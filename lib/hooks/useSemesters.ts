"use client";

import useSWR from "swr";
import { getSemesters, Semester } from "@/lib/firestore";

const fetcher = async (): Promise<Semester[]> => {
    return await getSemesters();
};

export function useSemesters() {
    const { data, error, isLoading, mutate } = useSWR<Semester[]>(
        "semesters",
        fetcher,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false
        }
    );

    return {
        semesters: data || [],
        loading: isLoading,
        error,
        mutate
    };
}
