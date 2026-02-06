"use client";

import { useState } from "react";
import { useSemesters } from "@/lib/hooks/useSemesters";
import { useBlocks } from "@/lib/hooks/useBlocks";
import { useModules } from "@/lib/hooks/useModules";
import { useAuth } from "@/lib/auth";
import {
    GraduationCap,
    Mic2,
    Lightbulb,
    ChevronRight,
    ArrowLeft,
    Layers,
    Box,
    PlayCircle,
    Flashlight
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type CurriculumView = "SEMESTERS" | "BLOCKS" | "MODULES";

export default function CurriculumPage() {
    const router = useRouter();
    const { user } = useAuth();

    // Data Hooks
    const { semesters, loading: semestersLoading } = useSemesters();
    const { blocks, loading: blocksLoading } = useBlocks();
    const { modules, isLoading: modulesLoading } = useModules();

    // View State
    const [view, setView] = useState<CurriculumView>("SEMESTERS");
    const [selectedSemesterId, setSelectedSemesterId] = useState<string | null>(null);
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

    // Filtered Data
    const currentSemester = semesters.find(s => s.id === selectedSemesterId);
    const semesterBlocks = blocks.filter(b => b.semesterId === selectedSemesterId).sort((a, b) => a.order - b.order);

    const currentBlock = blocks.find(b => b.id === selectedBlockId);
    const blockModules = modules.filter(m => m.blockId === selectedBlockId).sort((a, b) => a.order - b.order);

    const loading = semestersLoading || blocksLoading || modulesLoading;

    // Navigation Handlers
    const handleSemesterClick = (semesterId: string) => {
        setSelectedSemesterId(semesterId);
        setView("BLOCKS");
    };

    const handleBlockClick = (blockId: string) => {
        setSelectedBlockId(blockId);
        setView("MODULES");
    };

    const handleBack = () => {
        if (view === "MODULES") {
            setView("BLOCKS");
            setSelectedBlockId(null);
        } else if (view === "BLOCKS") {
            setView("SEMESTERS");
            setSelectedSemesterId(null);
        }
    };

    const getIcon = (type: string, title: string) => {
        const t = title.toLowerCase();
        if (type === "semester") {
            if (t.includes("audio") || t.includes("sound") || t.includes("geluid")) return <Mic2 className="w-8 h-8" />;
            if (t.includes("light") || t.includes("licht")) return <Flashlight className="w-8 h-8" />;
            return <GraduationCap className="w-8 h-8" />;
        }
        if (type === "block") return <Layers className="w-6 h-6" />;
        return <Box className="w-6 h-6" />;
    };

    // --- VIEW COMPONENTS ---

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50">
            <div className="max-w-7xl mx-auto px-6 py-8">

                {/* Header & Breadcrumbs */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
                        <ChevronRight className="w-4 h-4" />
                        <button
                            onClick={() => { setView("SEMESTERS"); setSelectedSemesterId(null); setSelectedBlockId(null); }}
                            className={`hover:text-primary transition-colors ${view === "SEMESTERS" ? "font-medium text-foreground" : ""}`}
                        >
                            Curriculum
                        </button>
                        {currentSemester && (
                            <>
                                <ChevronRight className="w-4 h-4" />
                                <button
                                    onClick={() => { setView("BLOCKS"); setSelectedBlockId(null); }}
                                    className={`hover:text-primary transition-colors ${view === "BLOCKS" ? "font-medium text-foreground" : ""}`}
                                >
                                    {currentSemester.title}
                                </button>
                            </>
                        )}
                        {currentBlock && (
                            <>
                                <ChevronRight className="w-4 h-4" />
                                <span className="font-medium text-foreground">{currentBlock.title}</span>
                            </>
                        )}
                    </div>

                    {view !== "SEMESTERS" && (
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-4 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Terug
                        </button>
                    )}

                    <h1 className="text-3xl font-bold text-gray-900">
                        {view === "SEMESTERS" && "Mijn Curriculum"}
                        {view === "BLOCKS" && currentSemester?.title}
                        {view === "MODULES" && currentBlock?.title}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {view === "SEMESTERS" && "Selecteer een semester om te starten"}
                        {view === "BLOCKS" && currentSemester?.description}
                        {view === "MODULES" && currentBlock?.description}
                    </p>
                </div>

                {/* --- SEMESTERS VIEW --- */}
                {view === "SEMESTERS" && (
                    <div className="grid md:grid-cols-2 gap-6">
                        {semesters.map((semester) => (
                            <button
                                key={semester.id}
                                onClick={() => handleSemesterClick(semester.id)}
                                className="group relative overflow-hidden bg-[#050A30] p-8 rounded-2xl border border-[#00F0FF]/20 hover:border-[#00F0FF]/50 hover:shadow-[0_0_20px_rgba(0,240,255,0.15)] transition-all text-left"
                            >
                                {/* Neon Glow Effect Overlay */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent opacity-30 group-hover:opacity-60 transition-opacity"></div>

                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity text-white">
                                    {getIcon("semester", semester.title)}
                                </div>
                                <div className="flex items-start gap-6">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform ${semester.title.toLowerCase().includes("audio")
                                        ? "bg-gradient-to-br from-purple-500 to-indigo-600 text-white"
                                        : "bg-gradient-to-br from-cyan-400 to-blue-500 text-white"
                                        }`}>
                                        {getIcon("semester", semester.title)}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-[#00F0FF] transition-colors">
                                            {semester.title}
                                        </h3>
                                        <p className="text-gray-400 mb-6 line-clamp-2">
                                            {semester.description}
                                        </p>
                                        <div className="flex items-center text-sm font-medium text-[#00F0FF]">
                                            Bekijk Blokken <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* --- BLOCKS VIEW --- */}
                {view === "BLOCKS" && (
                    <div className="grid md:grid-cols-3 gap-6">
                        {semesterBlocks.map((block) => (
                            <button
                                key={block.id}
                                onClick={() => handleBlockClick(block.id)}
                                className="group bg-[#050A30] p-6 rounded-xl border border-[#00F0FF]/20 hover:border-[#00F0FF]/50 hover:shadow-[0_0_15px_rgba(0,240,255,0.15)] transition-all text-left"
                            >
                                <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-white mb-4 group-hover:bg-[#00F0FF]/20 group-hover:text-[#00F0FF] transition-colors">
                                    <Layers className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#00F0FF] transition-colors">
                                    {block.title}
                                </h3>
                                <p className="text-sm text-gray-400 mb-4">
                                    {block.description}
                                </p>
                                <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#00F0FF] w-0 group-hover:w-full transition-all duration-1000 shadow-[0_0_10px_#00F0FF]" />
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* --- MODULES VIEW --- */}
                {view === "MODULES" && (
                    <div className="grid gap-4">
                        {blockModules.map((module) => (
                            <Link
                                key={module.id}
                                href={`/module/${module.id}`}
                                className="group flex items-center gap-6 bg-[#050A30] p-5 rounded-xl border border-[#00F0FF]/20 hover:border-[#00F0FF]/50 hover:shadow-[0_0_15px_rgba(0,240,255,0.15)] transition-all"
                            >
                                <div className="w-14 h-14 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform shrink-0 group-hover:border-[#00F0FF]/50">
                                    <span className="font-bold text-lg">{module.order}</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-white group-hover:text-[#00F0FF] transition-colors">
                                        {module.title}
                                    </h3>
                                    <p className="text-sm text-gray-400 line-clamp-1">
                                        {module.description}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 text-sm font-medium text-[#00F0FF] opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">
                                    Start Module <PlayCircle className="w-4 h-4" />
                                </div>
                            </Link>
                        ))}
                        {blockModules.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                                Geen modules gevonden in dit blok.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
