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
- supports retries and job states natively

---

## Why WebSockets over HTTP Long Polling?

Chosen for real-time job status updates because:

- **Resource Efficiency**: HTTP Long Polling forces the Node.js server to hold open hundreds of idle, blocking HTTP connections while waiting for OpenAI to finish, which drains memory and threads. WebSockets establish one lightweight, persistent tunnel.
- **Overhead**: Long polling requires clients to repeatedly establish new TCP connections and carry full HTTP headers every time a timeout occurs. WebSockets communicate via tiny, binary-framed packets.
- **Native Event Streaming**: It natively integrates with our BullMQ `QueueEvents`. As soon as the worker fires a `completed` hook via Redis, the WebSocket pushes the payload to the specific client instantly without continuous database checks.

---

## Why Cryptographic SHA-256 Caching?

- **Cost Protection**: We explicitly merge `code + language` and generate an invisible `sha256` signature prior to enqueuing. If the payload signature matches our Redis dictionary, it instantly shorts-circuits and skips execution. This prevents abusive users from spamming identical scripts and draining identical OpenAI tokens or locking up Docker threads.

---

## Why Strict Hard-Timeouts inside Docker?

- **Denial of Service Prevention**: In `dockerRunner.js`, passing the `{ timeout: 10000 }` constraint directly to the Node.js `exec` spawner protects the host machine from permanent deadlocks. Without this, an end-user supplying a `while(true)` infinite loop would permanently lock up the queue worker thread.

---

## Why Exponential Backoffs over Linear Retries?

- **Fault Tolerance against Limiting**: For BullMQ retries, we chose `delay: 1000` set to `exponential` rather than a static retry timer. OpenAI regularly issues `HTTP 429 Too Many Requests` limit errors. Standard linear retries fail sequentially; exponential backoffs wait 1s, then 2s, then 4s, which provides the API rate-limit window adequate organic cooling time before it attempts to connect again.

---

## Why HMAC Payload Security for Webhooks?

- **Authentication via Cryptography**: Utilizing `crypto.createHmac` maps strictly against Github's `x-hub-signature-256` protocol over standard API keys. Standard Webhooks are susceptible to spoofing; HMAC guarantees that the JSON payload body was mathematically encrypted by GitHub directly.
- **Timing Attack Prevention**: Comparing the signatures via `crypto.timingSafeEqual()` on a generated `Buffer` ensures malicious actors cannot use side-channel timing measurements to brute-force your Secret key!

---

## Why /tmp for file sharing?

- accessible to both host and container
- avoids mount visibility issues
