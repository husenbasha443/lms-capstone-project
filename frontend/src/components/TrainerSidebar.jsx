import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
    { label: 'Dashboard', icon: 'dashboard', path: '/dashboard/trainer' },
    { label: 'My Courses', icon: 'school', path: '/trainer/courses' },
    { label: 'Students', icon: 'group', path: '/trainer/students' },
    { label: 'Analytics', icon: 'monitoring', path: '/trainer/analytics' },
];

export default function TrainerSidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-hidden">
            <div className="p-6 flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-2 rounded-xl shadow-lg shadow-blue-600/20">
                    <span className="material-symbols-outlined text-xl">school</span>
                </div>
                <div>
                    <h2 className="text-lg font-bold tracking-tight text-slate-800">AI LMS</h2>
                    <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest">Trainer Portal</p>
                </div>
            </div>

            <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const active = location.pathname === item.path;
                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left transition-all cursor-pointer ${active
                                ? 'bg-blue-600/10 text-blue-600 font-semibold shadow-sm'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                }`}
                        >
                            <span className="material-symbols-outlined text-xl">{item.icon}</span>
                            <span className="text-sm">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="p-4 mx-4 mb-4 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-base">verified</span>
                    <span className="text-xs font-semibold">Trainer Access</span>
                </div>
                <p className="text-[10px] text-blue-100 leading-relaxed">
                    Manage your courses, track student progress, and monitor content performance.
                </p>
            </div>
        </aside>
    );
}
