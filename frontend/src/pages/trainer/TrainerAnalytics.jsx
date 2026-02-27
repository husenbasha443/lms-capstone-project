import React, { useState, useEffect } from 'react';
import {
    AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import TrainerSidebar from '../../components/TrainerSidebar';
import ProfileDropdown from '../../components/ProfileDropdown';

import api from '../../services/api';

export default function TrainerAnalytics() {
    const [stats, setStats] = useState(null);
    const [enrollmentTrend, setEnrollmentTrend] = useState([]);
    const [courseCompletion, setCourseCompletion] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const [statsRes, trendRes, compRes] = await Promise.all([
                    api.get('/trainer/stats'),
                    api.get('/trainer/analytics/enrollment-trend'),
                    api.get('/trainer/analytics/completion'),
                ]);
                setStats(statsRes.data);
                setEnrollmentTrend(Array.isArray(trendRes.data) ? trendRes.data : []);
                setCourseCompletion(Array.isArray(compRes.data) ? compRes.data : []);
            } catch { }
            setLoading(false);
        })();
    }, []);

    const colorMap = {
        blue: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'bg-blue-600', badge: 'bg-blue-100 text-blue-700' },
        emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'bg-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
        amber: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700' },
        purple: { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'bg-purple-600', badge: 'bg-purple-100 text-purple-700' },
    };

    const kpis = [
        { label: 'Avg Completion', value: stats ? `${stats.avg_completion}%` : '—', icon: 'trending_up', trend: `${stats?.total_students ?? 0} students`, color: 'blue' },
        { label: 'Total Courses', value: stats?.total_courses ?? '—', icon: 'school', trend: `${stats?.active_courses ?? 0} published`, color: 'emerald' },
        { label: 'Videos Uploaded', value: stats?.total_videos ?? '—', icon: 'videocam', trend: `${stats?.total_pdfs ?? 0} PDFs`, color: 'amber' },
        { label: 'Transcripts', value: stats?.total_transcripts ?? '—', icon: 'subtitles', trend: `${stats?.processed_lessons ?? 0} processed`, color: 'purple' },
    ];

    return (
        <div className="flex h-screen bg-slate-50">
            <TrainerSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between flex-shrink-0">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Analytics</h1>
                        <p className="text-xs text-slate-500 mt-0.5">Track your course performance and student engagement</p>
                    </div>
                    <ProfileDropdown />
                </header>

                <main className="flex-1 p-8 overflow-y-auto">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-4 gap-5 mb-8">
                        {kpis.map((kpi, i) => {
                            const c = colorMap[kpi.color];
                            return (
                                <div key={i} className={`${c.bg} border ${c.border} rounded-2xl p-5 transition-all hover:shadow-lg`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className={`w-10 h-10 ${c.icon} rounded-xl flex items-center justify-center shadow-lg`}>
                                            <span className="material-symbols-outlined text-white text-xl">{kpi.icon}</span>
                                        </div>
                                        <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${c.badge}`}>{kpi.trend}</span>
                                    </div>
                                    <p className="text-2xl font-bold text-slate-800 mb-0.5">{kpi.value}</p>
                                    <p className="text-xs text-slate-500">{kpi.label}</p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-2 gap-5 mb-8">
                        {/* Enrollment Trend */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <h3 className="font-semibold text-slate-800 text-sm mb-4">Enrollment Trend</h3>
                            {enrollmentTrend.length === 0 ? (
                                <div className="h-56 flex items-center justify-center text-slate-400 text-sm">No enrollment data yet</div>
                            ) : (
                                <ResponsiveContainer width="100%" height={224}>
                                    <AreaChart data={enrollmentTrend}>
                                        <defs>
                                            <linearGradient id="enrollGradAnalytics" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" />
                                        <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} />
                                        <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} />
                                        <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, fontSize: 12 }} />
                                        <Area type="monotone" dataKey="users" stroke="#3b82f6" fill="url(#enrollGradAnalytics)" strokeWidth={2.5} dot={{ r: 3, fill: '#3b82f6' }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        {/* Course Completion */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <h3 className="font-semibold text-slate-800 text-sm mb-4">Course Completion Rates</h3>
                            {courseCompletion.length === 0 ? (
                                <div className="h-56 flex items-center justify-center text-slate-400 text-sm">No completion data yet</div>
                            ) : (
                                <ResponsiveContainer width="100%" height={224}>
                                    <BarChart data={courseCompletion} layout="vertical">
                                        <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" />
                                        <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} />
                                        <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
                                        <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, fontSize: 12 }} />
                                        <Bar dataKey="completion" fill="#3b82f6" radius={[0, 8, 8, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* Per-Course Breakdown Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h3 className="font-semibold text-slate-800 text-sm mb-4">Course Performance Breakdown</h3>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                                    <th className="text-left pb-3 font-medium">Course</th>
                                    <th className="text-left pb-3 font-medium">Completion</th>
                                    <th className="text-left pb-3 font-medium">Students</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courseCompletion.length === 0 ? (
                                    <tr><td colSpan={3} className="py-8 text-center text-slate-400">No data yet</td></tr>
                                ) : courseCompletion.map(c => (
                                    <tr key={c.id} className="border-t border-slate-50 hover:bg-slate-50/50">
                                        <td className="py-3 font-medium text-slate-800">{c.name}</td>
                                        <td className="py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 bg-slate-100 rounded-full h-2 max-w-[150px]">
                                                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(c.completion, 100)}%` }}></div>
                                                </div>
                                                <span className="text-xs font-semibold text-slate-600">{c.completion}%</span>
                                            </div>
                                        </td>
                                        <td className="py-3 text-xs text-slate-500">{c.students}</td>
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
