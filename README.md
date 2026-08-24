\# TaskFlow — Distributed Job Scheduler



TaskFlow is a distributed job scheduling and processing system designed to manage projects, queues, jobs, and workers through a web-based dashboard.



The project is being developed as a full-stack distributed systems project using React, TypeScript, Node.js, Express, Prisma, and a database backend.



\---



\## 🚧 Project Status



\*\*Status: In Development\*\*



The core dashboard, authentication, project management, queue management, and initial job management functionality have been implemented.



The distributed worker execution system and several advanced scheduling features are still under development.



\---



\## ✨ Current Features



\### 🔐 Authentication



\- User registration and login

\- JWT-based authentication

\- Protected API routes

\- Automatic JWT token handling on the frontend

\- Logout functionality



\### 📁 Project Management



\- Create projects

\- View projects

\- Open individual projects

\- Delete projects

\- View queues belonging to a project



\### 📋 Queue Management



\- Create queues

\- View queues

\- Queue priority

\- Queue concurrency

\- Retry strategy configuration

\- Maximum retry configuration

\- Retry delay configuration

\- Pause queues

\- Resume queues

\- Delete queues

\- Queue ownership validation



\### 📝 Job Management



\- Create jobs inside queues

\- Job name

\- Job payload

\- Job priority

\- Delayed/scheduled jobs

\- Job status

\- Maximum attempts based on queue retry configuration

\- View jobs belonging to a queue

\- View jobs from the dashboard

\- Job refresh functionality



\### 📊 Dashboard



The dashboard currently provides:



\- Project count

\- Queue count

\- Job count

\- Worker count

\- Job statistics

\- Queued jobs

\- Scheduled jobs

\- Running jobs

\- Completed jobs

\- Failed jobs

\- Dead jobs

\- Recent jobs

\- Worker information



\### 🖥️ Frontend Navigation



The dashboard contains navigation for:



\- Dashboard

\- Projects

\- Queues

\- Jobs

\- Workers

\- Logout



\---



\# 🏗️ Architecture



TaskFlow follows a client-server architecture.



```text

&#x20;                   ┌─────────────────────┐

&#x20;                   │      React UI       │

&#x20;                   │   TypeScript/Vite   │

&#x20;                   └──────────┬──────────┘

&#x20;                              │

&#x20;                              │ REST API

&#x20;                              ▼

&#x20;                   ┌─────────────────────┐

&#x20;                   │   Express Backend   │

&#x20;                   │   Node.js + TS       │

&#x20;                   └──────────┬──────────┘

&#x20;                              │

&#x20;             ┌────────────────┼────────────────┐

&#x20;             │                │                │

&#x20;             ▼                ▼                ▼

&#x20;       Authentication     Projects         Queues

&#x20;             │                │                │

&#x20;             └────────────────┼────────────────┘

&#x20;                              │

&#x20;                              ▼

&#x20;                        ┌───────────┐

&#x20;                        │  Prisma   │

&#x20;                        │    ORM    │

&#x20;                        └─────┬─────┘

&#x20;                              │

&#x20;                              ▼

&#x20;                        ┌───────────┐

&#x20;                        │ Database  │

&#x20;                        └───────────┘

