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
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
                            <BookOpen className="w-8 h-8 text-primary" />
                            Mijn Werkboek
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Houd hier je voortgang, aantekeningen en huiswerk bij.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* LEFT: NOTES */}
                    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col h-[600px]">
                        <div className="border-b border-border bg-gray-50 px-4 py-3 flex items-center justify-between">
                            <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                                Notities & Aantekeningen
                            </span>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 text-xs font-bold text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
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
                            className="flex-1 w-full p-6 resize-none focus:outline-none text-base leading-relaxed text-zinc-800 placeholder:text-gray-300 font-serif"
                            placeholder="Typ hier je notities en ideeën..."
                        />
                    </div>

                    {/* RIGHT: HOMEWORK */}
                    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col h-[600px]">
                        <div className="border-b border-border bg-gray-50 px-4 py-3">
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
                                                    <span>{sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : "Unknown date"}</span>
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
                                            title="Download"
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
