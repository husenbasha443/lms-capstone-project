import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import TrainerSidebar from '../../components/TrainerSidebar';
import ProfileDropdown from '../../components/ProfileDropdown';

import api from '../../services/api';

const TrainerDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [activities, setActivities] = useState([]);
  const [enrollmentTrend, setEnrollmentTrend] = useState([]);
  const [courseCompletion, setCourseCompletion] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef(null);

  const userName = localStorage.getItem('userName') || 'Trainer';
  const userEmail = localStorage.getItem('userEmail') || '';
  const firstName = userName.split(' ')[0];
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, coursesRes, actRes, trendRes, compRes] = await Promise.all([
          api.get('/trainer/stats'),
          api.get('/trainer/courses'),
          api.get('/trainer/activities?limit=20'),
          api.get('/trainer/analytics/enrollment-trend'),
          api.get('/trainer/analytics/completion'),
        ]);

        setStats(statsRes.data);
        setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : []);
        setActivities(Array.isArray(actRes.data) ? actRes.data : []);
        setEnrollmentTrend(Array.isArray(trendRes.data) ? trendRes.data : []);
        setCourseCompletion(Array.isArray(compRes.data) ? compRes.data : []);
      } catch (err) {
        console.error('Failed to fetch trainer data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  // Transcript status distribution from courses data
  const transcriptDist = (() => {
    let completed = 0, processing = 0, none = 0;
    courses.forEach(c => c.modules?.forEach(m => {
      if (m.transcript_status === 'completed') completed++;
      else if (m.transcript_status === 'processing') processing++;
      else none++;
    }));
    return [
      { name: 'Completed', value: completed },
      { name: 'Processing', value: processing },
      { name: 'Pending', value: none },
    ].filter(d => d.value > 0);
  })();

  const PIE_COLORS = ['#10b981', '#f59e0b', '#94a3b8'];

  const kpis = [
    { label: 'My Courses', value: stats?.total_courses ?? '—', icon: 'school', trend: `${stats?.active_courses ?? 0} published`, color: 'blue' },
    { label: 'Total Modules', value: stats?.total_modules ?? '—', icon: 'folder', trend: `${stats?.total_lessons ?? 0} lessons`, color: 'emerald' },
    { label: 'Videos Uploaded', value: stats?.total_videos ?? '—', icon: 'videocam', trend: `${stats?.total_pdfs ?? 0} PDFs`, color: 'amber' },
    { label: 'Enrolled Students', value: stats?.total_students ?? '—', icon: 'group', trend: `${stats?.avg_completion ?? 0}% avg`, color: 'purple' },
  ];

  const colorMap = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'bg-blue-600', text: 'text-blue-600', badge: 'bg-blue-100 text-blue-700' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'bg-emerald-600', text: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'bg-amber-500', text: 'text-amber-600', badge: 'bg-amber-100 text-amber-700' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'bg-purple-600', text: 'text-purple-600', badge: 'bg-purple-100 text-purple-700' },
  };

  const actionIcons = {
    course_created: 'add_circle', course_updated: 'edit', course_deleted: 'delete',
    module_created: 'folder', video_uploaded: 'videocam', pdf_uploaded: 'picture_as_pdf',
    course_published: 'publish', transcript_generated: 'subtitles',
    login_success: 'login', material_uploaded: 'upload_file',
  };
  const actionIconColors = {
    course_created: 'text-emerald-600', course_updated: 'text-blue-600', course_deleted: 'text-red-600',
    module_created: 'text-purple-600', video_uploaded: 'text-blue-600', pdf_uploaded: 'text-amber-600',
    course_published: 'text-emerald-600', transcript_generated: 'text-purple-600',
    login_success: 'text-slate-500', material_uploaded: 'text-emerald-600',
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <TrainerSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ─── Top Bar ─── */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
              <input
                type="text" placeholder="Search courses, students..."
                className="pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-medium text-emerald-700">Live</span>
            </span>

            <div className="relative" ref={notificationsRef}>
              <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors">
                <span className="material-symbols-outlined text-slate-600">notifications</span>
                {activities.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                    {Math.min(activities.length, 9)}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-semibold text-sm text-slate-800">Recent Activity</span>
                    <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{activities.length} events</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {activities.slice(0, 8).map(a => (
                      <div key={a.id} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 border-b border-slate-100/50">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-slate-100">
                          <span className={`material-symbols-outlined text-base ${actionIconColors[a.action] || 'text-slate-500'}`}>
                            {actionIcons[a.action] || 'info'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-500 truncate">{a.detail || a.action.replace(/_/g, ' ')}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{a.created_at ? new Date(a.created_at).toLocaleString() : ''}</p>
                        </div>
                      </div>
                    ))}
                    {activities.length === 0 && (
                      <div className="px-4 py-8 text-center text-slate-400 text-sm">No recent activity</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <ProfileDropdown />
          </div>
        </header>

        {/* ─── Content ─── */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex">
            {/* ─── Main Content ─── */}
            <div className="flex-1 p-8">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800">Welcome back, {firstName} 👋</h1>
                <p className="text-sm text-slate-500 mt-1">Here's your course performance overview — real-time data</p>
              </div>

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
                        <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${c.badge}`}>
                          {kpi.trend}
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-slate-800 mb-0.5">{kpi.value}</p>
                      <p className="text-xs text-slate-500">{kpi.label}</p>
                    </div>
                  );
                })}
              </div>

              {/* Charts — 3-column row */}
              <div className="grid grid-cols-3 gap-5 mb-8">
                {/* Enrollment Trend */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-800 text-sm">Enrollment Trend</h3>
                    <span className="text-[10px] text-slate-400">Monthly</span>
                  </div>
                  {enrollmentTrend.length === 0 ? (
                    <div className="h-44 flex items-center justify-center text-slate-400 text-sm">No enrollment data yet</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={176}>
                      <AreaChart data={enrollmentTrend}>
                        <defs>
                          <linearGradient id="enrollGradTrainer" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" />
                        <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, fontSize: 12 }} />
                        <Area type="monotone" dataKey="users" stroke="#3b82f6" fill="url(#enrollGradTrainer)" strokeWidth={2.5} dot={{ r: 3, fill: '#3b82f6' }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Transcript Status */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-800 text-sm">Transcript Status</h3>
                  </div>
                  {transcriptDist.length === 0 ? (
                    <div className="h-44 flex items-center justify-center text-slate-400 text-sm">No transcript data yet</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={176}>
                      <PieChart>
                        <Pie data={transcriptDist} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="value" paddingAngle={3} stroke="none">
                          {transcriptDist.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                  <div className="flex justify-center gap-4 mt-1">
                    {transcriptDist.map((r, i) => (
                      <span key={r.name} className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}></span>
                        {r.name} ({r.value})
                      </span>
                    ))}
                  </div>
                </div>

                {/* Course Completion */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-800 text-sm">Course Completion</h3>
                  </div>
                  {courseCompletion.length === 0 ? (
                    <div className="h-44 flex items-center justify-center text-slate-400 text-sm">No completion data yet</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={176}>
                      <BarChart data={courseCompletion} layout="vertical">
                        <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} />
                        <YAxis dataKey="name" type="category" width={85} tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, fontSize: 12 }} />
                        <Bar dataKey="completion" fill="#3b82f6" radius={[0, 8, 8, 0]} barSize={16} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Bottom Row: My Courses Table */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-800 text-sm">My Courses</h3>
                  <button onClick={() => navigate('/trainer/courses')} className="text-xs text-blue-600 hover:text-blue-700 font-medium">Manage All →</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-slate-400 text-xs uppercase tracking-wider">
                        <th className="text-left pb-3 font-medium">Course</th>
                        <th className="text-left pb-3 font-medium">Modules</th>
                        <th className="text-left pb-3 font-medium">Students</th>
                        <th className="text-left pb-3 font-medium">Status</th>
                        <th className="text-left pb-3 font-medium">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.length === 0 ? (
                        <tr><td colSpan={5} className="py-8 text-center text-slate-400">No courses yet — create your first course!</td></tr>
                      ) : courses.slice(0, 6).map(c => (
                        <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors">
                          <td className="py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-xs font-bold shadow">
                                {c.title?.charAt(0)?.toUpperCase() || '?'}
                              </div>
                              <div>
                                <p className="font-medium text-slate-800 text-xs">{c.title}</p>
                                <p className="text-[10px] text-slate-400 truncate max-w-[180px]">{c.description || 'No description'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 text-xs text-slate-600">{c.modules?.length || 0} modules</td>
                          <td className="py-3 text-xs text-slate-600">{c.enrolled_count || 0}</td>
                          <td className="py-3">
                            <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${c.is_published
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                              }`}>
                              {c.is_published ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="py-3 text-xs text-slate-400">{c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Quick Actions Row */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { icon: 'add_circle', label: 'Create Course', desc: 'Add new course', path: '/trainer/courses', color: 'blue' },
                  { icon: 'group', label: 'My Students', desc: 'View student progress', path: '/trainer/students', color: 'emerald' },
                  { icon: 'monitoring', label: 'Analytics', desc: 'View reports', path: '/trainer/analytics', color: 'amber' },
                  { icon: 'upload_file', label: 'Upload Content', desc: 'Videos & PDFs', path: '/trainer/courses', color: 'purple' },
                ].map((action, i) => {
                  const c = colorMap[action.color];
                  return (
                    <button key={i} onClick={() => navigate(action.path)} className={`${c.bg} border ${c.border} rounded-2xl p-4 text-left transition-all hover:shadow-md group`}>
                      <div className={`w-9 h-9 ${c.icon} rounded-xl flex items-center justify-center shadow mb-3`}>
                        <span className="material-symbols-outlined text-white text-lg">{action.icon}</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">{action.label}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{action.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ─── Right Sidebar ─── */}
            <div className="w-72 border-l border-slate-200 bg-white p-6 flex-shrink-0 overflow-y-auto">
              {/* Trainer Profile */}
              <div className="text-center mb-6 pb-6 border-b border-slate-100">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-xl font-bold mx-auto shadow-lg shadow-blue-600/20">
                  {firstName.charAt(0)}
                </div>
                <h3 className="mt-3 font-semibold text-slate-800">{userName}</h3>
                <p className="text-xs text-slate-500">{userEmail}</p>
                <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-semibold">
                  <span className="material-symbols-outlined text-[12px]">school</span> Trainer
                </span>
              </div>

              {/* Course Health */}
              <div className="mb-6">
                <h4 className="font-semibold text-sm text-slate-800 mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-500 text-lg">monitor_heart</span>
                  Course Health
                </h4>
                <div className="space-y-2.5">
                  {[
                    { label: 'Published', value: stats?.active_courses ?? 0, ok: true },
                    { label: 'Drafts', value: (stats?.total_courses ?? 0) - (stats?.active_courses ?? 0), ok: false },
                    { label: 'Total Videos', value: stats?.total_videos ?? 0, ok: true },
                    { label: 'Total PDFs', value: stats?.total_pdfs ?? 0, ok: true },
                  ].map(s => (
                    <div key={s.label} className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50">
                      <span className="text-xs text-slate-600">{s.label}</span>
                      <span className={`text-xs font-bold ${s.ok ? 'text-slate-800' : 'text-amber-600'}`}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Stats */}
              <div className="mb-6">
                <h4 className="font-semibold text-sm text-slate-800 mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-purple-600 text-lg">smart_toy</span>
                  AI Processing
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between px-3 py-2 rounded-lg bg-slate-50">
                    <span className="text-slate-600">Transcripts</span>
                    <span className="font-bold text-slate-800">{stats?.total_transcripts ?? 0}</span>
                  </div>
                  <div className="flex justify-between px-3 py-2 rounded-lg bg-slate-50">
                    <span className="text-slate-600">Processed</span>
                    <span className="font-bold text-emerald-600">{stats?.processed_lessons ?? 0}</span>
                  </div>
                  <div className="flex justify-between px-3 py-2 rounded-lg bg-slate-50">
                    <span className="text-slate-600">Pending</span>
                    <span className="font-bold text-amber-600">{stats?.unprocessed_lessons ?? 0}</span>
                  </div>
                </div>
              </div>

              {/* Activity Feed */}
              <div>
                <h4 className="font-semibold text-sm text-slate-800 mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 text-lg">history</span>
                  Recent Activity
                </h4>
                <div className="space-y-2">
                  {activities.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">No activity yet</p>
                  ) : activities.slice(0, 8).map(a => (
                    <div key={a.id} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                      <span className={`material-symbols-outlined text-base mt-0.5 ${actionIconColors[a.action] || 'text-slate-500'}`}>
                        {actionIcons[a.action] || 'info'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-slate-500 truncate">{a.detail || a.action.replace(/_/g, ' ')}</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">{a.created_at ? new Date(a.created_at).toLocaleString() : ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerDashboard;
