import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import ProfileDropdown from '../../components/ProfileDropdown';

import api from '../../services/api';

export default function AdminUsers() {
    const [activeTab, setActiveTab] = useState('all');
    const [users, setUsers] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [resetModal, setResetModal] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [activityModal, setActivityModal] = useState(null);
    const [userActivity, setUserActivity] = useState([]);

    const fetchUsers = async (roleFilter, p = 1) => {
        setLoading(true);
        try {
            const role = roleFilter === 'all' ? '' : `&role=${roleFilter}`;
            const res = await api.get(`/admin/users?page=${p}&page_size=15${role}`);
            const data = res.data;
            setUsers(data.users || []);
            setTotal(data.total || 0);
        } catch { setUsers([]); }
        setLoading(false);
    };

    useEffect(() => { fetchUsers(activeTab, page); }, [activeTab, page]);

    const toggleActive = async (id) => {
        await api.post(`/admin/users/${id}/toggle-active`);
        fetchUsers(activeTab, page);
    };

    const approveUser = async (id) => {
        await api.post(`/admin/users/${id}/approve`);
        fetchUsers(activeTab, page);
    };

    const revokeUser = async (id) => {
        await api.post(`/admin/users/${id}/revoke`);
        fetchUsers(activeTab, page);
    };

    const changeRole = async (id, newRole) => {
        await api.post(`/admin/users/${id}/change-role`, { role: newRole });
        fetchUsers(activeTab, page);
    };

    const resetPassword = async () => {
        if (!resetModal || !newPassword) return;
        await api.post(`/admin/users/${resetModal.id}/reset-password`, { new_password: newPassword });
        setResetModal(null);
        setNewPassword('');
    };

    const viewActivity = async (userId) => {
        const res = await api.get(`/admin/users/${userId}/activity`);
        const data = res.data;
        setUserActivity(data);
        setActivityModal(userId);
    };

    const tabs = [
        { key: 'all', label: 'All Users', icon: 'group' },
        { key: 'admin', label: 'Admins', icon: 'admin_panel_settings' },
        { key: 'trainer', label: 'Trainers', icon: 'school' },
        { key: 'learner', label: 'Students', icon: 'person' },
    ];

    const actionIcons = {
        user_registered: 'person_add', login_success: 'login', login_failed: 'error',
        login_blocked: 'block', user_toggled: 'toggle_on', user_approved: 'check_circle',
        user_revoked: 'cancel', role_changed: 'swap_horiz', password_reset: 'lock_reset',
        password_changed: 'lock', course_created: 'add_circle', video_uploaded: 'videocam',
        pdf_uploaded: 'picture_as_pdf', course_published: 'publish', profile_updated: 'edit',
        material_uploaded: 'upload_file',
    };

    const statusBadge = (status) => {
        const map = {
            approved: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: 'check_circle', label: 'Approved' },
            pending: { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: 'hourglass_top', label: 'Pending' },
            revoked: { color: 'bg-red-50 text-red-700 border-red-200', icon: 'block', label: 'Revoked' },
        };
        const s = map[status] || map.pending;
        return (
            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full border ${s.color}`}>
                <span className="material-symbols-outlined text-xs">{s.icon}</span>
                {s.label}
            </span>
        );
    };

    // Separate pending users for prominent display
    const pendingUsers = users.filter(u => u.status === 'pending');
    const otherUsers = users.filter(u => u.status !== 'pending');

    return (
        <div className="flex h-screen bg-slate-50">
            <AdminSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between flex-shrink-0">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">User Management</h1>
                        <p className="text-xs text-slate-500 mt-0.5">Manage all platform users, approvals, and roles</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {pendingUsers.length > 0 && (
                            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-sm">hourglass_top</span>
                                {pendingUsers.length} pending
                            </span>
                        )}
                        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            {total} total users
                        </span>
                        <ProfileDropdown />
                    </div>
                </header>

                <main className="flex-1 p-8 overflow-y-auto">
                    {/* Tabs */}
                    <div className="flex gap-2 mb-6">
                        {tabs.map(t => (
                            <button
                                key={t.key}
                                onClick={() => { setActiveTab(t.key); setPage(1); }}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === t.key
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                    : 'bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-700 border border-slate-200'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-lg">{t.icon}</span>
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Pending Approvals Banner */}
                    {pendingUsers.length > 0 && activeTab === 'all' && (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="material-symbols-outlined text-amber-600">pending_actions</span>
                                <h3 className="font-bold text-amber-800 text-sm">Pending Approvals ({pendingUsers.length})</h3>
                            </div>
                            <div className="space-y-2">
                                {pendingUsers.map(u => (
                                    <div key={u.id} className="flex items-center justify-between bg-white rounded-xl p-3 border border-amber-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-sm font-bold">
                                                {u.full_name?.charAt(0)?.toUpperCase() || '?'}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-800">{u.full_name}</div>
                                                <div className="text-[10px] text-slate-400">{u.email} • Registered as {u.role}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => approveUser(u.id)}
                                                className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">check</span> Approve
                                            </button>
                                            <button onClick={() => revokeUser(u.id)}
                                                className="px-4 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-colors border border-red-200 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">close</span> Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="px-6 py-4 text-left text-xs text-slate-400 font-medium uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-left text-xs text-slate-400 font-medium uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-4 text-left text-xs text-slate-400 font-medium uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs text-slate-400 font-medium uppercase tracking-wider">Last Login</th>
                                    <th className="px-6 py-4 text-left text-xs text-slate-400 font-medium uppercase tracking-wider">Joined</th>
                                    <th className="px-6 py-4 text-right text-xs text-slate-400 font-medium uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="border-b border-slate-50">
                                            <td colSpan={6} className="px-6 py-5">
                                                <div className="h-4 bg-slate-100 rounded animate-pulse w-2/3"></div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (activeTab === 'all' ? otherUsers : users).length === 0 ? (
                                    <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">No users found</td></tr>
                                ) : (activeTab === 'all' ? otherUsers : users).map(u => (
                                    <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-sm font-bold shadow">
                                                    {u.full_name?.charAt(0)?.toUpperCase() || '?'}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-800">{u.full_name}</div>
                                                    <div className="text-[10px] text-slate-400">{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {u.role === 'admin' ? (
                                                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-700">admin</span>
                                            ) : (
                                                <select
                                                    value={u.role}
                                                    onChange={(e) => changeRole(u.id, e.target.value)}
                                                    className="text-[10px] font-semibold px-2 py-1 rounded-full border border-slate-200 bg-slate-50 text-slate-700 cursor-pointer outline-none focus:ring-1 focus:ring-blue-500"
                                                >
                                                    <option value="learner">learner</option>
                                                    <option value="trainer">trainer</option>
                                                </select>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {statusBadge(u.status)}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-400">
                                            {u.last_login ? new Date(u.last_login).toLocaleString() : 'Never'}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-400">
                                            {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                {u.role !== 'admin' && u.status === 'pending' && (
                                                    <button onClick={() => approveUser(u.id)} title="Approve"
                                                        className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors">
                                                        <span className="material-symbols-outlined text-lg">check_circle</span>
                                                    </button>
                                                )}
                                                {u.role !== 'admin' && u.status === 'approved' && (
                                                    <button onClick={() => revokeUser(u.id)} title="Revoke"
                                                        className="p-2 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors">
                                                        <span className="material-symbols-outlined text-lg">block</span>
                                                    </button>
                                                )}
                                                {u.role !== 'admin' && u.status === 'revoked' && (
                                                    <button onClick={() => approveUser(u.id)} title="Re-approve"
                                                        className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-400 hover:text-emerald-600 transition-colors">
                                                        <span className="material-symbols-outlined text-lg">undo</span>
                                                    </button>
                                                )}
                                                <button onClick={() => toggleActive(u.id)} title={u.is_active ? 'Deactivate' : 'Activate'}
                                                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-amber-600 transition-colors">
                                                    <span className="material-symbols-outlined text-lg">{u.is_active ? 'person_off' : 'person_add'}</span>
                                                </button>
                                                <button onClick={() => setResetModal(u)} title="Reset Password"
                                                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors">
                                                    <span className="material-symbols-outlined text-lg">lock_reset</span>
                                                </button>
                                                <button onClick={() => viewActivity(u.id)} title="View Activity"
                                                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-purple-600 transition-colors">
                                                    <span className="material-symbols-outlined text-lg">history</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {total > 15 && (
                        <div className="flex items-center justify-between mt-4">
                            <span className="text-sm text-slate-500">Page {page} of {Math.ceil(total / 15)}</span>
                            <div className="flex gap-2">
                                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                                    className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm disabled:opacity-40 hover:bg-slate-50 transition-colors">Previous</button>
                                <button disabled={page >= Math.ceil(total / 15)} onClick={() => setPage(p => p + 1)}
                                    className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm disabled:opacity-40 hover:bg-slate-50 transition-colors">Next</button>
                            </div>
                        </div>
                    )}

                    {/* Reset Password Modal */}
                    {resetModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setResetModal(null)}>
                            <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                                <h3 className="text-lg font-bold text-slate-800 mb-1">Reset Password</h3>
                                <p className="text-sm text-slate-500 mb-4">For: {resetModal.full_name} ({resetModal.email})</p>
                                <input type="password" placeholder="New password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none mb-4" />
                                <div className="flex justify-end gap-3">
                                    <button onClick={() => setResetModal(null)} className="px-4 py-2 rounded-xl text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
                                    <button onClick={resetPassword} className="px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-colors">Reset</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Activity Modal */}
                    {activityModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setActivityModal(null)}>
                            <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                                <h3 className="text-lg font-bold text-slate-800 mb-4">Activity Log</h3>
                                {userActivity.length === 0 ? (
                                    <p className="text-slate-400 text-sm">No activity recorded</p>
                                ) : (
                                    <div className="space-y-3">
                                        {userActivity.map(a => (
                                            <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                                    <span className="material-symbols-outlined text-blue-600 text-base">{actionIcons[a.action] || 'info'}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium text-slate-800">{a.action.replace(/_/g, ' ')}</div>
                                                    {a.detail && <div className="text-xs text-slate-500 mt-0.5">{a.detail}</div>}
                                                    <div className="text-[10px] text-slate-400 mt-1">{a.created_at ? new Date(a.created_at).toLocaleString() : ''}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="mt-4 flex justify-end">
                                    <button onClick={() => setActivityModal(null)} className="px-4 py-2 rounded-xl text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors">Close</button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
