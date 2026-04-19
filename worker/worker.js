const { Worker } = require("bullmq");
const IORedis = require("ioredis");
const admin = require("firebase-admin");
const { runInDocker } = require("./dockerRunner");
const { reviewCode } = require("./aiReviewer");
const {
  jobsCompleted,
  jobsFailed,
  jobDuration,
  workerActive,
} = require("../metrics");

/**
 * Transforms human-readable LeetCode inputs into machine-readable newline-separated JSON
 * Example: "nums = [2,7,11,15], target = 9" -> "[2,7,11,15]\n9"
 */
function transformInput(input) {
  if (!input || typeof input !== "string") return input;
  
  // If it already has multiple lines, assume it's machine-readable
  if (input.includes("\n")) return input;
  
  // Look for LeetCode-style assignments: name = value, name = value
  if (input.includes("=")) {
    try {
      // Split by comma BUT ignore commas inside brackets [1,2,3]
      const parts = input.split(/,(?![^\[]*\])/);
      const values = parts.map(p => {
        const eqIdx = p.indexOf("=");
        return eqIdx !== -1 ? p.substring(eqIdx + 1).trim() : p.trim();
      });
      return values.join("\n");
    } catch (e) {
      console.warn("Input transformation failed, using raw input:", e);
      return input;
    }
  }
  
  return input;
}

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const db = admin.firestore();

const connection = new IORedis({
  host: process.env.REDIS_HOST || "redis",
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  "code-execution",
  async (job) => {
    console.log(`👷 Worker received job: ${job.id} (Submission: ${job.data.submissionId})`);
    const startTime = Date.now();
    workerActive.inc({ queue_name: "code-execution" });

    try {
      const { submissionId, problemId, code, language, type } = job.data;

      let result = {
        status: "processing",
        output: "",
        testResults: [],
        allPassed: true,
        runtime: 0,
        memory: 0,
        aiFeedback: ""
      };

      // 1. Fetch the coding task (problem) test cases
      const problemDoc = await db.collection("problems").doc(problemId).get();
      if (!problemDoc.exists) {
        throw new Error(`Problem ${problemId} not found`);
      }

      const problemData = problemDoc.data();
      let activeTestCases = [];

      if (type === "run") {
        // Use public examples for debugging
        activeTestCases = problemData.examples || [];
      } else {
        // Use protected hidden test cases for judging
        // Note: These should be in a subcollection or protected field
        const tcSnapshot = await problemDoc.ref.collection("testCases").get();
        activeTestCases = tcSnapshot.docs.map(doc => doc.data());
      }

      if (activeTestCases.length === 0) {
        throw new Error(`No test cases found for problem ${problemId} (${type})`);
      }
      // 2. Execute code against test cases
      for (const tc of activeTestCases) {
        const rawInput = transformInput(tc.input || tc.inputStr || "");
        console.log(`📡 [${language}] Running case: ${tc.name || 'Sample'} with input:`, rawInput.replace(/\n/g, " | "));
        
        const execution = await runInDocker(code, language, rawInput);
        
        // Handle Compilation Errors (T019)
        if (execution.isCompilationError) {
          result.status = "compilation_error";
          result.output = execution.output;
          result.allPassed = false;
          result.testResults.push({
            name: "Compilation",
            input: "N/A",
            actual: execution.output,
            expected: "No compilation errors",
            status: "ERROR",
            runtime: 0,
            memory: 0
          });
          break;
        }

        const actual = execution.output || "";
        const expectedStr = (tc.output || tc.expected || "").toString().trim();

        // Detect specific failure types
        let status = "PASS";
        const normalize = (str) => {
          try { return JSON.stringify(JSON.parse(str.trim())); } catch (e) { return str.trim(); }
        };

        if (execution.output === "Time Limit Exceeded") status = "TLE";
        else if (execution.output === "Memory Limit Exceeded") status = "MLE";
        else if (normalize(actual) !== normalize(expectedStr)) status = "FAIL";
        
        if (status !== "PASS") result.allPassed = false;
        
        result.testResults.push({
          name: tc.name || `Case ${result.testResults.length + 1}`,
          input: tc.input || tc.inputStr || "No input",
          actual: (status === "TLE" || status === "MLE") ? execution.output : actual.trim(),
          expected: expectedStr,
          status,
          runtime: execution.runtime || 0,
          memory: execution.memory || 0
        });

        // Track max usage
        result.runtime = Math.max(result.runtime, execution.runtime || 0);
        result.memory = Math.max(result.memory, execution.memory || 0);
        
        // Short-circuit on non-PASS in submit mode (optional, but typical for LeetCode)
        if (type === "submit" && status !== "PASS") {
          result.firstFailedStatus = status;
          break;
        }
      }

      if (result.allPassed) {
        result.status = "accepted";
        result.output = "All tests passed";
      } else {
        const firstFail = result.testResults.find(r => r.status !== "PASS");
        if (firstFail.status === "TLE") result.status = "time_limit_exceeded";
        else if (firstFail.status === "MLE") result.status = "memory_limit_exceeded";
        else if (firstFail.status === "FAIL") result.status = "wrong_answer";
        else result.status = "runtime_error";
        
        result.output = firstFail.actual || firstFail.status;
      }
      
      let aiFeedback;
      try {
        // Pass the results to the AI reviewer
        aiFeedback = await reviewCode(code, result);
      } catch (err) {
        if (job.attemptsMade === job.opts.attempts) {
          aiFeedback = "AI Review Unavailable";
        } else {
          throw err;
        }
      }

      result.aiFeedback = aiFeedback;

      // 4. Update Firestore with final results
      if (submissionId) {
        await db.collection("submissions").doc(submissionId).update({
          status: result.status,
          testResults: result.testResults,
          runtime: `${result.runtime}ms`,
          memory: `${(result.memory / 1024 / 1024).toFixed(1)}MB`,
          aiFeedback: result.aiFeedback,
          finishedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }

      return result;
    } finally {
      const duration = (Date.now() - startTime) / 1000;
      jobDuration.observe({ queue_name: "code-execution" }, duration);
      workerActive.dec({ queue_name: "code-execution" });
    }
  },
  { connection },
);

worker.on("completed", (job, result) => {
  jobsCompleted.inc({ queue_name: "code-execution" });
  console.log(`✅ Job ${job.id} completed successfully.`);
});

worker.on("failed", (job, err) => {
  jobsFailed.inc({ queue_name: "code-execution" });
  console.error(`❌ Job ${job ? job.id : 'unknown'} failed:`, err);
});

worker.on("error", (err) => {
  console.error("🔥 Worker encountered a fatal error:", err);
});

console.log("🚀 Worker started for queue: code-execution");
