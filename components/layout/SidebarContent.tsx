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
import Logo from "@/components/ui/Logo";

export default function SidebarContent() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full bg-white text-zinc-900">
            {/* Logo */}
            <div className="p-6 border-b border-[#00F0FF]/20 bg-[#050A30] relative overflow-hidden">
                {/* Neon Glow Effect */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent opacity-50"></div>

                <Link href="/dashboard" className="block w-fit relative z-10">
                    <Logo className="text-white" />
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
