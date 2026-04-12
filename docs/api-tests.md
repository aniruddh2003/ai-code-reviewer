# 🧪 API Testing Commands (cURL)

This document contains all cURL commands to test the API endpoints.

---

# 🚀 Base URL

```bash id="baseurl"
http://localhost:3000
```

---

# 📌 1. Submit Code

## Python Example

```bash id="submit1"
curl -X POST http://localhost:3000/submit \
-H "Content-Type: application/json" \
-d '{
  "code": "print(\"Hello World\")",
  "language": "python"
}'
```

### Expected Response

```json id="submitres"
{
  "jobId": "1",
  "status": "queued"
}
```

---

## Another Example

```bash id="submit2"
curl -X POST http://localhost:3000/submit \
-H "Content-Type: application/json" \
-d '{
  "code": "print(5+10)",
  "language": "python"
}'
```

---

## JavaScript Example

```bash id="submit3"
curl -X POST http://localhost:3000/submit \
-H "Content-Type: application/json" \
-d '{
  "code": "console.log(\"Hello from JS\")",
  "language": "javascript"
}'
```

---

## C++ Example

```bash id="submit4"
curl -X POST http://localhost:3000/submit \
-H "Content-Type: application/json" \
-d '{
  "code": "#include <iostream>\nusing namespace std;\nint main() {\n  cout << \"Hello from C++\" << endl;\n  return 0;\n}",
  "language": "cpp"
}'
```

---

# 📌 2. Check Job Status

```bash id="status1"
curl http://localhost:3000/status/1
```

---

## Expected Responses

### While Processing

```json id="statusprocessing"
{
  "state": "active"
}
```

---

### Completed

```json id="statusdone"
{
  "state": "completed",
  "result": {
    "output": "Hello World\n",
    "aiFeedback": "..."
  }
}
```

---

### Failed

```json id="statusfail"
{
  "state": "failed",
  "failedReason": "Error message"
}
```

---

# 📌 3. Test Multiple Submissions

```bash id="multisubmit"
for i in {1..3}; do
  curl -X POST http://localhost:3000/submit \
  -H "Content-Type: application/json" \
  -d "{\"code\":\"print($i)\",\"language\":\"python\"}"
done
```

---

# 📌 4. Invalid Request Test

```bash id="invalid"
curl -X POST http://localhost:3000/submit \
-H "Content-Type: application/json" \
-d '{}'
```

---

## Expected Response

```json id="invalidres"
{
  "error": "Missing fields"
}
```

---

# 📌 5. Job Not Found

```bash id="notfound"
curl http://localhost:3000/status/9999
```

---

## Expected Response

```json id="notfoundres"
{
  "error": "Job not found"
}
```

---

# 🧠 Tips

- Use different job IDs to test multiple jobs
- Always check worker logs if something fails
- Use this file for quick manual testing

---

# 🚀 Future Additions

- Add test case-based execution requests
- Add authentication headers
- Add multi-language test cases
