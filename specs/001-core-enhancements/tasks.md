# Tasks: Core API Enhancements

**Input**: Design documents from `/specs/001-core-enhancements/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/api.yaml

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 `npm install socket.io` in the local directory.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T002 Implement base API structure inside `api/routes.js` and `api/app.js` to ensure the app boots locally alongside redis.

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Result Caching (Priority: P1) 🎯 MVP

**Goal**: Users submitting identical code snippets for review will receive instantaneous results without triggering additional OpenAI processing charges or Docker container cycles.

**Independent Test**: Can be tested by submitting identical code twice; the second run completes instantaneously without contacting OpenAI.

### Implementation for User Story 1

- [x] T003 [P] [US1] Create Redis Hash logic in `api/routes.js` to hash `SHA256(code+language)` into an internal cache key, while still returning a fresh UUIDv4 Job ID to the user for WebSocket tracking.
- [x] T004 [US1] Inject the caching logic mapping `SHA256(code+language)` to Redis `SETEX` (7-day TTL) before BullMQ queueing additions.

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Job Status Polling API (Priority: P1)

**Goal**: Clients integrating with the `/submit` API can individually request the status of a specific job ID returned from their submission.

**Independent Test**: Submit a long-running code snippet and curl `/status/:id` to check the `queued`, `active`, and `completed` states.

### Implementation for User Story 2

- [x] T005 [P] [US2] Create endpoint `GET /status/:jobId` in `api/routes.js`.
- [x] T006 [US2] Call `codeQueue.getJob(jobId)` and map/resolve job state and results directly inside the endpoint.

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Multi-Language Code Support (Priority: P2)

**Goal**: Users can specify the programming language (e.g., Python, Node.js, Go) when submitting their code, and the Docker engine runs it in the appropriate secure runtime environment.

**Independent Test**: Can be tested by submitting valid code strings in Python, JS, and Go, and verifying appropriate output logs and AI reviews.

### Implementation for User Story 3

- [x] T007 [P] [US3] Add `golang` handling logic mapping `go run script.go` in `worker/dockerRunner.js`.
- [x] T008 [P] [US3] Enforce strict execution timeout variables inside the docker container commands uniformly to 10000ms for Python, Node.js, and Golang in `worker/dockerRunner.js`.

**Checkpoint**: Languages should execute properly and safely up to 10s.

---

## Phase 6: User Story 4 - Real-Time WebSocket Notifications (Priority: P2)

**Goal**: Clients connecting via WebSockets receive instantaneous state transition events over an open socket.

**Independent Test**: Can be tested via a Socket.io test client visually observing job events.

### Implementation for User Story 4

- [x] T009 [P] [US4] Bind Socket.io Server to the active Express `http.createServer` instance in `api/app.js`.
- [x] T010 [US4] Add global QueueEvents to listen to BullMQ. Emit `job_started` and `job_completed` payloads via `socket.emit`.

---

## Phase 7: User Story 5 - GitHub PR Webhook Integration (Priority: P3)

**Goal**: Dynamic execution pipeline attached to PR events to post automated comments.

**Independent Test**: Send a mock GitHub PR webhook JSON to the endpoint and observe the API log.

### Implementation for User Story 5

- [x] T011 [P] [US5] Implement `POST /webhook/github` route in `api/routes.js` to parse `x-hub-signature-256`.
- [x] T012 [P] [US5] Validate HMAC signature via built-in `crypto` Node library against `process.env.GITHUB_WEBHOOK_SECRET`.
- [x] T013 [US5] Use native `fetch` API to securely post the AI output to the GitHub comment URL extracted from the PR payload, ensuring the worker environment exposes `process.env.GITHUB_WEBHOOK_SECRET` and a valid GitHub `PAT`.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T014 Update BullMQ jobs initialization mapping in the main routing/queue files to use exponential backoff and 3 retries (to circumvent OpenAI rate limitations).
- [x] T015 Verify `quickstart.md` logic works locally.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### Parallel Opportunities

- Caching (US1) and Polling (US2) can be built in parallel.
- WebHook Auth logic (US5) can be authored simultaneously with Docker runner updates (US3).
