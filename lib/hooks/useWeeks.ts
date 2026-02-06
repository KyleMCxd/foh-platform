"use client";

import useSWR from "swr";
import { getWeeks, Week } from "@/lib/firestore";

const fetcher = async (): Promise<Week[]> => {
    return await getWeeks();
};

export function useWeeks() {
    const { data, error, isLoading, mutate } = useSWR<Week[]>(
        "weeks",
        fetcher,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false
        }
    );

    return {
        weeks: data || [],
        loading: isLoading,
        error,
        mutate
    };
}
