# Tasks: Automated Test Case Validation

**Input**: Design documents from `/specs/002-test-case-validation/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/api.yaml

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create specification markers and verify directory structure in `specs/002-test-case-validation/`
- [x] T002 [P] Verify `bullmq` and `ioredis` connection health in `worker/worker.js`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T003 [P] Modify `worker/dockerRunner.js` to support interactive stdin via shell piping (`echo "..." | docker run -i ...`)
- [x] T004 [P] Update `api/routes.js` to accept `testCases` array in the `POST /submit` payload per the [Data Model](file:///c:/Users/ANIRUDDHA/OneDrive/Documents/Projects/ai-code-reviewer/specs/002-test-case-validation/data-model.md)
- [x] T005 [P] Update `api/routes.js` validation to limit `testCases` array size (e.g., max 10) to prevent DoS
- [x] T006 Update `api/queue.js` (or submission logic) to pass `testCases` into the BullMQ job data

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Robust Functional Verification via STDIN (Priority: P1) 🎯 MVP

**Goal**: Execute code against multiple STDIN inputs and report PASS/FAIL results.

**Independent Test**: Use the [Quickstart](file:///c:/Users/ANIRUDDHA/OneDrive/Documents/Projects/ai-code-reviewer/specs/002-test-case-validation/quickstart.md) sample to submit code with two test cases and receive a JSON response with correct `status` for each.

### Implementation for User Story 1

- [x] T007 [US1] Implement serial test execution loop in `worker/worker.js` to process `testCases`
- [x] T008 [US1] Handle error and timeout aggregation in `worker/worker.js` to populate the `testResults` report structure
- [x] T009 [US1] Modify `worker/worker.js` to return the new aggregated result format (including `allPassed` boolean)
- [x] T010 [US1] Update `api/routes.js` caching logic (T003/T004 from 001) to include `testCases` in the cache key hash

**Checkpoint**: Functional verification is now working and testable independently.

---

## Phase 4: User Story 2 - Insightful Failure Reasoning (Priority: P1)

**Goal**: AI feedback specifically addresses *why* a test failed.

**Independent Test**: Submit a script that fails a specific test case; verify the AI response contains a "Failure Analysis" section.

### Implementation for User Story 2

- [x] T011 [US2] update `worker/aiReviewer.js` to accept `testResults` and `allPassed` parameters
- [x] T012 [US2] Implement dynamic prompt logic in `worker/aiReviewer.js`: If `!allPassed`, instruct AI to focus on failure diagnosis and logic errors
- [x] T013 [US2] Ensure `worker/worker.js` passes the failed test details (input/actual/expected) into the AI review call

---

## Phase 5: User Story 3 - Asymptotic Optimization Advice (Priority: P2)

**Goal**: AI feedback provides complexity analysis when all tests pass.

**Independent Test**: Submit an O(n^2) sort that passes all tests; verify the AI response contains "Complexity Analysis" and O(n log n) suggestions.

### Implementation for User Story 3

- [x] T014 [US3] Implement dynamic prompt logic in `worker/aiReviewer.js`: If `allPassed`, instruct AI to provide Big-O time complexity and optimization tips
- [x] T015 [US3] Add "Efficiency Guard" instruction to prompt to prevent generic feedback when optimization is the focus

---

## Phase N: Polish & Cross-Cutting Concerns

- [ ] T016 [P] Update `README.md` to document the new `testCases` API capability
- [ ] T017 Verify `quickstart.md` logic works locally for all three languages (Python, Node, Go)
- [ ] T018 Code cleanup in `worker/worker.js` and `api/routes.js`

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)**: Start immediately
- **Foundational (Phase 2)**: Depends on T001 - BLOCKS all User Stories
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion (T003-T006)
- **User Story 2 & 3 (Phases 4 & 5)**: Depend on US1 (Phase 3) completion for results data

### Parallel Opportunities
- T003 (Worker) and T004/T005 (API) can be implemented in parallel
- T012 and T014 (Prompt Logic) can be refined simultaneously
