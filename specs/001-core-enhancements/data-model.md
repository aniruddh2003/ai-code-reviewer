# Data Model

## Cache Layer (Redis)

1. **JobCacheRecord**
   - **Fields**: Hash (SHA256 of code + language), Output (Docker result), AIFeedback (OpenAI output).
   - **TTL**: 7 Days (Via Redis `SETEX`).
   - **State**: Ephemeral.

## Communication Layer (Socket.io)

2. **WebSocketEvent**
   - **Type**: `job_update`
   - **Payload**: 
     - `jobId`: string (UUID)
     - `status`: string ('queued' | 'active' | 'completed' | 'failed')
     - `result`: Optional, contains the stdout and aiFeedback when status is completed.
