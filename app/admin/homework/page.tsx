"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    getAllSubmissions,
    getModules,
    updateSubmissionStatus,
    gradeSubmission,
    Submission,
    Module,
} from "@/lib/firestore";
import { useAuth } from "@/lib/auth";
import {
    ArrowLeft,
    File,
    Check,
    Clock,
    Eye,
    Filter,
    Loader2,
    CheckCircle,
    XCircle,
    X,
    MessageSquare,
} from "lucide-react";

export default function AdminHomeworkPage() {
    const { user } = useAuth();

    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [modules, setModules] = useState<Module[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterModule, setFilterModule] = useState<string>("all");
    const [filterStatus, setFilterStatus] = useState<string>("all");

    // Grading Modal State
    const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);
    const [selectedGrade, setSelectedGrade] = useState<"pass" | "fail">("pass");
    const [feedbackText, setFeedbackText] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                const [subsData, modulesData] = await Promise.all([
                    getAllSubmissions(),
                    getModules(),
                ]);
                setSubmissions(subsData);
                setModules(modulesData);
            } catch (error) {
                console.error("Failed to fetch submissions:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const openGradingModal = (sub: Submission) => {
        setGradingSubmission(sub);
        setSelectedGrade(sub.grade || "pass");
        setFeedbackText(sub.feedback || "");
    };

    const handleSaveGrade = async () => {
        if (!gradingSubmission) return;
        setSaving(true);
        try {
            await gradeSubmission(gradingSubmission.id, selectedGrade, feedbackText);
            setSubmissions((prev) =>
                prev.map((s) =>
                    s.id === gradingSubmission.id
                        ? { ...s, grade: selectedGrade, feedback: feedbackText, status: "reviewed" }
                        : s
                )
            );
            setGradingSubmission(null);
        } catch (error) {
            console.error("Failed to grade submission:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleQuickApprove = async (id: string) => {
        try {
            await gradeSubmission(id, "pass", "Goed werk!");
            setSubmissions((prev) =>
                prev.map((s) =>
                    s.id === id
                        ? { ...s, grade: "pass", feedback: "Goed werk!", status: "reviewed" }
                        : s
                )
            );
        } catch (error) {
            console.error("Failed to approve:", error);
        }
    };

    const filteredSubmissions = submissions.filter((sub) => {
        if (filterModule !== "all" && sub.moduleId !== filterModule) return false;
        if (filterStatus !== "all" && sub.status !== filterStatus) return false;
        return true;
    });

    const getModuleTitle = (moduleId: string) => {
        const module = modules.find((m) => m.id === moduleId);
        return module?.title || moduleId;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-border sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin"
                            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <h1 className="font-bold text-lg">Homework Submissions</h1>
                            <p className="text-xs text-muted-foreground">
                                {submissions.length} total • {submissions.filter(s => s.status === "pending").length} pending
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-10">
                {/* Filters */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-muted-foreground" />
                        <select
                            value={filterModule}
                            onChange={(e) => setFilterModule(e.target.value)}
                            className="px-3 py-2 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="all">All Modules</option>
                            {modules.map((module) => (
                                <option key={module.id} value={module.id}>
                                    {module.title}
                                </option>
                            ))}
                        </select>
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                    </select>
                </div>

                {/* Grading Modal */}
                {gradingSubmission && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold">Beoordeling</h3>
                                <button
                                    onClick={() => setGradingSubmission(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="mb-6">
                                <p className="text-sm text-muted-foreground mb-1">Student</p>
                                <p className="font-medium">{gradingSubmission.userEmail}</p>
                            </div>

                            <div className="mb-6">
                                <p className="text-sm text-muted-foreground mb-1">Bestand</p>
                                <a
                                    href={gradingSubmission.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-primary hover:underline"
                                >
                                    <File className="w-4 h-4" />
                                    {gradingSubmission.fileName}
                                </a>
                            </div>

                            <div className="mb-6">
                                <p className="text-sm font-medium mb-3">Beoordeling</p>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setSelectedGrade("pass")}
                                        className={`flex-1 py-4 rounded-xl border-2 font-bold transition-all ${selectedGrade === "pass"
                                            ? "border-green-500 bg-green-50 text-green-700"
                                            : "border-border hover:border-green-300"
                                            }`}
                                    >
                                        <CheckCircle className="w-6 h-6 mx-auto mb-1" />
                                        Voldoende
                                    </button>
                                    <button
                                        onClick={() => setSelectedGrade("fail")}
                                        className={`flex-1 py-4 rounded-xl border-2 font-bold transition-all ${selectedGrade === "fail"
                                            ? "border-red-500 bg-red-50 text-red-700"
                                            : "border-border hover:border-red-300"
                                            }`}
                                    >
                                        <XCircle className="w-6 h-6 mx-auto mb-1" />
                                        Onvoldoende
                                    </button>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium mb-2">
                                    <MessageSquare className="w-4 h-4 inline mr-1" />
                                    Feedback
                                </label>
                                <textarea
                                    value={feedbackText}
                                    onChange={(e) => setFeedbackText(e.target.value)}
                                    placeholder="Typ je feedback hier..."
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setGradingSubmission(null)}
                                    className="flex-1 py-3 rounded-lg border border-border font-medium hover:bg-gray-50"
                                >
                                    Annuleren
                                </button>
                                <button
                                    onClick={handleSaveGrade}
                                    disabled={saving}
                                    className="flex-1 py-3 rounded-lg bg-brand-gradient text-white font-medium flex items-center justify-center gap-2"
                                >
                                    {saving ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Check className="w-4 h-4" />
                                    )}
                                    Opslaan
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Submissions Table */}
                {filteredSubmissions.length === 0 ? (
                    <div className="text-center py-20 bg-white border border-dashed border-border rounded-2xl">
                        <p className="text-muted-foreground">No submissions found.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-border overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-border">
                                <tr>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Student
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Module
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Submitted
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Grade
                                    </th>
                                    <th className="text-right px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredSubmissions.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <p className="font-medium">{sub.userEmail}</p>
                                            <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                                                {sub.fileName}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">
                                            {getModuleTitle(sub.moduleId)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">
                                            {sub.submittedAt.toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {sub.grade ? (
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${sub.grade === "pass"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-red-100 text-red-700"
                                                        }`}
                                                >
                                                    {sub.grade === "pass" ? (
                                                        <>
                                                            <CheckCircle className="w-3 h-3" />
                                                            Voldoende
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="w-3 h-3" />
                                                            Onvoldoende
                                                        </>
                                                    )}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                                                    <Clock className="w-3 h-3" />
                                                    Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <a
                                                    href={sub.fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 rounded-lg hover:bg-gray-100 text-muted-foreground"
                                                    title="View PDF"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </a>
                                                <button
                                                    onClick={() => openGradingModal(sub)}
                                                    className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20"
                                                >
                                                    Beoordelen
                                                </button>
                                                {!sub.grade && (
                                                    <button
                                                        onClick={() => handleQuickApprove(sub.id)}
                                                        className="p-2 rounded-lg hover:bg-green-50 text-green-600"
                                                        title="Quick Approve"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}
