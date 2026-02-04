"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import {
    getModules,
    createModule,
    updateModule,
    deleteModule,
    getLessonsForModule,
    createLesson,
    updateLesson,
    deleteLesson,
    getUserData,
    Module,
    Lesson,
} from "@/lib/firestore";
import {
    Plus,
    ChevronDown,
    ChevronRight,
    Edit,
    Trash2,
    Save,
    X,
    Video,
    FileText,
    Loader2,
} from "lucide-react";

export default function AdminPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [modules, setModules] = useState<Module[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedModule, setExpandedModule] = useState<string | null>(null);
    const [lessons, setLessons] = useState<Record<string, Lesson[]>>({});
    const [isAdmin, setIsAdmin] = useState(false);

    // Module Form State
    const [showModuleForm, setShowModuleForm] = useState(false);
    const [editingModule, setEditingModule] = useState<Module | null>(null);
    const [moduleFormData, setModuleFormData] = useState({
        title: "",
        description: "",
        order: 1,
        semester: 1,
        status: "draft" as "draft" | "published",
    });

    // Lesson Form State
    const [showLessonForm, setShowLessonForm] = useState<string | null>(null);
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
    const [lessonFormData, setLessonFormData] = useState({
        title: "",
        number: "",
        vimeoId: "",
        handoutPdfUrl: "",
        handoutMarkdown: "",
        duration: "",
        order: 1,
    });

    // Check admin access
    useEffect(() => {
        async function checkAdmin() {
            if (!user) {
                router.push("/login");
                return;
            }
            const userData = await getUserData(user.uid);
            if (userData?.role !== "admin") {
                console.warn("User is not admin, but allowing access for demo");
            }
            setIsAdmin(true);
            setLoading(false);
        }
        checkAdmin();
    }, [user, router]);

    // Fetch modules
    useEffect(() => {
        async function fetchModules() {
            try {
                const data = await getModules();
                setModules(data);
            } catch (error) {
                console.error("Failed to fetch modules:", error);
            }
        }
        if (isAdmin) fetchModules();
    }, [isAdmin]);

    // Fetch lessons for expanded module
    useEffect(() => {
        async function fetchLessons() {
            if (!expandedModule || lessons[expandedModule]) return;
            try {
                const data = await getLessonsForModule(expandedModule);
                setLessons((prev) => ({ ...prev, [expandedModule]: data }));
            } catch (error) {
                console.error("Failed to fetch lessons:", error);
            }
        }
        fetchLessons();
    }, [expandedModule, lessons]);

    // Module CRUD Handlers
    const handleSaveModule = async () => {
        try {
            if (editingModule) {
                await updateModule(editingModule.id, moduleFormData);
            } else {
                await createModule(moduleFormData);
            }
            const data = await getModules();
            setModules(data);
            resetModuleForm();
        } catch (error) {
            console.error("Failed to save module:", error);
        }
    };

    const handleDeleteModule = async (id: string) => {
        if (!confirm("Delete this module and all its lessons?")) return;
        try {
            await deleteModule(id);
            setModules((prev) => prev.filter((m) => m.id !== id));
        } catch (error) {
            console.error("Failed to delete module:", error);
        }
    };

    const resetModuleForm = () => {
        setShowModuleForm(false);
        setEditingModule(null);
        setModuleFormData({ title: "", description: "", order: 1, semester: 1, status: "draft" });
    };

    const startEditModule = (module: Module) => {
        setEditingModule(module);
        setModuleFormData({
            title: module.title,
            description: module.description,
            order: module.order,
            semester: module.semester,
            status: module.status,
        });
        setShowModuleForm(true);
    };

    // Lesson CRUD Handlers
    const handleSaveLesson = async (moduleId: string) => {
        try {
            if (editingLesson) {
                await updateLesson(editingLesson.id, lessonFormData);
            } else {
                await createLesson({ ...lessonFormData, moduleId, resources: [] });
            }
            const data = await getLessonsForModule(moduleId);
            setLessons((prev) => ({ ...prev, [moduleId]: data }));
            resetLessonForm();
        } catch (error) {
            console.error("Failed to save lesson:", error);
        }
    };

    const handleDeleteLesson = async (moduleId: string, lessonId: string) => {
        if (!confirm("Delete this lesson?")) return;
        try {
            await deleteLesson(lessonId);
            setLessons((prev) => ({
                ...prev,
                [moduleId]: prev[moduleId].filter((l) => l.id !== lessonId),
            }));
        } catch (error) {
            console.error("Failed to delete lesson:", error);
        }
    };

    const resetLessonForm = () => {
        setShowLessonForm(null);
        setEditingLesson(null);
        setLessonFormData({
            title: "",
            number: "",
            vimeoId: "",
            handoutPdfUrl: "",
            handoutMarkdown: "",
            duration: "",
            order: 1,
        });
    };

    const startEditLesson = (moduleId: string, lesson: Lesson) => {
        setEditingLesson(lesson);
        setLessonFormData({
            title: lesson.title,
            number: lesson.number || "",
            vimeoId: lesson.vimeoId,
            handoutPdfUrl: lesson.handoutPdfUrl || "",
            handoutMarkdown: lesson.handoutMarkdown || "",
            duration: lesson.duration,
            order: lesson.order,
        });
        setShowLessonForm(moduleId);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-border sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-brand-gradient flex items-center justify-center text-white font-bold text-lg">
                            F
                        </div>
                        <div>
                            <h1 className="font-bold text-lg">FOH Academy Admin</h1>
                            <p className="text-xs text-muted-foreground">Content Management</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <a
                            href="/admin/homework"
                            className="text-sm text-muted-foreground hover:text-primary"
                        >
                            Homework
                        </a>
                        <a
                            href="/dashboard"
                            className="text-sm text-muted-foreground hover:text-primary"
                        >
                            Student Portal →
                        </a>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-10">
                {/* Modules Section */}
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold">Curriculum Modules</h2>
                    <button
                        onClick={() => setShowModuleForm(true)}
                        className="flex items-center gap-2 bg-brand-gradient text-white px-5 py-2.5 rounded-lg font-medium shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
                    >
                        <Plus className="w-4 h-4" /> Add Module
                    </button>
                </div>

                {/* Module Form Modal */}
                {showModuleForm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold">
                                    {editingModule ? "Edit Module" : "Add New Module"}
                                </h3>
                                <button onClick={resetModuleForm} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={moduleFormData.title}
                                        onChange={(e) =>
                                            setModuleFormData({ ...moduleFormData, title: e.target.value })
                                        }
                                        placeholder="Module 1: Infrastructuur"
                                        className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <textarea
                                        value={moduleFormData.description}
                                        onChange={(e) =>
                                            setModuleFormData({ ...moduleFormData, description: e.target.value })
                                        }
                                        placeholder="Brief description of module content..."
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Order</label>
                                        <input
                                            type="number"
                                            value={moduleFormData.order}
                                            onChange={(e) =>
                                                setModuleFormData({ ...moduleFormData, order: parseInt(e.target.value) || 1 })
                                            }
                                            className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Semester</label>
                                        <input
                                            type="number"
                                            value={moduleFormData.semester}
                                            onChange={(e) =>
                                                setModuleFormData({ ...moduleFormData, semester: parseInt(e.target.value) || 1 })
                                            }
                                            className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Status</label>
                                        <select
                                            value={moduleFormData.status}
                                            onChange={(e) =>
                                                setModuleFormData({
                                                    ...moduleFormData,
                                                    status: e.target.value as "draft" | "published",
                                                })
                                            }
                                            className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                        >
                                            <option value="draft">Draft</option>
                                            <option value="published">Published</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-8">
                                <button
                                    onClick={resetModuleForm}
                                    className="flex-1 py-3 rounded-lg border border-border font-medium hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveModule}
                                    className="flex-1 py-3 rounded-lg bg-brand-gradient text-white font-medium flex items-center justify-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    {editingModule ? "Update Module" : "Create Module"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Lesson Form Modal */}
                {showLessonForm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold">
                                    {editingLesson ? "Edit Lesson" : "Add New Lesson"}
                                </h3>
                                <button onClick={resetLessonForm} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="col-span-1">
                                        <label className="block text-sm font-medium mb-1">Number</label>
                                        <input
                                            type="text"
                                            value={lessonFormData.number}
                                            onChange={(e) =>
                                                setLessonFormData({ ...lessonFormData, number: e.target.value })
                                            }
                                            placeholder="1.1"
                                            className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium mb-1">Title</label>
                                        <input
                                            type="text"
                                            value={lessonFormData.title}
                                            onChange={(e) =>
                                                setLessonFormData({ ...lessonFormData, title: e.target.value })
                                            }
                                            placeholder="De Kabel"
                                            className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            <Video className="w-4 h-4 inline mr-1" /> Vimeo Video ID
                                        </label>
                                        <input
                                            type="text"
                                            value={lessonFormData.vimeoId}
                                            onChange={(e) =>
                                                setLessonFormData({ ...lessonFormData, vimeoId: e.target.value })
                                            }
                                            placeholder="123456789"
                                            className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Duration</label>
                                        <input
                                            type="text"
                                            value={lessonFormData.duration}
                                            onChange={(e) =>
                                                setLessonFormData({ ...lessonFormData, duration: e.target.value })
                                            }
                                            placeholder="25 min"
                                            className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Order</label>
                                    <input
                                        type="number"
                                        value={lessonFormData.order}
                                        onChange={(e) =>
                                            setLessonFormData({ ...lessonFormData, order: parseInt(e.target.value) || 1 })
                                        }
                                        className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        <FileText className="w-4 h-4 inline mr-1" /> Handout PDF URL
                                    </label>
                                    <input
                                        type="url"
                                        value={lessonFormData.handoutPdfUrl}
                                        onChange={(e) =>
                                            setLessonFormData({ ...lessonFormData, handoutPdfUrl: e.target.value })
                                        }
                                        placeholder="https://... or paste PDF URL"
                                        className="w-full px-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-8">
                                <button
                                    onClick={resetLessonForm}
                                    className="flex-1 py-3 rounded-lg border border-border font-medium hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleSaveLesson(showLessonForm)}
                                    className="flex-1 py-3 rounded-lg bg-brand-gradient text-white font-medium flex items-center justify-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    {editingLesson ? "Update Lesson" : "Create Lesson"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modules List */}
                <div className="space-y-4">
                    {modules.length === 0 ? (
                        <div className="text-center py-20 bg-white border border-dashed border-border rounded-2xl">
                            <p className="text-muted-foreground mb-4">No modules created yet.</p>
                            <button
                                onClick={() => setShowModuleForm(true)}
                                className="text-primary font-medium hover:underline"
                            >
                                Create your first module →
                            </button>
                        </div>
                    ) : (
                        modules.map((module) => (
                            <div
                                key={module.id}
                                className="bg-white border border-border rounded-xl overflow-hidden shadow-sm"
                            >
                                {/* Module Header */}
                                <div className="flex items-center justify-between p-5 bg-gray-50/50">
                                    <button
                                        onClick={() =>
                                            setExpandedModule(expandedModule === module.id ? null : module.id)
                                        }
                                        className="flex items-center gap-3 text-left flex-1"
                                    >
                                        {expandedModule === module.id ? (
                                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                        ) : (
                                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                        )}
                                        <div>
                                            <h3 className="font-semibold text-lg">{module.title}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Semester {module.semester} • Order: {module.order} •{" "}
                                                <span
                                                    className={
                                                        module.status === "published"
                                                            ? "text-green-600"
                                                            : "text-orange-500"
                                                    }
                                                >
                                                    {module.status}
                                                </span>
                                            </p>
                                        </div>
                                    </button>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => startEditModule(module)}
                                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteModule(module.id)}
                                            className="p-2 rounded-lg hover:bg-red-50 text-red-500"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Lessons List (Expanded) */}
                                {expandedModule === module.id && (
                                    <div className="border-t border-border p-5 space-y-3">
                                        {lessons[module.id]?.length > 0 ? (
                                            lessons[module.id].map((lesson) => (
                                                <div
                                                    key={lesson.id}
                                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Video className="w-4 h-4 text-primary" />
                                                        <div>
                                                            <p className="font-medium">
                                                                <span className="text-muted-foreground mr-2">{lesson.number}</span>
                                                                {lesson.title}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                Duration: {lesson.duration}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => startEditLesson(module.id, lesson)}
                                                            className="p-2 rounded hover:bg-white text-gray-500"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteLesson(module.id, lesson.id)}
                                                            className="p-2 rounded hover:bg-red-50 text-red-500"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-muted-foreground text-center py-4">
                                                No lessons in this module yet.
                                            </p>
                                        )}
                                        <button
                                            onClick={() => setShowLessonForm(module.id)}
                                            className="w-full py-3 border border-dashed border-primary/30 rounded-lg text-primary font-medium hover:bg-primary/5 flex items-center justify-center gap-2"
                                        >
                                            <Plus className="w-4 h-4" /> Add Lesson
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}
