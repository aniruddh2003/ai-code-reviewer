# 🏗️ System Architecture

## Overview

This system processes user-submitted code asynchronously using a queue-based architecture.

---

## Flow

Client → API → Redis Queue → Worker → Docker Execution → Result

---

## Components

### API

- Handles incoming requests
- Pushes jobs to queue
- Exports Prometheus metrics

### Redis

- Stores job queue

### Worker

- Consumes jobs
- Executes code in isolated Docker containers
- Generates AI feedback
- Publishes performance metrics

### Execution Containers

- **python-runner** - Executes Python 3.10 code safely
- **js-runner** - Executes JavaScript/Node.js 18 code safely
- Both containers have resource limits (100MB memory, 0.5 CPU) and 10-second timeout

---

## Execution Flow

1. User submits code
2. API creates job
3. Worker picks job
4. Docker container runs code
5. Output + AI feedback returned

---

## Key Concepts

- Asynchronous processing
- Container isolation
- Service-to-service communication
