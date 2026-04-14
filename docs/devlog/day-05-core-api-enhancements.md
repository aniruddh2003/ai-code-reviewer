# 📅 Day 5 – Core API Enhancements (Caching, Sockets, & CI/CD)

## 🎯 Goals

1. Reduce duplicate OpenAI API costs by caching identical code executions.
2. Eliminate REST polling by pushing real-time job updates to clients.
3. Integrate natively into GitHub Pull Requests as an automated CI/CD reviewer.
4. Scale execution parameters seamlessly (Adding Golang, Strict 10s limits).
5. Defend against OpenAI rate limits via Exponential Backoffs.

---

## 🧠 Problem Motivation

### Before Day 5:
- ❌ **Spammy Polling:** Clients had to repeatedly spam `GET /status/:id` to find out if their code was done.
- ❌ **Wasted Compute:** If 10 people submitted the exact same script, we ran Docker and billed OpenAI 10 separate times.
- ❌ **Isolated Tooling:** The platform could only be used directly via the API, with no native links to GitHub repositories.
- ❌ **Brittle Integrations:** If the OpenAI ping failed, the entire job crashed leaving the user in the dark.

### Why it matters:
- Real-time WebSockets drastically lower server network load.
- Caching acts as an aggressive cost-saver for recurring code patterns (like LeetCode tests).
- GitHub Webhooks transform this project from a sandbox into a commercial-grade Dev Tool.

---

## ⚙️ Implementation

### 1. Redis Bypassing (Caching layer)
**Problem:** We needed a way to deterministically map code blocks to AI answers without running them.

**Solution:**
In `api/routes.js`, before adding a job to the Queue, we hash the payload.
```javascript
const hash = crypto.createHash("sha256").update(code + language).digest("hex");
const cacheKey = `cache:${hash}`;

const cachedData = await redis.get(cacheKey);
if (cachedData) {
  // Short circuit! Issue a secure fake UUID job ID and return instantly
  const newJobId = uuidv4();
  return res.json({ jobId: newJobId, status: "completed", cached: true });
}
```
The Worker natively saves to this `cacheKey` using `connection.setex(cacheKey, 604800, result)` (7-day TTL).

### 2. WebSocket Pub/Sub
**Problem:** Clients want instant updates.
**Solution:** Bound `socket.io` to the Express `http` server and used BullMQ `QueueEvents` to pipe global worker states globally.
```javascript
const queueEvents = new QueueEvents("code-execution", { connection });

queueEvents.on("completed", ({ jobId, returnvalue }) => {
  io.emit("job_update", { jobId, status: "completed", result: returnvalue });
});
```

### 3. GitHub Webhook Automation (CI/CD)
**Problem:** Webhooks are dangerous if unprotected.
**Solution:** We added `POST /webhook/github` mapped tightly against Github's HMAC cryptography.
```javascript
const hmac = crypto.createHmac("sha256", process.env.GITHUB_WEBHOOK_SECRET || "");
const expectedSignature = `sha256=${hmac.update(req.rawBody).digest("hex")}`;

// Safely compare using Buffer to avoid timing attacks
if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
  return res.status(401).json({ error: "Invalid signature" });
}
```
Upon verification, the Worker utilizes native JavaScript `fetch` and your `PAT` to literally comment on the GitHub PR natively!

### 4. Hard Sandboxing + Backoffs
- Ensured `python-runner`, `js-runner`, and `golang:1.20-alpine` all strictly adhere to `{ timeout: 10000 }` to avoid hanging threads.
- Injected `backoff: { type: 'exponential', delay: 1000 }` alongside `attempts: 3` so BullMQ gracefully retries network failures before outputting: `"AI Review Unavailable"`.

---

## 🚀 Testing Commands

### Testing WebSockets (Browser Console)
```javascript
const socket = io("http://localhost:3000"); 
socket.on("job_update", (data) => console.log("LIVE UPDATE:", data));
```

### Testing the Redis Cache Trip-Wire
```powershell
# Run this twice in PowerShell:
$body = @{ code = "console.log('hello')"; language = "node" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/submit" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body

# The first run returns "status: queued". 
# The second returns "cached: true" instantaneously!
```

---

## ✨ What's Next (Day 6)

- Develop a beautiful Frontend React / Next.js Dashboard capable of managing these WebSockets visually
- Deploy a strict network-kill layer to our Docker configuration
- Write formalized unit tests for the worker integrations