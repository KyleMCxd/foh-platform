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

    const isActive = (path: string) => {
        if (path === "/dashboard") return pathname === "/dashboard";
        return pathname?.startsWith(path);
    };

    const getLinkClasses = (path: string) => {
        const active = isActive(path);
        return `flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all duration-200 group relative overflow-hidden ${active
            ? "bg-gradient-to-r from-[#BC13FE]/20 to-[#00F0FF]/10 text-white font-bold"
            : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`;
    };

    return (
        <div className="flex flex-col h-full bg-black/20 backdrop-blur-3xl text-white relative">
            {/* Logo */}
            <div className="p-6 relative overflow-hidden">

                <Link href="/dashboard" className="block w-fit relative z-10">
                    <Logo className="text-white" />
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {/* Dashboard Link */}
                <Link href="/dashboard" className={getLinkClasses("/dashboard")}>
                    {/* Active State Indicator: Cyan Vertical Line */}
                    {isActive("/dashboard") && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-[#00F2FF] rounded-r-full shadow-[0_0_10px_#00F2FF]" />
                    )}

                    {/* Icon with potential glow */}
                    <div className={`relative ${isActive("/dashboard") ? "text-[#BC13FE] drop-shadow-[0_0_8px_rgba(188,19,254,0.6)]" : "group-hover:text-[#BC13FE]"}`}>
                        <Home className="w-5 h-5 relative z-10" />
                        {/* Glow behind icon when active */}
                        {isActive("/dashboard") && <div className="absolute inset-0 bg-[#BC13FE] blur-xl opacity-30" />}
                    </div>

                    <span>Dashboard</span>
                </Link>

                {/* Mijn Curriculum Link */}
                <Link href="/curriculum" className={getLinkClasses("/curriculum")}>
                    {isActive("/curriculum") && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-[#00F2FF] rounded-r-full shadow-[0_0_10px_#00F2FF]" />
                    )}
                    <div className={`relative ${isActive("/curriculum") ? "text-[#BC13FE] drop-shadow-[0_0_8px_rgba(188,19,254,0.6)]" : "group-hover:text-[#BC13FE]"}`}>
                        <GraduationCap className="w-5 h-5 relative z-10" />
                        {isActive("/curriculum") && <div className="absolute inset-0 bg-[#BC13FE] blur-xl opacity-30" />}
                    </div>
                    <span>Mijn Curriculum</span>
                </Link>

                {/* Workbook Link */}
                <Link href="/workbook" className={getLinkClasses("/workbook")}>
                    {isActive("/workbook") && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-[#00F2FF] rounded-r-full shadow-[0_0_10px_#00F2FF]" />
                    )}
                    <div className={`relative ${isActive("/workbook") ? "text-[#BC13FE] drop-shadow-[0_0_8px_rgba(188,19,254,0.6)]" : "group-hover:text-[#BC13FE]"}`}>
                        <BookOpen className="w-5 h-5 relative z-10" />
                        {isActive("/workbook") && <div className="absolute inset-0 bg-[#BC13FE] blur-xl opacity-30" />}
                    </div>
                    <span>Mijn Werkboek</span>
                </Link>

                {/* Booking Link */}
                <Link href="/booking" className={getLinkClasses("/booking")}>
                    {isActive("/booking") && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-[#00F2FF] rounded-r-full shadow-[0_0_10px_#00F2FF]" />
                    )}
                    <div className={`relative ${isActive("/booking") ? "text-[#BC13FE] drop-shadow-[0_0_8px_rgba(188,19,254,0.6)]" : "group-hover:text-[#BC13FE]"}`}>
                        <Calendar className="w-5 h-5 relative z-10" />
                        {isActive("/booking") && <div className="absolute inset-0 bg-[#BC13FE] blur-xl opacity-30" />}
                    </div>
                    <span>Mijn Praktijkdagen</span>
                </Link>
            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-white/10 bg-black/20">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#BC13FE] to-[#2a0845] flex items-center justify-center text-sm font-bold text-white">
                        {user?.email?.charAt(0).toUpperCase() || "S"}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">
                            {user?.email?.split("@")[0] || "Student"}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                            {user?.email}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link
                        href="/admin"
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-slate-400 hover:text-[#00F0FF] hover:bg-white/5 rounded-lg transition-all"
                    >
                        <Settings className="w-4 h-4" />
                        Beheer
                    </Link>
                    <button
                        onClick={() => logout()}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-all"
                    >
                        <LogOut className="w-4 h-4" />
                        Uitloggen
                    </button>
                </div>
            </div>
        </div>
    );
}
