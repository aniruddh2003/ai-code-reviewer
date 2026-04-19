# Feature Specification: LeetCode Judge Pipeline Finalization

**Feature Branch**: `004-judge-pipeline-finalization`  
**Created**: 2026-04-18  
**Last Amended**: 2026-04-19  
**Status**: Final / Hardened  
**Input**: User description: "Finalize the connection between the LeetCode frontend 'Run/Submit' buttons and the actual Docker-based Judge Worker. This includes creating a Firestore listener that triggers the execution pipeline, updating submission status in real-time, and ensuring robust Docker-based testing for multiple languages."

## Clarifications

### Session 2026-04-18
- Q: How are test cases associated with a submission? → A: The judge worker fetches private test cases from a central `questions` or `problems` collection to ensure security and prevent hidden data exposure to the frontend.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Real-Time Code Execution (Priority: P1)

As a user, I want to click "Run" and see my code execute against the provided sample test cases so that I can debug my solution without submitting.

**Why this priority**: Core IDE functionality that enables the developer workflow. It verifies the basic communication between the frontend, database, and execution engine.

**Independent Test**: User writes code in the editor, clicks "Run", and the "Test Result" tab displays the output/failures within 5 seconds.

**Acceptance Scenarios**:

1. **Given** a user has written code for a problem, **When** they click "Run", **Then** the submission is written to Firestore with `type: "run"`, and the status updates to `accepted` or `wrong_answer` with sample test case results.
2. **Given** a "Run" request is in progress, **When** the code takes too long, **Then** the status should update to `time_limit_exceeded`.

---

### User Story 2 - Automated Judging (Priority: P1)

As a user, I want to click "Submit" and have my code judged against all hidden test cases so that my total progress is tracked and scored.

**Why this priority**: Defines the competitive nature of the platform and ensures that only correct and efficient solutions are accepted.

**Independent Test**: User submits a correct solution, and after a few seconds, the "Submissions" tab shows a new entry with "Accepted" status and a summary of passed tests.

**Acceptance Scenarios**:

1. **Given** a user submits code, **When** the judge processes it, **Then** every test case defined for the problem is executed, and a cumulative result (e.g., "Accepted", "Wrong Answer", "Runtime Error") is persisted.
2. **Given** a submission is processed, **When** the execution finishes, **Then** metrics (Runtime, Memory) are calculated and saved to the submission record.

---

### User Story 3 - Multi-Language Robustness (Priority: P1)

As a user, I want to submit code in any supported language (JavaScript, Python, C++) and have it executed in a consistent, isolated, and feature-rich environment.

**Why this priority**: Ensures platform flexibility and parity with industry standards (e.g., LeetCode/Codeforces).

**Independent Test**: User submits a C++ solution using `std::unordered_map` without manual `#include <unordered_map>`, and it executes successfully.

**Acceptance Scenarios**:

1. **Given** a C++ submission, **When** the judge worker receives it, **Then** it is compiled and executed within a Docker container.
2. **Given** a Python submission, **When** the judge worker receives it, **Then** it is interpreted within a Docker container.
3. **Given** the input contains human-readable variable assignments, **When** it is processed, **Then** it is normalized into raw machine-ready data automatically.

---

## Edge Cases

- **Infinite Loops**: The Docker runner must have a hard timeout (e.g., 5s) and return `TLE`.
- **Resource Exhaustion**: Docker container must have memory limits; runner should detect and return `MLE`.
- **Concurrent Submissions**: Worker uses BullMQ/Redis to scale and handle multiple concurrent jobs.
- **Linker Latency**: C++ compilation MUST output to a fast container-local path (e.g., `/tmp/prog`) to avoid volume synchronization delays on Windows/Docker.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a backend listener that triggers code execution when a new document is added to the real-time database.
- **FR-002**: System MUST isolate code execution using secure environments for each supported language.
- **FR-003**: System MUST execute debugging requests against sample test cases only.
- **FR-004**: System MUST execute full submission requests against hidden test cases.
- **FR-005**: System MUST update the submission record with status, test results, runtime, and memory metrics.
- **FR-006**: System MUST enforce configurable time and memory limits for all executions.
- **FR-007**: System MUST capture and return standard logging output for user debugging.
- **FR-008 (NEW)**: System MUST automatically normalize human-readable example inputs (e.g., `nums = [2,7], target = 9`) into machine-executable formats.
- **FR-009 (NEW)**: System MUST pre-configure compiled language environments with essential standard library headers (STL) to provide boilerplate-free execution.

### Key Entities

- **Submission**: Code, status, performance metrics, validation results.
- **Coding Task**: Problem definition, public metadata, sample test cases, and hidden test cases.
- **Validation Result**: Single test case output vs expected.

---

## Development Delta Report (Gap Analysis)

| Category | Item | Rationale | Result |
| :--- | :--- | :--- | :--- |
| **MORE** | **Smart Normalization** | Human-readable examples required a transformation layer. | ✅ Implemented `transformInput` |
| **MORE** | **STL Hardening** | Manual boilerplate for C++ was a friction point. | ✅ Integrated into template |
| **MORE** | **Linker Optimization** | Docker volume latency caused "File Not Found" errors. | ✅ Binaries moved to `/tmp` |
| **MORE** | **Hot-Reload DX** | Iteration was too slow with container rebuilds. | ✅ Bind-mounts established |
| **LESS** | **MLE Granularity** | High-precision memory telemetry is still best-effort. | ⚠️ Metrics limited to OS reporting |

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Average execution turnaround time is under 8 seconds.
- **SC-002**: 100% of infinite loops are terminated safely without host degradation.
- **SC-003**: 100% of submissions in JS, Python, and C++ (modern STL) map to their respective runners.
- **SC-004**: System provides accurate "Human-to-Machine" input transformation for 100% of standard LeetCode example formats.
