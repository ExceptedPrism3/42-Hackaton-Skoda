import Link from "next/link";
import "./globals.css";
import { LayoutDashboard, BookOpen, CheckCircle, Settings, User, Search } from "lucide-react";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-50 dark:bg-slate-900">
        <div className="flex h-screen">
          {/* Sidebar */}
          <aside className="w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 hidden md:flex flex-col">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <h1 className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">S³</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Skoda Smart Stream</p>
            </div>

            <nav className="flex-1 p-4 space-y-2">
              <Link href="/" className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <Search size={20} />
                <span className="font-medium">Employee Search</span>
              </Link>
              <Link href="/" className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <LayoutDashboard size={20} />
                <span className="font-medium">Department Overview</span>
              </Link>
              <Link href="/" className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <Settings size={20} />
                <span className="font-medium">Settings</span>
              </Link>
            </nav>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
                  <User size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Maria</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">HR Manager</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 flex flex-col overflow-hidden">
            <header className="h-16 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Dashboard</h2>
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
      </body>
    </html>
  );
}

function NavItem({ href, icon, label, active = false }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${active
        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
        : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900"
        }`}
    >
      {icon}
      {label}
    </Link>
  );
}
