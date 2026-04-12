# ⚙️ Development Workflow Guide (Docker + Backend)

This document defines the **standard process for adding features, debugging, and running the system**.

---

# 🧠 System Overview

Services:

- API (Express)
- Worker (BullMQ)
- Redis

All run inside Docker using `docker-compose`.

---

# 🔁 Standard Development Cycle

## 1. Stop containers

```bash
docker-compose down
```

---

## 2. Make code changes

Example:

```bash
code api/routes.js
code worker/worker.js
```

---

## 3. Rebuild & run

```bash
docker-compose up --build
```

---

## 4. Test API

```bash
curl http://localhost:3000
```

---

## 5. Check logs

```bash
docker logs ai-code-reviewer-api-1
docker logs ai-code-reviewer-worker-1
```

---

# ⚡ Faster Development (Recommended)

To avoid rebuilding every time, use volume mounting.

## Update `docker-compose.yml`

```yaml
api:
  volumes:
    - .:/app

worker:
  volumes:
    - .:/app
```

---

## Start once

```bash
docker-compose up --build
```

---

## After this:

### Edit code

```bash
code api/routes.js
```

### Restart container

```bash
docker-compose restart api
docker-compose restart worker
```

---

# 🚀 Adding a New Feature

## Example: Add `/status/:jobId`

### Step 1: Edit API

```bash
code api/routes.js
```

---

### Step 2: Restart API

```bash
docker-compose restart api
```

---

### Step 3: Test

```bash
curl http://localhost:3000/status/1
```

---

# 🔧 Updating Worker Logic

## Step 1: Edit worker

```bash
code worker/worker.js
```

---

## Step 2: Restart worker

```bash
docker-compose restart worker
```

---

## Step 3: Trigger job

```bash
curl -X POST http://localhost:3000/submit \
-H "Content-Type: application/json" \
-d '{"code":"print(\"Hello\")","language":"python"}'
```

---

# 📦 Installing New Dependencies

## Step 1: Install locally

```bash
npm install axios
```

---

## Step 2: Rebuild containers

```bash
docker-compose up --build
```

---

# 🐳 Debugging Inside Containers

## Open shell

### API container

```bash
docker exec -it ai-code-reviewer-api-1 sh
```

### Worker container

```bash
docker exec -it ai-code-reviewer-worker-1 sh
```

---

## Check files

```bash
ls /app
```

---

# 🔍 Redis Debugging

```bash
docker exec -it ai-code-reviewer-redis-1 redis-cli
```

---

# ⚠️ Important Rules

## Rebuild required when:

- `package.json` changes
- `Dockerfile` changes

---

## Restart is enough when:

- JavaScript code changes

---

# 💣 Common Mistakes

- Using `localhost` instead of service name (`redis`)
- Forgetting to rebuild after dependency install
- Not checking logs during debugging

---

# 🧠 Key Learnings

- Docker isolates services (network + filesystem)
- Volume mounting enables fast development
- Logs are the primary debugging tool
- Restart vs rebuild is critical for efficiency

---
