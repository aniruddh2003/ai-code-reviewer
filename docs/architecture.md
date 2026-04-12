# 🏗️ System Architecture

## Overview

This system processes user-submitted code asynchronously using a queue-based architecture.

---

## Flow

Client → API → Redis Queue → Worker → Docker Execution → Result

---

## Components

### API

* Handles incoming requests
* Pushes jobs to queue
* Exports Prometheus metrics

### Redis

* Stores job queue

### Worker

* Consumes jobs
* Executes code in Docker
* Generates AI feedback
* Publishes performance metrics

### Metrics System

* Tracks queue depth, job duration, completion/failure rates
* Exports metrics via `/metrics` endpoint (Prometheus format)
* Includes system-level metrics (CPU, memory, file descriptors)

---

## Execution Flow

1. User submits code
2. API creates job
3. Worker picks job
4. Docker container runs code
5. Output + AI feedback returned

---

## Key Concepts

* Asynchronous processing
* Container isolation
* Service-to-service communication
