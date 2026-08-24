import { Router } from "express";
import { prisma } from "../config/prisma.ts";

const router = Router();

router.get("/", async (req, res) => {
    try {
        const projects = await prisma.project.count();

        const queues = await prisma.queue.count();

       const jobs = await prisma.job.count();

const workers = await prisma.worker.count();

const recentJobs = await prisma.job.findMany({
    orderBy: {
        createdAt: "desc"
    },
    take: 10,
    select: {
        id: true,
        name: true,
        status: true,
        priority: true,
        attempts: true,
        createdAt: true,
        completedAt: true
    }
});

     

        const queued = await prisma.job.count({
            where: {
                status: "QUEUED"
            }
        });

        const scheduled = await prisma.job.count({
            where: {
                status: "SCHEDULED"
            }
        });

        const running = await prisma.job.count({
            where: {
                status: "RUNNING"
            }
        });

        const completed = await prisma.job.count({
            where: {
                status: "COMPLETED"
            }
        });

        const failed = await prisma.job.count({
            where: {
                status: "FAILED"
            }
        });

        const dead = await prisma.job.count({
            where: {
                status: "DEAD"
            }
        });

        res.json({
             projects,
    queues,
    jobs,
    workers,
    recentJobs,

            jobStats: {
                queued,
                scheduled,
                running,
                completed,
                failed,
                dead
            }
        });

    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );

        res.status(500).json({
            message: "Failed to load dashboard",
            error: String(error)
        });
    }
});

export default router;