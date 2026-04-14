# Implementation Plan: Core API Enhancements

**Branch**: `001-core-enhancements` | **Date**: 2026-04-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `spec.md`

## Summary

Enhancing the AI Code Reviewer with a Job Status Polling API, a Redis cache for inputs (7-day TTL), multi-language Docker execution (Go, Node, Python), a real-time WebSocket layer for notifications, and a GitHub webhook listener for automated PR reviews using HMAC validation.

## Technical Context

**Language/Version**: Node.js 18+
**Primary Dependencies**: Express, BullMQ, ioredis, Socket.io, crypto (built-in)
**Storage**: Redis
**Testing**: Jest / Postman
**Target Platform**: Docker
**Project Type**: Backend API + Worker
**Performance Goals**: <50ms cache hits
**Constraints**: 10s strict timeout for Docker executions
**Scale/Scope**: Handling stateless async jobs for real-time review

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Asynchronous By Default (API hands off to BullMQ via Cache checks)
- [x] Containerized Isolation (Docker strictly constrained to 10s)
- [x] AI-Enhanced Reviews (Worker calls OpenAI over BullMQ retry queue)

## Project Structure

### Documentation (this feature)

```text
specs/001-core-enhancements/
├── plan.md              # This file
├── research.md          # Node.js/Docker API context
├── data-model.md        # AI Review format & Cache layout
├── quickstart.md        # Testing webhook and sockets
└── contracts/api.yaml   # Endpoint structures
```

### Source Code

```text
backend/
├── api/
│   ├── app.js         # Modified (Socket.IO + Routes)
│   ├── routes.js      # Modified (GH Webhook + Cache + BullMQ polling)
│   └── queue.js       
├── worker/
│   ├── worker.js      # Modified (Retries + Fallbacks)
│   └── dockerRunner.js# Modified (Go support + 10s timeouts)
└── docker-compose.yaml
```

**Structure Decision**: Code changes are surgically injected into the existing backend API and Worker directories to preserve the current mono-repo stack.
