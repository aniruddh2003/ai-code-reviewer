const express = require("express");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const { codeQueue, connection: redis } = require("./queue");

const router = express.Router();

router.post("/submit", async (req, res) => {
  const { code, language } = req.body;

  if (!code || !language) {
    return res.status(400).json({ error: "Missing fields" });
  }

  // Generate deterministic internal cache key
  const hash = crypto.createHash("sha256").update(code + language).digest("hex");
  const cacheKey = `cache:${hash}`;

  const cachedData = await redis.get(cacheKey);
  if (cachedData) {
    const newJobId = uuidv4();
    // Save a mock job state so the polling API can still find it for 24h
    await redis.setex(`mockjob:${newJobId}`, 86400, cachedData);
    
    return res.json({
      jobId: newJobId,
      status: "completed",
      cached: true
    });
  }

  // Enqueue job with OpenAI retry logic options
  const job = await codeQueue.add("run-code", {
    code,
    language,
    cacheKey,
  }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 }
  });

  res.json({
    jobId: job.id,
    status: "queued",
  });
});

router.get("/status/:jobId", async (req, res) => {
  const { jobId } = req.params;

  // Resolve instantaneous cache hits mock statuses
  const mockJob = await redis.get(`mockjob:${jobId}`);
  if (mockJob) {
    return res.json({ id: jobId, status: "completed", result: JSON.parse(mockJob) });
  }

  const job = await codeQueue.getJob(jobId);
  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  const state = await job.getState();
  const result = job.returnvalue;
  const failedReason = job.failedReason;

  res.json({ id: jobId, status: state, result, failedReason });
});

router.post("/webhook/github", async (req, res) => {
  const signature = req.headers["x-hub-signature-256"];
  if (!signature) {
    return res.status(401).json({ error: "Missing signature" });
  }

  const hmac = crypto.createHmac("sha256", process.env.GITHUB_WEBHOOK_SECRET || "");
  const expectedSignature = `sha256=${hmac.update(req.rawBody).digest("hex")}`;

  try {
    if (signature.length !== expectedSignature.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return res.status(401).json({ error: "Invalid signature" });
    }
  } catch (e) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  const payload = req.body;
  if (!payload.pull_request) {
    return res.status(200).json({ message: "Ignored (not a pull request event)" });
  }

  const githubCommentUrl = payload.pull_request.comments_url;
  
  // For demonstration, extracting the 'code' from the body of the PR or providing a fallback string.
  const code = payload.pull_request.body || "print('hello from github webhook')";
  const language = "python"; // Stub language extraction for simplicity.

  const hash = crypto.createHash("sha256").update(code + language).digest("hex");
  const cacheKey = `cache:${hash}`;

  const job = await codeQueue.add("run-code", {
    code,
    language,
    cacheKey,
    githubCommentUrl,
  }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 }
  });

  res.status(200).json({
    message: "Accepted GitHub Webhook",
    jobId: job.id,
  });
});

module.exports = router;
