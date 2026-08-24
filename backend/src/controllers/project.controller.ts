import { prisma } from "../config/prisma.ts";

export const createProject = async (req: any, res: any) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Project name is required"
            });
        }

        const project = await prisma.project.create({
            data: {
                name: name.trim(),
                userId: req.user.userId
            }
        });

        res.status(201).json({
            message: "Project created successfully",
            project
        });

    } catch (error) {
        console.error("Create project error:", error);

        res.status(500).json({
            message: "Failed to create project"
        });
    }
};


export const getProjects = async (req: any, res: any) => {
    try {
        const projects = await prisma.project.findMany({
            where: {
                userId: req.user.userId
            },
            include: {
                queues: true
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        res.json({
            projects
        });

    } catch (error) {
        console.error("Get projects error:", error);

        res.status(500).json({
            message: "Failed to fetch projects"
        });
    }
};


export const getProject = async (req: any, res: any) => {
    try {
        const project = await prisma.project.findFirst({
            where: {
                id: req.params.id,
                userId: req.user.userId
            },
            include: {
                queues: true
            }
        });

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        res.json({
            project
        });

    } catch (error) {
        console.error("Get project error:", error);

        res.status(500).json({
            message: "Failed to fetch project"
        });
    }
};


export const deleteProject = async (req: any, res: any) => {
    try {
        const project = await prisma.project.findFirst({
            where: {
                id: req.params.id,
                userId: req.user.userId
            }
        });

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        await prisma.project.delete({
            where: {
                id: project.id
            }
        });

        res.json({
            message: "Project deleted successfully"
        });

    } catch (error) {
        console.error("Delete project error:", error);

        res.status(500).json({
            message: "Failed to delete project"
        });
    }
};