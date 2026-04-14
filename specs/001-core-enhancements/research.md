# Phase 0: Research

1. **Docker Execution for Go**: We need to support `go`. Go is compiled, so the runner must use a `golang` base image and run `go run script.go`.
  - *Decision*: Bound execution with strict 10s timeout using `docker run --rm ... golang go run script.go`.

2. **GitHub Webhook Verification**: 
  - *Decision*: Utilize the standard Node.js `crypto` library to hash the payload using `process.env.GITHUB_WEBHOOK_SECRET` and compare it to the `x-hub-signature-256` payload string.

3. **BullMQ Retries for OpenAI**: 
  - *Decision*: Setting `attempts: 3` and `backoff: { type: 'exponential', delay: 1000 }` directly in the `add()` call options handles the OpenAI retry logic automatically without complex custom loop logic in the worker.

4. **WebSocket Attachment**:
  - *Decision*: Attach Socket.io directly to the main `http.createServer(app)` instance in `api/app.js` to ensure they share the same public port mapping (`3000`) without breaking Docker compose configuration.
