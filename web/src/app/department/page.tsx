"use client";

import { Users, AlertTriangle } from "lucide-react";
import usersData from "@/data/users.json";

export default function DepartmentOverviewPage() {
    // Aggregate data by department
    const departments: Record<string, { count: number; gaps: number; skills: Record<string, number> }> = {};

    usersData.forEach(user => {
        if (!departments[user.department]) {
            departments[user.department] = { count: 0, gaps: 0, skills: {} };
        }

        const dept = departments[user.department];
        dept.count++;

        // Simulate gaps based on role/skills
        // In a real app, this would be calculated from the Swiss Cheese profile
        const hasGap = !user.skills.excel || user.skills.excel !== "advanced";
        if (hasGap) dept.gaps++;
    });

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Department Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(departments).map(([name, data]) => (
                    <div key={name} className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                                <Users size={24} />
                            </div>
                            <span className="text-xs font-medium px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400">
                                {data.count} Employees
                            </span>
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">{name}</h3>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Skill Health</span>
                                <span className="font-medium text-emerald-600">{Math.round(((data.count - data.gaps) / data.count) * 100)}%</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-emerald-500 h-full rounded-full"
                                    style={{ width: `${((data.count - data.gaps) / data.count) * 100}%` }}
                                ></div>
                            </div>

                            <div className="pt-4 flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm">
                                <AlertTriangle size={16} />
                                <span>{data.gaps} employees have critical gaps</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
