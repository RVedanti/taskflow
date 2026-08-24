# ⚡ TaskFlow

### Distributed Job Scheduling & Processing System

TaskFlow is a full-stack distributed job scheduler designed to create, manage, schedule, and process jobs across multiple workers.

It provides a centralized dashboard for managing **Projects, Queues, Jobs, and Workers**, while the backend provides REST APIs and the infrastructure required for distributed job processing.

---

## 🚧 Project Status

> **Currently in development**
> Core dashboard, auth, and CRUD APIs are complete. The distributed worker engine (job claiming, execution, retries, fault tolerance) is in progress.

---

## 🧩 Tech Stack

| Layer | Stack |
|---|---|
| Frontend | React, TypeScript, Vite, Axios |
| Backend | Node.js, Express, TypeScript, JWT |
| Database | SQLite + Prisma ORM |
| Tools | Git, Postman, VS Code |

---

## 🏗️ Architecture

```
React Dashboard → Axios → Express API → Auth Middleware → Controllers → Prisma → DB
```

**Planned (distributed processing):**

```
Dashboard → API → Job Queue / DB → Multiple Workers → Job Execution → Status Update
```

---

## 📦 Core Concepts

- **Project** — logical container for queues (e.g. `Email Processing`)
- **Queue** — holds jobs; configurable priority, concurrency, retries; `ACTIVE` / `PAUSED`
- **Job** — unit of work with payload, priority, status, attempts, schedule
- **Worker** — claims and executes jobs; sends heartbeats; recovers from failure

**Job Lifecycle**

```
QUEUED → RUNNING → COMPLETED
                 ↘ FAILED → RETRY → RUNNING → ... → DEAD
```

---

## 🖥️ Dashboard

`Dashboard` · `Projects` · `Queues` · `Jobs` · `Workers`

- Create/manage projects, queues, and jobs
- Pause/resume queues
- Track job status, priority, and attempts
- Monitor workers

---

## 🔐 Authentication

JWT-based auth — login returns a token, stored client-side and auto-attached via Axios interceptor:

```
Authorization: Bearer <token>
```

---

## 🔌 API Overview

```
/api/auth
/api/projects
/api/queues
/api/jobs
/api/workers
/api/dashboard
```

```
POST   /api/projects
GET    /api/queues/project/:projectId
POST   /api/queues/:id/pause
POST   /api/jobs/queue/:queueId
GET    /api/workers
```

---

## 🗂️ Database

```
User → Projects → Queues → Jobs
```

Workers exist independently and interact with jobs/queues during processing.

---

## 🚀 Getting Started

```bash
git clone https://github.com/<your-username>/taskflow.git
cd taskflow

# Backend
cd backend && npm install
npx prisma migrate dev && npx prisma generate
npm run dev

# Frontend (new terminal)
cd frontend && npm install
npm run dev
```

Frontend: `localhost:5173` · Backend: `localhost:5000`

---

## ✅ Completed

Auth, Projects, Queues, Jobs CRUD · Pause/resume · Priority, payload, scheduling · Retry config · Dashboard stats · Worker info endpoint

## 🔜 In Progress

Worker service · Job claiming/locking · Job execution engine · Retry processing · Concurrency limits · Heartbeats & fault tolerance · Real-time monitoring (WebSockets)

## 🗺️ Roadmap

Redis queue backend · Worker auto-scaling · Docker Compose · Recurring jobs · Dead-letter queues · Metrics & monitoring

---

## 🎯 Goal

Evolve TaskFlow from a job-management dashboard into a reliable **distributed job processing platform** — demonstrating concurrency, fault tolerance, scheduling, and worker coordination at scale.

---

## 📄 License

[MIT](LICENSE)
