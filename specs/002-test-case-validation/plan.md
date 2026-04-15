# Implementation Plan: Automated Test Case Validation

**Branch**: `002-test-case-validation` | **Date**: 2026-04-15 | **Spec**: [spec.md](file:///c:/Users/ANIRUDDHA/OneDrive/Documents/Projects/ai-code-reviewer/specs/002-test-case-validation/spec.md)

## Summary

Migration of the execution engine to a multi-test model with "LeetCode-style" function abstraction and specialized AI feedback logic.

## Technical Context

- **Primary Dependencies**: Docker, BullMQ, nlohmann/json (C++), Node.js v18
- **Architecture**: The 'Hidden Judge' model. User code is injected into a language-specific wrapper that handles argument parsing and result capture.

## Proposed Changes

### Phase 2: Execution Engine (Docker)
- Implemented `wrapCode` logic in `dockerRunner.js`.
- Added **Smart Judge** for Python, Node, and C++.
- C++ Judge uses variadic templates for auto-detecting user function signatures.

### Phase 3: Worker Orchestration & AI
- `worker.js` handles the test loop and success/failure branching.
- `aiReviewer.js` generates "Diagnosis" vs "Optimization" prompts.

## Project Structure

```text
api/
├── routes.js            # Submit endpoint
worker/
├── dockerRunner.js       # The 'Hidden Judge' Wrapper logic
├── worker.js            # Multi-test orchestration
└── aiReviewer.js        # Success/Failure branching prompts
```
