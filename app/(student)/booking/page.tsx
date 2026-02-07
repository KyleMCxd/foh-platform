"use client";

import { useState, useEffect } from "react";
import {
    getLiveSlots,
    bookLiveSlot,
    getUserData,
    getLessonsForModule,
    LiveSlot,
    UserData,
    Lesson
} from "@/lib/firestore";
import { useAuth } from "@/lib/auth";
import {
    Calendar,
    Clock,
    Users,
    CheckCircle,
    Lock,
    Loader2,
    AlertCircle
} from "lucide-react";

export default function BookingPage() {
    const { user } = useAuth();
    const [slots, setSlots] = useState<LiveSlot[]>([]);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [bookingId, setBookingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [moduleCompletionMap, setModuleCompletionMap] = useState<Record<string, boolean>>({});

    // Fetch data
    useEffect(() => {
        async function fetchData() {
            try {
                const slotsData = await getLiveSlots();
                setSlots(slotsData);

                if (user) {
                    const data = await getUserData(user.uid);
                    setUserData(data);
                }
            } catch (err) {
                console.error("Failed to fetch booking data:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [user]);

    // Fetch module completion status for prerequisites
    useEffect(() => {
        async function checkModuleCompletion() {
            if (!userData || !slots.length) return;

            const completionMap: Record<string, boolean> = {};

            // Get all unique prerequisite module IDs from all slots
            const allPrereqModuleIds = new Set<string>();
            slots.forEach(slot => {
                slot.prerequisiteModuleIds?.forEach(id => allPrereqModuleIds.add(id));
            });

            // For each prerequisite module, check if all its lessons are complete
            for (const moduleId of allPrereqModuleIds) {
                try {
                    const lessons = await getLessonsForModule(moduleId);
                    const allComplete = lessons.length > 0 && lessons.every((lesson: Lesson) =>
                        userData.progress && userData.progress[lesson.id] === true
                    );
                    completionMap[moduleId] = allComplete;
                } catch (err) {
                    console.error(`Failed to check module ${moduleId}:`, err);
                    completionMap[moduleId] = false;
                }
            }

            setModuleCompletionMap(completionMap);
        }

        checkModuleCompletion();
    }, [userData, slots]);

    const handleBook = async (slot: LiveSlot) => {
        if (!user || !userData) return;
        setBookingId(slot.id);
        setError(null);

        try {
            await bookLiveSlot(user.uid, slot.id);

            // Optimistic update locally
            setSlots(prev => prev.map(s =>
                s.id === slot.id
                    ? { ...s, bookedUserIds: [...s.bookedUserIds, user.uid] }
                    : s
            ));
            setUserData(prev => prev ? ({
                ...prev,
                bookedSlots: [...(prev.bookedSlots || []), slot.id]
            }) : null);

        } catch (err: any) {
            console.error("Booking failed:", err);
            setError(err.message || "Kon slot niet boeken.");
        } finally {
            setBookingId(null);
        }
    };

    const isPrerequisitesMet = (slot: LiveSlot) => {
        if (!userData || !slot.prerequisiteModuleIds || slot.prerequisiteModuleIds.length === 0) {
            return true; // No prerequisites
        }

        // Check if all prerequisite modules are completed
        return slot.prerequisiteModuleIds.every(moduleId =>
            moduleCompletionMap[moduleId] === true
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-5xl mx-auto">
                <div className="mb-10">
                    <h1 className="text-3xl font-extrabold tracking-tight mb-2">
                        Mijn Praktijkdagen
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Boek je live training dagen op locatie. Vol is vol!
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 flex items-center gap-3 border border-red-100">
                        <AlertCircle className="w-5 h-5" />
                        {error}
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                    {slots.map((slot) => {
                        const isBooked = userData?.bookedSlots?.includes(slot.id);
                        const isFull = slot.bookedUserIds.length >= slot.capacity;
                        const unlocked = isPrerequisitesMet(slot);
                        const spotsLeft = slot.capacity - slot.bookedUserIds.length;

                        return (
                            <div
                                key={slot.id}
                                className={`bg-white border rounded-2xl p-6 transition-all ${isBooked
                                    ? "border-green-200 bg-green-50/30"
                                    : "border-border hover:shadow-lg"
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider">
                                        Live Training
                                    </div>
                                    {isBooked && (
                                        <div className="flex items-center gap-1 text-green-600 font-bold text-sm">
                                            <CheckCircle className="w-4 h-4" />
                                            Gereserveerd
                                        </div>
                                    )}
                                </div>

                                <h3 className="text-xl font-bold mb-2">{slot.title}</h3>
                                <p className="text-muted-foreground text-sm mb-6">
                                    {slot.description}
                                </p>

                                <div className="space-y-3 mb-8">
                                    <div className="flex items-center gap-3 text-sm">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span>
                                            {slot.startTime.toLocaleDateString("nl-NL", {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <span>
                                            {slot.startTime.toLocaleTimeString("nl-NL", { hour: '2-digit', minute: '2-digit' })} -
                                            {slot.endTime.toLocaleTimeString("nl-NL", { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <Users className="w-4 h-4 text-gray-400" />
                                        <span className={isFull && !isBooked ? "text-red-500 font-medium" : ""}>
                                            {spotsLeft} plekken beschikbaar (Max {slot.capacity})
                                        </span>
                                    </div>
                                </div>

                                {isBooked ? (
                                    <button
                                        disabled
                                        className="w-full py-3 rounded-xl bg-green-100 text-green-700 font-bold cursor-default"
                                    >
                                        Je bent ingeschreven
                                    </button>
                                ) : !unlocked ? (
                                    <button
                                        disabled
                                        className="w-full py-3 rounded-xl bg-gray-100 text-gray-400 font-medium flex items-center justify-center gap-2 cursor-not-allowed"
                                    >
                                        <Lock className="w-4 h-4" />
                                        Voltooi eerst de modules
                                    </button>
                                ) : isFull ? (
                                    <button
                                        disabled
                                        className="w-full py-3 rounded-xl bg-gray-100 text-gray-400 font-medium cursor-not-allowed"
                                    >
                                        Vol - Geen plekken meer
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleBook(slot)}
                                        disabled={bookingId === slot.id}
                                        className="w-full py-3 rounded-xl bg-brand-gradient text-white font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        {bookingId === slot.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            "Nu Reserveren"
                                        )}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>

                {slots.length === 0 && (
                    <div className="text-center py-20 bg-white border border-dashed border-border rounded-2xl">
                        <p className="text-muted-foreground">Er zijn momenteel geen praktijkdagen gepland.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
