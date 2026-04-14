<!--
Sync Impact Report:
- Version change: Initial Draft -> 1.0.0
- Modified principles: None (initial creation)
- Added sections: Core Principles, Technical Stack and Conventions, Security Protocol, Governance
- Removed sections: None
- Templates requiring updates: N/A
-->

# Project Constitution

**Project Name**: AI Code Reviewer
**Ratification Date**: 2026-04-14
**Last Amended Date**: 2026-04-14
**Version**: 1.0.0

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

## 2. Technical Stack and Conventions

- **Language**: Node.js (Express framework)
- **Queueing Engine**: Redis (with BullMQ)
- **Container Execution**: Docker (orchestrated via the Node.js worker)
- **External Integration**: OpenAI API
- **Local Deployment**: Docker Compose for connecting API, Worker, and Redis locally.

## 3. Security Protocol

**Host Decoupling (MUST)**
The worker node MUST NOT execute user code directly on the host OS. All dynamic execution MUST be sandboxed within the Docker CLI isolation layer.
*Rationale*: Absolute necessity for a safe multi-tenant code execution engine.

**Resource Limitations (MUST)**
Every user-run Docker container MUST specify strict memory limit constraints, CPU caps, and maximum execution timeouts.
*Rationale*: Prevents infinite loops or memory leak scripts from consuming the worker node's core resources and creating Denial of Service (DoS).

## 4. Governance

**Amendment Procedure**: Changes to these core principles or architecture mandates require an update to this document and semantic versioning increment.
**Compliance Review**: All future features and bugfixes MUST be analyzed against this constitution (e.g., via `/06-speckit.analyze`) to prevent architectural drift.
