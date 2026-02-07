"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface SessionTimerContextType {
    sessionSeconds: number;
    totalStudyTime: number;
    formatTime: (seconds: number) => string;
}

const SessionTimerContext = createContext<SessionTimerContextType | undefined>(undefined);

export function SessionTimerProvider({ children }: { children: React.ReactNode }) {
    const [sessionSeconds, setSessionSeconds] = useState(0);
    const [totalStudyTime, setTotalStudyTime] = useState(0);

    useEffect(() => {
        // Load total study time from localStorage
        const stored = localStorage.getItem('foh_total_study_time');
        if (stored) {
            setTotalStudyTime(parseInt(stored, 10));
        }

        // Start session timer
        const interval = setInterval(() => {
            setSessionSeconds(prev => prev + 1);
            setTotalStudyTime(prev => {
                const newTotal = prev + 1;
                localStorage.setItem('foh_total_study_time', newTotal.toString());
                return newTotal;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <SessionTimerContext.Provider value={{ sessionSeconds, totalStudyTime, formatTime }}>
            {children}
        </SessionTimerContext.Provider>
    );
}

export function useSessionTimer() {
    const context = useContext(SessionTimerContext);
    if (context === undefined) {
        throw new Error("useSessionTimer must be used within a SessionTimerProvider");
    }
    return context;
}
