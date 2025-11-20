"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Play, AlertCircle, Award, BookOpen } from "lucide-react";
import usersData from "@/data/users.json";
import coursesData from "@/data/courses.json";

export default function EmployeeDetailPage() {
    const params = useParams();
    const userId = params.id as string;
    const user = usersData.find((u) => u.id === userId);

    if (!user) {
        return <div className="p-8 text-center">User not found</div>;
    }

    // Mock "Swiss Cheese" Logic
    // In a real app, this would be dynamic. Here we simulate gaps based on role.
    const skills = [
        { name: "Excel", level: user.skills.excel || "beginner", gap: user.skills.excel !== "advanced" },
        { name: "PowerPoint", level: user.skills.powerpoint || "beginner", gap: user.skills.powerpoint !== "advanced" },
        { name: "Python", level: user.skills.python || "none", gap: true },
        { name: "Data Analysis", level: "beginner", gap: true },
    ];

    // Find recommendations based on gaps
    const recommendations = coursesData.filter(course => {
        // Simple heuristic: recommend if tag matches a gap
        const tags = JSON.stringify(course.tags).toLowerCase();
        return skills.some(s => s.gap && tags.includes(s.name.toLowerCase()));
    }).slice(0, 6);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{user.name}</h1>
                    <p className="text-slate-500">{user.department} • {user.role}</p>
                </div>
            </div>

            {/* Swiss Cheese Profile */}
            <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Award className="text-emerald-500" /> Skill Profile ("Swiss Cheese")
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {skills.map((skill) => (
                        <div key={skill.name} className={`p-6 rounded-xl border-2 ${skill.gap ? 'border-dashed border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700' : 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'} transition-all`}>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg">{skill.name}</h3>
                                {skill.gap ? <AlertCircle className="text-amber-500" size={20} /> : <CheckCircle className="text-emerald-500" size={20} />}
                            </div>
                            <p className="text-sm opacity-80 capitalize">{skill.level}</p>
                            {skill.gap && <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 font-medium">Gap Detected</p>}
                        </div>
                    ))}
                </div>
            </section>

            {/* Recommendations */}
            <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <BookOpen className="text-blue-500" /> Recommended Micro-Modules
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recommendations.map((course) => (
                        <div key={course.id} className="bg-white dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all flex flex-col justify-between h-full">
                            <div>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {Object.entries(course.tags).map(([key, value]) => (
                                        key === 'skill' && <span key={key} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-md font-medium capitalize">{String(value)}</span>
                                    ))}
                                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs rounded-md font-medium">5 min</span>
                                </div>
                                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2 line-clamp-2">{course.title}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mb-4">{course.text}</p>
                            </div>
                            <button className="w-full py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                                <Play size={16} /> Start Module
                            </button>
                        </div>
                    ))}
                    {recommendations.length === 0 && (
                        <div className="col-span-full text-center py-12 text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                            No specific gaps found requiring immediate intervention.
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
