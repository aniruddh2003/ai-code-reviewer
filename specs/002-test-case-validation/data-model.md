# Data Model: Automated Test Case Validation

## Entities

### JobSubmission (Request)
```json
{
  "code": "string",
  "language": "string",
  "testCases": [
    {
      "name": "string",
      "input": "string",
      "expected": "string"
    }
  ]
}
```

### TestResult (Internal & Response)
| Field | Type | Description |
| :--- | :--- | :--- |
| `name` | String | Name of the test case. |
| `status` | Enum | `PASS`, `FAIL`, `TIMEOUT`, `ERROR`. |
| `actual` | String | The actual stdout from the container. |
| `expected` | String | The expected output provided by the user. |
| `error` | String | Stderr output if status is `ERROR`. |

### FinalResult (Response)
```json
{
  "output": "string (of first execution or summary)",
  "testResults": "TestResult[]",
  "allPassed": "boolean",
  "aiFeedback": "string"
}
```
