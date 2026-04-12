# 🧠 Design Decisions

## Why Queue-based Architecture?

Chosen to:

- avoid blocking API
- enable scaling
- support async processing

---

## Why Docker for execution?

- isolates untrusted code
- prevents system compromise

---

## Why BullMQ?

- simple Redis-based queue
- supports retries and job states

---

## Why /tmp for file sharing?

- accessible to both host and container
- avoids mount visibility issues
