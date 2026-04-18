<!--
Sync Impact Report:
- Version change: 1.0.0 -> 1.1.0
- Modified principles: Expanded "Core Principles" to include Identity and Persistence.
- Added sections: Firebase Auth, Firestore Persistence, Designing with Glassmorphism.
- Removed sections: None
- Templates requiring updates: N/A (Consistently use dynamic constitution checks).
-->

# Project Constitution

**Project Name**: AI Code Reviewer
**Ratification Date**: 2026-04-14
**Last Amended Date**: 2026-04-16
**Version**: 1.1.0

## 1. Core Principles

**Asynchronous By Default**
All heavy processing (compilation, Docker execution, AI inference) MUST occur asynchronously. Endpoints MUST return a job ID immediately via BullMQ and Redis rather than blocking.
*Rationale*: Ensures API scalability and responsiveness under heavy or malicious load.

**Containerized Isolation**
All user-submitted code MUST execute within strictly constrained and isolated Docker containers.
*Rationale*: Protects the host system from executing potentially malicious user-provided scripts, preventing RCE vulnerabilities.

**AI-Enhanced Reviews**
Code execution outputs MUST be piped to the OpenAI API for reasoning, providing actionable review feedback beyond simple standard output.
*Rationale*: Delivers the core value proposition of contextual code vetting.

**Identity-First Governance (NEW)**
Every state-changing operation (code submission, profile updates) MUST be gated by a verified identity provided by Firebase Auth. Anonymous access is permitted for browsing but restricted for execution.
*Rationale*: Establives individual accountability and prevents resource abuse by unauthorized actors.

**Immutable Submission History (NEW)**
The system MUST capture and persist every submission attempt in Firestore. Each record MUST contain the source code, execution status, and a server-side timestamp. These records are immutable once written.
*Rationale*: Provides an auditable trail of learning and progress, enabling historical analysis.

## 2. Technical Stack and Conventions

- **Backend**: Node.js (Express framework)
- **Queueing Engine**: Redis (with BullMQ)
- **Container Execution**: Docker (orchestrated via the Node.js worker)
- **Identity & Auth**: Firebase Authentication
- **Persistence Layer**: Google Firestore (Submission logs, user progress)
- **Frontend**: React + Vite (Typescript)
- **Styling**: Tailwind CSS + Glassmorphic Design System
- **External Integration**: OpenAI API
- **Local Deployment**: Docker Compose for connecting API, Worker, and Redis locally.

## 3. Security Protocol

**Host Decoupling (MUST)**
The worker node MUST NOT execute user code directly on the host OS. All dynamic execution MUST be sandboxed within the Docker CLI isolation layer.
*Rationale*: Absolute necessity for a safe multi-tenant code execution engine.

**Resource Limitations (MUST)**
Every user-run Docker container MUST specify strict memory limit constraints, CPU caps, and maximum execution timeouts.
*Rationale*: Prevents infinite loops or memory leak scripts from consuming the worker node's core resources and creating Denial of Service (DoS).

**Identity-Aware Authorization (MUST)**
Firestore Security Rules MUST be configured to enforce that users can only read/write data associated with their unique Firebase UID.
*Rationale*: Prevents cross-account data leakage.

## 4. Governance

**Amendment Procedure**: Changes to these core principles or architecture mandates require an update to this document and semantic versioning increment.
**Compliance Review**: All future features and bugfixes MUST be analyzed against this constitution (e.g., via `/06-speckit.analyze`) to prevent architectural drift.
