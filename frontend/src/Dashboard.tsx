import { useEffect, useState } from "react";
import api from "./services/api";

interface DashboardProps {
    onLogout: () => void;
}

function Dashboard({ onLogout }: DashboardProps) {

    const [workers, setWorkers] = useState<any[]>([]);
    const [showCreateJob, setShowCreateJob] = useState(false);

    // NOTE: these old booleans are kept around because several bits of UI logic
    // (create-forms, etc.) still reference them. They are no longer used to
    // decide which page is shown — `activePage` owns that now.
    const [showProjects, setShowProjects] = useState(false);
    const [showJobs, setShowJobs] = useState(false);
    const [showQueues, setShowQueues] = useState(false);

    const [allJobs, setAllJobs] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [showCreateProject, setShowCreateProject] = useState(false);
    const [projectName, setProjectName] = useState("");
    const [selectedProject, setSelectedProject] = useState<any>(null);
    const [selectedQueue, setSelectedQueue] = useState<any>(null);
    const [queueJobs, setQueueJobs] = useState<any[]>([]);
    const [queues, setQueues] = useState<any[]>([]);
    const [showCreateQueue, setShowCreateQueue] = useState(false);
    const [queueName, setQueueName] = useState("");
    const [queueProjectId, setQueueProjectId] = useState("");

    // Single source of truth for sidebar / page navigation
    const [activePage, setActivePage] = useState<
        "dashboard" | "projects" | "queues" | "jobs" | "workers"
    >("dashboard");

    const [stats, setStats] = useState({
        projects: 0,
        queues: 0,
        jobs: 0,
        workers: 0,

        jobStats: {
            queued: 0,
            scheduled: 0,
            running: 0,
            completed: 0,
            failed: 0,
            dead: 0
        },

        recentJobs: [] as any[]
    });

    // Load dashboard data
    const loadDashboard = async () => {
        try {
            const response = await api.get("/dashboard");

            setStats(response.data);

        } catch (error) {
            console.error(
                "Failed to load dashboard:",
                error
            );
        }
    };

    // Load workers
    const loadWorkers = async () => {
        try {
            const response = await api.get("/workers");

            setWorkers(response.data.workers);

        } catch (error) {
            console.error(
                "Failed to load workers:",
                error
            );
        }
    };

    const loadProjects = async () => {
        try {

            const response = await api.get("/projects");

            setProjects(response.data.projects);

        } catch (error) {

            console.error(
                "Failed to load projects:",
                error
            );
        }
    };

    const loadQueues = async () => {
        try {
            const allQueues: any[] = [];

            for (const project of projects) {
                const response = await api.get(
                    `/queues/project/${project.id}`
                );

                allQueues.push(
                    ...response.data.queues.map((queue: any) => ({
                        ...queue,
                        projectName: project.name
                    }))
                );
            }

            setQueues(allQueues);

        } catch (error) {
            console.error(
                "Failed to load queues:",
                error
            );
        }
    };

    const pauseQueue = async (queueId: string) => {
        try {
            await api.post(`/queues/${queueId}/pause`);

            alert("Queue paused successfully");

            await loadProjects();

            // Update selected project if currently viewing it
            if (selectedProject) {
                const response = await api.get("/projects");

                const updatedProject = response.data.projects.find(
                    (p: any) => p.id === selectedProject.id
                );

                setSelectedProject(updatedProject);
            }

        } catch (error: any) {
            console.error("Pause queue error:", error);

            alert(
                error.response?.data?.message ||
                "Failed to pause queue"
            );
        }
    };

    const resumeQueue = async (queueId: string) => {
        try {
            await api.post(`/queues/${queueId}/resume`);

            alert("Queue resumed successfully");

            await loadProjects();

            if (selectedProject) {
                const response = await api.get("/projects");

                const updatedProject = response.data.projects.find(
                    (p: any) => p.id === selectedProject.id
                );

                setSelectedProject(updatedProject);
            }

        } catch (error: any) {
            console.error("Resume queue error:", error);

            alert(
                error.response?.data?.message ||
                "Failed to resume queue"
            );
        }
    };

    const loadQueueJobs = async (queueId: string) => {
        try {
            const response = await api.get(
                `/jobs/queue/${queueId}`
            );

            setQueueJobs(response.data.jobs);

        } catch (error) {
            console.error(
                "Failed to load queue jobs:",
                error
            );

        }
    };

    const loadAllJobs = async () => {
        console.log("loadAllJobs() started");

        try {
            const response = await api.get("/projects");

            console.log("Projects response:", response.data);

            const projects = response.data.projects || [];
            const jobs: any[] = [];

            for (const project of projects) {

                console.log(
                    "Loading project:",
                    project.name
                );

                for (const queue of project.queues || []) {

                    console.log(
                        "Loading queue:",
                        queue.name,
                        queue.id
                    );

                    try {
                        const jobResponse = await api.get(
                            `/jobs/queue/${queue.id}`
                        );

                        console.log(
                            "Jobs response:",
                            jobResponse.data
                        );

                        const queueJobs =
                            jobResponse.data.jobs || [];

                        queueJobs.forEach((job: any) => {

                            jobs.push({
                                ...job,
                                queueName: queue.name,
                                projectName: project.name
                            });

                        });

                    } catch (error) {

                        console.error(
                            `Failed to load jobs for queue ${queue.id}:`,
                            error
                        );

                    }
                }
            }

            console.log(
                "All jobs loaded:",
                jobs
            );

            setAllJobs(jobs);

        } catch (error) {

            console.error(
                "Failed to load all jobs:",
                error
            );

            setAllJobs([]);
        }
    };

    const createQueue = async () => {
        try {

            if (!queueName.trim()) {
                alert("Queue name is required");
                return;
            }

            if (!queueProjectId) {
                alert("Please select a project");
                return;
            }

            await api.post(
                `/queues/project/${queueProjectId}`,
                {
                    name: queueName,
                    priority: 10,
                    concurrency: 3,
                    retryStrategy: "EXPONENTIAL",
                    maxRetries: 3,
                    retryDelay: 1000
                }
            );

            alert("Queue created successfully!");

            setQueueName("");
            setQueueProjectId("");
            setShowCreateQueue(false);

            await loadProjects();

        } catch (error: any) {

            console.error(
                "Create queue error:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to create queue"
            );
        }
    };

    const createProject = async () => {
        try {
            if (!projectName.trim()) {
                alert("Project name is required");
                return;
            }

            await api.post("/projects", {
                name: projectName
            });

            alert("Project created successfully!");

            setProjectName("");
            setShowCreateProject(false);

            await loadProjects();

        } catch (error: any) {
            console.error(
                "Create project error:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to create project"
            );
        }
    };

    const deleteQueue = async (queueId: string) => {
        if (!window.confirm("Are you sure you want to delete this queue?")) {
            return;
        }

        try {
            await api.delete(`/queues/${queueId}`);

            await loadProjects();

            // Keep the currently viewed project in sync if it's open
            if (selectedProject) {
                const response = await api.get("/projects");

                const updatedProject = response.data.projects.find(
                    (p: any) => p.id === selectedProject.id
                );

                setSelectedProject(updatedProject);
            }

            // If the deleted queue was open, close it out
            if (selectedQueue?.id === queueId) {
                setSelectedQueue(null);
                setQueueJobs([]);
            }

        } catch (error: any) {
            console.error("Delete queue error:", error);

            alert(
                error.response?.data?.message ||
                "Failed to delete queue"
            );
        }
    };

    const deleteProject = async (projectId: string) => {
        if (!window.confirm("Are you sure you want to delete this project?")) {
            return;
        }

        try {
            await api.delete(`/projects/${projectId}`);

            await loadProjects();
            await loadDashboard();

        } catch (error: any) {
            console.error("Delete project error:", error);

            alert(
                error.response?.data?.message ||
                "Failed to delete project"
            );
        }
    };

    // Load data when dashboard opens
    useEffect(() => {
        loadWorkers();
        loadDashboard();
    }, []);

    // Create job
    const createJob = async () => {

        try {
            if (!selectedQueue) {
                alert("Please select a queue first");
                return;
            }
            const nameInput = document.getElementById(
                "jobName"
            ) as HTMLInputElement;

            const payloadInput = document.getElementById(
                "jobPayload"
            ) as HTMLTextAreaElement;

            const priorityInput = document.getElementById(
                "jobPriority"
            ) as HTMLInputElement;

            const delayInput = document.getElementById(
                "jobDelay"
            ) as HTMLInputElement;

            const name = nameInput.value.trim();

            if (!name) {
                alert("Job name is required");
                return;
            }

            const payload = payloadInput.value.trim()
                ? JSON.parse(payloadInput.value)
                : {};

            const priority = Number(priorityInput.value);
            const delay = Number(delayInput.value);

            await api.post(
                  `/jobs/queue/${selectedQueue.id}`,
                {
                    name,
                    payload,
                    priority,
                    delay
                }
            );

            alert("Job created successfully!");

            setShowCreateJob(false);

            await loadDashboard();

        } catch (error) {

            console.error(
                "Create job error:",
                error
            );

            alert("Failed to create job");
        }
    };

    // Single navigation function — replaces the old showProjects/showQueues/showJobs
    // juggling that let multiple sidebar items end up "active" at once.
    const navigateTo = async (
        page: "dashboard" | "projects" | "queues" | "jobs" | "workers"
    ) => {
        console.log("Navigating to:", page);

        setActivePage(page);

        // Clear selected items whenever we change page
        setSelectedProject(null);
        setSelectedQueue(null);
        setQueueJobs([]);

        if (page === "projects") {
            await loadProjects();
        }

        if (page === "queues") {
            await loadProjects();
        }

        if (page === "jobs") {
            await loadAllJobs();
        }

        if (page === "workers") {
            await loadWorkers();
        }
    };

    return (
        <div className="app">

            {/* SIDEBAR */}

            <aside className="sidebar">

                <div className="logo">
                    ⚡ TaskFlow
                </div>

                <nav>

                    <button
                        className={`nav-item ${
                            activePage === "dashboard" ? "active" : ""
                        }`}
                        onClick={() => {
                            navigateTo("dashboard");
                        }}
                    >
                        Dashboard
                    </button>

                    <button
                        className={`nav-item ${
                            activePage === "projects" ? "active" : ""
                        }`}
                        onClick={() => {
                            navigateTo("projects");
                        }}
                    >
                        Projects
                    </button>

                    <button
                        className={`nav-item ${
                            activePage === "queues" ? "active" : ""
                        }`}
                        onClick={() => {
                            navigateTo("queues");
                        }}
                    >
                        Queues
                    </button>

                    <button
                        className={`nav-item ${
                            activePage === "jobs" ? "active" : ""
                        }`}
                        onClick={() => {
                            navigateTo("jobs");
                        }}
                    >
                        Jobs
                    </button>

                    <button
                        className={`nav-item ${
                            activePage === "workers" ? "active" : ""
                        }`}
                        onClick={() => {
                            navigateTo("workers");
                        }}
                    >
                        Workers
                    </button>

                </nav>

                <button
                    className="nav-item"
                    onClick={onLogout}
                >
                    Logout
                </button>

            </aside>


            {/* MAIN */}

            <main className="main">
                {activePage === "projects" ? (

                    <section className="panel">

                        <div className="panel-header">

                            <h2>
                                {selectedProject
                                    ? selectedProject.name
                                    : "Projects"}
                            </h2>

                            <div>

                                {selectedProject && (
                                    <button
                                        className="view-btn"
                                        onClick={() => setSelectedProject(null)}
                                    >
                                        ← Back
                                    </button>
                                )}

                                {!selectedProject && (
                                    <button
                                        className="view-btn"
                                        onClick={() =>
                                            setShowCreateProject(true)
                                        }
                                    >
                                        + Create Project
                                    </button>
                                )}

                            </div>

                        </div>
                        {selectedProject && (
                            <div className="recent-jobs">

                                <h3>Queues</h3>

                                {selectedProject.queues?.length === 0 ? (

                                    <div className="empty">
                                        No queues found
                                    </div>

                                ) : (

                                    selectedProject.queues.map((queue: any) => (

                                        <div
                                            className="recent-job"
                                            key={queue.id}
                                            onClick={() => {
                                                setSelectedQueue(queue);
                                                loadQueueJobs(queue.id);
                                            }}
                                            style={{ cursor: "pointer" }}
                                        >

                                            <div className="job-info">

                                                <strong>
                                                    {queue.name}
                                                </strong>

                                                <p>
                                                    {queue.id}
                                                </p>

                                            </div>

                                            <div className="job-details">

                                                <span>
                                                    Priority: {queue.priority}
                                                </span>

                                                <span>
                                                    Concurrency: {queue.concurrency}
                                                </span>

                                                <span>
                                                    {queue.paused
                                                        ? "PAUSED"
                                                        : "ACTIVE"}
                                                </span>

                                                {queue.paused ? (

                                                    <button
                                                        className="view-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            resumeQueue(queue.id);
                                                        }}
                                                    >
                                                        Resume
                                                    </button>

                                                ) : (

                                                    <button
                                                        className="view-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            pauseQueue(queue.id);
                                                        }}
                                                    >
                                                        Pause
                                                    </button>

                                                )}

                                                <button
                                                    className="delete-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteQueue(queue.id);
                                                    }}
                                                >
                                                    Delete
                                                </button>

                                            </div>

                                        </div>

                                    ))

                                )}

                            </div>
                        )}
                        {selectedQueue && (
                            <div className="panel">

                                <div className="panel-header">

                                    <h3>
                                        Queue: {selectedQueue.name}
                                    </h3>

                                    <button
                                        className="view-btn"
                                        onClick={() => {
                                            setSelectedQueue(null);
                                            setQueueJobs([]);
                                        }}
                                    >
                                        ← Back
                                    </button>

                                </div>

                                {queueJobs.length === 0 ? (

                                    <div className="empty">
                                        No jobs in this queue
                                    </div>

                                ) : (

                                    <div className="recent-jobs">

                                        {queueJobs.map((job: any) => (

                                            <div
                                                className="recent-job"
                                                key={job.id}
                                            >

                                                <div className="job-info">

                                                    <strong>
                                                        {job.name}
                                                    </strong>

                                                    <p>
                                                        {job.id}
                                                    </p>

                                                </div>

                                                <div className="job-details">

                                                    <span
                                                        className={`job-status ${job.status.toLowerCase()}`}
                                                    >
                                                        {job.status}
                                                    </span>

                                                    <span>
                                                        Priority: {job.priority}
                                                    </span>

                                                    <span>
                                                        Attempts: {job.attempts}
                                                    </span>

                                                </div>

                                            </div>

                                        ))}

                                    </div>

                                )}

                            </div>
                        )}
                        {showCreateProject && (
                            <div className="create-job-form">

                                <h3>Create New Project</h3>

                                <input
                                    type="text"
                                    placeholder="Project name"
                                    value={projectName}
                                    onChange={(e) =>
                                        setProjectName(e.target.value)
                                    }
                                />

                                <div className="form-buttons">

                                    <button
                                        className="create-btn"
                                        onClick={createProject}
                                    >
                                        Create Project
                                    </button>

                                    <button
                                        className="cancel-btn"
                                        onClick={() =>
                                            setShowCreateProject(false)
                                        }
                                    >
                                        Cancel
                                    </button>

                                </div>

                            </div>
                        )}

                        {projects.length === 0 ? (

                            <div className="empty">
                                No projects found
                            </div>

                        ) : (

                            <div className="recent-jobs">

                                {projects.map((project: any) => (

                                    <div
                                        className="recent-job"
                                        key={project.id}
                                        onClick={() => setSelectedProject(project)}
                                        style={{ cursor: "pointer" }}
                                    >

                                        <div className="job-info">

                                            <strong>
                                                {project.name}
                                            </strong>

                                            <p>
                                                {project.id}
                                            </p>

                                        </div>

                                        <div className="job-details">

                                            <span className="job-attempts">
                                                Queues:{" "}
                                                {project.queues?.length || 0}
                                            </span>
                                            <button
                                                className="delete-btn"
                                                onClick={() => deleteProject(project.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>

                                    </div>

                                ))}

                            </div>

                        )}

                    </section>

                ) : activePage === "queues" ? (

                    <section className="panel">

                        <div className="panel-header">

                            <h2>Queues</h2>

                            <button
                                className="view-btn"
                                onClick={() => {
                                    setShowCreateQueue(true);
                                    loadProjects();
                                }}
                            >
                                + Create Queue
                            </button>

                        </div>

                        {showCreateQueue && (

                            <div className="create-job-form">

                                <h3>Create New Queue</h3>

                                <input
                                    type="text"
                                    placeholder="Queue name"
                                    value={queueName}
                                    onChange={(e) =>
                                        setQueueName(e.target.value)
                                    }
                                />

                                <select
                                    value={queueProjectId}
                                    onChange={(e) =>
                                        setQueueProjectId(e.target.value)
                                    }
                                >

                                    <option value="">
                                        Select Project
                                    </option>

                                    {projects.map((project: any) => (

                                        <option
                                            key={project.id}
                                            value={project.id}
                                        >
                                            {project.name}
                                        </option>

                                    ))}

                                </select>

                                <div className="form-buttons">

                                    <button
                                        className="create-btn"
                                        onClick={createQueue}
                                    >
                                        Create Queue
                                    </button>

                                    <button
                                        className="cancel-btn"
                                        onClick={() =>
                                            setShowCreateQueue(false)
                                        }
                                    >
                                        Cancel
                                    </button>

                                </div>

                            </div>

                        )}

                        {projects.length === 0 ? (

                            <div className="empty">
                                No projects found
                            </div>

                        ) : (

                            <div className="recent-jobs">

                                {projects.map((project: any) => (

                                    <div key={project.id}>

                                        <h3>
                                            {project.name}
                                        </h3>

                                        {project.queues?.length === 0 ? (

                                            <div className="empty">
                                                No queues found
                                            </div>

                                        ) : (

                                            project.queues.map((queue: any) => (

                                                <div
                                                    className="recent-job"
                                                    key={queue.id}
                                                >

                                                    <div className="job-info">

                                                        <strong>
                                                            {queue.name}
                                                        </strong>

                                                        <p>
                                                            {queue.id}
                                                        </p>

                                                    </div>

                                                    <div className="job-details">

                                                        <span>
                                                            Priority: {queue.priority}
                                                        </span>

                                                        <span>
                                                            Concurrency: {queue.concurrency}
                                                        </span>

                                                        <span>
                                                            Jobs: {queue._count?.jobs || 0}
                                                        </span>

                                                        <span>
                                                            {queue.paused
                                                                ? "PAUSED"
                                                                : "ACTIVE"}
                                                        </span>

                                                        {queue.paused ? (

                                                            <button
                                                                className="view-btn"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    resumeQueue(queue.id);
                                                                }}
                                                            >
                                                                Resume
                                                            </button>

                                                        ) : (

                                                            <button
                                                                className="view-btn"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    pauseQueue(queue.id);
                                                                }}
                                                            >
                                                                Pause
                                                            </button>

                                                        )}

                                                        <button
                                                            className="delete-btn"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                deleteQueue(queue.id);
                                                            }}
                                                        >
                                                            Delete
                                                        </button>

                                                    </div>

                                                </div>

                                            ))

                                        )}

                                    </div>

                                ))}

                            </div>

                        )}

                    </section>

                ) : activePage === "jobs" ? (

                    <section className="panel">

                        <div className="panel-header">

                            <h2>Jobs</h2>

                            <button
                                type="button"
                                className="view-btn"
                                onClick={() => {
                                    console.log("JOBS REFRESH CLICKED");
                                    loadAllJobs();
                                }}
                            >
                                Refresh
                            </button>
                        </div>

                        {allJobs.length === 0 ? (

                            <div className="empty">
                                No jobs found
                            </div>

                        ) : (

                            <div className="recent-jobs">

                                {allJobs.map((job: any) => (

                                    <div
                                        className="recent-job"
                                        key={job.id}
                                    >

                                        <div className="job-info">

                                            <strong>
                                                {job.name}
                                            </strong>

                                            <p>
                                                {job.id}
                                            </p>

                                            <small>
                                                Project: {job.projectName}
                                                {" | "}
                                                Queue: {job.queueName}
                                            </small>

                                        </div>

                                        <div className="job-details">

                                            <span
                                                className={`job-status ${job.status.toLowerCase()}`}
                                            >
                                                {job.status}
                                            </span>

                                            <span>
                                                Priority: {job.priority}
                                            </span>

                                            <span>
                                                Attempts: {job.attempts}
                                            </span>

                                        </div>

                                    </div>

                                ))}

                            </div>

                        )}

                    </section>

                ) : activePage === "workers" ? (

                    <section className="panel">

                        <div className="panel-header">

                            <h2>Workers</h2>

                            <button
                                className="view-btn"
                                onClick={loadWorkers}
                            >
                                Refresh
                            </button>

                        </div>

                        {workers.length === 0 ? (

                            <div className="empty">
                                No workers found
                            </div>

                        ) : (

                            <div className="recent-jobs">

                                {workers.map((worker: any) => (

                                    <div
                                        className="recent-job"
                                        key={worker.id}
                                    >

                                        <div className="job-info">

                                            <strong>
                                                {worker.name}
                                            </strong>

                                            <p>
                                                {worker.id}
                                            </p>

                                        </div>

                                        <div className="job-details">

                                            <span className="status">
                                                ● {worker.status}
                                            </span>

                                        </div>

                                    </div>

                                ))}

                            </div>

                        )}

                    </section>

                ) : (
                    <>
                        {/* HEADER */}

                        <header className="header">

                            <div>

                                <h1>
                                    Dashboard
                                </h1>

                                <p>
                                    Monitor your distributed job scheduler
                                </p>

                            </div>

                            <button
                                className="refresh-btn"
                                onClick={() => {
                                    loadWorkers();
                                    loadDashboard();
                                }}
                            >
                                ↻ Refresh
                            </button>

                        </header>


                        {/* JOB STATISTICS + WORKERS */}

                        <section className="content-grid">

                            {/* JOB STATISTICS */}

                            <div className="panel">

                                <div className="panel-header">

                                    <h2>
                                        Job Statistics
                                    </h2>

                                </div>

                                <div className="job-stats">

                                    <div>
                                        <span className="dot queued"></span>
                                        Queued
                                        <strong>
                                            {stats.jobStats.queued}
                                        </strong>
                                    </div>

                                    <div>
                                        <span className="dot running"></span>
                                        Running
                                        <strong>
                                            {stats.jobStats.running}
                                        </strong>
                                    </div>

                                    <div>
                                        <span className="dot completed"></span>
                                        Completed
                                        <strong>
                                            {stats.jobStats.completed}
                                        </strong>
                                    </div>

                                    <div>
                                        <span className="dot failed"></span>
                                        Failed
                                        <strong>
                                            {stats.jobStats.failed}
                                        </strong>
                                    </div>

                                    <div>
                                        <span className="dot dead"></span>
                                        Dead
                                        <strong>
                                            {stats.jobStats.dead}
                                        </strong>
                                    </div>

                                </div>

                            </div>


                            {/* WORKERS */}

                            <div className="panel">

                                <div className="panel-header">

                                    <h2>
                                        Worker Status
                                    </h2>

                                </div>

                                {workers.length === 0 ? (

                                    <div className="empty">
                                        No workers found
                                    </div>

                                ) : (

                                    workers.map(worker => (

                                        <div
                                            className="worker"
                                            key={worker.id}
                                        >

                                            <div className="worker-icon">
                                                ⚙
                                            </div>

                                            <div>

                                                <strong>
                                                    {worker.name}
                                                </strong>

                                                <p>
                                                    {worker.id}
                                                </p>

                                            </div>

                                            <span className="status">
                                                ● {worker.status}
                                            </span>

                                        </div>

                                    ))

                                )}

                            </div>

                        </section>


                        {/* RECENT JOBS */}

                        <section className="panel recent">

                            <div className="panel-header">

                                <h2>
                                    Recent Jobs
                                </h2>

                                <div>

                                    <button
                                        className="view-btn"
                                        onClick={() =>
                                            setShowCreateJob(true)
                                        }
                                    >
                                        + Create Job
                                    </button>

                                    <button
                                        className="view-btn"
                                        onClick={loadDashboard}
                                    >
                                        Refresh
                                    </button>

                                </div>

                            </div>


                            {/* CREATE JOB FORM */}

                            {showCreateJob && (

                                <div className="create-job-form">

                                    <h3>
                                        Create New Job
                                    </h3>

                                    <input
                                        id="jobName"
                                        type="text"
                                        placeholder="Job name"
                                    />

                                    <textarea
                                        id="jobPayload"
                                        placeholder='Payload JSON e.g. {"message":"Hello"}'
                                    />

                                    <input
                                        id="jobPriority"
                                        type="number"
                                        placeholder="Priority"
                                        defaultValue={0}
                                    />

                                    <input
                                        id="jobDelay"
                                        type="number"
                                        placeholder="Delay in milliseconds"
                                        defaultValue={0}
                                    />

                                    <div className="form-buttons">

                                        <button
                                            className="create-btn"
                                            onClick={createJob}
                                        >
                                            Create Job
                                        </button>

                                        <button
                                            className="cancel-btn"
                                            onClick={() =>
                                                setShowCreateJob(false)
                                            }
                                        >
                                            Cancel
                                        </button>

                                    </div>

                                </div>

                            )}


                            {/* JOB LIST */}

                            {stats.recentJobs.length === 0 ? (

                                <div className="empty">
                                    No jobs available
                                </div>

                            ) : (

                                <div className="recent-jobs">

                                    {stats.recentJobs.map(
                                        (job: any) => (

                                            <div
                                                className="recent-job"
                                                key={job.id}
                                            >

                                                <div className="job-info">

                                                    <strong>
                                                        {job.name}
                                                    </strong>

                                                    <p>
                                                        {job.id}
                                                    </p>

                                                </div>

                                                <div className="job-details">

                                                    <span
                                                        className={`job-status ${job.status.toLowerCase()}`}
                                                    >
                                                        {job.status}
                                                    </span>

                                                    <span className="job-attempts">
                                                        Attempts: {job.attempts}
                                                    </span>

                                                </div>

                                            </div>

                                        )
                                    )}

                                </div>

                            )}

                        </section>
                    </>
                )}

            </main>

        </div>
    );
}

export default Dashboard;