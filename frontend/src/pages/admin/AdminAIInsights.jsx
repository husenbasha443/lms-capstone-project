import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import ProfileDropdown from '../../components/ProfileDropdown';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API = `${API_BASE}/api/admin`;

export default function AdminAIInsights() {
    const [stats, setStats] = useState(null);
    const [activities, setActivities] = useState([]);
    const [completion, setCompletion] = useState([]);
    const [topics, setTopics] = useState([]);
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        const load = async () => {
            try {
                const [s, a, c, t] = await Promise.all([
                    fetch(`${API}/stats`, { headers }).then(r => r.json()),
                    fetch(`${API}/activities?limit=20`, { headers }).then(r => r.json()),
                    fetch(`${API}/analytics/completion`, { headers }).then(r => r.json()),
                    fetch(`${API}/analytics/difficult-topics`, { headers }).then(r => r.json()),
                ]);
                setStats(s);
                setActivities(Array.isArray(a) ? a : []);
                setCompletion(Array.isArray(c) ? c : []);
                setTopics(Array.isArray(t) ? t : []);
                generateInsights(s, c, t, a);
            } catch { }
            setLoading(false);
        };
        load();
    }, []);

    const generateInsights = (s, c, t, a) => {
        const generated = [];

        if (s) {
            if (s.total_users > 0) generated.push({ type: 'info', icon: 'group', text: `Platform has ${s.total_users} registered users with ${s.active_users} currently active (${Math.round((s.active_users / s.total_users) * 100)}% active rate)` });
            if (s.avg_completion_rate > 0) generated.push({ type: s.avg_completion_rate < 50 ? 'warning' : 'success', icon: 'trending_up', text: `Average completion rate across all courses is ${s.avg_completion_rate}%${s.avg_completion_rate < 50 ? ' — consider reviewing course difficulty' : ''}` });
            if (s.unprocessed_lessons > 0) generated.push({ type: 'warning', icon: 'pending', text: `${s.unprocessed_lessons} lessons are still unprocessed by AI. Consider triggering transcript generation.` });
            if (s.processed_lessons > 0) generated.push({ type: 'success', icon: 'check_circle', text: `${s.processed_lessons} lessons have been AI-processed with transcripts and embeddings.` });
        }

        if (Array.isArray(c) && c.length > 0) {
            const lowest = c.filter(x => x.completion < 30);
            if (lowest.length > 0) generated.push({ type: 'warning', icon: 'warning', text: `${lowest.length} course(s) have completion rates below 30%: ${lowest.map(x => x.name).join(', ')}. Students may be struggling.` });
            const highest = c.filter(x => x.completion > 80);
            if (highest.length > 0) generated.push({ type: 'success', icon: 'emoji_events', text: `${highest.length} course(s) exceed 80% completion: ${highest.map(x => x.name).join(', ')}. Well done!` });
        }

        if (Array.isArray(t) && t.length > 0) {
            generated.push({ type: 'warning', icon: 'psychology', text: `Students struggle most with: ${t.slice(0, 3).map(x => `"${x.topic}" (${x.difficulty}% difficulty)`).join(', ')}` });
        }

        if (Array.isArray(a) && a.length > 0) {
            const loginCount = a.filter(x => x.action === 'login_attempt').length;
            const regCount = a.filter(x => x.action === 'user_registered').length;
            if (loginCount > 0) generated.push({ type: 'info', icon: 'login', text: `${loginCount} login events recorded in recent activity.` });
            if (regCount > 0) generated.push({ type: 'success', icon: 'person_add', text: `${regCount} new user registrations in recent activity. Growth is healthy!` });
        }

        if (generated.length === 0) {
            generated.push({ type: 'info', icon: 'info', text: 'Not enough data to generate insights yet. Add courses, users, and track progress to unlock AI-powered analytics.' });
        }

        setInsights(generated);
    };

    const typeStyles = {
        success: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'text-emerald-600', iconBg: 'bg-emerald-100' },
        warning: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-600', iconBg: 'bg-amber-100' },
        info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600', iconBg: 'bg-blue-100' },
    };

    const actionIcons = {
        user_registered: 'person_add', login_attempt: 'login', course_created: 'add_circle',
        material_uploaded: 'upload_file', transcript_generated: 'subtitles', user_toggled: 'toggle_on', password_reset: 'lock_reset',
    };
    const actionIconColors = {
        user_registered: 'text-blue-600', login_attempt: 'text-slate-500', course_created: 'text-emerald-600',
        material_uploaded: 'text-emerald-600', transcript_generated: 'text-purple-600', user_toggled: 'text-amber-600', password_reset: 'text-rose-600',
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <AdminSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between flex-shrink-0">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">AI Insights</h1>
                        <p className="text-xs text-slate-500 mt-0.5">Intelligent analysis generated from your platform data</p>
                    </div>
                    <ProfileDropdown />
                </header>

                <main className="flex-1 p-8 overflow-y-auto">
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>)}
                        </div>
                    ) : (
                        <>
                            {/* Summary Cards */}
                            {stats && (
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                                    {[
                                        { label: 'AI Processed', value: stats.processed_lessons, icon: 'smart_toy', color: 'purple' },
                                        { label: 'Unprocessed', value: stats.unprocessed_lessons, icon: 'pending', color: 'amber' },
                                        { label: 'Avg Score', value: `${stats.avg_completion_rate}%`, icon: 'analytics', color: 'blue' },
                                        { label: 'Difficult Topics', value: topics.length, icon: 'psychology', color: 'rose' },
                                    ].map((card, i) => {
                                        const colors = {
                                            purple: { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'bg-purple-600', text: 'text-purple-600' },
                                            amber: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'bg-amber-500', text: 'text-amber-600' },
                                            blue: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'bg-blue-600', text: 'text-blue-600' },
                                            rose: { bg: 'bg-rose-50', border: 'border-rose-200', icon: 'bg-rose-600', text: 'text-rose-600' },
                                        };
                                        const c = colors[card.color];
                                        return (
                                            <div key={i} className={`${c.bg} border ${c.border} rounded-2xl p-5`}>
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className={`w-10 h-10 ${c.icon} rounded-xl flex items-center justify-center shadow-lg`}>
                                                        <span className="material-symbols-outlined text-white text-xl">{card.icon}</span>
                                                    </div>
                                                </div>
                                                <div className="text-2xl font-bold text-slate-800">{card.value}</div>
                                                <div className="text-xs text-slate-500 mt-1">{card.label}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Insights */}
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center">
                                        <span className="material-symbols-outlined text-purple-600 text-lg">auto_awesome</span>
                                    </div>
                                    <h2 className="font-semibold text-slate-800">Generated Insights</h2>
                                </div>
                                <div className="space-y-3">
                                    {insights.map((ins, i) => {
                                        const s = typeStyles[ins.type];
                                        return (
                                            <div key={i} className={`${s.bg} border ${s.border} rounded-2xl p-4 transition-all hover:shadow-sm`}>
                                                <div className="flex items-start gap-3">
                                                    <div className={`w-8 h-8 rounded-lg ${s.iconBg} flex items-center justify-center flex-shrink-0`}>
                                                        <span className={`material-symbols-outlined text-base ${s.icon}`}>{ins.icon}</span>
                                                    </div>
                                                    <p className="text-sm text-slate-700 leading-relaxed">{ins.text}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                                        <span className="material-symbols-outlined text-blue-600 text-lg">history</span>
                                    </div>
                                    <h2 className="font-semibold text-slate-800">Recent Platform Activity</h2>
                                </div>
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                    {activities.length === 0 ? (
                                        <div className="py-12 text-center text-slate-400 text-sm">No activity data yet</div>
                                    ) : (
                                        <div className="divide-y divide-slate-100">
                                            {activities.slice(0, 15).map(a => (
                                                <div key={a.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                                                        <span className={`material-symbols-outlined text-base ${actionIconColors[a.action] || 'text-slate-500'}`}>
                                                            {actionIcons[a.action] || 'info'}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm text-slate-700"><span className="font-semibold text-slate-800">{a.user_name || 'System'}</span> — {a.action.replace(/_/g, ' ')}</p>
                                                        {a.detail && <p className="text-xs text-slate-500 mt-0.5 truncate">{a.detail}</p>}
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        {a.user_role && <span className="text-[10px] text-slate-400">{a.user_role}</span>}
                                                        <div className="text-[10px] text-slate-400">{a.created_at ? new Date(a.created_at).toLocaleString() : ''}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}
