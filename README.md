# ⚡ TaskFlow

### Distributed Job Scheduling & Processing System

TaskFlow is a full-stack distributed job scheduler designed to create, manage, schedule, and process jobs across multiple workers.

It provides a centralized dashboard for managing **Projects, Queues, Jobs, and Workers**, while the backend provides REST APIs and the infrastructure required for distributed job processing.

---

## 🚧 Project Status

> **Currently in development**

### ✅ Completed

- 🔐 JWT Authentication
- 📁 Project Management
- 📋 Queue Management
- ⏸️ Queue Pause / Resume
- 📝 Job Creation
- 📊 Dashboard
- 👷 Worker Monitoring
- 🔄 Job Refresh
- 🔁 Retry Configuration
- ⏱️ Delayed / Scheduled Jobs
- 🗑️ Project & Queue Management
- 🌐 REST API
- 🗄️ Prisma Database Integration

### 🔨 In Progress

- Distributed Worker Processing
- Job Execution Engine
- Job Locking
- Retry Processing
- Worker Heartbeats
- Fault Tolerance
- Advanced Scheduling
- Real-time Monitoring

---

# ✨ Features

## 🔐 Authentication

- User registration and login
- JWT-based authentication
- Protected API routes
- Automatic JWT token handling
- Secure password handling
- Logout

## 📁 Project Management

Users can:

- Create projects
- View projects
- Open projects
- Delete projects
- View project queues

## 📋 Queue Management

Each project can contain multiple queues.

Queue configuration includes:

- Queue name
- Priority
- Concurrency
- Retry strategy
- Maximum retries
- Retry delay
- Pause / Resume

## 📝 Job Management

Jobs can be created inside queues with:

- Job name
- JSON payload
- Priority
- Delay
- Scheduled execution
- Retry configuration

Jobs support states such as:

```text
QUEUED
SCHEDULED
RUNNING
COMPLETED
FAILED
DEAD
