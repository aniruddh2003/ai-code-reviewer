# 📅 Day 4 – Observability, Environment Validation & Multi-Language Support

## 🎯 Goals

1. Add environment validation at startup to catch missing API keys early
2. Implement Prometheus metrics for operational visibility
3. Extend language support (JavaScript, C++)
4. Optimize Docker execution pipeline

---

## 🧠 Problem Motivation

### Before Day 4:

- ❌ System would crash silently if `OPENAI_API_KEY` was missing
- ❌ No visibility into queue depth, job performance, or failure rates
- ❌ Only Python supported (limited use cases)
- ❌ 5-second timeout inadequate for compiled languages

### Why it matters:

- For production, early validation saves hours of debugging
- Observability enables auto-scaling and alerting
- Multi-language support opens new user segments

---

## ⚙️ Implementation

### 1. Environment Validation

#### Created `config.js`

```javascript
require("dotenv").config();

const requiredEnvVars = ["OPENAI_API_KEY"];

function validateEnv() {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error("❌ Missing required environment variables:");
    missing.forEach((key) => console.error(`  - ${key}`));
    process.exit(1);
  }

  console.log("✅ Environment validation passed");
}

module.exports = { validateEnv };
```

#### Added to API & Worker startup:

```js
const { validateEnv } = require("../config");
validateEnv();
```

---

### 2. Prometheus Metrics System

#### Created `metrics.js`

```javascript
const client = require("prom-client");

// Default metrics (CPU, memory, etc.)
client.collectDefaultMetrics();

// Custom metrics
const queueDepth = new client.Gauge({
  name: "queue_depth",
  help: "Number of jobs waiting in queue",
  labelNames: ["queue_name"],
});

const jobDuration = new client.Histogram({
  name: "job_duration_seconds",
  help: "Job processing duration in seconds",
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
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

const workerActive = new client.Gauge({
  name: "worker_active_jobs",
  help: "Number of jobs currently being processed",
  labelNames: ["queue_name"],
});

module.exports = {
  queueDepth,
  jobsCompleted,
  jobsFailed,
  jobDuration,
  workerActive,
  getMetrics: () => client.register.metrics(),
};
```

#### Updated `api/app.js`

```javascript
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", "text/plain");
  res.send(await getMetrics());
});
```

#### Updated `api/queue.js` - Track queue depth

```javascript
// Update queue depth gauge every 10 seconds
setInterval(async () => {
  const count = await codeQueue.count();
  queueDepth.set({ queue_name: "code-execution" }, count);
}, 10000);
```

#### Updated `worker/worker.js` - Track job metrics

```javascript
worker.on("completed", (job, result) => {
  jobsCompleted.inc({ queue_name: "code-execution" });
  console.log("Job done:", result);
});

worker.on("failed", (job, err) => {
  jobsFailed.inc({ queue_name: "code-execution" });
  console.error("Job failed:", err);
});
```

---

### 3. Multi-Language Support

#### Problem:

```bash
# Only Python was pre-configured
python-runner → ✅
js-runner → ❌ (didn't exist)
cpp-runner → ❌ (didn't exist)
```

#### Solution: Modular Docker Images

##### `docker/javascript.Dockerfile`

```dockerfile
FROM node:18-slim
WORKDIR /app
CMD ["node", "script.js"]
```

##### `docker/cpp.Dockerfile`

```dockerfile
FROM gcc:12-bullseye
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*
CMD g++ -o /tmp/program script.cpp && /tmp/program
```

#### Updated `docker-compose.yml`

```yaml
python-runner:
  build:
    context: ./docker
    dockerfile: python.Dockerfile
  image: python-runner

js-runner:
  build:
    context: ./docker
    dockerfile: javascript.Dockerfile
  image: js-runner

cpp-runner:
  build:
    context: ./docker
    dockerfile: cpp.Dockerfile
  image: cpp-runner
```

#### Updated `worker/dockerRunner.js`

```javascript
async function runInDocker(code, language) {
  const id = uuidv4();
  const tempDir = `/tmp/code-${id}`;

  fs.mkdirSync(tempDir);

  const filePath = path.join(
    tempDir,
    language === "javascript"
      ? "script.js"
      : language === "cpp"
        ? "script.cpp"
        : "script.py",
  );
  fs.writeFileSync(filePath, code);

  if (language === "python") {
    return executeDocker("python-runner", tempDir, 10000);
  } else if (language === "javascript") {
    return executeDocker("js-runner", tempDir, 10000, "node /app/script.js");
  } else if (language === "cpp") {
    return executeDocker("cpp-runner", tempDir, 15000);
  }
}

function executeDocker(image, tempDir, timeout, cmd = "") {
  return new Promise((resolve) => {
    const dockerCmd = `docker run --rm \
      -v ${tempDir}:/app \
      --memory=100m \
      --cpus="0.5" \
      ${image} ${cmd}`;

    exec(dockerCmd, { timeout }, (err, stdout, stderr) => {
      fs.rmSync(tempDir, { recursive: true, force: true });
      resolve(err ? stderr || err.message : stdout);
    });
  });
}
```

---

## ❌ Errors Faced & Solutions

### Problem 1: Node.js image pulling on every job

```
Unable to find image 'node:18-slim' locally
18-slim: Pulling from library/node...
```

**Cause:** Docker images need to be pre-built

**Fix:** Add services to docker-compose.yml to build images at startup

---

### Problem 2: Execution timeout too short

```
Error: Command timeout exceeded (5000ms)
```

**Cause:**

- JavaScript startup: ~1-2s
- C++ compilation: ~3-5s
- Timeout: 5s (too tight)

**Fix:** Increased timeouts:

- Python: 10s
- JavaScript: 10s
- C++: 15s (accounts for compilation)

---

### Problem 3: File path encoding issues

```
Script path: /tmp/code-abc/script.cpp
Docker mount failed silently
```

**Cause:** Path string escaping

**Fix:** Used `path.join()` for cross-platform compatibility

---

## 🧠 Key Learnings

### 1. Environment Validation Pattern

```javascript
// Always validate early:
validateEnv();  // ← Call at startup
// vs
if (!process.env.KEY) { ... }  // ← Late detection
```

**Why:** Fail fast = faster debugging in production

---

### 2. Prometheus Metrics Hierarchy

```
System Metrics (CPU, Memory)
    ↓
Application Metrics (Queue, Jobs)
    ↓
Business Metrics (Completion rate, SLA)
```

**Key insight:** Each layer tells a different story:

- CPU = infrastructure health
- Queue depth = capacity planning
- Completion rate = product health

---

### 3. Timeout Strategy for Multi-Language

```javascript
const timeouts = {
  python: 10000, // Interpreter startup
  javascript: 10000, // Node startup
  cpp: 15000, // Compilation + execution
};
```

**Why different?**

- Interpreted: startup overhead ~1-2s
- Compiled: compilation overhead ~3-5s
- Global: margin for Docker overhead

---

### 4. Docker Image Pre-Building

```yaml
# ❌ Wrong: Lazy pull
docker run node:18-slim  # Pulls on first use

# ✅ Right: Pre-built
services:
  js-runner:
    build: ./docker/javascript.Dockerfile
```

**Benefit:** Zero startup latency for jobs

---

## 🚀 Testing Commands

### Environment Validation

```bash
# Without OPENAI_API_KEY
docker-compose up
# Expected: ❌ Missing required environment variables

# With .env set correctly
export OPENAI_API_KEY=sk-...
docker-compose up
# Expected: ✅ Environment validation passed
```

### Prometheus Metrics

```bash
curl http://localhost:3000/metrics

# Output:
# queue_depth{queue_name="code-execution"} 2
# jobs_completed_total{queue_name="code-execution"} 5
# job_duration_seconds_bucket{le="10"} 5
```

### Multi-Language Execution

```bash
# Python
curl -X POST http://localhost:3000/submit \
  -H "Content-Type: application/json" \
  -d '{"code":"print(50)","language":"python"}'

# JavaScript
curl -X POST http://localhost:3000/submit \
  -H "Content-Type: application/json" \
  -d '{"code":"console.log(50)","language":"javascript"}'

# C++
curl -X POST http://localhost:3000/submit \
  -H "Content-Type: application/json" \
  -d '{"code":"#include <iostream>\nusing namespace std;\nint main() {\n  cout << 50 << endl;\n  return 0;\n}","language":"cpp"}'
```

---

## 📊 Metrics Interpretation

| Metric          | Indicates         | Action                |
| --------------- | ----------------- | --------------------- |
| queue_depth ↑   | Backlog building  | Scale workers up      |
| job_duration ↑  | Jobs slower       | Check resource limits |
| jobs_failed ↑   | Errors increasing | Check logs            |
| worker_active ↑ | Sustained load    | Plan scaling          |

---

## ✨ What's Next (Day 5)

- Database persistence (PostgreSQL) for history
- Test case validation system
- Rate limiting & cost tracking
- Frontend dashboard prototype
