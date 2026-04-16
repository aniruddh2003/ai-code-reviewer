# Tasks: Automated Test Case Validation (Harden)

This trace reflects the actual implementation journey for Feature 002.

- [x] **Phase 1: Foundation (Core Engine)**
    - [x] Refactor `dockerRunner.js` to extract wrapping logic into `getWrappedCode`.
    - [x] Implement initial Python 'Hidden Judge' with JSON parsing.
    - [x] Implement initial Node.js 'Hidden Judge' with `fs.readFileSync(0)`.
    - [x] Update `worker/worker.js` to handle the multi-test array loop.

- [x] **Phase 2: The Smart C++ Judge**
    - [x] Integrate `nlohmann/json` into `cpp.Dockerfile`.
    - [x] Implement Variadic Template Judge in C++17.
    - [x] Support recursive JSON-to-vector mapping (3D vectors/strings).
    - [x] Handle variadic argument count discovery via `execute(solution)`.

- [x] **Phase 3: Robustness & DX**
    - [x] Move all judge boilerplates to the `resources/` directory.
    - [x] Implement template caching in `dockerRunner.js`.
    - [x] Setup Jest and implement `worker/dockerRunner.test.js` (100% coverage).
    - [x] Update `package.json` with `test` script.

- [x] **Phase 4: AI Logic & Verification**
    - [x] Refactor `aiReviewer.js` for Success/Failure prompt branching.
    - [x] Implement "Diagnosis" and "Optimization" instructions.
    - [x] Create `verify_multilingual.js` and implement 13 cross-language tests.
    - [x] Verify Dijkstra algorithm support for Python, Node, and C++.

- [x] **Phase 5: Documentation Hardening**
    - [x] Synchronize `spec.md` with finalized functional requirements.
    - [x] Synchronize `plan.md` with 'Hidden Judge' architecture.
    - [x] Finalize `tasks.md` completion trace.
