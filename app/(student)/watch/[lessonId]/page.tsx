"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useModules } from "@/lib/hooks/useModules";
import { useUserData } from "@/lib/hooks/useUserData";
import { markLessonComplete, Lesson, Module, getLesson } from "@/lib/firestore";
import { useAuth } from "@/lib/auth";
import { ArrowLeft, Check, FileText, Download, ExternalLink, Lock } from "lucide-react";
import confetti from "canvas-confetti";

// Declare Vimeo Player API types
declare global {
    interface Window {
        Vimeo: any;
    }
}

export default function WatchPage() {
    const params = useParams();
    const lessonId = params.lessonId as string;
    const { user } = useAuth();
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [lessonLoading, setLessonLoading] = useState(true);
    const [marking, setMarking] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [videoWatched, setVideoWatched] = useState(false);
    const [videoProgress, setVideoProgress] = useState(0);

    // Fetch lesson details (Still a hit, but we can cache it)
    useEffect(() => {
        async function fetchLessonData() {
            try {
                const data = await getLesson(lessonId);
                setLesson(data);
            } catch (err) {
                console.error("Fetch lesson error:", err);
            } finally {
                setLessonLoading(false);
            }
        }
        fetchLessonData();
    }, [lessonId]);

    // Use shared hooks for module and user data
    const { modules, isLoading: modulesLoading } = useModules();
    const { progress, isLoading: userLoading } = useUserData(user?.uid);

    const module = lesson ? modules.find(m => m.id === lesson.moduleId) : null;
    const loading = lessonLoading || modulesLoading || userLoading;

    // Local completion state from progress
    useEffect(() => {
        if (lesson && progress[lesson.id]) {
            setCompleted(true);
            setVideoWatched(true); // If already completed, allow re-completion
        }
    }, [lesson, progress]);

    // Vimeo Player API integration
    useEffect(() => {
        if (!lesson?.vimeoId || !iframeRef.current) return;

        const iframe = iframeRef.current;
        // @ts-ignore - Vimeo Player API
        const player = new window.Vimeo.Player(iframe);

        // Track video progress
        player.on('timeupdate', (data: any) => {
            const percentComplete = (data.percent * 100);
            setVideoProgress(percentComplete);

            // Unlock button when 95% watched
            if (percentComplete >= 95 && !videoWatched) {
                setVideoWatched(true);
            }
        });

        player.on('ended', () => {
            setVideoWatched(true);
            setVideoProgress(100);
        });

        return () => {
            player.off('timeupdate');
            player.off('ended');
        };
    }, [lesson, videoWatched]);

    // Load Vimeo Player API script
    useEffect(() => {
        if (typeof window !== 'undefined' && !window.Vimeo) {
            const script = document.createElement('script');
            script.src = 'https://player.vimeo.com/api/player.js';
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    const handleMarkComplete = async () => {
        if (!user || !lesson || !videoWatched) return;
        setMarking(true);
        try {
            await markLessonComplete(user.uid, lesson.id);
            setCompleted(true);

            // Trigger celebration animation
            const duration = 3000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

            function randomInRange(min: number, max: number) {
                return Math.random() * (max - min) + min;
            }

            const interval: any = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);

                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
                });
                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
                });
            }, 250);

        } catch (error) {
            console.error("Failed to mark complete:", error);
        } finally {
            setMarking(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!lesson) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center">
                <h1 className="text-2xl font-bold mb-4">Lesson Not Found</h1>
                <Link href="/dashboard" className="text-primary hover:underline">
                    Return to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
            {/* LEFT: Video + Info */}
            <div className="flex-1 flex flex-col">
                {/* Top Bar */}
                <header className="bg-white border-b border-border px-6 py-4 flex items-center justify-between">
                    <Link
                        href={module ? `/module/${module.id}` : "/dashboard"}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">
                            {module?.title || "Back"}
                        </span>
                    </Link>
                </header>

                {/* Video Player */}
                <div className="bg-black aspect-video w-full relative">
                    {lesson.vimeoId ? (
                        <iframe
                            ref={iframeRef}
                            src={`https://player.vimeo.com/video/${lesson.vimeoId}?color=00FFFF&title=0&byline=0&portrait=0`}
                            className="absolute inset-0 w-full h-full"
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-white/50">
                            <p>No video configured. Add Vimeo ID in Admin.</p>
                        </div>
                    )}
                </div>

                {/* Lesson Info */}
                <div className="bg-white p-6 border-b border-border">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold mb-1">
                                <span className="text-primary mr-2">{lesson.number}</span>
                                {lesson.title}
                            </h1>
                            <p className="text-muted-foreground">
                                {module?.title} • {lesson.duration || "—"}
                            </p>
                        </div>
                        <div className="relative group">
                            <button
                                onClick={handleMarkComplete}
                                disabled={marking || completed || !videoWatched}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${completed
                                    ? "bg-green-100 text-green-700"
                                    : !videoWatched
                                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                        : "bg-brand-gradient text-white shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95"
                                    }`}
                            >
                                {!videoWatched && !completed ? <Lock className="w-5 h-5" /> : <Check className="w-5 h-5" />}
                                {completed ? "Voltooid!" : marking ? "Opslaan..." : "Voltooien"}
                            </button>
                            {!videoWatched && !completed && (
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap">
                                        Bekijk eerst de video volledig ({Math.round(videoProgress)}%)
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile: Show PDF link */}
                <div className="p-6 lg:hidden">
                    {lesson.handoutPdfUrl ? (
                        <a
                            href={lesson.handoutPdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-4 bg-white border border-border rounded-xl font-medium text-primary hover:bg-primary/5"
                        >
                            <FileText className="w-5 h-5" />
                            Bekijk Handout PDF
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    ) : (
                        <p className="text-center text-muted-foreground">
                            Geen handout beschikbaar.
                        </p>
                    )}
                </div>
            </div>

            {/* RIGHT: PDF Viewer Panel (Desktop Only) */}
            <div className="hidden lg:flex lg:w-[350px] xl:w-[450px] bg-white border-l border-border flex-col transition-all duration-300">
                <div className="p-4 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-secondary" />
                        <h3 className="font-bold text-sm tracking-wider uppercase">
                            Handout
                        </h3>
                    </div>
                    {lesson.handoutPdfUrl && (
                        <a
                            href={lesson.handoutPdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                            <Download className="w-4 h-4" />
                            Download
                        </a>
                    )}
                </div>

                <div className="flex-1 overflow-hidden bg-gray-50/50">
                    {lesson.handoutPdfUrl ? (
                        <iframe
                            src={`${lesson.handoutPdfUrl}#toolbar=0`}
                            className="w-full h-full border-0"
                            title="Lesson Handout PDF"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                            <FileText className="w-12 h-12 text-gray-200 mb-4" />
                            <p className="text-muted-foreground">
                                Geen handout beschikbaar.
                            </p>
                        </div>
                    )}
                </div>

                {/* Resources */}
                {lesson.resources && lesson.resources.length > 0 && (
                    <div className="p-4 border-t border-border bg-white">
                        <h4 className="text-xs font-bold text-muted-foreground uppercase mb-3">
                            Extra Downloads
                        </h4>
                        <div className="space-y-2">
                            {lesson.resources.map((resource, i) => (
                                <a
                                    key={i}
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                                >
                                    <Download className="w-4 h-4" />
                                    {resource.name}
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
