# Tasks: LeetCode-Style Platform Frontend (003)

**Input**: Design documents from `/specs/003-leetcode-platform-frontend/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Initialize Vite/React project structure in `frontend/`
- [ ] T002 Install dependencies (firebase, monaco-editor, tailwindcss, framer-motion, lucide-react) in `frontend/package.json`
- [ ] T003 [P] Configure Firebase Client SDK in `frontend/src/firebase/config.ts`
- [ ] T004 Setup Firebase Emulator for local testing in project root
- [ ] T005 Update root `README.md` to reflect full-stack platform vision

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Implement Glassmorphic Shell/Layout in `frontend/src/components/Layout`
- [ ] T007 Create Theme Store (Zustand/Context) in `frontend/src/stores/themeStore.ts`
- [ ] T008 [P] Implement `useAuth` hook for Firebase Auth in `frontend/src/hooks/useAuth.ts`
- [ ] T009 [P] Define Firestore Security Rules in `firestore.rules` per `contracts/submissions.md`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Multi-Theme Problem Solving (Priority: P1) 🎯 MVP

**Goal**: Solve coding problems in a dark or light environment with immediate visual feedback.

**Independent Test**: User can toggle between dark and light themes, and the Monaco editor/UI elements update immediately.

### Implementation for User Story 1

- [ ] T010 [P] [US1] Create Monaco Editor component with theme awareness in `frontend/src/components/Editor/CodeEditor.tsx`
- [ ] T011 [US1] Implement Theme Toggle UI in `frontend/src/components/Layout/ThemeToggle.tsx`
- [ ] T012 [US1] Create Problem View layout with description and editor panes in `frontend/src/pages/ProblemPage.tsx`
- [ ] T013 [US1] Implement local storage persistence for theme in `themeStore.ts`

**Checkpoint**: User Story 1 (Theming & Editor) fully functional.

---

## Phase 4: User Story 2 - Authenticated Code Submission (Priority: P1)

**Goal**: Sign in and submit code for execution with real-time status updates.

**Independent Test**: Authenticated user submits solution, status badge updates from "PENDING" to "ACCEPTED/WRONG_ANSWER".

### Implementation for User Story 2

- [ ] T014 [US2] Skeleton Judge Worker in `backend/src/worker.ts`
- [ ] T015 [US2] Implement Firestore listener in Judge Worker to pick up `PENDING` submissions
- [ ] T016 [US2] Integrate Docker runner into Judge Worker for secure execution
- [ ] T017 [US2] Implement `useSubmissions` hook for real-time Firestore sync in `frontend/src/hooks/useSubmissions.ts`
- [ ] T018 [US2] Implement Submit button logic and status tracking in `ProblemPage.tsx`

**Checkpoint**: End-to-end authenticated submission flow functional.

---

## Phase 5: User Story 3 - Past Submissions Review (Priority: P2)

**Goal**: View a history of previous submissions with code and AI-powered insights.

**Independent Test**: User views a "Submissions" tab and sees a list of past attempts with "Ask AI Review" toggle.

### Implementation for User Story 3

- [ ] T019 [P] [US3] Create Submissions Table/List in `frontend/src/components/Submissions/SubmissionList.tsx`
- [ ] T020 [US3] Implement Submission Detail modal with code viewer in `frontend/src/components/Submissions/SubmissionDetail.tsx`
- [ ] T021 [US3] Implement "Ask AI Review" trigger and display logic (Complexity/Annotations) in `SubmissionDetail.tsx`

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T022 Documentation updates in `docs/` and `README.md`
- [ ] T023 Performance optimization for Monaco editor rendering
- [ ] T024 Final security audit of Docker isolation and Firestore Rules

---

## Dependencies & Execution Order

- **Setup (Phase 1)**: Must complete T001-T004 first.
- **Foundational (Phase 2)**: T006-T009 block all User Story phases.
- **User Stories**:
  - US1 (Theme) is the MVP priority.
  - US2 (Submission) depends on US1 layout but is technically independent for the backend part.
  - US3 (History) depends on US2 data population.

## Implementation Strategy

### MVP First (User Story 1 & Auth)
1. Setup + Foundational
2. US1 Implementation
3. US2 Auth & Submission
4. **VALIDATE**: End-to-end "Code to Result" loop.
