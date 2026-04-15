const { validateEnv } = require("../config");

validateEnv();

const { Worker } = require("bullmq");
const IORedis = require("ioredis");
const { runInDocker } = require("./dockerRunner");
const { reviewCode } = require("./aiReviewer");
const {
  jobsCompleted,
  jobsFailed,
  jobDuration,
  workerActive,
} = require("../metrics");

const connection = new IORedis({
  host: "redis",
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  "code-execution",
  async (job) => {
    const startTime = Date.now();
    workerActive.inc({ queue_name: "code-execution" });

    try {
      const { code, language, testCases, cacheKey, githubCommentUrl } = job.data;

      let result = {
        output: "",
        testResults: null,
        allPassed: true,
        aiFeedback: ""
      };

      if (testCases && Array.isArray(testCases) && testCases.length > 0) {
        // Multi-test validation mode
        result.testResults = [];
        for (const tc of testCases) {
          const actual = await runInDocker(code, language, tc.input || "");
          const status = actual.trim() === (tc.expected || "").trim() ? "PASS" : "FAIL";
          
          if (status === "FAIL") result.allPassed = false;
          
          result.testResults.push({
            name: tc.name || "Unnamed Test",
            status,
            actual,
            expected: tc.expected
          });
        }
        result.output = result.allPassed ? "All tests passed" : "Some tests failed";
      } else {
        // Legacy single-run mode
        const output = await runInDocker(code, language);
        result.output = output;
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

      // T004: Save to cache if we have a cacheKey
      if (cacheKey) {
        await connection.setex(cacheKey, 604800, JSON.stringify(result)); // 7-day TTL
      }

      // T013: Post to GitHub if triggered via Webhook
      if (githubCommentUrl && process.env.PAT) {
        const commentBody = `### AI Code Review\n\n**Output:**\n\`\`\`\n${output}\n\`\`\`\n\n**AI Feedback:**\n${aiFeedback}`;
        try {
          await fetch(githubCommentUrl, {
            method: "POST",
            headers: {
              "Accept": "application/vnd.github.v3+json",
              "Authorization": `token ${process.env.PAT}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ body: commentBody })
          });
        } catch (e) {
          console.error("Failed to post comment to GitHub", e);
        }
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
  console.log("Job done:", result);
});

worker.on("failed", (job, err) => {
  jobsFailed.inc({ queue_name: "code-execution" });
  console.error("Job failed:", err);
});
