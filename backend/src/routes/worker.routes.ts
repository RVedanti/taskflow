import { Router } from "express";
import { prisma } from "../config/prisma.ts";

const router = Router();

router.get("/", async (req, res) => {
    try {
        const workers = await prisma.worker.findMany({
            orderBy: {
                lastHeartbeat: "desc"
            }
        });

        res.json({
            count: workers.length,
            workers
        });

    } catch (error) {
        console.error("Get workers error:", error);

        res.status(500).json({
            message: "Failed to fetch workers",
            error: String(error)
        });
    }
});

export default router;