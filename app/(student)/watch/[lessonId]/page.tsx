"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useModules } from "@/lib/hooks/useModules";
import { useLessons } from "@/lib/hooks/useLessons";
import { useUserData } from "@/lib/hooks/useUserData";
import { useAuth } from "@/lib/auth";
import {
    getLesson,
    markLessonComplete,
    markLessonIncomplete,
    Lesson,
    getSubmissionsForModule,
    Submission,
    createSubmission
} from "@/lib/firestore";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uploadHomework } from "@/lib/storage";
import confetti from "canvas-confetti";
import {
    Play,
    CheckCircle,
    FileText,
    Upload,
    ChevronLeft,
    Download,
    Lock,
    List,
    Check,
    Loader2,
    File,
    BookOpen,
    Save,
    AlignJustify,
    X,
    AlertCircle,
    Menu,
    ChevronRight,
    Search
} from "lucide-react";
import SidebarContent from "@/components/layout/SidebarContent";

// Types
type Tab = "INFO" | "HANDOUT" | "HOMEWORK" | "NOTES";

declare global {
    interface Window {
        Vimeo: any;
    }
}

export default function WatchPage() {
    const params = useParams();
    const router = useRouter();
    const lessonId = params.lessonId as string;
    const { user } = useAuth();
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>("INFO");
    const [completed, setCompleted] = useState(false);
    const [videoWatched, setVideoWatched] = useState(false);
    const [videoProgress, setVideoProgress] = useState(0);
    const [marking, setMarking] = useState(false);

    // UX State
    const [showUnmarkConfirm, setShowUnmarkConfirm] = useState(false);

    // Notes State
    const [notes, setNotes] = useState("");
    const [notesLoading, setNotesLoading] = useState(true);
    const [notesSaving, setNotesSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // Submissions State
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);

    // Hooks
    const { modules } = useModules();
    const { lessons: allLessons } = useLessons();
    const { userData, mutate } = useUserData(user?.uid);

    // Derived Data
    const module = lesson ? modules.find(m => m.id === lesson.moduleId) : null;
    const moduleLessons = lesson ? allLessons.filter(l => l.moduleId === lesson.moduleId).sort((a, b) => a.order - b.order) : [];
    const progress = userData?.progress || {};

    // Determine Next Lesson
    const currentLessonIndex = moduleLessons.findIndex(l => l.id === lessonId);
    const nextLesson = currentLessonIndex !== -1 && currentLessonIndex < moduleLessons.length - 1
        ? moduleLessons[currentLessonIndex + 1]
        : null;

    // Fetch Lesson Data
    useEffect(() => {
        async function fetchLesson() {
            if (!lessonId) return;
            try {
                const data = await getLesson(lessonId);
                setLesson(data);
                if (data && progress[data.id]) {
                    setCompleted(true);
                    setVideoWatched(true);
                }
            } catch (err) {
                console.error("Failed to fetch lesson", err);
            }
        }
        fetchLesson();
    }, [lessonId, progress]); // Re-run if progress updates

    // Fetch Notes (Global Workbook)
    useEffect(() => {
        async function fetchNotes() {
            if (!user) return;
            try {
                const docRef = doc(db, "users", user.uid, "data", "workbook");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setNotes(docSnap.data().notes || "");
                    setLastSaved(docSnap.data().updatedAt?.toDate() || null);
                }
            } catch (error) {
                console.error("Error fetching workbook:", error);
            } finally {
                setNotesLoading(false);
            }
        }
        if (activeTab === "NOTES") {
            fetchNotes();
        }
    }, [activeTab, user]);

    // Fetch Submissions (Only if tab is Homework)
    useEffect(() => {
        if (activeTab === "HOMEWORK" && module && user) {
            getSubmissionsForModule(module.id).then(subs => {
                setSubmissions(subs.filter(s => s.userId === user.uid));
            });
        }
    }, [activeTab, module, user]);

    // Vimeo Integration
    useEffect(() => {
        if (!lesson?.vimeoId || !iframeRef.current || typeof window === 'undefined') return;

        // Load Vimeo Script if needed
        if (!window.Vimeo) {
            const script = document.createElement('script');
            script.src = 'https://player.vimeo.com/api/player.js';
            script.async = true;
            script.onload = initPlayer;
            document.body.appendChild(script);
        } else {
            initPlayer();
        }

        function initPlayer() {
            if (!iframeRef.current) return;
            // @ts-ignore
            const player = new window.Vimeo.Player(iframeRef.current);
            player.on('timeupdate', (data: any) => {
                const pct = data.percent * 100;
                setVideoProgress(pct);
                if (pct >= 95) setVideoWatched(true);
            });
            player.on('ended', () => {
                setVideoWatched(true);
                setVideoProgress(100);
            });
        }
    }, [lesson?.vimeoId]);

    // Handlers
    const handleMarkComplete = async () => {
        if (!user || !lesson) return;

        // If already completed, show confirmation to unmark
        if (completed) {
            setShowUnmarkConfirm(true);
            return;
        }

        setMarking(true);
        try {
            await markLessonComplete(user.uid, lesson.id);
            await mutate(); // Revalidate SWR cache to unlock next lesson
            setCompleted(true);
            triggerConfetti();
        } catch (e) {
            console.error(e);
        } finally {
            setMarking(false);
        }
    };

    const handleUnmark = async () => {
        if (!user || !lesson) return;
        setMarking(true);
        try {
            await markLessonIncomplete(user.uid, lesson.id);
            await mutate(); // Revalidate SWR cache
            setCompleted(false);
            setShowUnmarkConfirm(false);
        } catch (e) {
            console.error(e);
        } finally {
            setMarking(false);
        }
    };

    const handleSaveNotes = async () => {
        if (!user) return;
        setNotesSaving(true);
        try {
            await setDoc(doc(db, "users", user.uid, "data", "workbook"), {
                notes,
                updatedAt: new Date(),
            }, { merge: true });
            setLastSaved(new Date());
        } catch (error) {
            console.error("Error saving workbook:", error);
        } finally {
            setNotesSaving(false);
        }
    };

    const triggerConfetti = () => {
        const duration = 2000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);
            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: Math.random(), y: Math.random() - 0.2 } });
        }, 250);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user || !module) return;

        if (file.size > 10 * 1024 * 1024) return alert("Bestand te groot (max 10MB)");
        if (file.type !== "application/pdf") return alert("Alleen PDF toegestaan");

        setUploading(true);
        try {
            const url = await uploadHomework(file, user.uid, module.id);
            await createSubmission({
                moduleId: module.id,
                userId: user.uid,
                userEmail: user.email || "",
                fileName: file.name,
                fileUrl: url,
                status: "pending"
            });

            // Notify API
            fetch("/api/notify-homework", {
                method: "POST",
                body: JSON.stringify({
                    studentEmail: user.email,
                    moduleTitle: module.title,
                    fileName: file.name,
                    submittedAt: new Date().toISOString()
                })
            }).catch(console.warn);

            const updated = await getSubmissionsForModule(module.id);
            setSubmissions(updated.filter(s => s.userId === user.uid));
            setUploadSuccess(true);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (err) {
            alert("Upload failed");
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    if (!lesson) return <div className="h-screen flex items-center justify-center bg-black"><Loader2 className="animate-spin text-primary" /></div>;

    // Check if locked
    const lessonIndex = moduleLessons.findIndex(l => l.id === lesson.id);
    const isLocked = lessonIndex > 0 && !progress[moduleLessons[lessonIndex - 1].id];

    if (isLocked) {
        return (
            <div className="h-screen w-full bg-zinc-950 flex flex-col items-center justify-center text-center p-6">
                <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6 border border-zinc-800">
                    <Lock className="w-8 h-8 text-zinc-500" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Les Vergrendeld</h1>
                <p className="text-zinc-400 max-w-md mb-8">
                    Je moet de voorgaande les (<i>{moduleLessons[lessonIndex - 1].title}</i>) afronden voordat je deze les kunt bekijken.
                </p>
                <div className="flex gap-4">
                    <Link
                        href={`/watch/${moduleLessons[lessonIndex - 1].id}`}
                        className="px-6 py-3 bg-brand-gradient text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
                    >
                        Ga naar vorige les
                    </Link>
                    <Link
                        href={`/module/${lesson.moduleId}`}
                        className="px-6 py-3 bg-zinc-800 text-white font-bold rounded-xl hover:bg-zinc-700 transition-colors"
                    >
                        Terug naar Module
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full bg-black flex flex-col overflow-hidden relative">

            {/* UNMARK CONFIRMATION DIALOG */}
            {showUnmarkConfirm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-4 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-white">Les Onvoltooien?</h3>
                                <p className="text-zinc-400 text-sm">Weet je zeker dat je de les wilt onvoltooien?</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowUnmarkConfirm(false)}
                                className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition-colors"
                            >
                                Nee, annuleren
                            </button>
                            <button
                                onClick={handleUnmark}
                                className="flex-1 py-2 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 font-bold transition-colors"
                            >
                                Ja, onvoltooien
                            </button>
                        </div>
                    </div>
                </div>
            )}



            {/* HEADER (Minimal) */}
            <div className="fixed top-0 left-0 right-0 h-16 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-4 z-30">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/module/${lesson.moduleId}`}
                        className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition-colors flex items-center gap-2 group"
                    >
                        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-bold hidden md:inline">Terug</span>
                    </Link>
                    <div>
                        <h1 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">{module?.title}</h1>
                        <h2 className="text-white font-medium text-lg truncate max-w-[300px] md:max-w-md">{lesson.title}</h2>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Mark Complete Button (Header Version) */}
                    <button
                        onClick={handleMarkComplete}
                        disabled={marking || (!completed && !videoWatched)}
                        className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${completed
                            ? "bg-green-500/10 text-green-500 border border-green-500/20"
                            : !videoWatched
                                ? "bg-zinc-800 text-zinc-600"
                                : "bg-primary text-black hover:bg-primary/90"
                            }`}
                    >
                        {completed ? <Check className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        {completed ? "Voltooid" : "Voltooien"}
                    </button>

                    {/* Next Lesson Button */}
                    {nextLesson && (
                        <Link
                            href={`/watch/${nextLesson.id}`}
                            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                        >
                            <span className="hidden md:inline text-sm">Volgende</span>
                            <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800 hover:border-zinc-700">
                                <ChevronRight className="w-4 h-4" />
                            </div>
                        </Link>
                    )}
                </div>
            </div>

            {/* MAIN CONTENT SPLIT */}
            <div className="flex-1 flex flex-col md:flex-row mt-16 w-full overflow-hidden">

                {/* VIDEO AREA (Left / Top) */}
                <div className="w-full md:w-[65%] lg:w-[70%] bg-black flex items-center justify-center relative border-r border-zinc-900">
                    {lesson.vimeoId ? (
                        <iframe
                            ref={iframeRef}
                            src={`https://player.vimeo.com/video/${lesson.vimeoId}?color=00F0FF&title=0&byline=0&portrait=0`}
                            className="w-full aspect-video md:h-full md:w-full"
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                        />
                    ) : (
                        <div className="text-zinc-600 flex flex-col items-center">
                            <Play className="w-12 h-12 mb-4 opacity-20" />
                            <p>Video niet beschikbaar</p>
                        </div>
                    )}
                </div>

                {/* WORKSPACE AREA (Right / Bottom) */}
                <div className="w-full md:w-[35%] lg:w-[30%] bg-zinc-950 flex flex-col h-[50vh] md:h-full border-l border-zinc-900">

                    {/* TABS */}
                    <div className="flex items-center border-b border-zinc-900 bg-zinc-950">
                        {[
                            { id: "INFO", label: "Info", icon: FileText },
                            { id: "HANDOUT", label: "Handout", icon: Download },
                            { id: "NOTES", label: "Notities", icon: BookOpen },
                            { id: "HOMEWORK", label: "Huiswerk", icon: Upload },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as Tab)}
                                className={`flex-1 flex flex-col items-center justify-center gap-1 py-4 text-[10px] font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === tab.id
                                    ? "border-primary text-primary bg-zinc-900"
                                    : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
                                    }`}
                            >
                                <tab.icon className="w-5 h-5 mb-1" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* CONTENT AREA */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6">

                        {activeTab === "INFO" && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div>
                                    <h2 className="text-xl font-bold text-white mb-2">{lesson.title}</h2>
                                    <p className="text-zinc-400 text-sm leading-relaxed">{module?.description || "No description available."}</p>
                                </div>
                                <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-900">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-zinc-500">Video Voortgang</span>
                                        <span className="text-primary font-mono">{Math.round(videoProgress)}%</span>
                                    </div>
                                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-brand-gradient transition-all duration-300" style={{ width: `${videoProgress}%` }} />
                                    </div>
                                </div>
                                {/* Mobile Mark Complete Button (Visible only on small screens) */}
                                <button
                                    onClick={handleMarkComplete}
                                    disabled={marking || (!completed && !videoWatched)}
                                    className={`w-full md:hidden flex items-center justify-center gap-2 px-4 py-4 rounded-xl font-bold text-sm transition-all ${completed
                                        ? "bg-green-500/10 text-green-500 border border-green-500/20"
                                        : !videoWatched
                                            ? "bg-zinc-800 text-zinc-600"
                                            : "bg-primary text-black hover:bg-primary/90"
                                        }`}
                                >
                                    {completed ? <Check className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                                    {completed ? "Voltooid" : "Markeer als Voltooid"}
                                </button>
                            </div>
                        )}

                        {activeTab === "HANDOUT" && (
                            <div className="h-full flex flex-col animate-in fade-in duration-300">
                                {lesson.handoutPdfUrl ? (
                                    <iframe src={`${lesson.handoutPdfUrl}#toolbar=0`} className="w-full h-full rounded-xl border border-zinc-800 bg-white" />
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-600">
                                        <FileText className="w-10 h-10 mb-3 opacity-20" />
                                        <p className="text-sm">Geen handout beschikbaar.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "NOTES" && (
                            <div className="h-full flex flex-col animate-in fade-in duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-white font-bold text-sm">Mijn Notities</h3>
                                    <button
                                        onClick={handleSaveNotes}
                                        disabled={notesSaving}
                                        className="text-primary text-xs font-bold hover:underline disabled:opacity-50"
                                    >
                                        {notesSaving ? "Opslaan..." : "Opslaan"}
                                    </button>
                                </div>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="flex-1 w-full p-4 bg-zinc-900 rounded-xl border border-zinc-800 focus:border-primary focus:outline-none text-zinc-300 leading-relaxed resize-none text-sm font-serif"
                                    placeholder="Typ hier je notities..."
                                />
                                <div className="mt-2 text-[10px] text-zinc-600 flex justify-between">
                                    <span>Notities worden gesynchroniseerd met je Werkboek</span>
                                    {lastSaved && <span>Opgeslagen: {lastSaved.toLocaleTimeString()}</span>}
                                </div>
                            </div>
                        )}

                        {activeTab === "HOMEWORK" && (
                            <div className="animate-in fade-in duration-300 space-y-6">
                                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
                                    <Upload className="w-8 h-8 text-primary mx-auto mb-3" />
                                    <h3 className="text-white font-bold mb-1">Huiswerk Inleveren</h3>
                                    <p className="text-xs text-zinc-500 mb-4 max-w-[200px] mx-auto">Upload PDF voor {module?.title}</p>

                                    <label className={`block w-full py-3 border border-dashed border-zinc-700 rounded-lg cursor-pointer hover:border-primary/50 hover:bg-zinc-800 transition-all ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
                                        <span className="text-xs font-bold text-zinc-400">
                                            {uploading ? "Uploaden..." : "Selecteer PDF Bestand"}
                                        </span>
                                        <input
                                            type="file"
                                            accept="application/pdf"
                                            className="hidden"
                                            onChange={handleFileUpload}
                                            disabled={uploading}
                                            ref={fileInputRef}
                                        />
                                    </label>
                                    {uploadSuccess && <p className="text-green-500 text-xs mt-2 font-bold">Succesvol geüpload!</p>}
                                </div>

                                <div>
                                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Geschiedenis</h4>
                                    <div className="space-y-2">
                                        {submissions.length === 0 ? (
                                            <p className="text-zinc-600 text-xs italic text-center">Nog geen inzendingen.</p>
                                        ) : (
                                            submissions.map(sub => (
                                                <div key={sub.id} className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg flex items-center justify-between">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <File className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                                                        <div className="min-w-0">
                                                            <p className="text-zinc-300 text-xs truncate max-w-[120px]">{sub.fileName}</p>
                                                            <p className="text-[10px] text-zinc-600">{new Date(sub.submittedAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${sub.grade === "pass" ? "bg-green-500/10 text-green-500" :
                                                        sub.grade === "fail" ? "bg-red-500/10 text-red-500" :
                                                            "bg-orange-500/10 text-orange-500"
                                                        }`}>
                                                        {sub.grade === "pass" ? "GESLAAGD" : sub.grade === "fail" ? "NIET GESLAAGD" : "IN BEHANDELING"}
                                                    </span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
