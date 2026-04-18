# Implementation Plan: LeetCode Judge Pipeline Finalization (004)

**Branch**: `004-judge-pipeline-finalization` | **Date**: 2026-04-18 | **Spec**: [spec.md](file:///c:/Users/ANIRUDDHA/OneDrive/Documents/Projects/ai-code-reviewer/specs/004-judge-pipeline-finalization/spec.md)

## Summary
Build the technical bridge between Firestore and the Docker-based Judge Worker. This includes a new `bridge.js` service for Firestore Change Data Capture (CDC) and worker enhancements for secure multi-language execution.

## Technical Context
- **Language/Version**: Node.js 18+ (Worker), TypeScript (Frontend).
- **Primary Dependencies**: `firebase-admin`, `bullmq`, `ioredis`, `dockerode`.
- **Database**: Firestore (Submissions, Problems).
- **Execution Environment**: Docker with `node:18-slim`, `python:3.10-slim`, `gcc`.

## Proposed Changes

### Backend (Judge Worker)

#### [NEW] [bridge.js](file:///c:/Users/ANIRUDDHA/OneDrive/Documents/Projects/ai-code-reviewer/worker/bridge.js)
Service account listener for Firestore `submissions`. Enqueues jobs into BullMQ.

#### [MODIFY] [worker.js](file:///c:/Users/ANIRUDDHA/OneDrive/Documents/Projects/ai-code-reviewer/worker/worker.js)
Refactor core processing loop to fetch problem test cases and write results back to Firestore.

#### [MODIFY] [dockerRunner.js](file:///c:/Users/ANIRUDDHA/OneDrive/Documents/Projects/ai-code-reviewer/worker/dockerRunner.js)
Hardening for multi-language execution and SIGKILL time-outs.

### Frontend

#### [MODIFY] [ProblemDetail.tsx](file:///c:/Users/ANIRUDDHA/OneDrive/Documents/Projects/ai-code-reviewer/frontend/src/pages/ProblemDetail.tsx)
Sync submit payload with new worker expectations; handle real-time status updates from Firestore.

## Verification Plan

### Automated Tests
- Run `node worker/dockerRunner.test.js` to verify isolation.
- Integration test forFirestore-BullMQ listener.

### Manual Verification
- Test "Run" with correct/incorrect code.
- Test "Submit" in JS, Python, and C++.
- Verify status updates (Accepted, TLE, WA) in the IDE dashboard.
