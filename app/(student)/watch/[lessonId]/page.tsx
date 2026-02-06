"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useModules } from "@/lib/hooks/useModules";
import { useWeeks } from "@/lib/hooks/useWeeks";
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
    MessageSquare,
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
    AlertCircle
} from "lucide-react";

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
    const [playlistOpen, setPlaylistOpen] = useState(true);
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
    const { userData } = useUserData(user?.uid);

    // Derived Data
    const module = lesson ? modules.find(m => m.id === lesson.moduleId) : null;
    const moduleLessons = lesson ? allLessons.filter(l => l.moduleId === lesson.moduleId).sort((a, b) => a.order - b.order) : [];
    const progress = userData?.progress || {};

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

        if (file.size > 10 * 1024 * 1024) return alert("File too large (max 10MB)");
        if (file.type !== "application/pdf") return alert("Only PDF allowed");

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

    if (!lesson) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-black text-white flex flex-col-reverse lg:flex-row overflow-hidden relative">

            {/* UNMARK CONFIRMATION DIALOG */}
            {showUnmarkConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-4 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Les Onvoltooien?</h3>
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

            {/* LEFT SIDEBAR - PLAYLIST (COLLAPSIBLE) */}
            <aside
                className={`bg-zinc-900 border-r border-zinc-800 flex flex-col h-auto min-h-[300px] lg:h-screen overflow-hidden shrink-0 transition-all duration-300 ease-in-out ${playlistOpen ? "w-full lg:w-80" : "w-0 lg:w-0 border-none"
                    }`}
            >
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                    <div>
                        <Link href="/curriculum" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-4 text-sm">
                            <ChevronLeft className="w-4 h-4" /> Back to Curriculum
                        </Link>
                        <h2 className="font-bold text-lg text-white mb-1 line-clamp-1 truncate w-48">{module?.title}</h2>
                        <p className="text-xs text-zinc-500">{moduleLessons.length} lessons</p>
                    </div>
                    {/* Close button for sidebar */}
                    <button
                        onClick={() => setPlaylistOpen(false)}
                        className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white lg:hidden"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar h-[300px] lg:h-auto whitespace-nowrap">
                    {moduleLessons.map((l) => {
                        const isCurrent = l.id === lesson.id;
                        const isDone = progress[l.id];
                        return (
                            <Link
                                key={l.id}
                                href={`/watch/${l.id}`}
                                className={`flex items-start gap-3 p-4 border-b border-zinc-800/50 hover:bg-zinc-800 transition-colors ${isCurrent ? "bg-zinc-800/80 border-l-2 border-l-primary" : ""}`}
                            >
                                <div className="mt-0.5">
                                    {isCurrent ? (
                                        <Play className="w-4 h-4 text-primary fill-primary" />
                                    ) : isDone ? (
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <div className="w-4 h-4 rounded-full border border-zinc-600" />
                                    )}
                                </div>
                                <div className="overflow-hidden">
                                    <h4 className={`text-sm font-medium truncate ${isCurrent ? "text-white" : "text-zinc-400"}`}>{l.title}</h4>
                                    <span className="text-xs text-zinc-600">{l.duration}</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </aside>

            {/* TOGGLE SIDEBAR BUTTON (When playlist is closed) */}
            {!playlistOpen && (
                <button
                    onClick={() => setPlaylistOpen(true)}
                    className="absolute top-4 left-4 z-20 p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white hover:border-primary/50 transition-colors shadow-lg"
                    title="Open Playlist"
                >
                    <AlignJustify className="w-5 h-5" />
                </button>
            )}

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-zinc-950">

                {/* VIDEO PLAYER */}
                <div className="w-full aspect-video bg-black relative shrink-0 group">
                    {/* Mobile Sidebar Toggle Overlay Button if closed */}
                    {!playlistOpen && (
                        <button
                            onClick={() => setPlaylistOpen(true)}
                            className="absolute top-4 left-4 z-20 p-2 bg-black/50 backdrop-blur hover:bg-black/80 rounded-lg text-white transition-colors lg:hidden"
                        >
                            <AlignJustify className="w-5 h-5" />
                        </button>
                    )}

                    {lesson.vimeoId ? (
                        <iframe
                            ref={iframeRef}
                            src={`https://player.vimeo.com/video/${lesson.vimeoId}?color=00F0FF&title=0&byline=0&portrait=0`}
                            className="absolute inset-0 w-full h-full"
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-zinc-600">
                            Video unavailable
                        </div>
                    )}
                </div>

                {/* TABS NAVIGATION */}
                <div className="flex items-center border-b border-zinc-800 bg-zinc-900 sticky top-0 z-10 overflow-x-auto no-scrollbar pl-16 lg:pl-0">
                    {/* Desktop Toggle Button */}
                    {!playlistOpen && (
                        <button
                            onClick={() => setPlaylistOpen(true)}
                            className="hidden lg:flex items-center justify-center w-14 h-full border-r border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                        >
                            <AlignJustify className="w-5 h-5" />
                        </button>
                    )}

                    {[
                        { id: "INFO", label: "Overview", icon: FileText },
                        { id: "HANDOUT", label: "Handout", icon: Download },
                        { id: "HOMEWORK", label: "Huiswerk", icon: Upload },
                        { id: "NOTES", label: "Notities", icon: BookOpen },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as Tab)}
                            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                                ? "border-primary text-primary bg-zinc-800/50"
                                : "border-transparent text-zinc-400 hover:text-white hover:bg-zinc-800"
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* TAB CONTENT */}
                <div className="flex-1 p-6 lg:p-10 max-w-4xl mx-auto w-full">

                    {/* INFO TAB */}
                    {activeTab === "INFO" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2">
                                    <span className="text-primary mr-3">{lesson.number}</span>
                                    {lesson.title}
                                </h1>
                                <p className="text-zinc-400 leading-relaxed text-lg">
                                    {module?.description}
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleMarkComplete}
                                    disabled={marking || (!completed && !videoWatched)}
                                    // Enabled if completed (to unmark) OR if videoWatched (to mark)
                                    className={`flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all transform active:scale-95 ${completed ? "bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20"
                                        : !videoWatched ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                                            : "bg-brand-gradient text-white shadow-lg shadow-primary/20 hover:opacity-90"
                                        }`}
                                >
                                    {completed ? <Check className="w-6 h-6" /> : !videoWatched ? <Lock className="w-5 h-5" /> : <CheckCircle className="w-6 h-6" />}
                                    {completed ? "Les Voltooid" : "Markeer als Voltooid"}
                                </button>

                                {!videoWatched && !completed && (
                                    <span className="text-sm text-zinc-500">
                                        Watch video to unlock ({Math.round(videoProgress)}%)
                                    </span>
                                )}
                            </div>

                            {/* Resources ... */}
                            {lesson.resources && lesson.resources.length > 0 && (
                                <div className="pt-8 border-t border-zinc-800">
                                    <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4">Resources</h3>
                                    <div className="flex flex-wrap gap-4">
                                        {lesson.resources.map((r, i) => (
                                            <a key={i} href={r.url} target="_blank" className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-primary/50 hover:text-primary transition-colors">
                                                <Download className="w-4 h-4" />
                                                {r.name}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* HANDOUT TAB */}
                    {activeTab === "HANDOUT" && (
                        <div className="h-[600px] bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                            {lesson.handoutPdfUrl ? (
                                <iframe src={`${lesson.handoutPdfUrl}#toolbar=0`} className="w-full h-full border-0" />
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                                    <FileText className="w-12 h-12 mb-4 opacity-20" />
                                    <p>No handout available for this lesson.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* HOMEWORK TAB */}
                    {activeTab === "HOMEWORK" && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 mb-8">
                                <h3 className="text-xl font-bold text-white mb-2">Submit Homework</h3>
                                <p className="text-zinc-400 mb-6">Upload your work for: <span className="text-primary">{module?.title}</span></p>

                                <label className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${uploading ? "border-zinc-700 bg-zinc-800/50" : "border-zinc-700 hover:border-primary/50 hover:bg-zinc-800"}`}>
                                    {uploading ? (
                                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                    ) : (
                                        <>
                                            <Upload className="w-8 h-8 text-zinc-500 mb-2" />
                                            <span className="text-sm font-medium text-zinc-300">Click to upload PDF</span>
                                            <span className="text-xs text-zinc-500 mt-1">Max 10MB</span>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                        disabled={uploading}
                                        ref={fileInputRef}
                                    />
                                </label>
                                {uploadSuccess && <p className="text-green-500 text-sm mt-4 text-center font-medium">Upload successful!</p>}
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Your Submissions</h4>
                                {submissions.length === 0 ? (
                                    <p className="text-zinc-500 italic">No submissions yet.</p>
                                ) : (
                                    submissions.map(sub => (
                                        <div key={sub.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                                                    <File className="w-5 h-5 text-zinc-400" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">{sub.fileName}</p>
                                                    <p className="text-xs text-zinc-500">{new Date(sub.submittedAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${sub.grade === "pass" ? "bg-green-500/10 text-green-500" :
                                                    sub.grade === "fail" ? "bg-red-500/10 text-red-500" :
                                                        "bg-orange-500/10 text-orange-500"
                                                    }`}>
                                                    {sub.grade === "pass" ? "Passed" : sub.grade === "fail" ? "Failed" : "Pending"}
                                                </span>
                                                <a href={sub.fileUrl} target="_blank" className="p-2 bg-zinc-800 rounded-lg hover:text-primary transition-colors"><Download className="w-4 h-4" /></a>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* NOTES TAB */}
                    {activeTab === "NOTES" && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col items-start gap-4 h-[600px]">
                            <div className="w-full flex items-center justify-between">
                                <Link
                                    href="/workbook"
                                    target="_blank"
                                    className="text-xl font-bold text-white hover:text-primary transition-colors flex items-center gap-2"
                                >
                                    My Notebook <BookOpen className="w-4 h-4" />
                                </Link>
                                <button
                                    onClick={handleSaveNotes}
                                    disabled={notesSaving}
                                    className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-primary hover:text-black font-medium transition-colors disabled:opacity-50"
                                >
                                    {notesSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {notesSaving ? "Savings..." : "Save Notes"}
                                </button>
                            </div>

                            <p className="text-xs text-zinc-500">
                                This is your global notebook. Notes taken here appear in "Mijn Werkboek".
                                {lastSaved && ` Last saved: ${lastSaved.toLocaleTimeString()}`}
                            </p>

                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="flex-1 w-full p-6 resize-none bg-zinc-900 border border-zinc-800 rounded-2xl focus:outline-none focus:border-primary text-zinc-200 leading-relaxed placeholder:text-zinc-700 custom-scrollbar font-sans"
                                placeholder="Type your notes here..."
                            />
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}
