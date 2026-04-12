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
