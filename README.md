# 🚀 AI Code Reviewer + Docker Execution Engine

## 📌 Overview

A backend system that securely executes user-submitted code inside Docker containers and provides AI-powered code review.

---

## 🧠 Features

* 🔄 Asynchronous job processing using Redis + BullMQ
* 🐳 Secure code execution using Docker containers
* 🤖 AI-based code analysis and feedback
* ⚡ Scalable worker-based architecture

---

## 🏗️ Architecture

Client → API → Queue (Redis) → Worker → Docker Execution + AI Review

---

## ⚙️ Tech Stack

* Node.js (Express)
* Redis (BullMQ)
* Docker
* OpenAI API

---

## 🚀 Getting Started

### 1. Clone repo

```bash
git clone <your-repo-url>
cd ai-code-reviewer
```

---

### 2. Setup environment

```bash
cp .env.example .env
```

Add your OpenAI API key.

---

### 3. Build & run

```bash
docker-compose up --build
```

---

### 4. Test API

```bash
curl -X POST http://localhost:3000/submit \
-H "Content-Type: application/json" \
-d '{"code":"print(\"Hello World\")","language":"python"}'
```

---

## 📦 API Endpoints

### POST /submit

Submit code for execution

---

## 🔐 Security Notes

* Code runs in isolated Docker containers
* CPU and memory limits applied
* No direct execution on host system

---

## 🚧 Future Improvements

* Multi-language support
* Test case validation
* Job status tracking API
* Kubernetes deployment

---

## 👨‍💻 Author

Built by Aniruddha Bandyopadhyay
