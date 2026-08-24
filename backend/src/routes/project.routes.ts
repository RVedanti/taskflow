import { Router } from "express";

import {
    createProject,
    getProjects,
    getProject,
    deleteProject
} from "../controllers/project.controller.ts";

import { authenticate } from "../middleware/auth.middleware.ts";

const router = Router();

router.use(authenticate);

router.post("/", createProject);
router.get("/", getProjects);
router.get("/:id", getProject);
router.delete("/:id", deleteProject);

export default router;