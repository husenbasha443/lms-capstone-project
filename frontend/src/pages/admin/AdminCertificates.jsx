import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import ProfileDropdown from '../../components/ProfileDropdown';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API = `${API_BASE}/api/admin`;

export default function AdminCertificates() {
    const [certs, setCerts] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const fetchCerts = async (p = 1) => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/certificates?page=${p}&page_size=15`, { headers });
            const data = await res.json();
            setCerts(data.certificates || []);
            setTotal(data.total || 0);
        } catch { setCerts([]); }
        setLoading(false);
    };

    useEffect(() => { fetchCerts(page); }, [page]);

    const revokeCert = async (id) => {
        if (!confirm('Revoke this certificate?')) return;
        await fetch(`${API}/certificates/${id}/revoke`, { method: 'POST', headers });
        fetchCerts(page);
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <AdminSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between flex-shrink-0">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Certificates</h1>
                        <p className="text-xs text-slate-500 mt-0.5">Issued certificates — real data from database</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            {total} issued
                        </span>
                        <ProfileDropdown />
                    </div>
                </header>

                <main className="flex-1 p-8 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="px-6 py-4 text-left text-xs text-slate-400 font-medium uppercase tracking-wider">Student</th>
                                    <th className="px-6 py-4 text-left text-xs text-slate-400 font-medium uppercase tracking-wider">Course</th>
                                    <th className="px-6 py-4 text-left text-xs text-slate-400 font-medium uppercase tracking-wider">Verification ID</th>
                                    <th className="px-6 py-4 text-left text-xs text-slate-400 font-medium uppercase tracking-wider">AI Score</th>
                                    <th className="px-6 py-4 text-left text-xs text-slate-400 font-medium uppercase tracking-wider">Issued</th>
                                    <th className="px-6 py-4 text-left text-xs text-slate-400 font-medium uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs text-slate-400 font-medium uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="border-b border-slate-50">
                                            <td colSpan={7} className="px-6 py-5"><div className="h-4 bg-slate-100 rounded animate-pulse w-1/2"></div></td>
                                        </tr>
                                    ))
                                ) : certs.length === 0 ? (
                                    <tr><td colSpan={7} className="px-6 py-16 text-center">
                                        <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-3">
                                            <span className="material-symbols-outlined text-amber-600 text-2xl">workspace_premium</span>
                                        </div>
                                        <p className="text-slate-500">No certificates issued yet</p>
                                    </td></tr>
                                ) : certs.map(c => (
                                    <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-800">{c.student_name}</div>
                                            <div className="text-[10px] text-slate-400">{c.student_email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{c.course_title}</td>
                                        <td className="px-6 py-4">
                                            <code className="px-2 py-1 rounded-lg bg-slate-100 text-blue-700 text-xs font-mono">{c.verification_id}</code>
                                        </td>
                                        <td className="px-6 py-4">
                                            {c.ai_mastery_score != null ? (
                                                <span className={`text-sm font-bold ${c.ai_mastery_score >= 80 ? 'text-emerald-600' : c.ai_mastery_score >= 60 ? 'text-amber-600' : 'text-red-500'}`}>
                                                    {c.ai_mastery_score}%
                                                </span>
                                            ) : <span className="text-slate-400">—</span>}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-400">{c.issued_at ? new Date(c.issued_at).toLocaleDateString() : '—'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`flex items-center gap-1.5 text-xs font-medium ${c.revoked ? 'text-red-500' : 'text-emerald-600'}`}>
                                                <span className={`w-2 h-2 rounded-full ${c.revoked ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                                                {c.revoked ? 'Revoked' : 'Valid'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                {c.certificate_url && (
                                                    <a href={c.certificate_url} target="_blank" rel="noopener noreferrer"
                                                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors" title="Download">
                                                        <span className="material-symbols-outlined text-lg">download</span>
                                                    </a>
                                                )}
                                                {!c.revoked && (
                                                    <button onClick={() => revokeCert(c.id)}
                                                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors" title="Revoke">
                                                        <span className="material-symbols-outlined text-lg">block</span>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {total > 15 && (
                        <div className="flex items-center justify-between mt-4">
                            <span className="text-sm text-slate-500">Page {page} of {Math.ceil(total / 15)}</span>
                            <div className="flex gap-2">
                                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                                    className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm disabled:opacity-40 hover:bg-slate-50">Previous</button>
                                <button disabled={page >= Math.ceil(total / 15)} onClick={() => setPage(p => p + 1)}
                                    className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm disabled:opacity-40 hover:bg-slate-50">Next</button>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
