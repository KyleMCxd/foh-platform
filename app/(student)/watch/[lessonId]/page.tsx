"use client";

import { useModules } from "@/lib/hooks/useModules";
import { useUserData } from "@/lib/hooks/useUserData";
import { markLessonComplete, Lesson, Module, getLesson } from "@/lib/firestore";
import { useAuth } from "@/lib/auth";
import { ArrowLeft, Check, FileText, Download, ExternalLink } from "lucide-react";

export default function WatchPage() {
    const params = useParams();
    const lessonId = params.lessonId as string;
    const { user } = useAuth();

    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [lessonLoading, setLessonLoading] = useState(true);
    const [marking, setMarking] = useState(false);
    const [completed, setCompleted] = useState(false);

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
        }
    }, [lesson, progress]);

    const handleMarkComplete = async () => {
        if (!user || !lesson) return;
        setMarking(true);
        try {
            await markLessonComplete(user.uid, lesson.id);
            setCompleted(true);
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
                        <button
                            onClick={handleMarkComplete}
                            disabled={marking || completed}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${completed
                                ? "bg-green-100 text-green-700"
                                : "bg-brand-gradient text-white shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95"
                                }`}
                        >
                            <Check className="w-5 h-5" />
                            {completed ? "Voltooid!" : marking ? "Opslaan..." : "Voltooien"}
                        </button>
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
