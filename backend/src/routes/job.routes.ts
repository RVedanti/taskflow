import { Router } from "express";

import {
    createJob,
    getJobs
} from "../controllers/job.controller.ts";

import { authenticate } from "../middleware/auth.middleware.ts";

const router = Router();

router.use(authenticate);

router.post("/queue/:queueId", createJob);
router.get("/queue/:queueId", getJobs);

export default router;