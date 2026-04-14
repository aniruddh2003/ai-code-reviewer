const { validateEnv } = require("../config");

validateEnv();

const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const { QueueEvents } = require("bullmq");
const IORedis = require("ioredis");

const routes = require("./routes");
const { getMetrics } = require("../metrics");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// Metrics endpoint
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", "text/plain");
  res.send(await getMetrics());
});

app.use("/", routes);

// Set up Socket.IO and QueueEvents
const connection = new IORedis({
  host: "redis",
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
});

const queueEvents = new QueueEvents("code-execution", { connection });

io.on("connection", (socket) => {
  console.log("Client connected via WebSocket");
});

queueEvents.on("active", ({ jobId }) => {
  io.emit("job_update", { jobId, status: "active" });
});

queueEvents.on("completed", ({ jobId, returnvalue }) => {
  // Ensure returnvalue can be parsed if it's a string, or returned directly if it's an object
  let result = returnvalue;
  if (typeof result === "string") {
    try {
      result = JSON.parse(result);
    } catch (e) {
      // Ignored
    }
  }
  io.emit("job_update", { jobId, status: "completed", result });
});

queueEvents.on("failed", ({ jobId, failedReason }) => {
  io.emit("job_update", { jobId, status: "failed", failedReason });
});

server.listen(3000, () => {
  console.log("API and WebSockets running on port 3000");
  console.log("Metrics available at http://localhost:3000/metrics");
});
