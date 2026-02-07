"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUserData } from "@/lib/hooks/useUserData";
import { useLessons } from "@/lib/hooks/useLessons";
import { useAuth } from "@/lib/auth";
import SidebarContent from "@/components/layout/SidebarContent";
import AuthGuard from "@/components/auth/AuthGuard";
import { SessionTimerProvider } from "@/components/providers/SessionTimerProvider";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <AuthGuard>
            <SessionTimerProvider>
                <DashboardLayoutContent>{children}</DashboardLayoutContent>
            </SessionTimerProvider>
        </AuthGuard>
    );
}

function DashboardLayoutContent({ children }: DashboardLayoutProps) {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

    // Fetch lessons for active state detection
    const { lessons, isLoading: lessonsLoading } = useLessons();
    const { userData, isLoading: userLoading } = useUserData(user?.uid);

    // Extract current lessonId from pathname for active state
    const activeLessonId = pathname?.startsWith("/watch/")
        ? pathname.split("/")[2]
        : undefined;

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    // Extract current moduleId from pathname
    const currentModuleId = pathname?.startsWith("/module/")
        ? pathname.split("/")[2]
        : null;

    return (
        <div className="min-h-screen relative">
            {/* Fixed Background Layer - Stays in place while content scrolls */}
            <div className="fixed inset-0 bg-gradient-to-br from-[#0f0a1e] via-[#1a1333] to-[#0d1321] z-0">
                {/* Vibrant stage light glow effects */}
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[100px]" />
                <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/15 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-500/8 rounded-full blur-[80px]" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-pink-600/15 rounded-full blur-[120px]" />
                <div className="absolute top-1/2 right-0 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[100px]" />
            </div>

            {/* Mobile Header - Hidden on Watch Page */}
            {!activeLessonId && (
                <header className="lg:hidden bg-[#0f0a1e]/80 backdrop-blur-lg border-b border-white/10 p-4 flex items-center justify-between sticky top-0 z-30">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center text-white font-bold">
                            F
                        </div>
                        <span className="font-bold tracking-tight text-white">FOH Academy</span>
                    </Link>
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 text-white/70 hover:bg-white/10 rounded-lg"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    </button>
                </header>
            )}

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar Drawer */}
            <aside
                className={`fixed inset-y-0 right-0 z-50 w-72 flex flex-col transform transition-transform duration-300 ease-in-out lg:hidden ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <SidebarContent />
            </aside>

            {/* Desktop Sidebar Toggle Button - Always visible */}
            {!activeLessonId && (
                <button
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    className={`hidden lg:flex fixed top-4 z-50 items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 text-white hover:bg-white/20 transition-all duration-300 cursor-pointer ${isSidebarCollapsed ? "right-4" : "right-[17rem]"
                        }`}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`transition-transform duration-300 ${isSidebarCollapsed ? "rotate-180" : ""}`}
                    >
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>
            )}

            {/* Desktop Sidebar (Fixed) - Hidden on Watch Page */}
            {!activeLessonId && (
                <aside
                    className={`hidden lg:flex fixed right-0 top-0 bottom-0 w-72 flex-col z-40 transform transition-transform duration-300 ease-in-out border-l border-white/10 ${isSidebarCollapsed ? "translate-x-full" : "translate-x-0"
                        }`}
                >
                    <SidebarContent />
                </aside>
            )}

            {/* Main Content - Scrollable over fixed background */}
            <main className={`relative z-10 flex-1 w-full min-h-screen transition-all duration-300 ${activeLessonId ? "" : isSidebarCollapsed ? "lg:mr-0" : "lg:mr-72"}`}>
                {children}
            </main>
        </div>
    );
}
