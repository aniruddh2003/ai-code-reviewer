# Implementation Plan: LeetCode-Style Platform Core (003)

**Branch**: `003-leetcode-platform-frontend` | **Date**: 2026-04-16 | **Spec**: [spec.md](file:///c:/Users/ANIRUDDHA/OneDrive/Documents/Projects/ai-code-reviewer/specs/003-leetcode-platform-frontend/spec.md)

## Summary
Architect a full-stack LeetCode-style platform using a React/Vite frontend and Firebase (Auth/Firestore) for state management. This plan includes real-time submission tracking and **on-demand AI reviews featuring Time/Space complexity analysis**.

## Technical Context

**Language/Version**: React 18+ (TS), Node.js 18+  
**Primary Dependencies**: `firebase`, `monaco-editor`, `framer-motion`, `lucide-react`, `tailwindcss`  
**Storage**: Google Firestore (NoSQL), Firebase Auth  
**Testing**: Firebase Emulator Suite  
**Target Platform**: Web (Vite)  
**Project Type**: Web Application (Frontend + Judge Worker)  
**Performance Goals**: Theme toggle <100ms, Submission latency (sync to Firestore) <500ms.  
**Constraints**: Firestore 1MB document limit; sub-100ms UI responsiveness.

## Constitution Check (v1.1.0)

- **Identity-First Governance**: **PASSED**. Every submission requires a Firebase Auth UID.
- **Immutable Submission History**: **PASSED**. Firestore record model established in `data-model.md`.
- **Asynchronous Processing**: **PASSED**. Judge Worker listens to Firestore updates and runs asynchronously.
- **Containerized Isolation**: **PASSED**. No changes to the existing Docker sandboxing logic.

## Project Structure (Web Application)

```text
frontend/
├── src/
│   ├── components/
│   │   ├── Editor/         # Monaco Editor with theme support
│   │   ├── Auth/           # Firebase Auth logic
│   │   └── Layout/         # Glassmorphic shell
│   ├── firebase/           # Config and initialization
│   ├── hooks/              # useFirestoreSubmissions, useAuth
│   └── stores/             # Theme store, user store
└── tests/

backend/ (Judge Worker)
├── src/
│   ├── services/           # Firestore listener + Docker runner
│   └── config/             # Firebase Admin SDK setup
```

## Proposed Changes

### Documentation (Specs/Design)

#### [NEW] [research.md](file:///c:/Users/ANIRUDDHA/OneDrive/Documents/Projects/ai-code-reviewer/specs/003-leetcode-platform-frontend/research.md)
Documented decisions on Firestore subcollections and real-time synchronization.

#### [NEW] [data-model.md](file:///c:/Users/ANIRUDDHA/OneDrive/Documents/Projects/ai-code-reviewer/specs/003-leetcode-platform-frontend/data-model.md)
Defined schemas for `users`, `problems`, `submissions`, and `testCases`.

#### [NEW] [contracts/submissions.md](file:///c:/Users/ANIRUDDHA/OneDrive/Documents/Projects/ai-code-reviewer/specs/003-leetcode-platform-frontend/contracts/submissions.md)
Defined the submission request schema and Firestore Security Rules.

## Verification Plan

### Manual Verification
- **Auth Flow**: Verify user can login and their UID is correctly associated with submissions.
- **Real-time Sync**: Confirm that when a worker updates a Firestore doc, the frontend UI (status badge) updates instantly without a refresh.
- **Theme Persistence**: Verify that the selected theme survives a page reload via `localStorage`.
- **Docker Isolation**: Ensure that malicious code (e.g., `fs.unlink("/")`) still results in a "Runtime Error" and is safely captured in the `submission.errorLog`.
