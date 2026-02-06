"use client";

import useSWR from "swr";
import { getLessonsForModule, Lesson } from "@/lib/firestore";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

const fetcherForModule = async (moduleId: string): Promise<Lesson[]> => {
    return getLessonsForModule(moduleId);
};

const fetcherAll = async (): Promise<Lesson[]> => {
    const snapshot = await getDocs(collection(db, "lessons"));
    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as Lesson[];
};

export function useLessons(moduleId?: string) {
    const { data, error, isLoading, mutate } = useSWR<Lesson[]>(
        moduleId ? ["lessons", moduleId] : "lessons-all",
        moduleId ? () => fetcherForModule(moduleId) : fetcherAll,
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
