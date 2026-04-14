const { Queue } = require("bullmq");
const IORedis = require("ioredis");
const { queueDepth } = require("../metrics");

const connection = new IORedis({
  host: "redis",
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
});

const codeQueue = new Queue("code-execution", { connection });

// Update queue depth gauge every 10 seconds
setInterval(async () => {
  try {
    const count = await codeQueue.count();
    queueDepth.set({ queue_name: "code-execution" }, count);
  } catch (err) {
    console.error("Error updating queue depth metric:", err);
  }
}, 10000);

module.exports = { codeQueue, connection };
