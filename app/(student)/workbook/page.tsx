"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getSubmissionsForUser, Submission } from "@/lib/firestore";
import { Save, Loader2, BookOpen, File, Download } from "lucide-react";

export default function WorkbookPage() {
    const { user } = useAuth();
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    const [submissions, setSubmissions] = useState<Submission[]>([]);

    useEffect(() => {
        async function fetchData() {
            if (!user) return;
            setLoading(true);
            try {
                // Fetch Notes
                const docRef = doc(db, "users", user.uid, "data", "workbook");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setNotes(docSnap.data().notes || "");
                    setLastSaved(docSnap.data().updatedAt?.toDate() || null);
                }

                // Fetch Submissions
                const subs = await getSubmissionsForUser(user.uid);
                setSubmissions(subs);
            } catch (error) {
                console.error("Error fetching workbook data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [user]);

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        try {
            await setDoc(doc(db, "users", user.uid, "data", "workbook"), {
                notes,
                updatedAt: new Date(),
            }, { merge: true });
            setLastSaved(new Date());
        } catch (error) {
            console.error("Error saving workbook:", error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f0a1e] p-4 md:p-8 relative overflow-hidden">
            {/* Ambient Background Effects */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-6xl mx-auto space-y-8 relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3 text-white">
                            <BookOpen className="w-8 h-8 text-[#BC13FE]" />
                            Mijn Werkboek
                        </h1>
                        <p className="text-zinc-400 mt-1">
                            Houd hier je voortgang, aantekeningen en huiswerk bij.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* LEFT: NOTES */}
                    <div className="bg-white rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col h-[600px] relative">
                        {/* Flight Case Corner Accents (Subtle) */}
                        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-zinc-300"></div>
                        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-zinc-300"></div>
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-zinc-300"></div>
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-zinc-300"></div>

                        <div className="border-b border-gray-100 bg-gray-50/80 px-4 py-3 flex items-center justify-between backdrop-blur-sm">
                            <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-2">
                                <File className="w-3 h-3" />
                                Notities & Aantekeningen
                            </span>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 text-xs font-bold text-[#BC13FE] hover:text-[#BC13FE]/80 transition-colors disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                {saving ? "Opslaan..." : "Opslaan"}
                            </button>
                        </div>
                        <div className="bg-yellow-50/50 flex items-center justify-between px-4 py-1 border-b border-yellow-100 text-[10px] text-yellow-700">
                            {lastSaved ? `Laatst opgeslagen: ${lastSaved.toLocaleString()}` : "Nog niet opgeslagen"}
                        </div>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="flex-1 w-full p-6 resize-none focus:outline-none text-base leading-relaxed text-zinc-800 placeholder:text-gray-300 font-serif bg-white"
                            placeholder="Typ hier je notities en ideeën..."
                        />
                    </div>

                    {/* RIGHT: HOMEWORK */}
                    <div className="bg-white rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col h-[600px] relative">
                        {/* Flight Case Corner Accents */}
                        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-zinc-300"></div>
                        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-zinc-300"></div>
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-zinc-300"></div>
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-zinc-300"></div>

                        <div className="border-b border-gray-100 bg-gray-50/80 px-4 py-3">
                            <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                                Mijn Huiswerk
                            </span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            {submissions.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                                    <File className="w-12 h-12 mb-2 opacity-20" />
                                    <p className="text-sm">Nog geen huiswerk ingeleverd.</p>
                                </div>
                            ) : (
                                submissions.map((sub) => (
                                    <div key={sub.id} className="flex items-center justify-between p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-gray-50 transition-colors group">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                <File className="w-5 h-5 text-primary" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-sm text-zinc-900 truncate">{sub.fileName}</p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span>{sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : "Onbekende datum"}</span>
                                                    <span>•</span>
                                                    <span className={`font-medium ${sub.grade === "pass" ? "text-green-600" :
                                                        sub.grade === "fail" ? "text-red-600" :
                                                            "text-orange-500"
                                                        }`}>
                                                        {sub.grade === "pass" ? "Geslaagd" :
                                                            sub.grade === "fail" ? "Niet geslaagd" :
                                                                "In behandeling"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <a
                                            href={sub.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 text-muted-foreground hover:text-primary transition-colors"
                                            title="Downloaden"
                                        >
                                            <Download className="w-4 h-4" />
                                        </a>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
