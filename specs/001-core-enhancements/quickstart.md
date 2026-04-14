# Quickstart

## Local Testing for Webhooks and Sockets

### 1. Boot up Stack
```bash
docker-compose up --build
```

### 2. Test Socket.io (Browser Console)
Connect to the API from any client script to automatically receive Job pushes without polling!
```javascript
const socket = io("http://localhost:3000"); 
socket.on("job_update", (data) => console.log(data));
```

### 3. Trigger GitHub Webhook Mocks
```bash
# Provide a valid x-hub-signature-256 header (or configure to allow dummy requests in DEV)
curl -X POST http://localhost:3000/webhook/github \
-H "x-hub-signature-256: sha256=123..." \
-d '{"action": "opened", "pull_request": {"url": "..."}}'
```
