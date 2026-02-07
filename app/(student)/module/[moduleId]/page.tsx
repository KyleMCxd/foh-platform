"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useModules } from "@/lib/hooks/useModules";
import { useWeeks } from "@/lib/hooks/useWeeks";
import { useLessons } from "@/lib/hooks/useLessons";
import { useUserData } from "@/lib/hooks/useUserData";
import {
    createSubmission,
    getSubmissionsForModule,
    Submission,
} from "@/lib/firestore";
import { uploadHomework } from "@/lib/storage";
import { useAuth } from "@/lib/auth";
import {
    ArrowLeft,
    Play,
    Clock,
    FileText,
    Upload,
    Check,
    Loader2,
    File,
    Calendar,
    ChevronRight,
    ChevronDown,
    Lock,
} from "lucide-react";

export default function ModulePage() {
    const params = useParams();
    const moduleId = params.moduleId as string;
    const { user } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // SWR hooks for parallel, cached fetching
    const { modules, isLoading: modulesLoading } = useModules();
    const { weeks, loading: weeksLoading } = useWeeks();
    const { lessons, isLoading: lessonsLoading } = useLessons();
    const { userData, isLoading: userLoading } = useUserData(user?.uid ?? undefined);

    // State for expanded weeks
    const [expandedWeeks, setExpandedWeeks] = useState<Record<string, boolean>>({});

    // Submissions still local for now as it's more specific
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [subsLoading, setSubsLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);

    const module = modules.find(m => m.id === moduleId);
    const moduleWeeks = weeks.filter(w => w.moduleId === moduleId).sort((a, b) => a.order - b.order);
    const moduleLessons = lessons.filter(l => l.moduleId === moduleId);
    const progress = userData?.progress || {};
    const loading = modulesLoading || weeksLoading || lessonsLoading || userLoading || subsLoading;

    // Auto-expand first week
    useEffect(() => {
        if (moduleWeeks.length > 0 && Object.keys(expandedWeeks).length === 0) {
            setExpandedWeeks({ [moduleWeeks[0].id]: true });
        }
    }, [moduleWeeks]);

    useEffect(() => {
        async function fetchSubmissions() {
            if (!user || !moduleId) {
                setSubsLoading(false);
                return;
            }
            try {
                const submissionsData = await getSubmissionsForModule(moduleId);
                // Filter to show only current user's submissions
                const mySubmissions = submissionsData.filter((s) => s.userId === user.uid);
                setSubmissions(mySubmissions);
            } catch (error) {
                console.error("Failed to fetch submissions:", error);
            } finally {
                setSubsLoading(false);
            }
        }
        fetchSubmissions();
    }, [moduleId, user]);

    const toggleWeek = (weekId: string) => {
        setExpandedWeeks(prev => ({
            ...prev,
            [weekId]: !prev[weekId]
        }));
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user || !module) return;

        // Validate PDF
        if (file.type !== "application/pdf") {
            alert("Please upload a PDF file.");
            return;
        }

        // Max 10MB
        if (file.size > 10 * 1024 * 1024) {
            alert("File size must be less than 10MB.");
            return;
        }

        setUploading(true);
        setUploadSuccess(false);

        try {
            const fileUrl = await uploadHomework(file, user.uid, moduleId);

            await createSubmission({
                moduleId,
                userId: user.uid,
                userEmail: user.email || "unknown",
                fileName: file.name,
                fileUrl,
                status: "pending",
            });

            // Send email notification to admin
            try {
                await fetch("/api/notify-homework", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        studentEmail: user.email,
                        moduleTitle: module.title,
                        fileName: file.name,
                        submittedAt: new Date().toISOString(),
                    }),
                });
            } catch (notifyError) {
                console.warn("Failed to send notification:", notifyError);
            }

            // Refresh submissions
            const updatedSubmissions = await getSubmissionsForModule(moduleId);
            setSubmissions(updatedSubmissions.filter((s) => s.userId === user.uid));
            setUploadSuccess(true);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!module) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 flex flex-col items-center justify-center text-center">
                <h1 className="text-2xl font-bold mb-4">Module Not Found</h1>
                <Link href="/curriculum" className="text-primary hover:underline">
                    Return to Curriculum
                </Link>
            </div>
        );
    }

    const completedLessons = moduleLessons.filter(l => progress[l.id]).length;
    const totalLessons = moduleLessons.length;
    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    // Helper to check if a lesson is locked
    const isLessonLocked = (lessonId: string) => {
        const lessonIndex = moduleLessons.findIndex(l => l.id === lessonId);
        if (lessonIndex <= 0) return false; // First lesson is always unlocked

        const prevLesson = moduleLessons[lessonIndex - 1];
        return !progress[prevLesson.id]; // Locked if previous is not complete
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="bg-black/20 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link
                        href="/curriculum"
                        className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Back to Curriculum</span>
                    </Link>
                    <div className="text-sm text-white/60">
                        {moduleWeeks.length} weeks • {totalLessons} lessons
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-12">
                {/* Module Header */}
                <div className="mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                        Module {module.order}
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-white">
                        {module.title}
                    </h1>
                    <p className="text-lg text-white/60 max-w-2xl">
                        {module.description}
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/10 p-6 mb-8">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-white">Module Progress</span>
                        <span className="text-sm text-white/60">
                            {completedLessons}/{totalLessons} lessons ({progressPercentage}%)
                        </span>
                    </div>
                    <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>

                {/* Weeks with Lessons */}
                <div className="space-y-4 mb-16">
                    <h2 className="text-xl font-bold mb-4 text-white">Weeks & Lessons</h2>

                    {moduleWeeks.length === 0 ? (
                        <div className="text-center py-12 bg-white/10 border border-dashed border-white/20 rounded-2xl">
                            <p className="text-white/60">
                                No weeks in this module yet.
                            </p>
                        </div>
                    ) : (
                        moduleWeeks.map((week) => {
                            const weekLessons = moduleLessons.filter(l => l.weekId === week.id).sort((a, b) => a.order - b.order);
                            const weekCompleted = weekLessons.filter(l => progress[l.id]).length;
                            const isExpanded = expandedWeeks[week.id];

                            return (
                                <div key={week.id} className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
                                    {/* Week Header */}
                                    <button
                                        onClick={() => toggleWeek(week.id)}
                                        className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                                            <Calendar className="w-5 h-5 text-secondary" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <h3 className="font-semibold text-white">{week.title}</h3>
                                            <p className="text-sm text-white/60">
                                                {weekLessons.length} lessons • {weekCompleted} completed
                                            </p>
                                        </div>
                                        {isExpanded ? (
                                            <ChevronDown className="w-5 h-5 text-white/40" />
                                        ) : (
                                            <ChevronRight className="w-5 h-5 text-white/40" />
                                        )}
                                    </button>

                                    {/* Lessons */}
                                    {isExpanded && weekLessons.length > 0 && (
                                        <div className="border-t border-white/10 divide-y divide-white/10">
                                            {weekLessons.map((lesson) => {
                                                const isCompleted = progress[lesson.id];
                                                const isLocked = isLessonLocked(lesson.id);

                                                return (
                                                    <Link
                                                        key={lesson.id}
                                                        href={isLocked ? "#" : `/watch/${lesson.id}`}
                                                        className={`flex items-center gap-4 p-4 pl-8 transition-colors group ${isLocked
                                                            ? "pointer-events-none opacity-60"
                                                            : "hover:bg-white/5"
                                                            }`}
                                                    >
                                                        <div className={`text-lg font-bold w-12 text-right ${isCompleted
                                                            ? "text-green-600"
                                                            : isLocked
                                                                ? "text-white/40"
                                                                : "text-primary"
                                                            }`}>
                                                            {isCompleted ? (
                                                                <Check className="w-5 h-5 ml-auto" />
                                                            ) : isLocked ? (
                                                                <Lock className="w-5 h-5 ml-auto" />
                                                            ) : (
                                                                lesson.number
                                                            )}
                                                        </div>
                                                        <div className="flex-1 border-l border-white/10 pl-4 py-1">
                                                            <h4 className={`font-medium text-lg transition-colors ${isCompleted
                                                                ? "text-gray-500"
                                                                : isLocked
                                                                    ? "text-white/40"
                                                                    : "text-white group-hover:text-primary"
                                                                }`}>
                                                                {lesson.title}
                                                            </h4>
                                                            <div className="flex items-center gap-3 mt-0.5 text-xs text-white/40">
                                                                {lesson.duration && (
                                                                    <span className="flex items-center gap-1">
                                                                        <Clock className="w-3 h-3" />
                                                                        {lesson.duration}
                                                                    </span>
                                                                )}
                                                                {lesson.handoutPdfUrl && (
                                                                    <span className="flex items-center gap-1">
                                                                        <FileText className="w-3 h-3" />
                                                                        PDF
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {isLocked ? (
                                                            <Lock className="w-4 h-4 text-gray-300" />
                                                        ) : (
                                                            <Play className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
                                                        )}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Homework Submission Section */}
                <div className="bg-white border border-border rounded-2xl p-8">
                    <h2 className="text-xl font-bold mb-2">Submit Homework</h2>
                    <p className="text-muted-foreground mb-6">
                        Upload your homework PDF for this module. Maximum file size: 10MB.
                    </p>

                    {/* Upload Button */}
                    <div className="flex items-center gap-4 mb-6">
                        <label className="flex items-center gap-3 px-6 py-3 bg-brand-gradient text-white font-medium rounded-xl cursor-pointer hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20">
                            {uploading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-5 h-5" />
                                    Choose PDF File
                                </>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,application/pdf"
                                onChange={handleFileSelect}
                                disabled={uploading}
                                className="hidden"
                            />
                        </label>
                        {uploadSuccess && (
                            <span className="flex items-center gap-2 text-green-600 font-medium">
                                <Check className="w-5 h-5" />
                                Uploaded successfully!
                            </span>
                        )}
                    </div>

                    {/* My Submissions */}
                    {submissions.length > 0 && (
                        <div>
                            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
                                My Submissions
                            </h3>
                            <div className="space-y-3">
                                {submissions.map((sub) => (
                                    <div
                                        key={sub.id}
                                        className={`p-4 rounded-xl border ${sub.grade === "pass"
                                            ? "bg-green-50 border-green-200"
                                            : sub.grade === "fail"
                                                ? "bg-red-50 border-red-200"
                                                : "bg-gray-50 border-border"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <File className="w-5 h-5 text-primary" />
                                                <div>
                                                    <p className="font-medium">{sub.fileName}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {sub.submittedAt.toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {sub.grade ? (
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-bold ${sub.grade === "pass"
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-red-100 text-red-700"
                                                            }`}
                                                    >
                                                        {sub.grade === "pass" ? "✓ Voldoende" : "✗ Onvoldoende"}
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                                                        In behandeling
                                                    </span>
                                                )}
                                                <a
                                                    href={sub.fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm font-medium text-primary hover:underline"
                                                >
                                                    Bekijk
                                                </a>
                                            </div>
                                        </div>
                                        {sub.feedback && (
                                            <div className="mt-3 pt-3 border-t border-border/50">
                                                <p className="text-xs font-medium text-muted-foreground mb-1">
                                                    Feedback van docent:
                                                </p>
                                                <p className="text-sm">{sub.feedback}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
