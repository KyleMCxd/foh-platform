"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useWeeks } from "@/lib/hooks/useWeeks";
import { useLessons } from "@/lib/hooks/useLessons";
import { useModules } from "@/lib/hooks/useModules";
import { useBlocks } from "@/lib/hooks/useBlocks";
import { useUserData } from "@/lib/hooks/useUserData";
import { useAuth } from "@/lib/auth";
import {
    ArrowLeft,
    Calendar,
    Play,
    Clock,
    FileText,
    Check,
    ChevronRight,
} from "lucide-react";

export default function WeekPage() {
    const params = useParams();
    const weekId = params.weekId as string;
    const { user } = useAuth();

    // Data hooks
    const { weeks, loading: weeksLoading } = useWeeks();
    const { modules, isLoading: modulesLoading } = useModules();
    const { blocks, loading: blocksLoading } = useBlocks();
    const { lessons, isLoading: lessonsLoading } = useLessons();
    const { userData, isLoading: userLoading } = useUserData(user?.uid ?? undefined);

    const loading = weeksLoading || modulesLoading || blocksLoading || lessonsLoading || userLoading;
    const progress = userData?.progress || {};

    // Find current week and related data
    const week = weeks.find(w => w.id === weekId);
    const weekLessons = lessons.filter(l => l.weekId === weekId).sort((a, b) => a.order - b.order);
    const module = week ? modules.find(m => m.id === week.moduleId) : null;
    const block = module ? blocks.find(b => b.id === module.blockId) : null;

    // Calculate stats
    const completedCount = weekLessons.filter(l => progress[l.id]).length;
    const totalCount = weekLessons.length;
    const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!week) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 flex flex-col items-center justify-center text-center">
                <h1 className="text-2xl font-bold mb-4">Week Not Found</h1>
                <Link href="/curriculum" className="text-primary hover:underline">
                    Return to Curriculum
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="max-w-4xl mx-auto px-6 py-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-white/60 mb-6">
                    <Link href="/dashboard" className="hover:text-primary transition-colors">
                        Dashboard
                    </Link>
                    <ChevronRight className="w-4 h-4" />
                    <Link href="/curriculum" className="hover:text-primary transition-colors">
                        Curriculum
                    </Link>
                    {block && (
                        <>
                            <ChevronRight className="w-4 h-4" />
                            <span className="text-white/40">{block.title}</span>
                        </>
                    )}
                    {module && (
                        <>
                            <ChevronRight className="w-4 h-4" />
                            <Link href={`/module/${module.id}`} className="hover:text-primary transition-colors">
                                {module.title}
                            </Link>
                        </>
                    )}
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-white font-medium">{week.title}</span>
                </div>

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary to-cyan-500 flex items-center justify-center">
                            <Calendar className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">{week.title}</h1>
                            {module && (
                                <p className="text-white/60">
                                    {module.title}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/10 p-6 mb-8">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-white">Week Progress</span>
                        <span className="text-sm text-white/60">
                            {completedCount}/{totalCount} lessons ({progressPercentage}%)
                        </span>
                    </div>
                    <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>

                {/* Lessons List */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10">
                    <div className="p-6 border-b border-white/10">
                        <h2 className="text-lg font-semibold text-white">
                            Lessons in this Week
                        </h2>
                    </div>

                    <div className="divide-y divide-white/10">
                        {weekLessons.length === 0 ? (
                            <div className="p-8 text-center text-white/60">
                                No lessons in this week yet.
                            </div>
                        ) : (
                            weekLessons.map((lesson, index) => {
                                const isCompleted = progress[lesson.id];
                                return (
                                    <Link
                                        key={lesson.id}
                                        href={`/watch/${lesson.id}`}
                                        className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors group"
                                    >
                                        {/* Lesson Number */}
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${isCompleted
                                            ? "bg-green-100 text-green-600"
                                            : "bg-primary/10 text-primary"
                                            }`}>
                                            {isCompleted ? (
                                                <Check className="w-5 h-5" />
                                            ) : (
                                                lesson.number || index + 1
                                            )}
                                        </div>

                                        {/* Lesson Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className={`font-medium group-hover:text-primary transition-colors ${isCompleted ? "text-white/50" : "text-white"
                                                }`}>
                                                {lesson.title}
                                            </h3>
                                            <div className="flex items-center gap-3 mt-1 text-sm text-white/40">
                                                {lesson.duration && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4" />
                                                        {lesson.duration}
                                                    </span>
                                                )}
                                                {lesson.handoutPdfUrl && (
                                                    <span className="flex items-center gap-1">
                                                        <FileText className="w-4 h-4" />
                                                        PDF
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Play Button */}
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                            <Play className="w-4 h-4" />
                                        </div>
                                    </Link>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Back Link */}
                <div className="mt-8">
                    <Link
                        href="/curriculum"
                        className="inline-flex items-center gap-2 text-white/60 hover:text-primary transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Curriculum
                    </Link>
                </div>
            </div>
        </div>
    );
}
