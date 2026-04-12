# 📅 Day 1 – Foundation: API, Queue & System Design

## 🎯 Goal

Build a scalable backend architecture instead of a simple API

---

## 🧠 Initial Design Thinking

Instead of:
❌ API → execute code directly

I designed:
✔ API → Queue → Worker → Execution

Reason:

- Avoid blocking API
- Handle multiple users
- Scale horizontally

---

## 🏗️ Architecture

```
Client → API → Redis Queue → Worker
```

---

## ⚙️ Implementation

### Queue Setup (`api/queue.js`)

```js
const { Queue } = require("bullmq");
const IORedis = require("ioredis");

const connection = new IORedis({
  host: "redis",
  port: 6379,
  maxRetriesPerRequest: null,
});

const codeQueue = new Queue("code-execution", { connection });

module.exports = { codeQueue };
```

---

### Worker Setup (`worker/worker.js`)

```js
const { Worker } = require("bullmq");
const IORedis = require("ioredis");

const connection = new IORedis({
  host: "redis",
  port: 6379,
  maxRetriesPerRequest: null,
});

new Worker(
  "code-execution",
  async (job) => {
    console.log("Processing job:", job.id);
  },
  { connection },
);
```

---

## ❌ Errors Faced

### 1. Redis connection failed

```bash
ECONNREFUSED 127.0.0.1:6379
```

👉 Cause:
Used `localhost` inside container

👉 Fix:

```js
host: "redis";
```

---

### 2. BullMQ crash

```bash
maxRetriesPerRequest must be null
```

👉 Cause:
BullMQ requires blocking Redis operations

👉 Fix:

```js
maxRetriesPerRequest: null;
```

---

## 🧠 Key Learnings

- Docker containers don’t use `localhost` for other services
- Service names act as DNS in docker-compose
- Async architecture is critical for backend scalability

---

## ⚠️ Mistakes

- Initially tried direct execution inside API
- Didn’t understand container networking

---

## 🚀 Next Plan

- Containerize system
- Add Docker execution
