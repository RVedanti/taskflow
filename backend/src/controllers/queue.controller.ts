import { prisma } from "../config/prisma.ts";


export const createQueue = async (req: any, res: any) => {
    try {
        const { projectId } = req.params;

        const {
            name,
            priority = 0,
            concurrency = 2,
            retryStrategy = "EXPONENTIAL",
            maxRetries = 3,
            retryDelay = 1000
        } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Queue name is required"
            });
        }

        if (concurrency < 1) {
            return res.status(400).json({
                message: "Concurrency must be at least 1"
            });
        }

        // Make sure the project belongs to the logged-in user
        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                userId: req.user.userId
            }
        });

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        const queue = await prisma.queue.create({
            data: {
                name: name.trim(),
                projectId,
                priority: Number(priority),
                concurrency: Number(concurrency),
                retryStrategy,
                maxRetries: Number(maxRetries),
                retryDelay: Number(retryDelay)
            }
        });

        res.status(201).json({
            message: "Queue created successfully",
            queue
        });

    } catch (error) {
        console.error("Create queue error:", error);

        res.status(500).json({
            message: "Failed to create queue"
        });
    }
};


export const getQueues = async (req: any, res: any) => {
    try {
        const { projectId } = req.params;

        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                userId: req.user.userId
            }
        });

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        const queues = await prisma.queue.findMany({
            where: {
                projectId
            },
            include: {
                _count: {
                    select: {
                        jobs: true
                    }
                }
            },
            orderBy: {
                priority: "desc"
            }
        });

        res.json({
            queues
        });

    } catch (error) {
        console.error("Get queues error:", error);

        res.status(500).json({
            message: "Failed to fetch queues"
        });
    }
};


export const updateQueue = async (req: any, res: any) => {
    try {
        const { id } = req.params;

        const {
            name,
            priority,
            concurrency,
            retryStrategy,
            maxRetries,
            retryDelay
        } = req.body;

        const queue = await prisma.queue.findFirst({
            where: {
                id,
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

        const updatedQueue = await prisma.queue.update({
            where: {
                id
            },
            data: {
                ...(name !== undefined && { name }),
                ...(priority !== undefined && { priority: Number(priority) }),
                ...(concurrency !== undefined && {
                    concurrency: Number(concurrency)
                }),
                ...(retryStrategy !== undefined && { retryStrategy }),
                ...(maxRetries !== undefined && {
                    maxRetries: Number(maxRetries)
                }),
                ...(retryDelay !== undefined && {
                    retryDelay: Number(retryDelay)
                })
            }
        });

        res.json({
            message: "Queue updated successfully",
            queue: updatedQueue
        });

    } catch (error) {
        console.error("Update queue error:", error);

        res.status(500).json({
            message: "Failed to update queue"
        });
    }
};


export const pauseQueue = async (req: any, res: any) => {
    try {
        const queue = await prisma.queue.findFirst({
            where: {
                id: req.params.id,
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

        const updatedQueue = await prisma.queue.update({
            where: {
                id: queue.id
            },
            data: {
                paused: true
            }
        });

        res.json({
            message: "Queue paused",
            queue: updatedQueue
        });

    } catch (error) {
        console.error("Pause queue error:", error);

        res.status(500).json({
            message: "Failed to pause queue"
        });
    }
};


export const resumeQueue = async (req: any, res: any) => {
    try {
        const queue = await prisma.queue.findFirst({
            where: {
                id: req.params.id,
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

        const updatedQueue = await prisma.queue.update({
            where: {
                id: queue.id
            },
            data: {
                paused: false
            }
        });

        res.json({
            message: "Queue resumed",
            queue: updatedQueue
        });

    } catch (error) {
    console.error("Resume queue error:", error);

    res.status(500).json({
        message: "Failed to resume queue"
    });
}
};


export const deleteQueue = async (req: any, res: any) => {
    try {
        const queue = await prisma.queue.findFirst({
            where: {
                id: req.params.id,
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

        await prisma.queue.delete({
            where: {
                id: queue.id
            }
        });

        res.json({
            message: "Queue deleted successfully"
        });

    } catch (error) {
        console.error("Delete queue error:", error);

        res.status(500).json({
            message: "Failed to delete queue"
        });
    }
};