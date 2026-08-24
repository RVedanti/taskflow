import { prisma } from "../config/prisma.ts";
// CREATE JOB
export const createJob = async (req: any, res: any) => {
    try {
        const { queueId } = req.params;

        const {
            name,
            payload = {},
            priority = 0,
            delay = 0,
            scheduledAt: requestedScheduledAt,
            recurring = false,
            interval = 0
        } = req.body;

        // Validate name
        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Job name is required"
            });
        }

        // Check queue ownership
        const queue = await prisma.queue.findFirst({
            where: {
                id: queueId,
                project: {
                    userId: req.user.userId
                }
            }
        });

        if (!queue) {
            return res.status(404).json({
                message: "Queue not found"
            });
        }

        // Calculate scheduled time
        const delayMs = Number(delay);

        let scheduledAt: Date | null = null;

        if (requestedScheduledAt) {
            scheduledAt = new Date(requestedScheduledAt);
        } else if (delayMs > 0) {
            scheduledAt = new Date(
                Date.now() + delayMs
            );
        }

        // Prepare payload
        const jobPayload = {
            ...payload,

            ...(recurring && Number(interval) > 0
                ? {
                    _recurring: true,
                    _interval: Number(interval)
                }
                : {})
        };

        // Create job
        const job = await prisma.job.create({
            data: {
                name: name.trim(),
                payload: jobPayload,
                priority: Number(priority),
                queueId,

                status: scheduledAt
                    ? "SCHEDULED"
                    : "QUEUED",

                scheduledAt,

                maxAttempts: queue.maxRetries + 1
            }
        });

        return res.status(201).json({
            message: "Job created successfully",
            job
        });

    } catch (error) {
        console.error("Create job error:", error);

        return res.status(500).json({
            message: "Failed to create job",
            error: String(error)
        });
    }
};
// GET ALL JOBS OF A QUEUE
export const getJobs = async (req: any, res: any) => {
    try {
        const { queueId } = req.params;

        // Check queue ownership
        const queue = await prisma.queue.findFirst({
            where: {
                id: queueId,
                project: {
                    userId: req.user.userId
                }
            }
        });

        if (!queue) {
            return res.status(404).json({
                message: "Queue not found"
            });
        }

        const jobs = await prisma.job.findMany({
            where: {
                queueId
            },
            orderBy: {
                createdAt: "desc"
            },
            take: 100
        });

        return res.json({
            count: jobs.length,
            jobs
        });

    } catch (error) {
        console.error("Get jobs error:", error);

        return res.status(500).json({
            message: "Failed to fetch jobs",
            error: String(error)
        });
    }
};