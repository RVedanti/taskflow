import { useEffect, useState } from "react";
import api from "./services/api";

function Jobs() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadJobs = async () => {
        try {
            setLoading(true);

            const response = await api.get("/dashboard");

            setJobs(response.data.recentJobs || []);

        } catch (error) {
            console.error("Failed to load jobs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadJobs();
    }, []);

    return (
        <div className="jobs-page">

            <div className="page-header">
                <div>
                    <h1>Jobs</h1>
                    <p>Monitor and manage your jobs</p>
                </div>

                <button
                    className="refresh-btn"
                    onClick={loadJobs}
                >
                    ↻ Refresh
                </button>
            </div>

            <div className="panel">

                <div className="panel-header">
                    <h2>Recent Jobs</h2>
                </div>

                {loading ? (
                    <div className="empty">
                        Loading jobs...
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="empty">
                        No jobs available
                    </div>
                ) : (
                    <div className="jobs-list">

                        {jobs.map((job) => (

                            <div
                                className="job-row"
                                key={job.id}
                            >

                                <div>
                                    <strong>{job.name}</strong>

                                    <p>
                                        {job.id}
                                    </p>
                                </div>

                                <span className={`job-status ${job.status.toLowerCase()}`}>
                                    {job.status}
                                </span>

                                <span>
                                    Priority: {job.priority}
                                </span>

                                <span>
                                    Attempts: {job.attempts}
                                </span>

                            </div>

                        ))}

                    </div>
                )}

            </div>

        </div>
    );
}

export default Jobs;