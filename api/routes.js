const express = require("express");
const { codeQueue } = require("./queue");
const { fail } = require("node:assert");

const router = express.Router();

router.post("/submit", async (req, res) => {
  const { code, language } = req.body;

  if (!code || !language) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const job = await codeQueue.add("run-code", {
    code,
    language,
  });

  res.json({
    jobId: job.id,
    status: "queued",
  });
});

router.get("/status/:jobId", async (req, res) => {
  const { jobId } = req.params;

  const job = await codeQueue.getJob(jobId);
  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  const state = await job.getState();
  const result = await job.returnvalue;
  const failedReason = job.failedReason;

  res.json({ id: jobId, status: state, result, failedReason });
});

module.exports = router;
