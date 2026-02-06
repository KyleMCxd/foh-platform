import { useEffect, useState } from "react";
import { getBlocks, Block } from "@/lib/firestore";

export function useBlocks() {
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let mounted = true;

        async function fetch() {
            try {
                const data = await getBlocks();
                if (mounted) {
                    setBlocks(data);
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

    return { blocks, loading, error };
}
