const { Worker } = require("bullmq");
const IORedis = require("ioredis");
const { runInDocker } = require("./dockerRunner");
const { reviewCode } = require("./aiReviewer");

const connection = new IORedis({
  host: "redis",
  port: 6379,
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  "code-execution",
  async (job) => {
    const { code, language } = job.data;

    const output = await runInDocker(code, language);
    const aiFeedback = await reviewCode(code);

    return {
      output,
      aiFeedback,
    };
  },
  { connection },
);

worker.on("completed", (job, result) => {
  console.log("Job done:", result);
});

worker.on("failed", (job, err) => {
  console.error("Job failed:", err);
});
