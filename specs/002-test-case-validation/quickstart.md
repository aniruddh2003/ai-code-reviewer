# Quickstart: Automated Test Case Validation

## 1. Submission with Tests

Post a code snippet with stdin-based test cases:

```bash
curl -X POST http://localhost:3000/submit \
-H "Content-Type: application/json" \
-d '{
  "language": "python",
  "code": "import sys\nfor line in sys.stdin:\n    print(int(line) * 2)",
  "testCases": [
    {"name": "double 5", "input": "5", "expected": "10"},
    {"name": "double 10", "input": "10", "expected": "20"}
  ]
}'
```

## 2. Check Results

Poll the status API:

```bash
curl http://localhost:3000/status/<jobId>
```

Expect a `testResults` array in the response alongside the specialized AI review.
