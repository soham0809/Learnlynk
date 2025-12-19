import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

type Application = {
    id: string;
    lead_id: string;
    stage: string;
};

export default function CreateTask() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [formData, setFormData] = useState({
        application_id: "",
        task_type: "call",
        due_at: "",
        title: "",
    });
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        fetchApplications();
    }, []);

    async function fetchApplications() {
        const { data } = await supabase.from("applications").select("id, lead_id, stage");
        if (data) setApplications(data);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setMessage(null);

        try {
            // First, fetch the application to get tenant_id
            const { data: application, error: appError } = await supabase
                .from("applications")
                .select("tenant_id")
                .eq("id", formData.application_id)
                .single();

            if (appError || !application) {
                throw new Error("Application not found");
            }

            // Now insert the task with tenant_id
            const { data, error } = await supabase
                .from("tasks")
                .insert({
                    tenant_id: application.tenant_id,
                    application_id: formData.application_id,
                    type: formData.task_type,
                    due_at: new Date(formData.due_at).toISOString(),
                    title: formData.title,
                    status: "open",
                })
                .select()
                .single();

            if (error) throw error;

            setMessage({ type: "success", text: `Task created successfully! ID: ${data.id}` });
            setFormData({ application_id: "", task_type: "call", due_at: "", title: "" });
        } catch (err: any) {
            setMessage({ type: "error", text: err.message || "Failed to create task" });
        }
    }

    return (
        <main style={{ padding: "1.5rem", maxWidth: "600px", margin: "0 auto" }}>
            <h1>Create New Task</h1>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
                        Application *
                    </label>
                    <select
                        required
                        value={formData.application_id}
                        onChange={(e) => setFormData({ ...formData, application_id: e.target.value })}
                        style={{ width: "100%", padding: "0.5rem", fontSize: "1rem" }}
                    >
                        <option value="">-- Select Application --</option>
                        {applications.map((app) => (
                            <option key={app.id} value={app.id}>
                                {app.id.substring(0, 8)}... (Stage: {app.stage})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
                        Task Title *
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g., Follow up with student"
                        style={{ width: "100%", padding: "0.5rem", fontSize: "1rem" }}
                    />
                </div>

                <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
                        Task Type *
                    </label>
                    <select
                        required
                        value={formData.task_type}
                        onChange={(e) => setFormData({ ...formData, task_type: e.target.value })}
                        style={{ width: "100%", padding: "0.5rem", fontSize: "1rem" }}
                    >
                        <option value="call">Call</option>
                        <option value="email">Email</option>
                        <option value="review">Review</option>
                    </select>
                </div>

                <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
                        Due Date & Time *
                    </label>
                    <input
                        type="datetime-local"
                        required
                        value={formData.due_at}
                        onChange={(e) => setFormData({ ...formData, due_at: e.target.value })}
                        style={{ width: "100%", padding: "0.5rem", fontSize: "1rem" }}
                    />
                </div>

                <button
                    type="submit"
                    style={{
                        padding: "0.75rem",
                        fontSize: "1rem",
                        background: "#0070f3",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                    }}
                >
                    Create Task
                </button>
            </form>

            {message && (
                <div
                    style={{
                        marginTop: "1rem",
                        padding: "1rem",
                        borderRadius: "5px",
                        background: message.type === "success" ? "#d4edda" : "#f8d7da",
                        color: message.type === "success" ? "#155724" : "#721c24",
                        border: `1px solid ${message.type === "success" ? "#c3e6cb" : "#f5c6cb"}`,
                    }}
                >
                    {message.text}
                </div>
            )}

            <div style={{ marginTop: "2rem" }}>
                <a href="/dashboard/today" style={{ color: "#0070f3" }}>
                    ← Back to Today's Tasks
                </a>
            </div>
        </main>
    );
}
