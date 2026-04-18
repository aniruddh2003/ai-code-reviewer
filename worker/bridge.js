const admin = require("firebase-admin");
const { Queue } = require("bullmq");
const IORedis = require("ioredis");
require("dotenv").config();

// Initialize Firebase Admin
// It will look for GOOGLE_APPLICATION_CREDENTIALS env var or use default project config
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const db = admin.firestore();

// Redis connection for BullMQ
const connection = new IORedis({
  host: process.env.REDIS_HOST || "redis",
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
});

const executionQueue = new Queue("code-execution", { connection });

console.log("🚀 Firestore Bridge started. Listening for pending submissions...");

// Listen for new submissions with status 'pending'
db.collection("submissions")
  .where("status", "==", "pending")
  .onSnapshot((snapshot) => {
    snapshot.docChanges().forEach(async (change) => {
      if (change.type === "added" || change.type === "modified") {
        const submission = change.doc.data();
        if (submission.status !== "pending") return;
        const submissionId = change.doc.id;

        console.log(`📦 New submission detected: ${submissionId}`);

        try {
          // 1. Mark as 'queued' to prevent duplicate processing
          await change.doc.ref.update({
            status: "queued",
            queuedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          // 2. Enqueue to BullMQ
          await executionQueue.add(
            "execute-code",
            {
              submissionId,
              problemId: submission.problemId,
              code: submission.code,
              language: submission.language,
              type: submission.type || "submit", // 'run' or 'submit'
            },
            {
              jobId: submissionId, // Use submissionId as jobId for deduplication
              attempts: 3,
              backoff: {
                type: "exponential",
                delay: 1000,
              },
            }
          );

          console.log(`✅ [${submissionId}] Successfully enqueued.`);
        } catch (error) {
          console.error(`❌ [${submissionId}] Failed to enqueue:`, error);
          await change.doc.ref.update({
            status: "error",
            error: "Failed to enqueue to judge worker",
          });
        }
      }
    });
  });
