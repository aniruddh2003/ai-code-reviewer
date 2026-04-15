# Tasks: Automated Test Case Validation (Feature 002)

- [x] **Phase 1: Basic Stdin Support**
    - [x] Update `worker/dockerRunner.js` to handle piped input
    - [x] Fix child process stdin termination to prevent hanging
    - [x] Verify multi-line input handling

- [x] **Phase 2: LeetCode-Style Abstraction (The Smart Judge)**
    - [x] Implement Python Judge (JSON parsing + function call)
    - [x] Implement Node.js Judge (JSON parsing + function call)
    - [x] Implement C++ Smart Judge (Variadic templates + nlohmann/json)
    - [x] Support for advanced types (2D/3D vectors, Strings, Bool) in C++

- [x] **Phase 3: Worker & AI Orchestration**
    - [x] Update `worker/worker.js` with multi-test loop and result aggregation
    - [x] Update `worker/aiReviewer.js` with Success/Failure prompt branching
    - [x] Implement "Diagnosis Mode" for failures
    - [x] Implement "Optimization Mode" for passed tests

- [x] **Phase 4: Verification & Docs**
    - [x] Create `verify_multilingual.js` test suite
    - [x] Update `spec.md` and `plan.md` to reflect the final architecture
    - [x] Generate final Validation Report
