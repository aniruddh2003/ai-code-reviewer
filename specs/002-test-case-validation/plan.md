# Implementation Plan: Automated Test Case Validation

**Branch**: `002-test-case-validation` | **Date**: 2026-04-15 | **Spec**: [spec.md](file:///c:/Users/ANIRUDDHA/OneDrive/Documents/Projects/ai-code-reviewer/specs/002-test-case-validation/spec.md)

## Summary

Migration of the execution engine to a multi-test model with STDIN support and specialized AI feedback logic for failure reasoning and asymptotic optimization.

## Technical Context

- **Language/Version**: Node.js v18+
- **Primary Dependencies**: BullMQ, Redis, Docker, OpenAI API
- **Project Type**: Web API + Background Worker
- **Performance Goals**: Execution and review completed in < 30s for up to 5 test cases.
- **Constraints**: 10s timeout per test case; < 200MB memory per container.

## Constitution Check

| Principle | Status | Implementation Detail |
| :--- | :---: | :--- |
| **Asynchronous By Default** | ✅ | Continues using BullMQ for all steps. |
| **Containerized Isolation** | ✅ | Each test case runs in an isolated Docker container. |
| **AI-Enhanced Reviews** | ✅ | AI reviews tailored based on pass/fail outcomes. |

## Proposed Changes

### Phase 2: Execution Engine (Docker)
Modify `worker/dockerRunner.js` to support interactive stdin via shell piping.

### Phase 3: Worker Orchestration & AI
Update `worker/worker.js` and `worker/aiReviewer.js` for result aggregation and dynamic prompting.

## Project Structure

```text
api/
├── routes.js            # Submit endpoint update
└── queue.js             # Task data expansion
worker/
├── dockerRunner.js       # Stdin support
├── worker.js            # Multi-test loop
└── aiReviewer.js        # Dynamic prompts
```
