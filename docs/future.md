# 🚀 Future Improvements & Product Roadmap

---

# 👤 User Stories

## 🧑‍💻 Developer (Primary User)

- As a developer, I want to submit code and get instant feedback
- As a developer, I want to see whether my code passes test cases
- As a developer, I want suggestions to improve my code quality
- As a developer, I want to track my past submissions

---

## 🧑‍🏫 Interview Candidate

- As a candidate, I want to practice coding problems
- As a candidate, I want feedback on time complexity and edge cases

---

## 🏢 Team / Organization 

- As a team, we want automated code review for pull requests (ACHIEVED)
- As a team, we want secure execution of untrusted scripts

---

# 🧩 Feature Breakdown

## Core Features (Current + Near Future)

- Code submission API
- Asynchronous job processing (BullMQ)
- Docker-based secure execution (Python, Node, Go)
- AI-based code review with Result Caching
- Real-time status tracking via WebSockets
- Automated GitHub Pull Request comment injection

---

## Planned Features

- Test case validation system
- Submission history
- Extended language support (Java, Rust, C++)
- Frontend dashboard

---

# 🧠 Current Limitations

- No persistent persistent state store (aside from Redis Cache timeouts)
- Basic structural AI feedback without deep syntax-tree parsing

---

# 🔥 Phase 1 – Core Enhancements

## ✅ 0. Basic Metrics (COMPLETED)
- Prometheus metrics export (`/metrics` endpoint)

## ✅ 1. JavaScript Support (COMPLETED)
- Added Node.js 18 execution

## ✅ 2. Structural & Architectural Reliability (COMPLETED)
- Bound Docker Execution parameters tightly to a 10s maximum timeout
- Configured native BullMQ Retries via Exponential Backlogs to gracefully bypass OpenAI rate limit issues.

## ✅ 3. Platform Growth & Scaling (COMPLETED)
- Implemented **Socket.io** integration for real-time `job_update` hooks.
- Implemented **Result Caching** using SHA256 hashed code payloads with a 7-day TTL reducing AI cost footprints.
- Expanded supported sandboxing to **Golang (1.20)** execution environments.
- Developed an automated CI/CD **GitHub Webhook** listener validating HMAC arrays and natively pinging results.

---

# ⚡ Phase 2 – User Experience

## 4. Frontend Dashboard

- Submit code manually
- Display AI insights
- Visualized historical analytics

---

# 🔐 Phase 3 – Security

- Disable external network calls across all internal docker containers
- Lock CPU bounds to strict limits programmatically

---

# 🧱 Phase 4 – Scalability

- Kubernetes deployment
- Distributed queue system

---

# 🧪 Phase 5 – Advanced Features

- IDE extensions for live review
- Leaderboard system for interview prep tracking
