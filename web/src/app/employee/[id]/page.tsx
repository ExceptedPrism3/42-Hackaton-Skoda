import { toast } from "sonner";

// ... imports ...

export default function EmployeeDetailPage() {
    // ... existing code ...

    // ... inside return ...
    <button
        onClick={() => {
            toast.success("Module Assigned Successfully", {
                const params = useParams();
                const userId = params.id as string;
                const user: UserProfile | undefined = usersData.find((u) => u.id === userId);

            if (!user) {
                return <div className="p-8 text-center">User not found</div>;
            }
            const skillEntries = Object.entries(user.skills || {}).map(([name, level]) => ({
                name,
                level,
                gap: level !== "advanced"
            }));
            const skills = skillEntries.length ? skillEntries : [
                { name: "Data Storytelling", level: "intermediate", gap: true },
                { name: "Automation", level: "beginner", gap: true },
                { name: "Compliance", level: "advanced", gap: false },
                { name: "People Operations", level: "advanced", gap: false }
            ];

            const priorityCategories = (user.course_mix || []).map((mix: { category: string }) => mix.category);
            const recommendations = coursesData.filter((course: Course) => {
                if (!skills.some(s => s.gap)) return true;
                return priorityCategories.includes(course.category);
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
                            <p className="text-sm text-slate-500">
                                {user.position} • {user.experience_years ? `${user.experience_years} yrs exp` : null}
                            </p>
                        </div>
                    </div>

                    {/* Profile Snapshot */}
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                            <div className="flex items-center gap-2 mb-2 text-slate-600 dark:text-slate-300 text-sm uppercase tracking-wide">
                                <Briefcase size={16} /> Current Assignment
                            </div>
                            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{user.current_assignment}</p>
                            <p className="text-sm text-slate-500 mt-2">{user.current_focus}</p>
                        </div>
                        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                            <div className="flex items-center gap-2 mb-2 text-slate-600 dark:text-slate-300 text-sm uppercase tracking-wide">
                                <GraduationCap size={16} /> Education
                            </div>
                            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{user.education?.category}</p>
                            <p className="text-sm text-slate-500 mt-2">{user.education?.branch}</p>
                            <p className="text-xs text-slate-500">{user.education?.field}</p>
                        </div>
                        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                            <div className="flex items-center gap-2 mb-2 text-slate-600 dark:text-slate-300 text-sm uppercase tracking-wide">
                                <Award size={16} /> Experience
                            </div>
                            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                {user.experience_years} yrs
                            </p>
                            <p className="text-sm text-slate-500 mt-2">Grounded in {user.background}</p>
                        </div>
                    </section>

                    {/* Swiss Cheese Profile */}
                    <section>
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Award className="text-emerald-500" /> Skill Profile (&ldquo;Swiss Cheese&rdquo;)
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

                    {/* Learning Mix */}
                    <section>
                        <h2 className="text-xl font-semibold mb-4">Learning Focus</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                                <h3 className="text-sm text-slate-500 uppercase tracking-wide mb-3">Recent Courses</h3>
                                <div className="space-y-2">
                                    {(user.recent_courses || []).map((course: { title: string; date?: string; source?: string }, index: number) => (
                                        <div key={`${course.title}-${index}`} className="text-sm">
                                            <p className="font-medium text-slate-900 dark:text-slate-100">{course.title}</p>
                                            <p className="text-xs text-slate-500">{course.date} • {course.source}</p>
                                        </div>

                    {/* Recommendations */ }
                                        < section >
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <BookOpen className="text-blue-500" /> Recommended Micro-Modules
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {recommendations.map((course: Course, index: number) => (
                                <div key={`${course.title}-${index}`} className="bg-white dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all flex flex-col justify-between h-full">
                                    <div>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-md font-medium capitalize">{course.category}</span>
                                            {course.provider && (
                                                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs rounded-md font-medium">{course.provider}</span>
                                            );
        }
