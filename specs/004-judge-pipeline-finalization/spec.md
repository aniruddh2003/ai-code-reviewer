# Feature Specification: LeetCode Judge Pipeline Finalization

**Feature Branch**: `004-judge-pipeline-finalization`  
**Created**: 2026-04-18  
**Status**: Draft  
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

### User Story 3 - Multi-Language Robustness (Priority: P2)

As a user, I want to submit code in any supported language (JavaScript, Python, C++) and have it executed in a consistent, isolated environment.

**Why this priority**: Ensures platform flexibility and security through Docker isolation.

**Independent Test**: User submits valid code in Python and C++, and both return correct results with consistent status reporting.

**Acceptance Scenarios**:

1. **Given** a C++ submission, **When** the judge worker receives it, **Then** it is compiled and executed within a Docker container specifically configured for C++.
2. **Given** a Python submission, **When** the judge worker receives it, **Then** it is interpreted within a Docker container specifically configured for Python.

---

## Edge Cases

- **Infinite Loops**: How does the system handle code that never terminates? (The Docker runner must have a hard timeout (e.g., 5s) and return `TLE`).
- **Resource Exhaustion**: How does the system handle code that consumes excessive memory? (The Docker container must have memory limits, and the runner should detect and return `MLE`).
- **Concurrent Submissions**: How does the system handle multiple users submitting at the same time? (The worker must use a queue (BullMQ/Redis) and scale to handle multiple concurrent jobs).
- **Network Failure**: What happens if the worker fails to update Firestore? (The system should use retries or a "claimed" status to prevent jobs from being lost).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a backend listener that triggers code execution when a new document is added to the real-time database.
- **FR-002**: System MUST isolate code execution using secure environments for each supported language.
- **FR-003**: System MUST execute debugging requests against sample test cases only.
- **FR-004**: System MUST execute full submission requests against the complete set of validation test cases fetched securely by the backend.
- **FR-005**: System MUST update the submission record with status, test results, runtime, and memory metrics upon completion.
- **FR-006**: System MUST enforce configurable time and memory limits for all executions.
- **FR-007**: System MUST capture and return standard logging output for user debugging.

### Key Entities *(include if feature involves data)*

- **Submission**: Represents the execution request and its final outcome (code, status, performance metrics, validation results).
- **Coding Task**: Represents a problem definition, containing public metadata, sample test cases for debugging, and a protected set of hidden test cases for validation.
- **Validation Result**: Represents the output of a single test case compared against expected results.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Average execution turnaround time (from user click to result) is under 8 seconds for standard solutions.
- **SC-002**: 100% of non-terminating code submissions are correctly identified as exceeding time limits without host degradation.
- **SC-003**: 100% of submissions in supported languages successfully map to their respective execution environments.
- **SC-004**: Submission status updates in the user interface within 500ms of the backend finalizing the result.
