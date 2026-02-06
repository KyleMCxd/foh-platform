"use client";

import useSWR from "swr";
import { getBlocks, Block } from "@/lib/firestore";

const fetcher = async (): Promise<Block[]> => {
    return await getBlocks();
};

export function useBlocks() {
    const { data, error, isLoading, mutate } = useSWR<Block[]>(
        "blocks",
        fetcher,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false
        }
    );

    return {
        blocks: data || [],
        loading: isLoading,
        error,
        mutate
    };
}
