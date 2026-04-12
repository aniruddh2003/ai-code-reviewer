const express = require("express");
const { codeQueue } = require("./queue");

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

module.exports = router;
