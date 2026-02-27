import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import ProfileDropdown from '../../components/ProfileDropdown';
import api from '../../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [enrollmentTrend, setEnrollmentTrend] = useState([]);
  const [courseCompletion, setCourseCompletion] = useState([]);
  const [difficultTopics, setDifficultTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef(null);

  const userName = localStorage.getItem('userName') || 'Admin';
  const userEmail = localStorage.getItem('userEmail') || 'admin@platform.com';
  const firstName = userName.split(' ')[0];

  // Fetch admin data from real API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, usersRes, actRes, trendRes, compRes, topicsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/users?page=1&page_size=10'),
          api.get('/admin/activities?limit=20'),
          api.get('/admin/analytics/enrollment-trend'),
          api.get('/admin/analytics/completion'),
          api.get('/admin/analytics/difficult-topics'),
        ]);

        setStats(statsRes.data);
        setUsers(usersRes.data.users || []);
        setActivities(Array.isArray(actRes.data) ? actRes.data : []);
        setEnrollmentTrend(Array.isArray(trendRes.data) ? trendRes.data : []);
        setCourseCompletion(Array.isArray(compRes.data) ? compRes.data : []);
        setDifficultTopics(Array.isArray(topicsRes.data) ? topicsRes.data : []);
      } catch (err) {
        console.error('Failed to fetch admin data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Close notifications on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  // Toggle user active status
  const handleToggleUser = async (userId) => {
    const handleToggleUser = async (userId) => {
      try {
        const res = await api.post(`/admin/users/${userId}/toggle-active`);
        const updated = res.data;
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: updated.is_active } : u));
      } catch (err) {
        console.error('Failed to toggle user:', err);
      }
    };
  };

  // Role distribution from real stats
  const roleDist = stats?.role_distribution?.length
    ? stats.role_distribution.map(r => ({ name: r.role.charAt(0).toUpperCase() + r.role.slice(1), value: r.count }))
    : [];

  const PIE_COLORS = ['#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];

  const kpis = [
    {
      label: 'Total Users',
      value: stats?.total_users ?? '—',
      icon: 'group',
      trend: `${stats?.active_users ?? 0} active`,
      trendUp: true,
      color: 'blue',
    },
    {
      label: 'Active Courses',
      value: stats?.total_courses ?? '—',
      icon: 'school',
      trend: `${stats?.total_modules ?? 0} modules`,
      trendUp: true,
      color: 'emerald',
    },
    {
      label: 'Avg Completion',
      value: stats ? `${stats.avg_completion_rate}%` : '—',
      icon: 'trending_up',
      trend: `${stats?.total_lessons ?? 0} lessons`,
      trendUp: true,
      color: 'amber',
    },
    {
      label: 'AI Processed',
      value: stats?.processed_lessons ?? '—',
      icon: 'psychology',
      trend: `${stats?.unprocessed_lessons ?? 0} pending`,
      trendUp: false,
      color: 'purple',
    },
  ];

  const colorMap = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'bg-blue-600', text: 'text-blue-600', badge: 'bg-blue-100 text-blue-700' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'bg-emerald-600', text: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'bg-amber-500', text: 'text-amber-600', badge: 'bg-amber-100 text-amber-700' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'bg-purple-600', text: 'text-purple-600', badge: 'bg-purple-100 text-purple-700' },
  };

  const sidebarItems = [
    { key: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
    { key: 'users', icon: 'group', label: 'Users', path: '/admin/users' },
    { key: 'courses', icon: 'school', label: 'Courses', path: '/admin/courses' },
    { key: 'analytics', icon: 'monitoring', label: 'Analytics', path: '/admin/analytics' },
    { key: 'ai', icon: 'psychology', label: 'AI Insights', path: '/admin/ai-insights' },
    { key: 'certificates', icon: 'workspace_premium', label: 'Certificates', path: '/admin/certificates' },
    { key: 'settings', icon: 'settings', label: 'Settings', path: '/admin/settings' },
  ];

  // Action icons for activity feed
  const actionIcons = {
    user_registered: 'person_add', login_attempt: 'login', course_created: 'add_circle',
    module_created: 'folder', material_uploaded: 'upload_file', transcript_generated: 'subtitles',
    user_toggled: 'toggle_on', password_reset: 'lock_reset',
  };

  const actionIconColors = {
    user_registered: 'text-blue-600', login_attempt: 'text-slate-500', course_created: 'text-emerald-600',
    module_created: 'text-purple-600', material_uploaded: 'text-emerald-600', transcript_generated: 'text-purple-600',
    user_toggled: 'text-amber-600', password_reset: 'text-rose-600',
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* ─── Sidebar ─── */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-hidden">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-2 rounded-xl shadow-lg shadow-blue-600/20">
            <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-800">AI LMS</h2>
            <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          {sidebarItems.map(item => (
            <button
              key={item.key}
              onClick={() => {
                setActiveNav(item.key);
                if (item.path) navigate(item.path);
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left transition-all cursor-pointer ${activeNav === item.key
                ? 'bg-blue-600/10 text-blue-600 font-semibold shadow-sm'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
            >
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 mx-4 mb-4 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-base">security</span>
            <span className="text-xs font-semibold">Admin Access</span>
          </div>
          <p className="text-[10px] text-blue-100 leading-relaxed">
            All actions are logged and protected by role-based access control.
          </p>
        </div>
      </aside>

      {/* ─── Main Area ─── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ─── Top Bar ─── */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
              <input
                type="text" placeholder="Search users, courses..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Live badge */}
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-medium text-emerald-700">Live</span>
            </span>

            {/* Notifications — REAL activity data */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
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
                      <div key={a.id} className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50 border-b border-slate-100/50`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-slate-100`}>
                          <span className={`material-symbols-outlined text-base ${actionIconColors[a.action] || 'text-slate-500'}`}>
                            {actionIcons[a.action] || 'info'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800">{a.user_name || 'System'}</p>
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
              {/* Welcome */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800">Welcome back, {firstName} 👋</h1>
                <p className="text-sm text-slate-500 mt-1">Here's what's happening on your learning platform — real-time data</p>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-4 gap-5 mb-8">
                {kpis.map((kpi, i) => {
                  const c = colorMap[kpi.color];
                  return (
                    <div key={i} className={`${c.bg} border ${c.border} rounded-2xl p-5 transition-all hover:shadow-lg hover:shadow-${kpi.color}-100`}>
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
                {/* Enrollment Trend — REAL DATA */}
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
                          <linearGradient id="enrollGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" />
                        <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, fontSize: 12 }} />
                        <Area type="monotone" dataKey="users" stroke="#3b82f6" fill="url(#enrollGrad)" strokeWidth={2.5} dot={{ r: 3, fill: '#3b82f6' }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Role Distribution — REAL DATA */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-800 text-sm">User Roles</h3>
                  </div>
                  {roleDist.length === 0 ? (
                    <div className="h-44 flex items-center justify-center text-slate-400 text-sm">No user data yet</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={176}>
                      <PieChart>
                        <Pie data={roleDist} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="value" paddingAngle={3} stroke="none">
                          {roleDist.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                  <div className="flex justify-center gap-4 mt-1">
                    {roleDist.map((r, i) => (
                      <span key={r.name} className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}></span>
                        {r.name} ({r.value})
                      </span>
                    ))}
                  </div>
                </div>

                {/* Course Completion — REAL DATA */}
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

              {/* Bottom Row: Difficult Topics + Users Table */}
              <div className="grid grid-cols-3 gap-5 mb-8">
                {/* Difficult Topics — REAL DATA */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-rose-500 text-lg">local_fire_department</span>
                    <h3 className="font-semibold text-slate-800 text-sm">Difficult Topics</h3>
                  </div>
                  {difficultTopics.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-sm">No topic data yet</div>
                  ) : (
                    <div className="space-y-3">
                      {difficultTopics.map((topic, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-lg">{topic.difficulty >= 80 ? '🔴' : topic.difficulty >= 65 ? '🟠' : '🟡'}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-slate-700 font-medium truncate">{topic.topic}</span>
                              <span className="text-xs text-red-500 font-semibold ml-2">{topic.difficulty}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5">
                              <div className="bg-gradient-to-r from-rose-500 to-amber-500 h-1.5 rounded-full" style={{ width: `${Math.min(topic.difficulty, 100)}%` }}></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Users Table — REAL DATA */}
                <div className="col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-800 text-sm">Recent Users</h3>
                    <button onClick={() => navigate('/admin/users')} className="text-xs text-blue-600 hover:text-blue-700 font-medium">View All →</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-slate-400 text-xs uppercase tracking-wider">
                          <th className="text-left pb-3 font-medium">User</th>
                          <th className="text-left pb-3 font-medium">Role</th>
                          <th className="text-left pb-3 font-medium">Status</th>
                          <th className="text-left pb-3 font-medium">Last Login</th>
                          <th className="text-right pb-3 font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.length === 0 ? (
                          <tr><td colSpan={5} className="py-8 text-center text-slate-400">No users found</td></tr>
                        ) : users.slice(0, 6).map(u => (
                          <tr key={u.id} className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors">
                            <td className="py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-xs font-bold shadow">
                                  {u.full_name?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                                <div>
                                  <p className="font-medium text-slate-800 text-xs">{u.full_name}</p>
                                  <p className="text-[10px] text-slate-400">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3">
                              <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${u.role === 'admin' ? 'bg-red-100 text-red-700'
                                : u.role === 'trainer' ? 'bg-blue-100 text-blue-700'
                                  : 'bg-emerald-100 text-emerald-700'
                                }`}>{u.role}</span>
                            </td>
                            <td className="py-3">
                              <span className={`flex items-center gap-1.5 text-xs font-medium ${u.is_active ? 'text-emerald-600' : 'text-red-500'}`}>
                                <span className={`w-2 h-2 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                {u.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="py-3 text-xs text-slate-400">
                              {u.last_login ? new Date(u.last_login).toLocaleString() : 'Never'}
                            </td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() => handleToggleUser(u.id)}
                                className={`text-[10px] font-semibold px-3 py-1.5 rounded-lg transition-colors ${u.is_active
                                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                  : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                  }`}
                              >
                                {u.is_active ? 'Disable' : 'Enable'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Quick Actions Row */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { icon: 'group', label: 'Manage Users', desc: 'View & manage users', path: '/admin/users', color: 'blue' },
                  { icon: 'add_circle', label: 'Create Course', desc: 'Add new course', path: '/admin/courses', color: 'emerald' },
                  { icon: 'monitoring', label: 'Analytics', desc: 'View reports', path: '/admin/analytics', color: 'amber' },
                  { icon: 'download', label: 'Export Data', desc: 'Download CSV', path: '/admin/analytics', color: 'purple' },
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
              {/* Admin Profile */}
              <div className="text-center mb-6 pb-6 border-b border-slate-100">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-xl font-bold mx-auto shadow-lg shadow-blue-600/20">
                  {firstName.charAt(0)}
                </div>
                <h3 className="mt-3 font-semibold text-slate-800">{userName}</h3>
                <p className="text-xs text-slate-500">{userEmail}</p>
                <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-semibold">
                  <span className="material-symbols-outlined text-[12px]">shield</span> Admin
                </span>
              </div>

              {/* Platform Health */}
              <div className="mb-6">
                <h4 className="font-semibold text-sm text-slate-800 mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-500 text-lg">monitor_heart</span>
                  Platform Health
                </h4>
                <div className="space-y-2.5">
                  {[
                    { label: 'API Status', ok: true },
                    { label: 'Database', ok: true },
                    { label: 'Azure Blob', ok: true },
                    { label: 'AI Services', ok: (stats?.processed_lessons ?? 0) > 0 },
                  ].map(s => (
                    <div key={s.label} className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50">
                      <span className="text-xs text-slate-600">{s.label}</span>
                      <span className={`flex items-center gap-1 text-[10px] font-semibold ${s.ok ? 'text-emerald-600' : 'text-amber-600'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.ok ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                        {s.ok ? 'Online' : 'Check'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Stats */}
              <div className="mb-6">
                <h4 className="font-semibold text-sm text-slate-800 mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-purple-600 text-lg">smart_toy</span>
                  AI Usage
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between px-3 py-2 rounded-lg bg-slate-50">
                    <span className="text-slate-600">Processed</span>
                    <span className="font-bold text-slate-800">{stats?.processed_lessons ?? 0}</span>
                  </div>
                  <div className="flex justify-between px-3 py-2 rounded-lg bg-slate-50">
                    <span className="text-slate-600">Pending</span>
                    <span className="font-bold text-amber-600">{stats?.unprocessed_lessons ?? 0}</span>
                  </div>
                  <div className="flex justify-between px-3 py-2 rounded-lg bg-slate-50">
                    <span className="text-slate-600">Total Lessons</span>
                    <span className="font-bold text-slate-800">{stats?.total_lessons ?? 0}</span>
                  </div>
                </div>
              </div>

              {/* Recent Activity Feed — REAL DATA */}
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
                        <p className="text-xs text-slate-700">
                          <span className="font-semibold">{a.user_name || 'System'}</span>
                        </p>
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

export default AdminDashboard;
