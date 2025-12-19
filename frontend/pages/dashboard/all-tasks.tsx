import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type Task = {
    id: string;
    type: string;
    status: string;
    application_id: string;
    due_at: string;
    title: string;
};

export default function AllTasks() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function fetchTasks() {
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase
                .from("tasks")
                .select("*")
                .order("due_at", { ascending: true });

            if (error) throw error;

            setTasks(data || []);
        } catch (err: any) {
            console.error(err);
            setError("Failed to load tasks");
        } finally {
            setLoading(false);
        }
    }

    async function markComplete(id: string) {
        try {
            const { error } = await supabase
                .from("tasks")
                .update({ status: 'completed' })
                .eq('id', id);

            if (error) throw error;

            setTasks((prev) => prev.filter((t) => t.id !== id));
        } catch (err: any) {
            console.error(err);
            alert("Failed to update task");
        }
    }

    useEffect(() => {
        fetchTasks();
    }, []);

    if (loading) return <div>Loading tasks...</div>;
    if (error) return <div style={{ color: "red" }}>{error}</div>;

    return (
        <main style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h1>All Tasks</h1>
                <a
                    href="/dashboard/create-task"
                    style={{
                        padding: "0.5rem 1rem",
                        background: "#0070f3",
                        color: "white",
                        textDecoration: "none",
                        borderRadius: "5px",
                    }}
                >
                    + Create Task
                </a>
            </div>

            <div style={{ marginBottom: "1rem" }}>
                <a href="/dashboard/today" style={{ color: "#0070f3" }}>
                    ← Today's Tasks
                </a>
            </div>

            {tasks.length === 0 && <p>No tasks found 🎉</p>}

            {tasks.length > 0 && (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ borderBottom: "2px solid #ddd" }}>
                            <th style={{ padding: "0.5rem", textAlign: "left" }}>Title</th>
                            <th style={{ padding: "0.5rem", textAlign: "left" }}>Type</th>
                            <th style={{ padding: "0.5rem", textAlign: "left" }}>Due At</th>
                            <th style={{ padding: "0.5rem", textAlign: "left" }}>Status</th>
                            <th style={{ padding: "0.5rem", textAlign: "left" }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map((t) => (
                            <tr key={t.id} style={{ borderBottom: "1px solid #eee" }}>
                                <td style={{ padding: "0.5rem" }}>{t.title || "(No title)"}</td>
                                <td style={{ padding: "0.5rem" }}>{t.type}</td>
                                <td style={{ padding: "0.5rem" }}>{new Date(t.due_at).toLocaleString()}</td>
                                <td style={{ padding: "0.5rem" }}>
                                    <span style={{
                                        padding: "0.25rem 0.5rem",
                                        borderRadius: "3px",
                                        background: t.status === "completed" ? "#d4edda" : "#fff3cd",
                                        color: t.status === "completed" ? "#155724" : "#856404",
                                    }}>
                                        {t.status}
                                    </span>
                                </td>
                                <td style={{ padding: "0.5rem" }}>
                                    {t.status !== "completed" && (
                                        <button
                                            onClick={() => markComplete(t.id)}
                                            style={{
                                                padding: "0.25rem 0.5rem",
                                                background: "#28a745",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "3px",
                                                cursor: "pointer",
                                            }}
                                        >
                                            Mark Complete
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </main>
    );
}
