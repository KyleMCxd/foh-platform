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
    createSemester,
    updateSemester,
    deleteSemester,
    createBlock,
    updateBlock,
    deleteBlock,
    createWeek,
    updateWeek,
    deleteWeek,
    Semester,
    Block,
    Module,
    Week,
    Lesson,
} from "@/lib/firestore";
import { useSemesters } from "@/lib/hooks/useSemesters";
import { useBlocks } from "@/lib/hooks/useBlocks";
import { useModules } from "@/lib/hooks/useModules";
import { useWeeks } from "@/lib/hooks/useWeeks";
import {
    Plus,
    Edit,
    Trash2,
    Save,
    X,
    Video,
    FileText,
    Loader2,
    Layout,
    BookOpen,
    Calendar,
    GraduationCap,
    Grid,
    List,
    ChevronRight,
    Search
} from "lucide-react";

type AdminTab = "semesters" | "blocks" | "modules" | "weeks" | "lessons";

export default function AdminPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<AdminTab>("modules");
    const [isAdmin, setIsAdmin] = useState(false);
    const [checkingAdmin, setCheckingAdmin] = useState(true);

    // Hooks for data
    const { semesters, mutate: mutateSemesters } = useSemesters();
    const { blocks, mutate: mutateBlocks } = useBlocks();
    const { modules, mutate: mutateModules } = useModules();
    const { weeks, mutate: mutateWeeks } = useWeeks();

    // Local state for lessons (since they depend on module selection)
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [selectedModuleForLessons, setSelectedModuleForLessons] = useState<string>("");

    // Form States
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formData, setFormData] = useState<any>({});

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
            setCheckingAdmin(false);
        }
        checkAdmin();
    }, [user, router]);

    // Fetch lessons when module selected
    useEffect(() => {
        async function fetchLessons() {
            if (selectedModuleForLessons) {
                try {
                    const data = await getLessonsForModule(selectedModuleForLessons);
                    setLessons(data.sort((a, b) => a.order - b.order));
                } catch (error) {
                    console.error("Failed to fetch lessons:", error);
                }
            } else {
                setLessons([]);
            }
        }
        fetchLessons();
    }, [selectedModuleForLessons]);

    // Generic Form Handlers
    const resetForm = () => {
        setShowForm(false);
        setEditingItem(null);
        setFormData({});
    };

    const handleEdit = (item: any) => {
        setEditingItem(item);
        setFormData({ ...item });
        setShowForm(true);
    };

    const handleDelete = async (id: string, type: AdminTab) => {
        if (!confirm("Are you sure you want to delete this item? This cannot be undone.")) return;

        try {
            switch (type) {
                case "semesters": await deleteSemester(id); await mutateSemesters(); break;
                case "blocks": await deleteBlock(id); await mutateBlocks(); break;
                case "modules": await deleteModule(id); await mutateModules(); break;
                case "weeks": await deleteWeek(id); await mutateWeeks(); break;
                case "lessons":
                    if (selectedModuleForLessons) {
                        await deleteLesson(id);
                        const updated = await getLessonsForModule(selectedModuleForLessons);
                        setLessons(updated.sort((a, b) => a.order - b.order));
                    }
                    break;
            }
        } catch (error) {
            console.error("Delete failed:", error);
            alert("Failed to delete item");
        }
    };

    const handleSave = async () => {
        try {
            const isEdit = !!editingItem;
            // Clean data
            const cleanData = { ...formData };
            delete cleanData.id;
            // Ensure numbers are numbers
            if (cleanData.order) cleanData.order = Number(cleanData.order);
            if (cleanData.weekNumber) cleanData.weekNumber = Number(cleanData.weekNumber);

            switch (activeTab) {
                case "semesters":
                    if (isEdit) await updateSemester(editingItem.id, cleanData);
                    else await createSemester(cleanData);
                    await mutateSemesters();
                    break;
                case "blocks":
                    if (isEdit) await updateBlock(editingItem.id, cleanData);
                    else await createBlock(cleanData);
                    await mutateBlocks();
                    break;
                case "modules":
                    if (isEdit) await updateModule(editingItem.id, cleanData);
                    else await createModule(cleanData);
                    await mutateModules();
                    break;
                case "weeks":
                    if (isEdit) await updateWeek(editingItem.id, cleanData);
                    else await createWeek(cleanData);
                    await mutateWeeks();
                    break;
                case "lessons":
                    if (!selectedModuleForLessons) return;
                    if (isEdit) await updateLesson(editingItem.id, cleanData);
                    else await createLesson({ ...cleanData, moduleId: selectedModuleForLessons, resources: [] });
                    const updated = await getLessonsForModule(selectedModuleForLessons);
                    setLessons(updated.sort((a, b) => a.order - b.order));
                    break;
            }
            resetForm();
        } catch (error) {
            console.error("Save failed:", error);
            alert("Failed to save item: " + error);
        }
    };

    // Render Table Helper
    const RenderTable = ({
        items,
        columns
    }: {
        items: any[];
        columns: { key: string; label: string; render?: (item: any) => React.ReactNode }[]
    }) => (
        <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-700 font-medium border-b border-border">
                    <tr>
                        {columns.map((col) => (
                            <th key={col.key} className="px-6 py-3">{col.label}</th>
                        ))}
                        <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {items.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length + 1} className="px-6 py-8 text-center text-muted-foreground">
                                No items found.
                            </td>
                        </tr>
                    ) : (
                        items.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50/50">
                                {columns.map((col) => (
                                    <td key={col.key} className="px-6 py-4">
                                        {col.render ? col.render(item) : item[col.key]}
                                    </td>
                                ))}
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-primary transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id, activeTab)}
                                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );

    if (checkingAdmin) {
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
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-brand-gradient flex items-center justify-center text-white font-bold text-lg">
                            A
                        </div>
                        <div>
                            <h1 className="font-bold text-lg">FOH Academy Admin</h1>
                            <p className="text-xs text-muted-foreground">Content Management System</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <a href="/dashboard" className="text-sm text-muted-foreground hover:text-primary">
                            Student Portal →
                        </a>
                    </div>
                </div>

                {/* Tabs */}
                <div className="max-w-7xl mx-auto px-6 overflow-x-auto">
                    <div className="flex space-x-1">
                        {[
                            { id: "semesters", label: "Semesters", icon: GraduationCap },
                            { id: "blocks", label: "Blocks", icon: Grid },
                            { id: "modules", label: "Modules", icon: BookOpen },
                            { id: "weeks", label: "Weeks", icon: Calendar },
                            { id: "lessons", label: "Lessons", icon: Video },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id as AdminTab); setShowForm(false); }}
                                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                                        ? "border-primary text-primary"
                                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-200"
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Actions Bar */}
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold capitalize">{activeTab} Management</h2>
                    <button
                        onClick={() => { resetForm(); setShowForm(true); }}
                        className="flex items-center gap-2 bg-brand-gradient text-white px-5 py-2.5 rounded-lg font-medium shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
                    >
                        <Plus className="w-4 h-4" /> Add {activeTab.slice(0, -1)}
                    </button>
                </div>

                {/* Content Rendering */}
                {activeTab === "semesters" && (
                    <RenderTable
                        items={semesters}
                        columns={[
                            { key: "order", label: "#" },
                            { key: "title", label: "Title" },
                            { key: "description", label: "Description" },
                        ]}
                    />
                )}

                {activeTab === "blocks" && (
                    <RenderTable
                        items={blocks}
                        columns={[
                            { key: "order", label: "#" },
                            { key: "title", label: "Title" },
                            { key: "semesterId", label: "Semester", render: (b) => semesters.find(s => s.id === b.semesterId)?.title || b.semesterId },
                            { key: "description", label: "Description" },
                        ]}
                    />
                )}

                {activeTab === "modules" && (
                    <RenderTable
                        items={modules}
                        columns={[
                            { key: "order", label: "#" },
                            { key: "title", label: "Title" },
                            { key: "blockId", label: "Block", render: (m) => blocks.find(b => b.id === m.blockId)?.title || m.blockId },
                            { key: "status", label: "Status", render: (m) => <span className={`px-2 py-0.5 rounded text-xs font-bold ${m.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{m.status}</span> },
                        ]}
                    />
                )}

                {activeTab === "weeks" && (
                    <RenderTable
                        items={weeks}
                        columns={[
                            { key: "weekNumber", label: "Week #" },
                            { key: "title", label: "Title" },
                            { key: "moduleId", label: "Module", render: (w) => modules.find(m => m.id === w.moduleId)?.title || w.moduleId },
                        ]}
                    />
                )}

                {activeTab === "lessons" && (
                    <div className="space-y-6">
                        {/* Module Selector for Lessons */}
                        <div className="bg-white p-4 rounded-xl border border-border flex items-center gap-4">
                            <label className="font-medium text-sm text-gray-700">Select Module:</label>
                            <select
                                value={selectedModuleForLessons}
                                onChange={(e) => setSelectedModuleForLessons(e.target.value)}
                                className="flex-1 max-w-md px-3 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="">Select a module to view lessons...</option>
                                {modules.map(m => (
                                    <option key={m.id} value={m.id}>{m.title}</option>
                                ))}
                            </select>
                        </div>

                        {selectedModuleForLessons ? (
                            <RenderTable
                                items={lessons}
                                columns={[
                                    { key: "order", label: "#" },
                                    { key: "number", label: "Code" },
                                    { key: "title", label: "Title" },
                                    { key: "duration", label: "Duration" },
                                ]}
                            />
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                Please select a module to manage its lessons.
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* General Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold capitalize">
                                {editingItem ? "Edit" : "Add New"} {activeTab.slice(0, -1)}
                            </h3>
                            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* DYNAMIC FORM FIELDS BASED ON ACTIVE TAB */}

                            {/* Common Fields */}
                            {(activeTab !== "weeks") && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Order</label>
                                    <input
                                        type="number"
                                        value={formData.order || ""}
                                        onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="1"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium mb-1">Title</label>
                                <input
                                    type="text"
                                    value={formData.title || ""}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="Title"
                                />
                            </div>

                            {/* Description (Semesters, Blocks, Modules, Lessons) */}
                            {["semesters", "blocks", "modules", "lessons"].includes(activeTab) && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <textarea
                                        value={formData.description || ""}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="Description..."
                                        rows={3}
                                    />
                                </div>
                            )}

                            {/* Blocks Specific */}
                            {activeTab === "blocks" && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Parent Semester</label>
                                    <select
                                        value={formData.semesterId || ""}
                                        onChange={(e) => setFormData({ ...formData, semesterId: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary/20"
                                    >
                                        <option value="">Select Semester...</option>
                                        {semesters.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                                    </select>
                                </div>
                            )}

                            {/* Modules Specific */}
                            {activeTab === "modules" && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Parent Block</label>
                                        <select
                                            value={formData.blockId || ""}
                                            onChange={(e) => setFormData({ ...formData, blockId: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary/20"
                                        >
                                            <option value="">Select Block...</option>
                                            {blocks.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Status</label>
                                        <select
                                            value={formData.status || "draft"}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary/20"
                                        >
                                            <option value="draft">Draft</option>
                                            <option value="published">Published</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            {/* Weeks Specific */}
                            {activeTab === "weeks" && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Week Number (Global)</label>
                                        <input
                                            type="number"
                                            value={formData.weekNumber || ""}
                                            onChange={(e) => setFormData({ ...formData, weekNumber: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary/20"
                                            placeholder="1"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Parent Module</label>
                                        <select
                                            value={formData.moduleId || ""}
                                            onChange={(e) => setFormData({ ...formData, moduleId: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary/20"
                                        >
                                            <option value="">Select Module...</option>
                                            {modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                                        </select>
                                    </div>
                                </>
                            )}

                            {/* Lessons Specific */}
                            {activeTab === "lessons" && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Lesson Code</label>
                                            <input
                                                type="text"
                                                value={formData.number || ""}
                                                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                                                className="w-full px-4 py-3 rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary/20"
                                                placeholder="B1 L1.1"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Duration</label>
                                            <input
                                                type="text"
                                                value={formData.duration || ""}
                                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                                className="w-full px-4 py-3 rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary/20"
                                                placeholder="20 min"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Vimeo ID</label>
                                        <input
                                            type="text"
                                            value={formData.vimeoId || ""}
                                            onChange={(e) => setFormData({ ...formData, vimeoId: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary/20"
                                            placeholder="12345678"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Parent Week</label>
                                        <select
                                            value={formData.weekId || ""}
                                            onChange={(e) => setFormData({ ...formData, weekId: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary/20"
                                        >
                                            <option value="">Select Week (Optional)...</option>
                                            {/* Ideally filter weeks by selected module */}
                                            {selectedModuleForLessons && weeks.filter(w => w.moduleId === selectedModuleForLessons).map(w => (
                                                <option key={w.id} value={w.id}>{w.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            )}

                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={resetForm}
                                className="flex-1 py-3 rounded-lg border border-border font-medium hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 py-3 rounded-lg bg-brand-gradient text-white font-medium flex items-center justify-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                Save {activeTab.slice(0, -1)}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
