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
      const { code, language, cacheKey, githubCommentUrl } = job.data;

      const output = await runInDocker(code, language);
      
      let aiFeedback;
      try {
        aiFeedback = await reviewCode(code);
      } catch (err) {
        if (job.attemptsMade === job.opts.attempts) {
          // Final attempt failed, gracefully return without marking job as failed
          aiFeedback = "AI Review Unavailable";
        } else {
          // Let it bubble up so BullMQ built-in retries pick it up
          throw err;
        }
      }

      const result = {
        output,
        aiFeedback,
      };

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
