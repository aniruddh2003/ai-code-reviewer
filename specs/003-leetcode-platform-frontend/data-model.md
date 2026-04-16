# Data Model: LeetCode Platform Core

## Firestore Collections

### 1. `users` (Collection)
Represents platform members.
- `uid`: string (Primary ID from Firebase Auth)
- `displayName`: string
- `photoURL`: string
- `stats`: map
    - `solvedCount`: number
    - `totalSubmissions`: number
- `createdAt`: timestamp

### 2. `problems` (Collection)
Represents coding challenges.
- `id`: string (Slug-based index)
- `title`: string
- `difficulty`: enum (`EASY`, `MEDIUM`, `HARD`)
- `tags`: array<string>
- `description`: string (Markdown)
- `starterCode`: map
    - `javascript`: string
    - `python`: string
    - `cpp`: string
- **`testCases`** (Subcollection)
    - `input`: string
    - `expectedOutput`: string
    - `isPublic`: boolean (Visible to user on failure vs. hidden)

### 3. `submissions` (Collection)
Represents a user's attempt at a problem.
- `id`: string (Auto-generated)
- `userId`: string (Reference to users.uid)
- `problemId`: string (Reference to problems.id)
- `code`: string
- `language`: string
- `status`: enum (`PENDING`, `ACCEPTED`, `WRONG_ANSWER`, `TIME_LIMIT_EXCEEDED`, `RUNTIME_ERROR`)
- `runtimeMs`: number
- `timestamp`: timestamp (Server-side)
- `errorLog`: string (Optional)
- `aiReview`: map (Nullable)
    - `summary`: string
    - `timeComplexity`: string (e.g., "O(N log N)")
    - `spaceComplexity`: string (e.g., "O(1)")
    - `status`: enum (`PENDING`, `COMPLETED`, `FAILED`)
    - `comments`: array<map>
        - `line`: number
        - `content`: string
        - `type`: enum (`BUG`, `OPTIMIZATION`, `STYLE`)
- `results`: array<map>
    - `testCaseId`: string
    - `passed`: boolean
    - `actualOutput`: string (Stored only for public test cases)

## State Transitions (Submissions)

1. **`PENDING`**: Initial state when created by Frontend.
2. **`RUNNING`**: Updated by Judge Worker when picked up (Optional).
3. **`COMPLETED`**: Terminal state (Map to `ACCEPTED`, `WRONG_ANSWER`, etc. based on logic).
