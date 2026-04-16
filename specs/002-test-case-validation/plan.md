# Implementation Plan: Automated Test Case Validation

**Branch**: `002-test-case-validation` | **Date**: 2026-04-15 | **Spec**: [spec.md](file:///c:/Users/ANIRUDDHA/OneDrive/Documents/Projects/ai-code-reviewer/specs/002-test-case-validation/spec.md)

## Summary

Migration of the execution engine to a multi-test model using the **'Hidden Judge' Pattern**. This architecture isolates user logic from I/O boilerplate by injecting it into language-specific templates that handle automated JSON parsing and result capture.

## Technical Context

- **Language/Version**: Node.js v18+, Python 3.x, C++17
- **Primary Dependencies**: `nlohmann/json` (C++), `bullmq`, `ioredis`, `docker`
- **Architecture**: **The Hidden Judge**. Code is wrapped in language-specific meta-programs before execution.
- **Performance Goals**: Total job turnaround < 20s; execution overhead < 500ms per test.
- **Constraints**: 10s timeout; 200MB RAM for C++, 100MB for Python/Node.

## Constitution Check

| Principle | Status | Implementation Detail |
| :--- | :---: | :--- |
| **Asynchronous By Default** | ✅ | Uses BullMQ for background job distribution. |
| **Containerized Isolation** | ✅ | Each test case runs in a ephemeral container via `dockerRunner.js`. |
| **Strict Security** | ✅ | Resource templates are read-only and injected server-side. |

## Project Structure

### Documentation
```text
specs/002-test-case-validation/
├── plan.md              # Finalized technical design
├── spec.md              # Functional requirements & user stories
├── research.md          # Multi-test case investigation notes
└── tasks.md             # Synchronized implementation checklist
```

### Source Code
```text
api/
└── routes.js            # POST /review orchestration
worker/
├── worker.js            # Orchestrates the multi-test loop
├── dockerRunner.js       # Core engine and wrapping logic
├── dockerRunner.test.js  # Jest unit tests for judge templates
└── aiReviewer.js        # Success/Failure dynamic prompting
resources/
├── python_judge.py      # Python boilerplate with JSON parsing
├── node_judge.js        # Node.js boilerplate
└── cpp_judge.cpp        # C++ variadic template judge
```

## Technical Design: The Hidden Judge

### C++ Variadic Template Engine
The C++ judge utilizes C++17 variadic templates to auto-detect the user's `solution` function signature. It uses `std::apply` and `std::index_sequence` to map JSON arrays from stdin directly into the function arguments, supporting any level of nesting (e.g., `vector<vector<vector<string>>>`).

### Dynamic Prompt Branching
The `aiReviewer.js` component implements a state machine for prompting:
- **FAIL**: AI is instructed to perform **Diagnosis reasoning** on the failed test's input/output diff.
- **PASS**: AI is instructed to perform **Complexity analysis** (Big-O) and suggest asymptotic optimizations.
