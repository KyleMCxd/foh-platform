"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUserData } from "@/lib/hooks/useUserData";
import { useLessons } from "@/lib/hooks/useLessons";
import { useAuth } from "@/lib/auth";
import SidebarContent from "@/components/layout/SidebarContent";
import AuthGuard from "@/components/auth/AuthGuard";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <AuthGuard>
            <DashboardLayoutContent>{children}</DashboardLayoutContent>
        </AuthGuard>
    );
}

function DashboardLayoutContent({ children }: DashboardLayoutProps) {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        <div className="min-h-screen bg-background flex flex-col lg:flex-row">
            {/* Mobile Header - Hidden on Watch Page */}
            {!activeLessonId && (
                <header className="lg:hidden bg-white border-b border-border p-4 flex items-center justify-between sticky top-0 z-30">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center text-white font-bold">
                            F
                        </div>
                        <span className="font-bold tracking-tight">FOH Academy</span>
                    </Link>
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 text-muted-foreground hover:bg-gray-100 rounded-lg"
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
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar Drawer */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-border flex flex-col transform transition-transform duration-200 ease-in-out lg:hidden ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <SidebarContent />
            </aside>

            {/* Desktop Sidebar (Fixed) - Hidden on Watch Page */}
            {!activeLessonId && (
                <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-72 bg-white border-r border-border flex-col z-40">
                    <SidebarContent />
                </aside>
            )}

            {/* Main Content - No margin on Watch Page */}
            <main className={`flex-1 w-full ${activeLessonId ? "" : "lg:ml-72"}`}>
                {children}
            </main>
        </div>
    );
}
