# 📅 Day 3 – Docker Execution Engine & Volume Mounting

## 🎯 Goal

Execute user code inside isolated Docker container

---

## ⚙️ Implementation

### Docker Runner

```js
exec(`
docker run --rm \
-v ${tempDir}:/app \
python-runner
`);
```

---

## ❌ Critical Error

```bash
python: can't open file '/app/script.py'
```

---

## 💣 Root Cause (IMPORTANT)

### Problem:

- tempDir created inside worker container
- Docker runs on host

👉 So:

```
Worker Container FS ❌ ≠ Host FS
```

---

## 🧠 Visualization

```
Worker Container
   /app/temp-123   ❌ (invisible to host)

Host Docker
   tries to mount → FAILS silently
```

---

## 🔥 Final Fix

### Use shared directory `/tmp`

#### docker-compose.yml

```yaml
worker:
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock
    - /tmp:/tmp
```

---

#### dockerRunner.js

```js
const tempDir = `/tmp/code-${id}`;
```

---

## 🧠 Why `/tmp` works

| Location         | Shared |
| ---------------- | ------ |
| Host `/tmp`      | ✅     |
| Container `/tmp` | ✅     |

👉 Both can access same files

---

## 🧪 Final Working Output

```bash
Job done: {
  output: 'Hello\n',
  aiFeedback: 'Hello from AI reviewer!'
}
```

---

## 🧠 Key Learnings

### 1. Volume Mounting Rule

👉 Only host paths can be mounted into containers

---

### 2. Container Isolation

- Filesystems are isolated
- Network is isolated
- Processes are isolated

---

### 3. Debugging Strategy

Instead of guessing:
✔ read logs
✔ trace system boundaries
✔ fix root cause

---

## ⚠️ Mistakes

- Assumed container path = host path
- Tried multiple fixes without understanding root cause initially

---

## 🔁 What I’d Do Better

- Draw system flow before coding
- Understand Docker internals earlier

---

## 🚀 Final Outcome

Built a system that:

- Executes untrusted code securely
- Uses async processing
- Integrates AI feedback
- Handles real-world infra challenges
