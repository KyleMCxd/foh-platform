'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, BookOpen, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export default function Sidebar() {
    const { logout } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    return (
        <aside className="w-64 h-screen bg-surface border-r border-border fixed left-0 top-0 flex flex-col z-50">
            <div className="p-6 border-b border-border">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-brand-primary flex items-center justify-center font-bold text-black">
                        F
                    </div>
                    <span className="font-bold tracking-wider text-brand-secondary">FOH ACADEMY</span>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                <div className="px-3 mb-2 text-xs font-mono text-gray-500 uppercase tracking-widest">Platform</div>
                <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md bg-surface-highlight text-white hover:bg-surface-highlight/80 transition-colors">
                    <Home className="w-4 h-4 text-brand-primary" />
                    Dashboard
                </Link>

                <div className="mt-8 px-3 mb-2 text-xs font-mono text-gray-500 uppercase tracking-widest">Curriculum</div>
                {/* Mock Modules */}
                {[
                    'Infrastructuur & Speakers',
                    'Elektriciteit & Veiligheid',
                    'Mengpanelen (Analoog)',
                    'Mengpanelen (Digitaal)',
                    'Licht Hardware & Infra',
                    'Lichtsturing',
                    'Geluidstechniek Advanced',
                    'Netwerken & Draadloos',
                    'Het Eindexamen'
                ].map((mod, i) => (
                    <div key={i} className="group flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
                        <BookOpen className="w-4 h-4 text-gray-600 group-hover:text-brand-secondary transition-colors" />
                        <span className="truncate">Module {i + 1}: {mod}</span>
                    </div>
                ))}
            </nav>

            <div className="p-4 border-t border-border">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-400 hover:text-white cursor-pointer transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Uitloggen
                </button>
            </div>
        </aside>
    );
}
