"use client";

import { useSemesters } from "@/lib/hooks/useSemesters";
import { useBlocks } from "@/lib/hooks/useBlocks";
import { useModules } from "@/lib/hooks/useModules";
import { useWeeks } from "@/lib/hooks/useWeeks";
import { useLessons } from "@/lib/hooks/useLessons";
import { useUserData } from "@/lib/hooks/useUserData";
import { useAuth } from "@/lib/auth";
import { SemesterAccordion } from "@/components/Accordion/SemesterAccordion";
import { GraduationCap, BookOpen, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function CurriculumPage() {
    const { user } = useAuth();
    const { semesters, loading: semestersLoading } = useSemesters();
    const { blocks, loading: blocksLoading } = useBlocks();
    const { modules, isLoading: modulesLoading } = useModules();
    const { weeks, loading: weeksLoading } = useWeeks();
    const { lessons, isLoading: lessonsLoading } = useLessons();
    const { userData } = useUserData(user?.uid ?? undefined);

    const loading = semestersLoading || blocksLoading || modulesLoading || weeksLoading || lessonsLoading;
    const progress = userData?.progress || {};

    // Calculate stats
    const completedLessons = Object.values(progress).filter(Boolean).length;
    const totalLessons = lessons.length;
    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
            <div className="max-w-5xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Link href="/dashboard" className="hover:text-primary transition-colors">
                            Dashboard
                        </Link>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-foreground font-medium">Mijn Curriculum</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                            <GraduationCap className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Mijn Curriculum</h1>
                            <p className="text-muted-foreground">
                                Bekijk alle semesters, blokken, modules en lessen
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <p className="text-2xl font-bold text-primary">{semesters.length}</p>
                        <p className="text-sm text-muted-foreground">Semesters</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <p className="text-2xl font-bold text-secondary">{modules.length}</p>
                        <p className="text-sm text-muted-foreground">Modules</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <p className="text-2xl font-bold text-cyan-500">{totalLessons}</p>
                        <p className="text-sm text-muted-foreground">Lessen</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <p className="text-2xl font-bold text-green-500">{progressPercentage}%</p>
                        <p className="text-sm text-muted-foreground">Voltooid</p>
                    </div>
                </div>

                {/* Curriculum Tree */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-primary" />
                            Volledig Curriculum Overzicht
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Klik op een semester om de inhoud te bekijken. Klik op een les om te starten.
                        </p>
                    </div>

                    <div className="p-4">
                        {loading ? (
                            <div className="py-12 text-center">
                                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-muted-foreground">Curriculum laden...</p>
                            </div>
                        ) : semesters.length === 0 ? (
                            <div className="py-12 text-center">
                                <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-muted-foreground">Nog geen curriculum beschikbaar.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {semesters.map((semester) => (
                                    <SemesterAccordion
                                        key={semester.id}
                                        semester={semester}
                                        blocks={blocks}
                                        modules={modules}
                                        weeks={weeks}
                                        lessons={lessons}
                                        userProgress={progress}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
