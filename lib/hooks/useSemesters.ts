import { useEffect, useState } from "react";
import { getSemesters, Semester } from "@/lib/firestore";

export function useSemesters() {
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let mounted = true;

        async function fetch() {
            try {
                const data = await getSemesters();
                if (mounted) {
                    setSemesters(data);
                    setLoading(false);
                }
            } catch (err) {
                if (mounted) {
                    setError(err as Error);
                    setLoading(false);
                }
            }
        }

        fetch();
        return () => {
            mounted = false;
        };
    }, []);

    return { semesters, loading, error };
}
