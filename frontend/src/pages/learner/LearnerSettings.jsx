import React, { useState } from 'react';
import ProfileDropdown from '../../components/ProfileDropdown';

export default function LearnerSettings() {
    const [emailNotifs, setEmailNotifs] = useState(true);
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <a href="/dashboard/learner" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </a>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">Learner Settings</h1>
                            <p className="text-xs text-slate-500 mt-0.5">Manage your learning preferences</p>
                        </div>
                    </div>
                    <ProfileDropdown />
                </header>

                <main className="flex-1 p-8 overflow-y-auto">
                    <div className="max-w-2xl mx-auto space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <h2 className="font-semibold text-slate-800 mb-4">Notifications</h2>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-700">Course Updates & Reminders</span>
                                <button
                                    onClick={() => setEmailNotifs(!emailNotifs)}
                                    className={`relative w-12 h-7 rounded-full transition-colors ${emailNotifs ? 'bg-emerald-600' : 'bg-slate-300'}`}
                                >
                                    <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${emailNotifs ? 'left-6' : 'left-1'}`}></span>
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button onClick={handleSave}
                                className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors">
                                {saved ? 'Saved!' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
