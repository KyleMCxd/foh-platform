'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Logo from "@/components/ui/Logo";
import { Lock, ArrowRight, Music, Mic2, Zap } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await signIn(email, password);
            router.push('/dashboard');
        } catch (err: any) {
            console.error(err);
            setError('Ongeldige inloggegevens. Probeer het opnieuw.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0f0a1e]">
            {/* Ambient Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse-slow delay-1000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-black/40 radial-gradient-mask" />
            </div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 pointer-events-none" />

            <div className="w-full max-w-md relative z-10 px-4">
                {/* Main Card */}
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_50px_-10px_rgba(0,0,0,0.5)] overflow-hidden">

                    {/* Header Section */}
                    <div className="p-8 pb-6 text-center border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
                        <div className="flex justify-center mb-6">
                            <div className="p-4 rounded-2xl bg-black/50 border border-white/10 shadow-[0_0_20px_rgba(188,19,254,0.2)]">
                                <Logo className="scale-125" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-black text-white tracking-tight mb-2">WELKOM BACKSTAGE</h1>
                        <p className="text-zinc-400 text-sm">Log in om toegang te krijgen tot je curriculum</p>
                    </div>

                    {/* Form Section */}
                    <div className="p-8 pt-6">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                                    <Zap className="w-4 h-4" />
                                    {error}
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider ml-1">E-mailadres</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white placeholder:text-zinc-600 focus:border-[#BC13FE] focus:ring-1 focus:ring-[#BC13FE] focus:outline-none transition-all"
                                    placeholder="student@fohacademy.nl"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider ml-1">Wachtwoord</label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white placeholder:text-zinc-600 focus:border-[#BC13FE] focus:ring-1 focus:ring-[#BC13FE] focus:outline-none transition-all pr-10"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-[#BC13FE] to-[#00F0FF] text-white font-bold py-3.5 px-4 rounded-xl transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(188,19,254,0.3)] disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    {loading ? "BEZIG MET INLOGGEN..." : "INLOGGEN"}
                                    {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                                </span>
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-xs text-zinc-600">
                            <span className="flex items-center gap-1.5">
                                <Lock className="w-3 h-3" />
                                Secure Connection
                            </span>
                            <span className="font-mono opacity-50">v2.4.0</span>
                        </div>
                    </div>
                </div>

                {/* Footer Decor */}
                <div className="mt-8 text-center space-y-2">
                    <div className="flex justify-center gap-4 opacity-30">
                        <Mic2 className="w-5 h-5 text-zinc-500" />
                        <Music className="w-5 h-5 text-zinc-500" />
                        <Zap className="w-5 h-5 text-zinc-500" />
                    </div>
                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest">
                        FOH Academy Student Platform
                    </p>
                </div>
            </div>
        </div>
    );
}
