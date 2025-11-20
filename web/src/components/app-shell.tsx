"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, BookOpen, Settings, LogOut, User, Lock, Building2, BarChart3, Search } from "lucide-react";
import { useAuth } from "@/context/auth-context";

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const isLoginPage = pathname === "/login";

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 hidden md:flex flex-col">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                    <h1 className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">S³</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Skoda Smart Stream</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${pathname === '/' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                        <Search size={20} />
                        <span className="font-medium">Employee Search</span>
                    </Link>
                    <Link href="/department" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${pathname === '/department' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                        <LayoutDashboard size={20} />
                        <span className="font-medium">Department Overview</span>
                    </Link>
                    <Link
                        href="/analytics"
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === "/analytics"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 font-medium"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
                            }`}
                    >
                        <BarChart3 size={20} />
                        Analytics
                    </Link>
                    <Link
                        href="/settings"
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${pathname === '/settings' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                        <Settings size={20} />
                        <span className="font-medium">Settings</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="group relative">
                        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
                                <User size={16} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{user?.name || 'User'}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{user?.role || 'Employee'}</p>
                            </div>
                        </div>

                        {/* Simple Popover for Logout */}
                        <div className="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                            <button
                                onClick={logout}
                                className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl flex items-center gap-2"
                            >
                                <Lock size={16} /> Log Out
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                        {pathname === '/' ? 'Employee Search' :
                            pathname === '/department' ? 'Department Overview' :
                                pathname === '/settings' ? 'Settings' : 'Dashboard'}
                    </h2>
                    <div className="flex items-center gap-4">
                        <button className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors">
                            Daily Micro-Challenge
                        </button>
                    </div>
                </header>
                <div className="flex-1 overflow-auto p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
