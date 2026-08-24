import "dotenv/config";
import express from "express";
import cors from "cors"

import { prisma } from "./config/prisma.ts";
import authRoutes from "./routes/auth.routes.ts";
import projectRoutes from "./routes/project.routes.ts";
import queueRoutes from "./routes/queue.routes.ts";
import jobRoutes from "./routes/job.routes.ts";
import workerRoutes from "./routes/worker.routes.ts";
import dashboardRoutes from "./routes/dashboard.routes.ts";
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/queues", queueRoutes);
app.use("/api/workers", workerRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", async (req, res) => {
    try {
        const userCount = await prisma.user.count();

        res.json({
            message: "TaskFlow Distributed Job Scheduler API",
            status: "running",
            database: "connected",
            users: userCount
        });

    } catch (error) {
        console.error("Database error:", error);

        res.status(500).json({
            message: "Database connection failed",
            error: String(error)
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`TaskFlow server running on port ${PORT}`);
});