# Research: Automated Test Case Validation

## 1. Docker Stdin Piping

### Decision
Use `child_process.exec` with a shell-piped string: `echo "input" | docker run --rm -i ...`.

### Rationale
- Minimal change to existing `dockerRunner.js`.
- `-i` flag in `docker run` enables interactive mode (stdin).
- Bash-compliant piping works well with the existing `exec` wrapper.

### Alternatives Considered
- `child_process.spawn`: More robust for massive streams but introduces callback complexity for simple string test cases.
- Temp file piping: `docker run -v stdin.txt:/stdin ... < /stdin`. Rejected for disk IO overhead.

## 2. Multi-Test Orchestration

### Decision
Serialize execution within the worker block.

### Rationale
- Prevents OOM (Out of Memory) on the worker node by limiting concurrent Docker instances to 1.
- Simple error boundary: if one test fails, the overall job remains "completed" but with specific fail statuses in the report.

## 3. Dynamic AI Prompting

### Decision
Standardized prompt segments based on `results.allPassed`.

### Findings
- OpenAI GPT-4o-mini is highly effective at identifying logic errors when provided with the failed input and actual vs. expected output.
- Time complexity analysis requires the AI to understand the loop structures and recursion depth in the code snippet.
