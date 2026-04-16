# API Contract: Code Submission

## Endpoint: `POST /v1/submissions`
*Note: In the Firebase implementation, this translates to a `CollectionReference.add()` operation on the `submissions` collection.*

### Request Body (Schema)

```json
{
  "userId": "string (Firebase UID)",
  "problemId": "string (Problem unique ID)",
  "code": "string (Source code content)",
  "language": "enum (javascript | python | cpp)",
  "timestamp": "ISO-8601 or Firebase ServerValue.serverTimestamp()"
}
```

### Validation Rules
1. `userId` MUST match the authenticated user's UID (Enforced via Firebase Rules).
2. `code` MUST NOT exceed 1MB (Standard Firestore limit).
3. `language` MUST be one of the supported execution environments.

### Response (Async)
The server returns the `submissionId`. The actual execution result is delivered via Firestore real-time updates on the created document.

## Firestore Security Rule Contract

```javascript
service cloud.firestore {
  match /databases/{database}/documents {
    match /submissions/{submissionId} {
      // Users can only create submissions for themselves
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      
      // Users can only read their own submissions
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      
      // Only the Judge Admin (Service Account) can update status/results
      allow update: if false; 
    }
    
    match /problems/{problemId} {
      allow read: if request.auth != null;
      allow write: if false; // Admin only
    }
  }
}
```
