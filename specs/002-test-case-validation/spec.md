# Feature Specification: Automated Test Case Validation

**Feature Branch**: `002-test-case-validation`  
**Created**: 2026-04-15  
**Status**: Finalized  
**Input**: User description: "Automated Multilingual Test Validation with LeetCode-style function abstraction and failure reasoning."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - LeetCode-Style Functional Abstraction (Priority: P1)

As a developer, I want to submit only a function solution (e.g., `solution`) without boilerplate competitive-programming I/O code, so that I can focus purely on algorithmic logic.

**Why this priority**: Core value proposition. Eliminates friction and improves the quality of AI-generated solutions.

**Independent Test**: Can be tested by submitting a Python snippet `def solution(a, b): return a + b` with test cases `1 2 -> 3` and verifying automated parsing.

**Acceptance Scenarios**:

1. **Given** a function-only snippet, **When** executed, **Then** the engine MUST automatically map stdin lines to function arguments based on the language's "Hidden Judge" template.
2. **Given** a return value from the user function, **When** execution ends, **Then** the value MUST be JSON-serialized and compared against the expected output.

---

### User Story 2 - Advanced Type Parsing for C++ (Priority: P1)

As a competitive programmer, I want to use C++ with complex types like 2D/3D vectors and strings without manually using `cin` or `getline`, so that I can solve advanced graph and matrix problems seamlessly.

**Why this priority**: Differentiator for high-performance algorithm review.

**Independent Test**: Submit a C++ function taking `vector<vector<int>>` and verify it correctly sums elements from a JSON array input.

**Acceptance Scenarios**:

1. **Given** a JSON array input (e.g., `[[1,2],[3,4]]`), **When** passed to a C++ solution, **Then** the Variadic Template Judge MUST correctly parse it into `std::vector<std::vector<int>>`.

---

### User Story 3 - Insightful AI Feedback Branching (Priority: P2)

As a developer, I want the AI to provide diagnosis advice when tests fail and optimization advice when they pass, so that the feedback is always contextually relevant.

**Independent Test**: Trigger a failing test and verify the AI review contains "Diagnosis" reasoning; then trigger a passing test and verify "Optimization" tips.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support a "LeetCode Style" functional abstraction (users implement `solution`).
- **FR-002**: System MUST support Python, Node.js, and C++ runtimes.
- **FR-003**: The C++ runner MUST utilize `nlohmann/json` and variadic templates to auto-detect and parse function signatures.
- **FR-004**: System MUST store judge templates in external `resources/` files for maintainability.
- **FR-005**: Execution MUST be isolated with a **10-second timeout** per test case.
- **FR-006**: AI prompts MUST dynamically transition between "Diagnosis" and "Optimization" modes based on job status.

### Key Entities

- **Hidden Judge**: A language-specific wrapper (stored in `resources/`) that handles stdin parsing and function invocation.
- **Test Case**: A discrete verification unit with `input` (raw strings/JSON) and `expected` (JSON strings).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: System correctly identifies 100% of functional failures in verified multilingual tests.
- **SC-002**: C++ judge handles nested vectors up to 3 dimensions flawlessly.
- **SC-003**: 100% of 'Hidden Judge' logic is covered by unit tests in `dockerRunner.test.js`.
- **SC-004**: Execution engine overhead (excluding Docker boot) is under 500ms per test case.

### Edge Cases
- **Null/Empty Lists**: Handled by JSON parser as empty arrays.
- **Infinite Loops**: Killed by 10s hard timeout.
- **No Solution Function**: Reported as "Error: No function found" via stderr.
