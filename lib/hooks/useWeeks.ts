import { useEffect, useState } from "react";
import { getWeeks, Week } from "@/lib/firestore";

export function useWeeks() {
    const [weeks, setWeeks] = useState<Week[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let mounted = true;

        async function fetch() {
            try {
                const data = await getWeeks();
                if (mounted) {
                    setWeeks(data);
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

    return { weeks, loading, error };
}
