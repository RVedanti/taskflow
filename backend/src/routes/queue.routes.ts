import { Router } from "express";

import {
    createQueue,
    getQueues,
    updateQueue,
    pauseQueue,
    resumeQueue,
    deleteQueue
} from "../controllers/queue.controller.ts";

import { authenticate } from "../middleware/auth.middleware.ts";

const router = Router();

router.use(authenticate);

router.post("/project/:projectId", createQueue);
router.get("/project/:projectId", getQueues);

router.patch("/:id", updateQueue);

router.post("/:id/pause", pauseQueue);
router.post("/:id/resume", resumeQueue);

router.delete("/:id", deleteQueue);

export default router;