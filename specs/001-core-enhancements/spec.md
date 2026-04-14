# Feature Specification: Core API Enhancements

**Feature Branch**: `001-core-enhancements`  
**Created**: 2026-04-14  
**Status**: Draft  
**Input**: User description: "all above (Job Status API, Result Caching, Multi-language Support, WebSockets, GitHub Webhook)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Result Caching (Priority: P1)

Users submitting identical code snippets for review will receive instantaneous results without triggering additional OpenAI processing charges or Docker container cycles.

**Why this priority**: Saves immediate compute and API costs, avoiding redundant work.
**Independent Test**: Can be tested by submitting identical code twice; the second run completes instantaneously without contacting OpenAI.

**Acceptance Scenarios**:
1. **Given** no previous run, **When** a user submits code, **Then** the system hashes the input, executes it fully, and caches the result.
2. **Given** a cached run exists, **When** a user submits the exact same code + language, **Then** the system returns the cached AI review and Docker output, bypassing the BullMQ worker queue entirely.

---

### User Story 2 - Job Status Polling API (Priority: P1)

Clients integrating with the `/submit` API can individually request the status of a specific job ID returned from their submission.

**Why this priority**: Critical for fundamental API UX given the asynchronous nature of BullMQ jobs.
**Independent Test**: Submit a long-running code snippet and curl `/status/:id` to check the `queued`, `active`, and `completed` states.

**Acceptance Scenarios**:
1. **Given** a valid queued job ID, **When** the client queries `GET /status/:id`, **Then** the system returns `{ status: "queued|active", ... }`.
2. **Given** a completed job ID, **When** the client queries `GET /status/:id`, **Then** the system returns `{ status: "completed", result: { ... } }`.

---

### User Story 3 - Multi-Language Code Support (Priority: P2)

Users can specify the programming language (e.g., Python, Node.js, Go) when submitting their code, and the Docker engine runs it in the appropriate secure runtime environment.

**Why this priority**: Greatly expands the platform's versatility beyond a hardcoded language runtime.
**Independent Test**: Can be tested by submitting valid code strings in Python, JS, and Go, and verifying appropriate output logs and AI reviews.

**Acceptance Scenarios**:
1. **Given** payload `{"code": "print('hi')", "language": "python"}`, **When** executed, **Then** a Python Docker container executes it.
2. **Given** an unsupported language, **When** submitted, **Then** the API rejects it synchronously with a 400 Bad Request.

---

### User Story 4 - Real-Time WebSocket Notifications (Priority: P2)

Clients connecting via WebSockets receive instantaneous state transition events (e.g. queue progression, review completion) over an open socket, avoiding polling delays.

**Why this priority**: Improves frontend responsiveness and creates a "live" feel to execution tracking.
**Independent Test**: Can be tested via a Socket.io/WebSocket test client visually observing `job_started` and `job_finished` events in real-time.

**Acceptance Scenarios**:
1. **Given** an active Socket connection listening to events for `job_123`, **When** the worker finishes processing, **Then** a `completed` event is emitted containing the output and AI review to that client.

---

### User Story 5 - GitHub PR Webhook Integration (Priority: P3)

Repository admins can configure a GitHub webhook that automatically sends PR data to the engine. The engine dynamically evaluates the changed code and posts an AI code review directly as a PR comment.

**Why this priority**: Delivers massive value by embedding the product directly into existing developer CI/CD workflows.
**Independent Test**: Send a mock GitHub PR webhook JSON to the endpoint and observe the AI review successfully posted to a test GitHub repo.

**Acceptance Scenarios**:
1. **Given** a valid GitHub incoming Webhook payload, **When** a PR is opened/synchronized, **Then** the code is queued, and the resulting AI review is posted back to the PR URL using the GitHub API.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a `GET /status/:jobId` endpoint returning accurate state logic derived from BullMQ.
- **FR-002**: System MUST hash incoming code + language combinations with `SHA-256` and query a Redis cache prior to queueing.
- **FR-003**: System MUST accept a `language` parameter on `/submit` (supported values: `python`, `node`, `go`).
- **FR-004**: System MUST emit WebSocket events mapping to BullMQ's global status transitions.
- **FR-005**: System MUST expose a `POST /webhook/github` endpoint capable of processing `pull_request` types.
- **FR-006**: System MUST securely use a GitHub PAT (Personal Access Token) from `.env` to communicate with the GitHub API.

### Key Entities

- **Job Cache**: Represents the executed result (Docker stdout + AI review) stored in Redis via short hash.
- **Webhook Payload**: The PR diff details parsed from GitHub to be passed to the code execution and AI review pipeline.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Cache hits skip queueing entirely and return execution output in under 50ms.
- **SC-002**: `/status/:jobId` correctly maps all BullMQ states (waiting, active, completed, failed) reliably.
- **SC-003**: Multi-language execution securely handles Python, Node.js, and Golang with the exact same strict Docker constraints.
- **SC-004**: WebSocket states are propagated rapidly to connected clients.
- **SC-005**: GitHub webhooks are immediately acknowledged with a 200 OK within 2 seconds, safely delegating the heavy processing and GitHub PR comment API call to the worker queue.
