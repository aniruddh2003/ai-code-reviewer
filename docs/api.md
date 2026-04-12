# 📡 API Documentation

## POST /submit

Submit code for execution

### Request

```json
{
  "code": "print('Hello')",
  "language": "python"
}
```

### Response

```json
{
  "jobId": "1",
  "status": "queued"
}
```

---

## GET /status/:id

Get job status

### Response

```json
{
  "state": "completed",
  "result": {
    "output": "Hello\n",
    "aiFeedback": "..."
  }
}
```

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
