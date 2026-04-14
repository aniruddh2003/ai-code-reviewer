# 🏗️ System Architecture

## Overview

This system processes user-submitted code asynchronously using a robust queue and caching architecture, ensuring secure executions decoupled from the REST API interface.

---

## Flow

1. Client POSTs Code → API (Checks Redis Cache Hash)
   - *If cache hit*: Return instantly
   - *If cache miss*: Enqueue Job in Redis → Worker
2. Worker → Executes Docker Code in isolated container (Strict 10s Limits)
3. Worker → Sends container output to OpenAI for Review (Exponential Retries)
4. Worker saves output + AI Review into Redis Cache (7 day TTL)
5. API layer broadcasts updates to Clients via Socket.io Event Bus

---

## Components

### API

- Handles incoming REST requests + GitHub Webhooks (HMAC verification)
- Resolves instantaneous cache hits
- Exposes Socket.io WebSocket connections for live notifications
- Pushes jobs to BullMQ queue
- Exports Prometheus metrics

### Redis

- Acts as a 7-day memory cache for avoiding redundant AI/Docker execution
- Stores BullMQ tracking jobs

### Worker

- Consumes BullMQ jobs
- Executes code in isolated Docker containers safely limiting deadlocks
- Integrates with OpenAI APIs
- Posts PR comments natively back to GitHub Webhooks

### Execution Containers

All containers represent secure Runtime Executions bound by strict 10 second timeouts.
- **python-runner** - Executes Python 3.10
- **js-runner** - Executes JavaScript/Node.js 18
- **golang:1.20-alpine** - Executes compiled Go routines

---

## Key Concepts

- Asynchronous processing (BullMQ)
- Deterministic Caching (Bypassing heavy workloads securely)
- Ironclad Security Isolation (10s Hard bounds on containers)
- Event-Driven Streams (WebSockets Pub/Sub)
