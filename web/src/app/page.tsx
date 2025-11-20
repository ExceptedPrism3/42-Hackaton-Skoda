"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, User, ChevronRight } from "lucide-react";
import usersData from "@/data/users.json";

export default function HRSearchPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = usersData.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-950 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Employee Skill Search</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-6">Find employees to view their skill gaps and assign micro-learning.</p>

        <div className="max-w-xl mx-auto relative">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by Name or Employee ID..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.slice(0, 50).map((user) => (
          <Link key={user.id} href={`/employee/${user.id}`}>
            <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition-all hover:shadow-md group cursor-pointer flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-slate-100">{user.name}</h3>
                  <p className="text-xs text-slate-500">{user.department} • ID: {user.id}</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
            </div>
          </Link>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          No employees found matching "{searchTerm}"
        </div>
      )}
    </div>
  );
}
