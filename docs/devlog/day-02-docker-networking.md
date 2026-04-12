# 📅 Day 2 – Docker, Networking & System Isolation

## 🎯 Goal

Run API, Worker, and Redis inside Docker containers

---

## 🧠 Key Concept

Each container is:
👉 isolated
👉 has its own filesystem
👉 has its own localhost

---

## ⚙️ docker-compose.yml

```yaml
version: "3.9"

services:
  redis:
    image: redis:alpine

  api:
    build: .
    command: npm run api
    depends_on:
      - redis

  worker:
    build: .
    command: npm run worker
    depends_on:
      - redis
```

---

## ❌ Errors Faced

### 1. Dockerfile not found

```bash
failed to read dockerfile
```

👉 Cause:
Docker expects `Dockerfile` by default

👉 Fix:
Created root Dockerfile:

```dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
```

---

### 2. Worker cannot access Docker

```bash
docker: not found
```

👉 Cause:
Worker container doesn’t have Docker CLI

---

## 🔥 Fix (IMPORTANT CONCEPT)

### Add Docker socket

```yaml
worker:
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock
```

👉 This allows:
Container → Host Docker Engine communication

---

### Install Docker CLI in container

```dockerfile
RUN apt-get update && apt-get install -y docker.io
```

---

## 🧠 Deep Learning

### Docker Socket Concept

```
Worker Container
      ↓
/var/run/docker.sock
      ↓
Host Docker Engine
      ↓
New Containers Spawned
```

👉 This is how CI/CD systems work internally

---

## ⚠️ Mistakes

- Thought Docker inside container works automatically
- Didn’t understand host vs container boundary

---

## 🚀 Next Plan

- Execute user code inside Docker
- Handle file transfer correctly
