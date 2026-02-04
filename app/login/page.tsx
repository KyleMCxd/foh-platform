'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { signIn } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await signIn(email, password);
            router.push('/dashboard');
        } catch (err: any) {
            console.error(err);
            setError('Invalid credentials. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md bg-surface border border-border rounded-lg p-8 relative overflow-hidden">
                {/* Flight Case Corners */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-gray-600"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-gray-600"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-gray-600"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-gray-600"></div>

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold tracking-tighter text-white mb-2">
                        FOH <span className="text-brand-secondary">ACADEMY</span>
                    </h1>
                    <p className="text-gray-400 text-sm">ACCESS CONTROL SYSTEM</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded text-sm text-center font-bold">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black border border-gray-800 rounded p-3 text-white focus:border-brand-primary focus:outline-none transition-colors"
                            placeholder="student@fohacademy.nl"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black border border-gray-800 rounded p-3 text-white focus:border-brand-primary focus:outline-none transition-colors"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-brand-primary hover:bg-brand-primary/90 text-background font-bold py-3 px-4 rounded transition-all shadow-[0_4px_0_rgba(0,0,0,0.5)] active:translate-y-[2px] active:shadow-none"
                    >
                        AUTHENTICATE
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-600">
                        SYSTEM ID: FOH-LMS-2026 // <span className="text-brand-secondary">SECURE CONNECTION</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
