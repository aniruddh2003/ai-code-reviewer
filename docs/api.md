# 📡 API Documentation

## POST /submit

Submit code for execution. Identical code + language pairs are cached via Redis for instant resolution bypassing the AI queue.

### Request

```json
{
  "code": "print('Hello')",
  "language": "python"
}
```

**Supported languages:**

- `python` - Python 3.10
- `node` or `javascript` - Node.js 18+
- `go` - Golang 1.20

### Response

```json
{
  "jobId": "1a2b3c4d-...",
  "status": "queued",
  "cached": false
}
```
*Note: If `cached: true`, status will be `completed` instantly.*

---

## GET /status/:id

Get job status.

### Response

```json
{
  "id": "1a2b3c4d-...",
  "status": "completed",
  "result": {
    "output": "Hello\n",
    "aiFeedback": "..."
  }
}
```

---

## POST /webhook/github

Target payload endpoint for GitHub Pull Request automation. Automatically runs code found in PRs and natively posts an AI review comment back to the GitHub PR.

### Request Headers
- `x-hub-signature-256`: Requires valid HMAC SHA256 hashed signature matching your deployment's `GITHUB_WEBHOOK_SECRET`.

### Response
```json
{
  "message": "Accepted GitHub Webhook",
  "jobId": "..."
}
```

---

## 🔌 WebSocket (Socket.io)

Clients can optionally connect via a WebSockets proxy to automatically receive pushed updates, removing the need to poll `/status/:id`.

**Events Emitted:**
- `job_update` - Payload: `{ jobId, status: "active" | "completed" | "failed", result? }`

---

## GET /metrics

Export Prometheus metrics for monitoring

### Response

Returns metrics in Prometheus text format

### Metrics Available

- `queue_depth` - Number of jobs waiting in queue
- `jobs_completed_total` - Total completed jobs
- `jobs_failed_total` - Total failed jobs
- `job_duration_seconds` - Job processing time (histogram with percentiles)
- `worker_active_jobs` - Currently processing jobs by worker
- System metrics (CPU, memory, Node.js process stats)

### Usage

```bash
curl http://localhost:3000/metrics
```

Use with Prometheus/Grafana for monitoring and alerting.
