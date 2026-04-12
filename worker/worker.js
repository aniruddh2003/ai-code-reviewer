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
      const { code, language } = job.data;

      const output = await runInDocker(code, language);
      const aiFeedback = await reviewCode(code);

      return {
        output,
        aiFeedback,
      };
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
