import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import AdminSidebar from '../../components/AdminSidebar';
import ProfileDropdown from '../../components/ProfileDropdown';

import api from '../../services/api';

export default function AdminAnalytics() {
    const [completion, setCompletion] = useState([]);
    const [topics, setTopics] = useState([]);
    const [trend, setTrend] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [c, t, tr, r] = await Promise.all([
                    api.get('/admin/analytics/completion'),
                    api.get('/admin/analytics/difficult-topics'),
                    api.get('/admin/analytics/enrollment-trend'),
                    api.get('/admin/analytics/registrations'),
                ]);
                setCompletion(Array.isArray(c.data) ? c.data : []);
                setTopics(Array.isArray(t.data) ? t.data : []);
                setTrend(Array.isArray(tr.data) ? tr.data : []);
                setRegistrations(Array.isArray(r.data) ? r.data : []);
            } catch { }
            setLoading(false);
        };
        load();
    }, []);

    const exportReport = async (type) => {
        try {
            const res = await api.get(`/admin/export/${type}`, { responseType: 'blob' });
            const blob = res.data;
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `${type}_report.csv`; a.click();
            URL.revokeObjectURL(url);
        } catch { alert('Export failed'); }
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <AdminSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between flex-shrink-0">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Analytics & Reports</h1>
                        <p className="text-xs text-slate-500 mt-0.5">Real-time platform analytics from database</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {['users', 'courses', 'activities'].map(t => (
                            <button key={t} onClick={() => exportReport(t)}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-800 border border-slate-200 transition-all">
                                <span className="material-symbols-outlined text-base">download</span>
                                {t.charAt(0).toUpperCase() + t.slice(1)}
                            </button>
                        ))}
                        <ProfileDropdown />
                    </div>
                </header>

                <main className="flex-1 p-8 overflow-y-auto">
                    {loading ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            {[1, 2, 3, 4].map(i => <div key={i} className="h-72 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            {/* Enrollment Trend */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="font-semibold text-slate-800">Enrollment Trend</h3>
                                        <p className="text-xs text-slate-500 mt-0.5">Monthly registrations</p>
                                    </div>
                                    <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                                        <span className="material-symbols-outlined text-blue-600 text-lg">trending_up</span>
                                    </div>
                                </div>
                                {trend.length === 0 ? (
                                    <div className="h-52 flex items-center justify-center text-slate-400 text-sm">No enrollment data yet</div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={220}>
                                        <AreaChart data={trend}>
                                            <defs>
                                                <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" />
                                            <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
                                            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
                                            <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, fontSize: 12 }} />
                                            <Area type="monotone" dataKey="users" stroke="#3b82f6" fill="url(#trendGrad)" strokeWidth={2.5} dot={{ r: 3, fill: '#3b82f6' }} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </div>

                            {/* Course Completion Rates */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="font-semibold text-slate-800">Course Completion Rates</h3>
                                        <p className="text-xs text-slate-500 mt-0.5">Per-course completion %</p>
                                    </div>
                                    <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
                                        <span className="material-symbols-outlined text-emerald-600 text-lg">bar_chart</span>
                                    </div>
                                </div>
                                {completion.length === 0 ? (
                                    <div className="h-52 flex items-center justify-center text-slate-400 text-sm">No completion data yet</div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={220}>
                                        <BarChart data={completion} layout="vertical">
                                            <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" />
                                            <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
                                            <YAxis dataKey="name" type="category" width={120} tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
                                            <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, fontSize: 12 }} />
                                            <Bar dataKey="completion" fill="#3b82f6" radius={[0, 8, 8, 0]} barSize={18} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>

                            {/* Difficult Topics */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-9 h-9 bg-rose-50 rounded-xl flex items-center justify-center">
                                        <span className="material-symbols-outlined text-rose-600 text-lg">local_fire_department</span>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-800">Most Difficult Topics</h3>
                                        <p className="text-xs text-slate-500 mt-0.5">Based on low completion & rewatch rates</p>
                                    </div>
                                </div>
                                {topics.length === 0 ? (
                                    <div className="py-12 text-center text-slate-400 text-sm">No topic data yet</div>
                                ) : (
                                    <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                                        {topics.map((t, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <span className="w-6 text-xs font-bold text-slate-400">#{i + 1}</span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-sm text-slate-700 font-medium truncate">{t.topic}</span>
                                                        <span className="text-xs text-red-500 font-semibold ml-2">{t.difficulty}%</span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                                                        <div className="h-1.5 rounded-full bg-gradient-to-r from-rose-500 to-amber-500" style={{ width: `${Math.min(t.difficulty, 100)}%` }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Recent Registrations */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center">
                                        <span className="material-symbols-outlined text-purple-600 text-lg">person_add</span>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-800">Recent Registrations</h3>
                                        <p className="text-xs text-slate-500 mt-0.5">Latest student sign-ups</p>
                                    </div>
                                </div>
                                {registrations.length === 0 ? (
                                    <div className="py-12 text-center text-slate-400 text-sm">No registrations yet</div>
                                ) : (
                                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                                        {registrations.map(r => (
                                            <div key={r.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-xs font-bold">
                                                    {r.full_name?.charAt(0)?.toUpperCase() || '?'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium text-slate-800 truncate">{r.full_name}</div>
                                                    <div className="text-[10px] text-slate-400">{r.email}</div>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${r.role === 'admin' ? 'bg-red-100 text-red-700' : r.role === 'trainer' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>{r.role}</span>
                                                    <div className="text-[10px] text-slate-400 mt-1">{r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
