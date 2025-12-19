import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        router.push("/dashboard/today");
    }, [router]);

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <p>Redirecting to dashboard...</p>
        </div>
    );
}
