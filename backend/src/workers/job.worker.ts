import { prisma } from "../config/prisma.ts";

const WORKER_ID = `worker-${process.pid}`;
const WORKER_NAME = `TaskFlow Worker ${process.pid}`;

let isRunning = true;

console.log(`Worker started: ${WORKER_ID}`);
async function registerWorker() {
    try {
        await prisma.worker.upsert({
            where: {
                id: WORKER_ID
            },
            update: {
                status: "ACTIVE",
                lastHeartbeat: new Date()
            },
            create: {
                id: WORKER_ID,
                name: WORKER_NAME,
                status: "ACTIVE",
                concurrency: 2,
                lastHeartbeat: new Date()
            }
        });

        console.log(
            `[${WORKER_ID}] Worker registered`
        );

    } catch (error) {
        console.error(
            `[${WORKER_ID}] Worker registration failed:`,
            error
        );
    }
}
async function sendHeartbeat() {
    try {
        await prisma.worker.update({
            where: {
                id: WORKER_ID
            },
            data: {
                status: "ACTIVE",
                lastHeartbeat: new Date()
            }
        });

        await prisma.workerHeartbeat.create({
            data: {
                workerId: WORKER_ID
            }
        });

    } catch (error) {
        console.error(
            `[${WORKER_ID}] Heartbeat failed:`,
            error
        );
    }
}
async function executeJob(jobId: string) {
    let executionId: string | null = null;
    let executionStart: Date | null = null;

    try {
        const job = await prisma.job.findUnique({
            where: {
                id: jobId
            }
        });

        if (!job) {
            return;
        }

        executionStart = new Date();

        const execution = await prisma.jobExecution.create({
            data: {
                jobId: job.id,
                workerId: WORKER_ID,
                attempt: job.attempts,
                status: "RUNNING",
                startedAt: executionStart
            }
        });

        executionId = execution.id;

        console.log(
            `[${WORKER_ID}] Executing job: ${job.name}`
        );

        // Simulate failure for testing
        if ((job.payload as any)?.fail === true) {
            throw new Error("Simulated job failure");
        }

        // Simulate actual work
        await new Promise(resolve =>
            setTimeout(resolve, 2000)
        );

        const completedAt = new Date();

        // Mark job completed
        await prisma.job.update({
            where: {
                id: jobId
            },
            data: {
                status: "COMPLETED",
                completedAt,
                lockedBy: null,
                lockedAt: null
            }
        });

        // Mark execution completed
        await prisma.jobExecution.update({
            where: {
                id: executionId
            },
            data: {
                status: "COMPLETED",
                completedAt,
                duration:
                    completedAt.getTime() -
                    executionStart.getTime()
            }
        });

        console.log(
            `[${WORKER_ID}] Job ${jobId} completed`
        );

    } catch (error) {

        console.error(
            `[${WORKER_ID}] Job failed:`,
            error
        );

        // Mark current execution as failed
        if (executionId && executionStart) {

            const failedAt = new Date();

            await prisma.jobExecution.update({
                where: {
                    id: executionId
                },
                data: {
                    status: "FAILED",
                    completedAt: failedAt,
                    duration:
                        failedAt.getTime() -
                        executionStart.getTime(),
                    error:
                        error instanceof Error
                            ? error.message
                            : String(error)
                }
            });
        }

        await handleFailure(jobId, error);
    }
}
async function handleFailure(jobId: string, error: unknown) {
    const job = await prisma.job.findUnique({
        where: {
            id: jobId
        },
        include: {
            queue: true
        }
    });

    if (!job) {
        return;
    }

    const errorMessage =
        error instanceof Error
            ? error.message
            : String(error);

    console.log(
        `[${WORKER_ID}] Job failed: ${job.name}`
    );

    console.log(
        `[${WORKER_ID}] Attempt ${job.attempts}/${job.maxAttempts}`
    );

    // Retry if attempts are still available
    if (job.attempts < job.maxAttempts) {

        const retryDelay =
            job.queue.retryStrategy === "EXPONENTIAL"
                ? job.queue.retryDelay *
                  Math.pow(2, job.attempts - 1)
                : job.queue.retryDelay;

        const scheduledAt = new Date(
            Date.now() + retryDelay
        );

        await prisma.job.update({
            where: {
                id: jobId
            },
            data: {
                status: "SCHEDULED",
                scheduledAt,
                lockedBy: null,
                lockedAt: null,
                startedAt: null,
                lastError: errorMessage
            }
        });

        console.log(
            `[${WORKER_ID}] Retrying job in ${retryDelay}ms`
        );

      } else {

        // Maximum attempts reached → DLQ
        await prisma.job.update({
            where: {
                id: jobId
            },
            data: {
                status: "DEAD",
                lockedBy: null,
                lockedAt: null,
                lastError: errorMessage
            }
        });

        await prisma.deadLetterJob.create({
            data: {
                jobId,
                reason: errorMessage
            }
        });

        console.log(
            `[${WORKER_ID}] Job ${jobId} moved to DLQ`
        );
    }
}  
async function promoteScheduledJobs() {
    try {
        await prisma.job.updateMany({
            where: {
                status: "SCHEDULED",
                scheduledAt: {
                    lte: new Date()
                }
            },
            data: {
                status: "QUEUED",
                scheduledAt: null
            }
        });
    } catch (error) {
        console.error(
            "Scheduled job promotion error:",
            error
        );
    }
}
async function claimJobForQueue(
    queueId: string
): Promise<string | null> {

    try {
        const job = await prisma.job.findFirst({
            where: {
                queueId,
                status: "QUEUED"
            },
            orderBy: [
                {
                    priority: "desc"
                },
                {
                    createdAt: "asc"
                }
            ]
        });

        if (!job) {
            return null;
        }

        const claimed = await prisma.job.updateMany({
            where: {
                id: job.id,
                status: "QUEUED"
            },
            data: {
                status: "RUNNING",
                startedAt: new Date(),
                lockedAt: new Date(),
                lockedBy: WORKER_ID,
                attempts: {
                    increment: 1
                }
            }
        });

        if (claimed.count === 0) {
            return null;
        }

        return job.id;

    } catch (error) {
        console.error(
            "Claim job error:",
            error
        );

        return null;
    }
}
async function getAvailableJobs(): Promise<string[]> {
    try {
        // Get queues that are not paused
        const queues = await prisma.queue.findMany({
            where: {
                paused: false
            }
        });

        const jobIds: string[] = [];

        for (const queue of queues) {

            const availableSlots = queue.concurrency;

            for (let i = 0; i < availableSlots; i++) {

                const jobId = await claimJobForQueue(queue.id);

                if (jobId) {
                    jobIds.push(jobId);
                } else {
                    break;
                }
            }
        }

        return jobIds;

    } catch (error) {
        console.error(
            "Get available jobs error:",
            error
        );

        return [];
    }
}
async function workerLoop() {
    while (isRunning) {

        await promoteScheduledJobs();

        // Get jobs that are ready to run
        const jobs = await getAvailableJobs();

        if (jobs.length === 0) {
            await new Promise(resolve =>
                setTimeout(resolve, 1000)
            );

            continue;
        }

        // Run jobs concurrently
        await Promise.all(
            jobs.map(jobId => executeJob(jobId))
        );
    }
}
async function startWorker() {
    await registerWorker();

    await sendHeartbeat();

    setInterval(
        sendHeartbeat,
        5000
    );

    await workerLoop();
}

startWorker().catch(error => {
    console.error(
        "Worker crashed:",
        error
    );
});


async function shutdownWorker() {
    console.log(
        `[${WORKER_ID}] Worker shutting down...`
    );

    isRunning = false;

    try {
        await prisma.worker.update({
            where: {
                id: WORKER_ID
            },
            data: {
                status: "OFFLINE"
            }
        });

        console.log(
            `[${WORKER_ID}] Worker marked OFFLINE`
        );

        await prisma.$disconnect();

    } catch (error) {
        console.error(
            "Shutdown error:",
            error
        );
    }

    process.exit(0);
}

process.on("SIGINT", shutdownWorker);
process.on("SIGTERM", shutdownWorker);