import courses from "@/data/courses.json";
import { Clock, ArrowRight, Layers } from "lucide-react";

type Course = typeof courses[number];

export default function FeedPage() {
    const categorySummary: Record<string, number> = {};
    courses.forEach((course: Course) => {
        const key = course.category || "Professional Skills";
        categorySummary[key] = (categorySummary[key] || 0) + 1;
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Your Learning Feed</h1>
                    <p className="text-slate-500 dark:text-slate-400">Micro-modules across Škoda Academy tracks.</p>
                </div>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                        {courses.length} Modules Available
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {Object.entries(categorySummary)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(([category, count]) => (
                        <div key={category} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600">
                                <Layers size={20} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">{category}</p>
                                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{count} modules</p>
                            </div>
                        </div>
                    ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course: Course, index: number) => (
                    <div
                        key={index}
                        className="group bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-md transition-all hover:border-emerald-500/50"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex gap-2">
                                <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                                    {course.category || "Skills"}
                                </span>
                                {course.provider && (
                                    <span className="px-2 py-1 bg-slate-50 dark:bg-slate-900 text-slate-500 rounded-md text-[10px] font-medium uppercase tracking-wider">
                                        {course.provider}
                                    </span>
                                )}
                            </div>
                        </div>

                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                            {course.title}
                        </h3>

                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-3">
                            {course.topic || course.source}
                        </p>

                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-900">
                            <div className="flex items-center gap-1 text-xs text-slate-400">
                                <Clock size={14} />
                                <span>{course.content_type || "Micro-learning"}</span>
                            </div>
                            <button className="text-sm font-medium text-emerald-600 flex items-center gap-1 hover:gap-2 transition-all">
                                Start <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
