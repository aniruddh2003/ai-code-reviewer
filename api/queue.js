const { Queue } = require("bullmq");
const IORedis = require("ioredis");

const connection = new IORedis({
  host: "redis",
  port: 6379,
  maxRetriesPerRequest: null
});

const codeQueue = new Queue("code-execution", { connection });

module.exports = { codeQueue };
