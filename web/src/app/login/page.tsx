"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Lock, User, ArrowRight } from "lucide-react";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useAuth();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (username && password) {
            login(username);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-950 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 mb-4">
                            <Lock size={32} />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Welcome Back</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">Sign in to access the HR Dashboard</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Username
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <User size={20} />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                    placeholder="Enter your username"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                        >
                            Sign In <ArrowRight size={20} />
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Demo Credentials: any username / any password
                        </p>
                    </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 text-center border-t border-slate-200 dark:border-slate-800">
                    <p className="text-xs text-slate-500">
                        Protected by S³ Enterprise Security
                    </p>
                </div>
            </div>
        </div>
    );
}
