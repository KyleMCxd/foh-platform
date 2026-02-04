"use client";

import useSWR from "swr";
import { getLessonsForModule, Lesson } from "@/lib/firestore";

const fetcher = async (moduleId: string): Promise<Lesson[]> => {
    return getLessonsForModule(moduleId);
};

export function useLessons(moduleId: string | undefined) {
    const { data, error, isLoading, mutate } = useSWR<Lesson[]>(
        moduleId ? ["lessons", moduleId] : null,
        moduleId ? () => fetcher(moduleId) : null,
        {
            revalidateOnFocus: false,
            dedupingInterval: 60000, // 1 minute
        }
    );

    return {
        lessons: data || [],
        isLoading,
        isError: !!error,
        mutate,
    };
}
