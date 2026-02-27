import React, { useState, useEffect } from 'react';
import TrainerSidebar from '../../components/TrainerSidebar';
import ProfileDropdown from '../../components/ProfileDropdown';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API = `${API_BASE}/api/trainer`;

export default function TrainerStudents() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [courseFilter, setCourseFilter] = useState('all');

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`${API}/students`, { headers });
                if (res.ok) setStudents(await res.json());
            } catch { }
            setLoading(false);
        })();
    }, []);

    const courses = [...new Set(students.map(s => s.course_title))];
    const filtered = courseFilter === 'all' ? students : students.filter(s => s.course_title === courseFilter);

    const statusBadge = (status) => {
        const map = {
            completed: { color: 'bg-emerald-100 text-emerald-700', label: 'Completed' },
            in_progress: { color: 'bg-blue-100 text-blue-700', label: 'In Progress' },
            not_started: { color: 'bg-slate-100 text-slate-500', label: 'Not Started' },
        };
        const s = map[status] || map.not_started;
        return <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${s.color}`}>{s.label}</span>;
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <TrainerSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between flex-shrink-0">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">My Students</h1>
                        <p className="text-xs text-slate-500 mt-0.5">Track student enrollment and progress across your courses</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            {filtered.length} students
                        </span>
                        <ProfileDropdown />
                    </div>
                </header>

                <main className="flex-1 p-8 overflow-y-auto">
                    {/* Filters */}
                    <div className="flex gap-2 mb-6 flex-wrap">
                        <button onClick={() => setCourseFilter('all')}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${courseFilter === 'all' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}>
                            All Courses
                        </button>
                        {courses.map(c => (
                            <button key={c} onClick={() => setCourseFilter(c)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${courseFilter === c ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}>
                                {c}
                            </button>
                        ))}
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="px-6 py-4 text-left text-xs text-slate-400 font-medium uppercase tracking-wider">Student</th>
                                    <th className="px-6 py-4 text-left text-xs text-slate-400 font-medium uppercase tracking-wider">Course</th>
                                    <th className="px-6 py-4 text-left text-xs text-slate-400 font-medium uppercase tracking-wider">Progress</th>
                                    <th className="px-6 py-4 text-left text-xs text-slate-400 font-medium uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs text-slate-400 font-medium uppercase tracking-wider">Enrolled</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="border-b border-slate-50">
                                            <td colSpan={5} className="px-6 py-5"><div className="h-4 bg-slate-100 rounded animate-pulse w-2/3"></div></td>
                                        </tr>
                                    ))
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">No students enrolled yet</td></tr>
                                ) : filtered.map((s, i) => (
                                    <tr key={`${s.student_id}-${s.course_id}-${i}`} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-sm font-bold shadow">
                                                    {s.student_name?.charAt(0)?.toUpperCase() || '?'}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-800">{s.student_name}</div>
                                                    <div className="text-[10px] text-slate-400">{s.student_email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-600">{s.course_title}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 bg-slate-100 rounded-full h-2 max-w-[120px]">
                                                    <div className={`h-2 rounded-full transition-all ${s.progress >= 100 ? 'bg-emerald-500' : s.progress > 0 ? 'bg-blue-500' : 'bg-slate-300'}`}
                                                        style={{ width: `${Math.min(s.progress, 100)}%` }}></div>
                                                </div>
                                                <span className="text-xs font-semibold text-slate-600">{s.progress}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{statusBadge(s.status)}</td>
                                        <td className="px-6 py-4 text-xs text-slate-400">
                                            {s.enrolled_at ? new Date(s.enrolled_at).toLocaleDateString() : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
        </div>
    );
}
