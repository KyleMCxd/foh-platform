"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useModules } from "@/lib/hooks/useModules";
import { useUserData } from "@/lib/hooks/useUserData";
import { useAuth } from "@/lib/auth";
import {
    BookOpen,
    ChevronRight,
    Settings,
    LogOut,
    Check,
    Play,
    Home,
} from "lucide-react";

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

    // SWR hooks - data is cached and shared across components
    const { modules, isLoading: modulesLoading } = useModules();
    const { progress, isLoading: userLoading } = useUserData(user?.uid);

    const loading = modulesLoading || userLoading;

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    // Extract current moduleId from pathname
    const currentModuleId = pathname?.startsWith("/module/")
        ? pathname.split("/")[2]
        : null;

    const SidebarContent = () => (
        <>
            {/* Logo */}
            <div className="p-6 border-b border-border">
                <Link href="/dashboard" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
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
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mt-0.5">Student Portal</p>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {/* Dashboard Link */}
                <Link
                    href="/dashboard"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-colors ${pathname === "/dashboard"
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-gray-50 hover:text-foreground"
                        }`}
                >
                    <Home className="w-5 h-5" />
                    <span>Dashboard</span>
                </Link>

                {/* Workbook Link */}
                <Link
                    href="/workbook"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-colors ${pathname === "/workbook"
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-gray-50 hover:text-foreground"
                        }`}
                >
                    <BookOpen className="w-5 h-5" />
                    <span>Mijn Werkboek</span>
                </Link>

                {/* Booking Link (LIVE DAYS) */}
                <Link
                    href="/booking"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-6 transition-colors ${pathname === "/booking"
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-gray-50 hover:text-foreground"
                        }`}
                >
                    <Play className="w-5 h-5" />
                    <span>Mijn Praktijkdagen</span>
                </Link>

                {/* Curriculum Section */}
                {loading ? (
                    <div className="px-4 py-8 text-center">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                ) : modules.length === 0 ? (
                    <p className="px-4 text-sm text-muted-foreground">
                        No content available.
                    </p>
                ) : (
                    <div className="space-y-6">
                        {/* Semester 1 */}
                        {modules.some(m => m.semester === 1) && (
                            <div>
                                <h3 className="px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                                    Semester 1: Audio
                                </h3>
                                <div className="space-y-1">
                                    {modules.filter(m => m.semester === 1).map((module) => {
                                        const isActive = currentModuleId === module.id;
                                        // Demo logic: assume first few are playable
                                        const isCompleted = false; // logic to be added later

                                        return (
                                            <Link
                                                key={module.id}
                                                href={`/module/${module.id}`}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative overflow-hidden ${isActive
                                                    ? "bg-secondary/10 text-secondary font-medium"
                                                    : "text-muted-foreground hover:bg-gray-50 hover:text-foreground"
                                                    }`}
                                            >
                                                {/* Active Indicator Bar */}
                                                {isActive && (
                                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary" />
                                                )}

                                                <div
                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors shrink-0 ${isActive
                                                        ? "bg-secondary text-white"
                                                        : isCompleted
                                                            ? "bg-green-100 text-green-600"
                                                            : "bg-gray-100 text-gray-500 group-hover:bg-primary/10 group-hover:text-primary"
                                                        }`}
                                                >
                                                    {isCompleted ? (
                                                        <Check className="w-4 h-4 stroke-[3]" />
                                                    ) : (
                                                        module.order
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0 z-10">
                                                    <p className="text-sm font-medium truncate">
                                                        Module {module.order}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {module.title.split(": ")[1] || module.title}
                                                    </p>
                                                </div>
                                                <ChevronRight
                                                    className={`w-4 h-4 transition-transform shrink-0 ${isActive ? "text-secondary" : "text-gray-300 group-hover:text-gray-500"
                                                        }`}
                                                />
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Semester 2 */}
                        {modules.some(m => m.semester === 2) && (
                            <div>
                                <h3 className="px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                                    Semester 2: Light
                                </h3>
                                <div className="space-y-1">
                                    {modules.filter(m => m.semester === 2).map((module) => {
                                        const isActive = currentModuleId === module.id;
                                        const isCompleted = false;

                                        return (
                                            <Link
                                                key={module.id}
                                                href={`/module/${module.id}`}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative overflow-hidden ${isActive
                                                    ? "bg-secondary/10 text-secondary font-medium"
                                                    : "text-muted-foreground hover:bg-gray-50 hover:text-foreground"
                                                    }`}
                                            >
                                                {isActive && (
                                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary" />
                                                )}
                                                <div
                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors shrink-0 ${isActive
                                                        ? "bg-secondary text-white"
                                                        : isCompleted
                                                            ? "bg-green-100 text-green-600"
                                                            : "bg-gray-100 text-gray-500 group-hover:bg-primary/10 group-hover:text-primary"
                                                        }`}
                                                >
                                                    {module.order}
                                                </div>
                                                <div className="flex-1 min-w-0 z-10">
                                                    <p className="text-sm font-medium truncate">
                                                        Module {module.order}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {module.title.split(": ")[1] || module.title}
                                                    </p>
                                                </div>
                                                <ChevronRight
                                                    className={`w-4 h-4 transition-transform shrink-0 ${isActive ? "text-secondary" : "text-gray-300 group-hover:text-gray-500"
                                                        }`}
                                                />
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-border">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                        {user?.email?.charAt(0).toUpperCase() || "S"}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                            {user?.email?.split("@")[0] || "Student"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                            {user?.email}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link
                        href="/admin"
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        <Settings className="w-4 h-4" />
                        Admin
                    </Link>
                    <button
                        onClick={() => logout()}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-background flex flex-col lg:flex-row">
            {/* Mobile Header */}
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

            {/* Desktop Sidebar (Fixed) */}
            <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-72 bg-white border-r border-border flex-col z-40">
                <SidebarContent />
            </aside>

            {/* Main Content */}
            <main className="flex-1 w-full lg:ml-72">
                {children}
            </main>
        </div>
    );
}
