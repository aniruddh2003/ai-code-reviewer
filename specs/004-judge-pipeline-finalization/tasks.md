# Tasks: LeetCode Judge Pipeline Finalization

**Input**: Design documents from `/specs/004-judge-pipeline-finalization/`
**Prerequisites**: [plan.md](file:///c:/Users/ANIRUDDHA/OneDrive/Documents/Projects/ai-code-reviewer/specs/004-judge-pipeline-finalization/plan.md), [spec.md](file:///c:/Users/ANIRUDDHA/OneDrive/Documents/Projects/ai-code-reviewer/specs/004-judge-pipeline-finalization/spec.md)

## Organization
Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

- [x] T001 Install `firebase-admin` dependency in `worker/package.json`
- [x] T002 [P] Configure Firebase Admin service account for backend worker access
- [x] T003 Ensure Redis/BullMQ is healthy and accessible from the worker

---

## Phase 2: Foundational (Blocking Prerequisites)

- [x] T004 [P] Create `worker/bridge.js` to listen for `status: "pending"` in Firestore `submissions`
- [x] T005 Implement logic in `bridge.js` to enqueue jobs into BullMQ `code-execution` queue
- [x] T006 Update `worker/worker.js` to handle Firestore connection and basic result reporting
- [x] T007 [P] Define `ExecutionResult` and `SubmissionUpdate` types for consistent data handling

---

## Phase 3: User Story 1 - Real-Time Code Execution (Priority: P1) 🎯 MVP

**Goal**: Enable the "Run" feature in the IDE for quick debugging.

**Independent Test**: Write code, click "Run", and see sample test results in the "Test Result" tab.

### Implementation for User Story 1

- [x] T008 [US1] Update `worker/worker.js` to detect `type: "run"` and use sample tests from the problem data
- [x] T009 [US1] Implement standard output (stdout) capture in `worker/dockerRunner.js` for execution logs
- [x] T010 [US1] Update Firestore document with results for each sample test case
- [x] T011 [US1] [P] Modify `frontend/src/pages/ProblemDetail.tsx` to display real-time "Running..." state from Firestore

---

## Phase 4: User Story 2 - Automated Judging (Priority: P1)

**Goal**: Fully judge submissions against hidden test cases and update performance metrics.

**Independent Test**: Submit a solution and verify "Accepted" status with Runtime/Memory metrics in the submission history.

### Implementation for User Story 2

- [x] T012 [US2] Update `worker/worker.js` to fetch hidden test cases from `problems/{id}/testCases`
- [x] T013 [US2] Implement total status calculation (Accepted vs WA/TLE/RE) across all test cases
- [x] T014 [US2] Implement Runtime and Memory measurement in `worker/dockerRunner.js` using `dockerode` stats
- [x] T015 [US2] [P] Update `frontend/src/pages/ProblemDetail.tsx` to handle the final submission transition logic (Demo Mode -> Live)

---

## Phase 5: User Story 3 - Multi-Language Robustness (Priority: P2)

**Goal**: Ensure JS, Python, and C++ work reliably in isolated containers.

**Independent Test**: Submit a C++ solution and verify it compiles and executes correctly.

### Implementation for User Story 3

- [x] T016 [US3] Update `worker/dockerRunner.js` to handle C++ compilation (`g++`) and execution
- [x] T017 [US3] [P] Configure base Docker images (`python:3.10-slim`, `node:18-slim`, `gcc`) for consistency
- [x] T018 [US3] Implement SIGKILL timeouts and resource limits in `worker/dockerRunner.js`

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T019 [P] Add error logging for failed Docker executions or Firestore updates
- [ ] T020 Run full end-to-end traversal of "Run" and "Submit" flows for all languages
- [ ] T021 [P] Ensure all artifacts (screenshots/videos) are updated in `assets/`
- [ ] T022 Update `walkthrough.md` with final judge pipeline demo

---

## Dependencies & Execution Order

- **Phase 1 & 2**: MUST be completed first to establish the bridge.
- **Phase 3 (US1)**: Can be implemented and verified independently as MVP.
- **Phase 4 (US2)**: Depends on Phase 3 logic for base execution but adds the judging layer.
- **Phase 5 (US3)**: Can run in parallel with US1/US2 implementation tasks for specific file updates in `dockerRunner.js`.
