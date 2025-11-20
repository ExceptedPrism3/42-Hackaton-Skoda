"use client";

import React, { createContext, useContext, useState, useEffect, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";

interface User {
    name: string;
    role: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    login: (username: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [, startTransition] = useTransition();
    const router = useRouter();
    const pathname = usePathname();

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }
        const storedUser = localStorage.getItem("s3_user");
        if (storedUser) {
            startTransition(() => setUser(JSON.parse(storedUser)));
        }
    }, [startTransition]);

    const login = (username: string) => {
        setIsLoading(true);
        // Simulate network delay for transition
        setTimeout(() => {
            const mockUser: User = {
                name: "Maria",
                role: "HR Manager",
                email: `${username}@skoda-auto.cz`
            };
            setUser(mockUser);
            localStorage.setItem("s3_user", JSON.stringify(mockUser));
            router.push("/");
            setTimeout(() => setIsLoading(false), 500); // Keep loading slightly after push
        }, 1500);
    };

    const logout = () => {
        setIsLoading(true);
        setTimeout(() => {
            setUser(null);
            localStorage.removeItem("s3_user");
            router.push("/login");
            setIsLoading(false);
        }, 1000);
    };

    // Protect routes
    useEffect(() => {
        const isLoginPage = pathname === "/login";
        const storedUser = localStorage.getItem("s3_user");

        if (!storedUser && !isLoginPage) {
            router.push("/login");
        } else if (storedUser && isLoginPage) {
            router.push("/");
        }
    }, [pathname, router]);

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
            {isLoading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm transition-all">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-emerald-600 dark:text-emerald-400 font-medium animate-pulse">
                            {user ? "Signing out..." : "Authenticating..."}
                        </p>
                    </div>
                </div>
            )}
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
