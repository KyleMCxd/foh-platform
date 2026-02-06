"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
    BookOpen,
    Settings,
    LogOut,
    Home,
    Calendar,
    GraduationCap,
} from "lucide-react";

export default function SidebarContent() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full bg-white text-zinc-900">
            {/* Logo */}
            <div className="p-6 border-b border-gray-200">
                <Link href="/dashboard" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                        {/* Vector Logo Placeholder */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-6 h-6"
                        >
                            <line x1="4" y1="21" x2="4" y2="14" />
                            <line x1="4" y1="10" x2="4" y2="3" />
                            <line x1="12" y1="21" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12" y2="3" />
                            <line x1="20" y1="21" x2="20" y2="16" />
                            <line x1="20" y1="12" x2="20" y2="3" />
                            <line x1="1" y1="14" x2="7" y2="14" />
                            <line x1="9" y1="8" x2="15" y2="8" />
                            <line x1="17" y1="16" x2="23" y2="16" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="font-bold text-lg tracking-tight leading-none group-hover:text-primary transition-colors">FOH Academy</h1>
                        <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mt-0.5">Student Portal</p>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {/* Dashboard Link */}
                <Link
                    href="/dashboard"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-colors ${pathname === "/dashboard"
                        ? "bg-purple-100 text-purple-700 font-medium"
                        : "text-zinc-500 hover:bg-gray-50 hover:text-zinc-900"
                        }`}
                >
                    <Home className="w-5 h-5" />
                    <span>Dashboard</span>
                </Link>

                {/* Mijn Curriculum Link - Full Overview Page */}
                <Link
                    href="/curriculum"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-colors ${pathname === "/curriculum" || pathname?.startsWith("/curriculum")
                        ? "bg-purple-100 text-purple-700 font-medium"
                        : "text-zinc-500 hover:bg-gray-50 hover:text-zinc-900"
                        }`}
                >
                    <GraduationCap className="w-5 h-5" />
                    <span>Mijn Curriculum</span>
                </Link>

                {/* Workbook Link */}
                <Link
                    href="/workbook"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-colors ${pathname === "/workbook"
                        ? "bg-purple-100 text-purple-700 font-medium"
                        : "text-zinc-500 hover:bg-gray-50 hover:text-zinc-900"
                        }`}
                >
                    <BookOpen className="w-5 h-5" />
                    <span>Mijn Werkboek</span>
                </Link>

                {/* Booking Link (LIVE DAYS) */}
                <Link
                    href="/booking"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-6 transition-colors ${pathname === "/booking"
                        ? "bg-purple-100 text-purple-700 font-medium"
                        : "text-zinc-500 hover:bg-gray-50 hover:text-zinc-900"
                        }`}
                >
                    <Calendar className="w-5 h-5" />
                    <span>Mijn Praktijkdagen</span>
                </Link>
            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                        {user?.email?.charAt(0).toUpperCase() || "S"}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                            {user?.email?.split("@")[0] || "Student"}
                        </p>
                        <p className="text-xs text-zinc-500 truncate">
                            {user?.email}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link
                        href="/admin"
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-zinc-500 hover:text-zinc-900 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        <Settings className="w-4 h-4" />
                        Admin
                    </Link>
                    <button
                        onClick={() => logout()}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-zinc-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}
