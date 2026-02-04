"use client";

import useSWR from "swr";
import { getUserData, UserData } from "@/lib/firestore";

const fetcher = async (userId: string): Promise<UserData | null> => {
    return getUserData(userId);
};

export function useUserData(userId: string | undefined) {
    const { data, error, isLoading, mutate } = useSWR<UserData | null>(
        userId ? ["userData", userId] : null,
        userId ? () => fetcher(userId) : null,
        {
            revalidateOnFocus: false,
            dedupingInterval: 30000, // 30 seconds
        }
    );

    return {
        userData: data || null,
        progress: data?.progress || {},
        isLoading,
        isError: !!error,
        mutate,
    };
}
