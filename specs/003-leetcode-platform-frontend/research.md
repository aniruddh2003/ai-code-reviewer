# Technical Research: LeetCode-Style Platform Architecture

**Feature**: `003-leetcode-platform-frontend`
**Status**: Resolved

## 1. Firebase Firestore Schema

### Decision
Use a normalized structure for top-level entities (`users`, `questions`, `submissions`) and subcollections for high-volume child data (`testCases`).

### Rationale
- **Subcollections**: Storing test cases in `questions/{id}/testCases` keeps the main question document lightweight (under 1MB) and prevents unnecessary data fetching.
- **Normalization**: Separating `submissions` allows for easier querying of user history and platform-wide metrics without inflating the `user` document.

### Alternatives Considered
- **Embedded Arrays**: Rejected. Storing test cases as an array within the question document would hit the 1MB document limit as complexity grows.
- **Root-level testCases**: Rejected. Harder to manage cascading deletes and security rules compared to subcollections.

## 2. Real-time State Synchronization

### Decision
Transition from **Socket.io** to **Firestore Real-time Snapshots** for the platform's primary feedback loop.

### Rationale
- **Simplicity**: Firestore listeners provide out-of-the-box support for offline persistence, auto-reconnection, and change detection.
- **Decoupling**: The Judge Worker can simply update a submission document, and the Frontend will immediately reflect the change without needing a middle-man Socket server.

## 3. Identity & Authentication

### Decision
Use **Firebase Authentication** with Social (GitHub/Google) and Email/Password providers.

### Rationale
- **Native Integration**: Seamlessly integrates with Firestore Security Rules for identity-aware data access.
- **Speed**: Removes the burden of managing JWTs, password hashing, and session persistence manually.

## 4. Judging Workflow

### Decision
Maintain the **Express-based Judge Service** but have it act as a "Firestore Worker".

### Flow:
1. Frontend creates a `submission` doc in Firestore (Status: `PENDING`).
2. Judge Service (Worker) listens for new docs via a Firestore Admin watcher.
3. Judge Service executes code in Docker and calculates results.
4. Judge Service updates the `submission` doc in Firestore (Status: `AC`, `WA`, etc.).
5. Frontend listener detects the update and displays results.
