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
                        href="/documentation"
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${pathname === '/documentation' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                        <BookOpen size={20} />
                        <span className="font-medium">Documentation</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="group relative">
                        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-all duration-200 cursor-pointer">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/40 dark:to-emerald-800/40 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shadow-sm group-hover:shadow-md transition-shadow">
                                <User size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{user?.name || 'User'}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.role || 'Employee'}</p>
                            </div>
                            <div className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="transform group-hover:rotate-180 transition-transform duration-200">
                                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                        </div>

                        {/* Enhanced Popover for Settings and Logout */}
                        <div className="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-out transform translate-y-2 group-hover:translate-y-0 overflow-hidden backdrop-blur-sm">
                            {/* Arrow pointer */}
                            <div className="absolute bottom-0 left-6 transform translate-y-full">
                                <div className="w-3 h-3 bg-white dark:bg-slate-950 border-r border-b border-slate-200 dark:border-slate-800 transform rotate-45 -mt-1.5"></div>
                            </div>
                            
                            <div className="relative bg-white dark:bg-slate-950 rounded-xl overflow-hidden">
                                {/* User info header */}
                                <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-800">
                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Account</p>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{user?.name || 'User'}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email || user?.role || 'Employee'}</p>
                                </div>

                                {/* Menu items */}
                                <div className="py-1">
                                    <Link
                                        href="/settings"
                                        className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-all duration-150 ${
                                            pathname === '/settings' 
                                                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-medium' 
                                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900'
                                        }`}
                                    >
                                        <Settings size={18} className="flex-shrink-0" />
                                        <span>Settings</span>
                                        {pathname === '/settings' && (
                                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                        )}
                                    </Link>
                                    
                                    <div className="my-1 border-t border-slate-200 dark:border-slate-800"></div>
                                    
                                    <button
                                        onClick={logout}
                                        className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-all duration-150 group/logout"
                                    >
                                        <LogOut size={18} className="flex-shrink-0 group-hover/logout:rotate-12 transition-transform" />
                                        <span className="font-medium">Log Out</span>
                                    </button>
                                </div>
                            </div>
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
                                pathname === '/feed' ? 'Daily Micro-Challenges' :
                                    pathname === '/documentation' ? 'Documentation' :
                                        pathname === '/settings' ? 'Settings' : 'Dashboard'}
                    </h2>
                    <div className="flex items-center gap-4">
                        <Link href="/feed" className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors">
                            Daily Micro-Challenge
                        </Link>
                    </div>
                </header>
                <div className="flex-1 overflow-auto p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
