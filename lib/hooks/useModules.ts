"use client";

import useSWR from "swr";
import { getModules, Module } from "@/lib/firestore";

const fetcher = async (): Promise<Module[]> => {
    const modules = await getModules();
    return modules.filter(m => m.status === "published");
};

export function useModules() {
    const { data, error, isLoading, mutate } = useSWR<Module[]>(
        "modules",
        fetcher,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            dedupingInterval: 60000, // 1 minute deduplication
        }
    );

    return {
        modules: data || [],
        isLoading,
        isError: !!error,
        mutate,
    };
}
