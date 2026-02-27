import React, { useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import ProfileDropdown from '../../components/ProfileDropdown';

export default function AdminSettings() {
    const [transcriptAuto, setTranscriptAuto] = useState(true);
    const [aiInsightsEnabled, setAiInsightsEnabled] = useState(true);
    const [quizGenEnabled, setQuizGenEnabled] = useState(true);
    const [saved, setSaved] = useState(false);

    const envVars = [
        { label: 'Azure OpenAI Endpoint', key: 'AZURE_OPENAI_ENDPOINT', masked: false },
        { label: 'Azure OpenAI Deployment', key: 'AZURE_OPENAI_DEPLOYMENT', masked: false },
        { label: 'Azure OpenAI Key', key: 'AZURE_OPENAI_KEY', masked: true },
        { label: 'Azure Speech Region', key: 'AZURE_SPEECH_REGION', masked: false },
        { label: 'Azure Speech Key', key: 'AZURE_SPEECH_KEY', masked: true },
        { label: 'Azure Storage Account', key: 'AZURE_STORAGE_ACCOUNT_URL', masked: false },
        { label: 'Azure Client ID', key: 'AZURE_CLIENT_ID', masked: false },
        { label: 'Azure Tenant ID', key: 'AZURE_TENANT_ID', masked: false },
        { label: 'Database URL', key: 'DATABASE_URL', masked: true },
        { label: 'JWT Secret', key: 'JWT_SECRET_KEY', masked: true },
    ];

    const roles = [
        { role: 'Admin', color: 'red', permissions: ['Create courses', 'Manage users', 'View analytics', 'Export reports', 'Issue certificates', 'Manage settings', 'Full platform access'] },
        { role: 'Trainer', color: 'blue', permissions: ['Create courses', 'Upload materials', 'View own course analytics', 'Manage own modules'] },
        { role: 'Student', color: 'emerald', permissions: ['Enroll in courses', 'Watch videos', 'View transcripts', 'Download PDFs', 'Take assessments', 'View certificates'] },
    ];

    const roleColorMap = {
        red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: 'bg-red-600' },
        blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'bg-blue-600' },
        emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: 'bg-emerald-600' },
    };

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <AdminSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between flex-shrink-0">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Settings</h1>
                        <p className="text-xs text-slate-500 mt-0.5">Platform configuration, Azure integration, and role permissions</p>
                    </div>
                    <ProfileDropdown />
                </header>

                <main className="flex-1 p-8 overflow-y-auto">
                    <div className="space-y-6 max-w-4xl">
                        {/* Azure Configuration */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <span className="material-symbols-outlined text-white text-xl">cloud</span>
                                </div>
                                <div>
                                    <h2 className="font-semibold text-slate-800">Azure Configuration</h2>
                                    <p className="text-xs text-slate-500 mt-0.5">Environment variables loaded from <code className="px-1.5 py-0.5 rounded bg-slate-100 text-blue-700 text-[10px] font-mono">.env</code></p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {envVars.map(v => (
                                    <div key={v.key} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
                                        <div>
                                            <div className="text-sm font-medium text-slate-700">{v.label}</div>
                                            <div className="text-[10px] text-slate-400 font-mono">{v.key}</div>
                                        </div>
                                        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${v.masked ? 'bg-slate-200 text-slate-500' : 'bg-emerald-100 text-emerald-700'}`}>
                                            {v.masked ? '••••••••' : 'Configured'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* AI Feature Toggles */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <span className="material-symbols-outlined text-white text-xl">smart_toy</span>
                                </div>
                                <h2 className="font-semibold text-slate-800">AI Settings</h2>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { label: 'Auto Transcript Generation', desc: 'Automatically generate transcripts when videos are uploaded', value: transcriptAuto, setter: setTranscriptAuto },
                                    { label: 'AI Insights Generation', desc: 'Generate intelligent analytics insights from platform data', value: aiInsightsEnabled, setter: setAiInsightsEnabled },
                                    { label: 'AI Quiz Generation', desc: 'Auto-generate quiz questions from lesson content', value: quizGenEnabled, setter: setQuizGenEnabled },
                                ].map((toggle, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                                        <div>
                                            <div className="text-sm font-medium text-slate-700">{toggle.label}</div>
                                            <div className="text-[10px] text-slate-500 mt-0.5">{toggle.desc}</div>
                                        </div>
                                        <button
                                            onClick={() => toggle.setter(!toggle.value)}
                                            className={`relative w-12 h-7 rounded-full transition-colors ${toggle.value ? 'bg-blue-600' : 'bg-slate-300'}`}
                                        >
                                            <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${toggle.value ? 'left-6' : 'left-1'}`}></span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Storage Settings */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                                    <span className="material-symbols-outlined text-white text-xl">storage</span>
                                </div>
                                <h2 className="font-semibold text-slate-800">Storage Settings</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {[
                                    { label: 'Primary Container', value: 'ltc-recordings', icon: 'folder' },
                                    { label: 'Public Container', value: 'ltc-public-media', icon: 'public' },
                                    { label: 'Auth Method', value: 'Azure AD (AAD)', icon: 'security' },
                                    { label: 'Access Level', value: 'Private', icon: 'lock' },
                                ].map((item, i) => (
                                    <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="material-symbols-outlined text-slate-400 text-base">{item.icon}</span>
                                            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">{item.label}</span>
                                        </div>
                                        <div className="text-sm font-semibold text-slate-700 font-mono">{item.value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Role Permissions */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <span className="material-symbols-outlined text-white text-xl">admin_panel_settings</span>
                                </div>
                                <h2 className="font-semibold text-slate-800">Role Permissions</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {roles.map(r => {
                                    const c = roleColorMap[r.color];
                                    return (
                                        <div key={r.role} className={`${c.bg} border ${c.border} rounded-2xl p-4`}>
                                            <div className={`text-sm font-bold ${c.text} mb-3`}>{r.role}</div>
                                            <ul className="space-y-1.5">
                                                {r.permissions.map((p, i) => (
                                                    <li key={i} className="flex items-center gap-2 text-xs text-slate-600">
                                                        <span className="material-symbols-outlined text-emerald-500 text-sm">check_circle</span>
                                                        {p}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end">
                            <button onClick={handleSave}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-colors">
                                <span className="material-symbols-outlined text-lg">{saved ? 'check' : 'save'}</span>
                                {saved ? 'Saved!' : 'Save Settings'}
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
