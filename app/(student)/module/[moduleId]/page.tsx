"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useModules } from "@/lib/hooks/useModules";
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
} from "lucide-react";

export default function ModulePage() {
    const params = useParams();
    const moduleId = params.moduleId as string;
    const { user } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // SWR hooks for parallel, cached fetching
    const { modules, isLoading: modulesLoading } = useModules();
    const { lessons, isLoading: lessonsLoading } = useLessons(moduleId);
    const { progress, isLoading: userLoading } = useUserData(user?.uid);

    // Submissions still local for now as it's more specific
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [subsLoading, setSubsLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);

    const module = modules.find(m => m.id === moduleId);
    const loading = modulesLoading || lessonsLoading || userLoading || subsLoading;

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
            // Upload to Firebase Storage (we keep using weekId param name in storage fn if not refactored yet, or update it)
            // Assuming uploadHomework helper takes a generic id, we can pass moduleId
            const fileUrl = await uploadHomework(file, user.uid, moduleId);

            // Create submission record
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

            // Reset file input
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
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!module) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center">
                <h1 className="text-2xl font-bold mb-4">Module Not Found</h1>
                <Link href="/dashboard" className="text-primary hover:underline">
                    Return to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="bg-white border-b border-border sticky top-0 z-40">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Back to Dashboard</span>
                    </Link>
                    <div className="text-sm text-muted-foreground">
                        {lessons.length} lessons
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-12">
                {/* Module Header */}
                <div className="mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 text-secondary rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                        Module {module.order}
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight mb-2">
                        {module.title}
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl">
                        {module.description}
                    </p>
                </div>

                {/* Lessons Grid */}
                <div className="space-y-4 mb-16">
                    <h2 className="text-xl font-bold mb-4">Lessons</h2>
                    {lessons.length === 0 ? (
                        <div className="text-center py-12 bg-white border border-dashed border-border rounded-2xl">
                            <p className="text-muted-foreground">
                                No lessons in this module yet.
                            </p>
                        </div>
                    ) : (
                        lessons.map((lesson, index) => (
                            <Link
                                key={lesson.id}
                                href={`/watch/${lesson.id}`}
                                className="group flex items-center gap-6 p-6 bg-white border border-border rounded-2xl hover:shadow-lg hover:border-primary/20 transition-all"
                            >
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center font-bold text-lg text-primary group-hover:scale-110 transition-transform">
                                    {lesson.number}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                                        {lesson.title}
                                    </h3>
                                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {lesson.duration || "—"}
                                        </span>
                                        {lesson.handoutMarkdown && (
                                            <span className="flex items-center gap-1">
                                                <FileText className="w-4 h-4" />
                                                Notes included
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-brand-gradient flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                    <Play className="w-5 h-5 fill-current" />
                                </div>
                            </Link>
                        ))
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
