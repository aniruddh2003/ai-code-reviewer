<!--
Sync Impact Report:
- Version change: 1.2.0 -> 1.3.0
- Modified principles:
    - Added "Diagnostic Integrity (Code 128)" (Reliability).
    - Added "High-Precision Telemetry (RSS)" (Observability).
    - Added "Telemetry Marker Parity" (Standardization).
- Added sections: Strict Resource Constraints (5s TLE).
- Removed sections: None
- Templates requiring updates: N/A
-->

# Project Constitution

**Project Name**: AI Code Reviewer
**Ratification Date**: 2026-04-14
**Last Amended Date**: 2026-04-19
**Version**: 1.3.0

## 1. Core Principles

**Asynchronous By Default**
All heavy processing (compilation, Docker execution, AI inference) MUST occur asynchronously. Endpoints MUST return a job ID immediately via BullMQ and Redis rather than blocking.
*Rationale*: Ensures API scalability and responsiveness under heavy or malicious load.

**Containerized Isolation**
All user-submitted code MUST execute within strictly constrained and isolated Docker containers.
*Rationale*: Protects the host system from executing potentially malicious user-provided scripts, preventing RCE vulnerabilities.

**Diagnostic Integrity (NEW)**
The execution pipeline MUST use distinct, sentinel exit codes to categorize failures. Specifically, Code 128 MUST be reserved for compilation failures, and Code 137 for memory limit violations.
*Rationale*: Prevents ambiguous "Runtime Error" reports and provides users with precise debug context (Build vs. Logic).

**High-Precision Telemetry (NEW)**
The system MUST report actual system metrics (Peak RSS and Precision Runtime) captured via internal language-specific calls (e.g., `getrusage`) instead of host-side estimations.
*Rationale*: Ensures data accuracy for benchmarking and fair judging.

**Telemetry Marker Parity (NEW)**
Every language template MUST emit metrics using the standardized `INTERNAL_TELEMETRY:{"memory_rss":...}` marker in stderr.
*Rationale*: Standardizes the parsing logic across the Worker stack and simplifies multi-language scaling.

**Smart Input Normalization**
The worker MUST automatically normalize human-readable user inputs (e.g., "nums = [1,2], target = 3") into the machine-readable formats required by language-specific judges.
*Rationale*: Bridges the gap between user-friendly problem descriptions and rigorous static execution.

**Identity-First Governance**
Every state-changing operation MUST be gated by a verified identity provided by Firebase Auth. Anonymous access is permitted for browsing but restricted for execution.
*Rationale*: Establishes individual accountability and prevents resource abuse.

**Immutable Submission History**
The system MUST capture and persist every submission attempt in Firestore. Each record is immutable once written.
*Rationale*: Provides an auditable trail of progress and historical diagnostic analysis.

## 2. Technical Stack and Conventions

- **Backend**: Node.js (Express framework)
- **Queueing Engine**: Redis (with BullMQ)
- **Container Execution**: Docker (orchestrated via the Node.js worker)
- **Identity & Auth**: Firebase Authentication
- **Persistence Layer**: Google Firestore
- **Frontend**: React + Vite (Typescript)
- **Styling**: Vanilla CSS + Glassmorphic Design System
- **External Integration**: OpenAI API
- **Local Deployment**: Docker Compose with **Bind Mounts**.

## 3. Tooling and Environment Standards

**STL Pre-inclusion Standard (C++)**
The C++ runner image MUST pre-include essential STL headers (vector, map, algorithm, etc.) to support standard competitive programming solutions without manual boilerplate.
*Rationale*: Minimizes friction for users and matches standard LeetCode industry expectations.

**DX: Bind Mount Infrastructure**
The development environment MUST use bind mounts for `api`, `worker`, and `bridge` services to enable instant hot-reloading of backend logic.
*Rationale*: Eliminates the "stale code" deployment bottleneck during iterative development.

## 4. Security Protocol

**Strict Resource Constraints (AMENDED)**
Every user-run Docker container MUST specify strict memory limit constraints and a MANDATORY execution timeout of **5.0 seconds**.
*Rationale*: Prevents DoS attacks and rogue processes while maintaining a fast execution loop.

**Host Decoupling (MUST)**
The worker node MUST NOT execute user code directly on the host OS. All dynamic execution MUST be sandboxed within the Docker CLI isolation layer.
*Rationale*: Absolute necessity for a safe multi-tenant code execution engine.

**Identity-Aware Authorization (MUST)**
Firestore Security Rules MUST be configured to enforce that users can only read/write data associated with their unique Firebase UID.
*Rationale*: Prevents cross-account data leakage.

## 5. Governance

**Amendment Procedure**: Changes to these core principles or architecture mandates require an update to this document and semantic versioning increment.
**Compliance Review**: All future features and bugfixes MUST be analyzed against this constitution (e.g., via `/06-speckit.analyze`) to prevent architectural drift.
