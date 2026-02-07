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
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto px-6 py-8">

                {/* Header & Breadcrumbs */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-sm text-white/60 mb-4">
                        <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
                        <ChevronRight className="w-4 h-4" />
                        <button
                            onClick={() => { setView("SEMESTERS"); setSelectedSemesterId(null); setSelectedBlockId(null); }}
                            className={`hover:text-primary transition-colors ${view === "SEMESTERS" ? "font-medium text-white" : ""}`}
                        >
                            Curriculum
                        </button>
                        {currentSemester && (
                            <>
                                <ChevronRight className="w-4 h-4" />
                                <button
                                    onClick={() => { setView("BLOCKS"); setSelectedBlockId(null); }}
                                    className={`hover:text-primary transition-colors ${view === "BLOCKS" ? "font-medium text-white" : ""}`}
                                >
                                    {currentSemester.title}
                                </button>
                            </>
                        )}
                        {currentBlock && (
                            <>
                                <ChevronRight className="w-4 h-4" />
                                <span className="font-medium text-white">{currentBlock.title}</span>
                            </>
                        )}
                    </div>

                    {view !== "SEMESTERS" && (
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 text-sm font-medium text-white/60 hover:text-white mb-4 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Terug
                        </button>
                    )}

                    <h1 className="text-3xl font-bold text-white">
                        {view === "SEMESTERS" && "Mijn Curriculum"}
                        {view === "BLOCKS" && currentSemester?.title}
                        {view === "MODULES" && currentBlock?.title}
                    </h1>
                    <p className="text-white/60 mt-1">
                        {view === "SEMESTERS" && "Selecteer een semester om te starten"}
                        {view === "BLOCKS" && currentSemester?.description}
                        {view === "MODULES" && currentBlock?.description}
                    </p>
                </div>

                {/* --- SEMESTERS VIEW --- */}
                {view === "SEMESTERS" && (
                    <div className="grid md:grid-cols-2 gap-8">
                        {semesters.map((semester) => {
                            const isGeluid = semester.title?.toLowerCase().includes('geluid');
                            const isLicht = semester.title?.toLowerCase().includes('licht');
                            const bgImage = isGeluid
                                ? '/semester-geluid-bg.png'
                                : isLicht
                                    ? '/semester-licht-bg.png'
                                    : '';
                            const overlayClass = isGeluid
                                ? 'bg-gradient-to-r from-[#0a1628]/90 via-[#122a4d]/70 to-[#0d1f3c]/50'
                                : isLicht
                                    ? 'bg-gradient-to-r from-[#8b1a1a]/90 via-[#c41e3a]/70 to-transparent'
                                    : 'bg-gradient-to-br from-[#130f40] via-[#2a0845] to-[#0f0c29]';

                            return (
                                <button
                                    key={semester.id}
                                    onClick={() => handleSemesterClick(semester.id)}
                                    className="group relative overflow-hidden p-8 rounded-3xl border border-white/10 hover:border-primary/50 transition-all duration-500 text-left shadow-2xl hover:shadow-[0_0_40px_-5px_rgba(188,19,254,0.4)]"
                                    style={{
                                        backgroundImage: bgImage ? `url('${bgImage}')` : undefined,
                                        backgroundSize: 'cover',
                                        backgroundPosition: isLicht ? 'right center' : 'center',
                                    }}
                                >
                                    {/* Dark Overlay for text readability */}
                                    <div className={`absolute inset-0 ${overlayClass}`} />
                                    {/* Background Gradient Mesh */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    {/* Top Decoration */}
                                    <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity duration-500 scale-150 group-hover:scale-125 transform origin-top-right">
                                        {getIcon("semester", semester.title)}
                                    </div>

                                    <div className="relative z-10 flex flex-col h-full">
                                        <div className="flex items-start justify-between mb-8">
                                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500 ${semester.title.toLowerCase().includes("audio")
                                                ? "bg-gradient-to-br from-[#BC13FE] to-[#8a00c2] text-white shadow-[#BC13FE]/30"
                                                : "bg-gradient-to-br from-primary to-[#00a8b3] text-black shadow-primary/30"
                                                }`}>
                                                {getIcon("semester", semester.title)}
                                            </div>
                                            <div className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold uppercase tracking-widest text-zinc-400 group-hover:text-white group-hover:border-white/30 transition-colors">
                                                Semester {semester.order}
                                            </div>
                                        </div>

                                        <h3 className="text-3xl font-black text-white mb-3 uppercase tracking-tight group-hover:text-primary transition-colors">
                                            {semester.title}
                                        </h3>
                                        <p className="text-zinc-400 mb-8 line-clamp-2 text-sm leading-relaxed font-medium">
                                            {semester.description}
                                        </p>

                                        <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-6">
                                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider group-hover:text-white transition-colors">
                                                Start Modules
                                            </span>
                                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all duration-300 group-hover:rotate-[-45deg]">
                                                <ChevronRight className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* --- BLOCKS VIEW --- */}
                {view === "BLOCKS" && (
                    <div className="grid md:grid-cols-3 gap-6">
                        {semesterBlocks.map((block) => (
                            <button
                                key={block.id}
                                onClick={() => handleBlockClick(block.id)}
                                className="group relative bg-gradient-to-br from-[#130f40] via-[#2a0845] to-[#0f0c29] p-6 rounded-2xl border border-white/10 hover:border-primary/50 transition-all duration-300 text-left hover:shadow-[0_0_30px_-10px_rgba(188,19,254,0.4)] overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-1 h-full bg-primary/0 group-hover:bg-primary transition-all duration-300" />

                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                                        <Layers className="w-6 h-6" />
                                    </div>
                                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest border border-white/5 px-2 py-1 rounded bg-black">
                                        Blok {block.order}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
                                    {block.title}
                                </h3>
                                <p className="text-sm text-zinc-400 mb-6 font-medium leading-relaxed">
                                    {block.description}
                                </p>

                                <div className="flex items-center justify-between text-xs font-bold text-zinc-500 uppercase tracking-wider group-hover:text-white transition-colors">
                                    <span>Bekijk Modules</span>
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-primary" />
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
                                className="group flex items-center gap-6 bg-gradient-to-br from-[#130f40] via-[#2a0845] to-[#0f0c29] p-5 rounded-xl border border-white/10 hover:border-primary/50 hover:shadow-[0_0_20px_-5px_rgba(188,19,254,0.3)] transition-all"
                            >
                                <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform shrink-0 border border-white/10 group-hover:bg-primary group-hover:text-black">
                                    <span className="font-bold text-lg">{module.order}</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                                        {module.title}
                                    </h3>
                                    <p className="text-sm text-zinc-400 line-clamp-1 group-hover:text-zinc-300">
                                        {module.description}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">
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
