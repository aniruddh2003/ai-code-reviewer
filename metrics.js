const client = require("prom-client");

// Register default metrics (CPU, memory, etc.)
client.collectDefaultMetrics();

// Custom metrics
const queueDepth = new client.Gauge({
  name: "queue_depth",
  help: "Number of jobs waiting in queue",
  labelNames: ["queue_name"],
});

const jobsCompleted = new client.Counter({
  name: "jobs_completed_total",
  help: "Total number of completed jobs",
  labelNames: ["queue_name"],
});

const jobsFailed = new client.Counter({
  name: "jobs_failed_total",
  help: "Total number of failed jobs",
  labelNames: ["queue_name"],
});

const jobDuration = new client.Histogram({
  name: "job_duration_seconds",
  help: "Job processing duration in seconds",
  labelNames: ["queue_name"],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
});

const workerActive = new client.Gauge({
  name: "worker_active_jobs",
  help: "Number of jobs currently being processed by worker",
  labelNames: ["queue_name"],
});

async function getMetrics() {
  return client.register.metrics();
}

module.exports = {
  queueDepth,
  jobsCompleted,
  jobsFailed,
  jobDuration,
  workerActive,
  getMetrics,
};
