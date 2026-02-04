"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase"; // Ensure this import exists
import { Save, Loader2, BookOpen } from "lucide-react";

export default function WorkbookPage() {
    const { user } = useAuth();
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

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
                setLoading(false);
            }
        }
        fetchNotes();
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
            <div className="max-w-4xl mx-auto space-y-6">
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
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-primary/20"
                    >
                        {saving ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        {saving ? "Opslaan..." : "Opslaan"}
                    </button>
                </div>

                <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col h-[calc(100vh-200px)] min-h-[500px]">
                    <div className="border-b border-border bg-gray-50 px-4 py-2 flex items-center justify-between text-xs text-muted-foreground font-medium uppercase tracking-wider">
                        <span>Notities & Aantekeningen</span>
                        <span>
                            {lastSaved
                                ? `Laatst opgeslagen: ${lastSaved.toLocaleTimeString()}`
                                : "Nog niet opgeslagen"}
                        </span>
                    </div>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="flex-1 w-full p-6 resize-none focus:outline-none text-lg leading-relaxed text-foreground placeholder:text-gray-300"
                        placeholder="Typ hier je notities..."
                    />
                </div>
            </div>
        </div>
    );
}
