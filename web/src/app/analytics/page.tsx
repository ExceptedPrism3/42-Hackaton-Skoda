"use client";

import { useState, useMemo } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
} from "recharts";
import usersData from "@/data/users.json";

// --- Types ---
type User = typeof usersData[0];

// --- Colors ---
const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#6366f1"];

export default function AnalyticsPage() {
    // --- Data Processing ---
    const departmentData = useMemo(() => {
        const counts: Record<string, number> = {};
        usersData.forEach((user) => {
            const dept = user.department || "Unknown";
            counts[dept] = (counts[dept] || 0) + 1;
        });
        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, []);

    const skillData = useMemo(() => {
        const counts: Record<string, number> = {};
        usersData.forEach((user) => {
            Object.keys(user.skills).forEach((skill) => {
                counts[skill] = (counts[skill] || 0) + 1;
            });
        });
        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10); // Top 10 skills
    }, []);

    const learningTrendsData = useMemo(() => {
        // Mocking trend data based on "completed_courses" count for visualization
        // In a real app, we'd use actual completion dates
        return [
            { month: "Jan", hours: 120 },
            { month: "Feb", hours: 150 },
            { month: "Mar", hours: 180 },
            { month: "Apr", hours: 220 },
            { month: "May", hours: 250 },
            { month: "Jun", hours: 300 },
        ];
    }, []);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Analytics Dashboard</h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Overview of workforce skills, department distribution, and learning trends.
                </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Employees</h3>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{usersData.length}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Departments</h3>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{departmentData.length}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Top Skill</h3>
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                        {skillData[0]?.name || "N/A"}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Department Breakdown */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Department Breakdown</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={departmentData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {departmentData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ color: '#1e293b' }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Skill Distribution */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Top 10 Skills</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={skillData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    width={120}
                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ color: '#1e293b' }}
                                />
                                <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Learning Trends */}
                <div className="col-span-1 lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Learning Activity Trends</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={learningTrendsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ color: '#1e293b' }}
                                />
                                <Area type="monotone" dataKey="hours" stroke="#3b82f6" fillOpacity={1} fill="url(#colorHours)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
