import React, { useState, useEffect } from 'react';
import TrainerSidebar from '../../components/TrainerSidebar';
import ProfileDropdown from '../../components/ProfileDropdown';
import api from '../../services/api';

export default function TrainerCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [addModuleCourseId, setAddModuleCourseId] = useState(null);
    const [moduleTitle, setModuleTitle] = useState('');
    const [expandedCourse, setExpandedCourse] = useState(null);
    const [editModuleModal, setEditModuleModal] = useState(null);
    const [editModuleTitle, setEditModuleTitle] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const res = await api.get('/trainer/courses');
            setCourses(res.data);
        } catch (error) {
            console.error("Failed to fetch courses:", error);
        }
        setLoading(false);
    };

    const showSuccess = (msg) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    useEffect(() => { fetchCourses(); }, []);

    const createCourse = async () => {
        if (!newTitle.trim()) return;
        try {
            await api.post('/trainer/courses', { title: newTitle, description: newDesc });
            setNewTitle(''); setNewDesc(''); setShowCreate(false);
            fetchCourses();
        } catch (error) {
            console.error("Failed to create course:", error);
        }
    };

    const deleteCourse = async (id) => {
        if (!confirm('Delete this course?')) return;
        try {
            await api.delete(`/trainer/courses/${id}`);
            fetchCourses();
        } catch (error) {
            console.error("Failed to delete course:", error);
        }
    };

    const addModule = async (courseId) => {
        if (!moduleTitle.trim()) return;
        try {
            await api.post(`/trainer/courses/${courseId}/modules`, { title: moduleTitle, order_index: 0 });
            setModuleTitle(''); setAddModuleCourseId(null);
            fetchCourses();
            showSuccess('Module added successfully!');
        } catch (error) {
            console.error("Failed to add module:", error);
        }
    };

    const updateModule = async () => {
        if (!editModuleModal || !editModuleTitle.trim()) return;
        try {
            await api.put(`/trainer/modules/${editModuleModal.id}`, { title: editModuleTitle });
            setEditModuleModal(null);
            fetchCourses();
            showSuccess('Module updated successfully!');
        } catch (error) {
            console.error("Failed to update module:", error);
        }
    };

    const uploadFile = async (moduleId, type) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = type === 'video' ? 'video/*' : '.pdf';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('file', file);

            try {
                await api.post(`/trainer/modules/${moduleId}/upload-${type}`, formData); // Axios sets Content-Type automatically for FormData
                fetchCourses();
                showSuccess(`${type === 'video' ? 'Video' : 'PDF'} uploaded successfully!`);
            } catch (error) {
                console.error(`Failed to upload ${type}:`, error);
                showSuccess(`Upload failed: ${error.response?.data?.detail || error.message}`);
            }
        };
        input.click();
    };

    const publishCourse = async (courseId) => {
        try {
            await api.post(`/api/trainer/courses/${courseId}/publish`);
            showSuccess('Course published successfully!');
            fetchCourses();
        } catch (error) {
            const msg = error.response?.data?.detail;
            console.error("Publish failed:", error);
            showSuccess('Publish failed: ' + (typeof msg === 'string' ? msg : 'Error'));
        }
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <TrainerSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between flex-shrink-0">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">My Courses</h1>
                        <p className="text-xs text-slate-500 mt-0.5">Create, manage, and publish your courses</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setShowCreate(true)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-colors">
                            <span className="material-symbols-outlined text-lg">add</span> New Course
                        </button>
                        <ProfileDropdown />
                    </div>
                </header>

                {/* Success Toast */}
                {successMessage && (
                    <div className="fixed top-20 right-8 z-[60] flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-600/20 animate-in fade-in slide-in-from-top-4 duration-300">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        <span className="text-sm font-medium">{successMessage}</span>
                    </div>
                )}

                <main className="flex-1 p-8 overflow-y-auto">
                    {/* Create Course Modal */}
                    {showCreate && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowCreate(false)}>
                            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200" onClick={e => e.stopPropagation()}>
                                <h3 className="text-lg font-bold text-slate-800 mb-4">Create New Course</h3>
                                <input type="text" placeholder="Course Title" value={newTitle} onChange={e => setNewTitle(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm mb-3 focus:ring-2 focus:ring-blue-500 outline-none" />
                                <textarea placeholder="Description (optional)" value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={3}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm mb-4 focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
                                <div className="flex justify-end gap-3">
                                    <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-xl text-sm text-slate-500 hover:text-slate-700">Cancel</button>
                                    <button onClick={createCourse} className="px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium shadow-lg shadow-blue-600/20 hover:bg-blue-700">Create</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <div className="grid grid-cols-2 gap-5">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
                                    <div className="h-5 bg-slate-100 rounded w-2/3 mb-3"></div>
                                    <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    ) : courses.length === 0 ? (
                        <div className="text-center py-20">
                            <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">school</span>
                            <h3 className="text-lg font-semibold text-slate-600">No courses yet</h3>
                            <p className="text-sm text-slate-400 mt-1">Create your first course to get started</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-5">
                            {courses.map(c => (
                                <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                    {/* Course Header */}
                                    <div className="p-5 border-b border-slate-100">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-sm font-bold shadow">
                                                    {c.title?.charAt(0)?.toUpperCase() || '?'}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-slate-800 text-sm">{c.title}</h3>
                                                    <p className="text-[10px] text-slate-400 mt-0.5">{c.description || 'No description'}</p>
                                                </div>
                                            </div>
                                            <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${c.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {c.is_published ? 'Published' : 'Draft'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">folder</span> {c.modules?.length || 0} modules</span>
                                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">group</span> {c.enrolled_count || 0} students</span>
                                        </div>
                                    </div>

                                    {/* Modules */}
                                    <div className="p-5">
                                        {c.modules?.length > 0 && (
                                            <div className="space-y-2 mb-3">
                                                {(expandedCourse === c.id ? c.modules : c.modules.slice(0, 3)).map(m => (
                                                    <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                                                        <div className="flex items-center gap-2.5">
                                                            <span className="material-symbols-outlined text-slate-400 text-base">folder</span>
                                                            <span className="text-xs font-medium text-slate-700">{m.title}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`w-2 h-2 rounded-full ${m.has_video ? 'bg-emerald-500' : 'bg-slate-300'}`} title={m.has_video ? 'Video ✓' : 'No video'}></span>
                                                            <span className={`w-2 h-2 rounded-full ${m.has_pdf ? 'bg-blue-500' : 'bg-slate-300'}`} title={m.has_pdf ? 'PDF ✓' : 'No PDF'}></span>
                                                            <button onClick={() => { setEditModuleModal(m); setEditModuleTitle(m.title); }} className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-blue-600 transition-colors" title="Edit Module">
                                                                <span className="material-symbols-outlined text-sm">edit</span>
                                                            </button>
                                                            <button onClick={() => uploadFile(m.id, 'video')} className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-blue-600 transition-colors" title="Upload Video">
                                                                <span className="material-symbols-outlined text-sm">videocam</span>
                                                            </button>
                                                            <button onClick={() => uploadFile(m.id, 'pdf')} className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-amber-600 transition-colors" title="Upload PDF">
                                                                <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {c.modules.length > 3 && (
                                                    <button onClick={() => setExpandedCourse(expandedCourse === c.id ? null : c.id)}
                                                        className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                                                        {expandedCourse === c.id ? 'Show less' : `+${c.modules.length - 3} more modules`}
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {/* Add Module inline */}
                                        {addModuleCourseId === c.id ? (
                                            <div className="flex gap-2 mb-3">
                                                <input type="text" placeholder="Module title" value={moduleTitle} onChange={e => setModuleTitle(e.target.value)}
                                                    className="flex-1 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs outline-none focus:ring-1 focus:ring-blue-500" />
                                                <button onClick={() => addModule(c.id)} className="px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium">Add</button>
                                                <button onClick={() => setAddModuleCourseId(null)} className="px-3 py-2 rounded-lg text-slate-400 text-xs">Cancel</button>
                                            </div>
                                        ) : null}

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => setAddModuleCourseId(c.id)}
                                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 transition-colors">
                                                <span className="material-symbols-outlined text-sm">add</span> Module
                                            </button>
                                            {!c.is_published && (
                                                <button onClick={() => publishCourse(c.id)}
                                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-medium hover:bg-emerald-100 border border-emerald-200 transition-colors">
                                                    <span className="material-symbols-outlined text-sm">publish</span> Publish
                                                </button>
                                            )}
                                            <button onClick={() => deleteCourse(c.id)}
                                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-500 text-xs font-medium hover:bg-red-100 transition-colors ml-auto">
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Edit Module Modal */}
                    {editModuleModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setEditModuleModal(null)}>
                            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200" onClick={e => e.stopPropagation()}>
                                <h3 className="text-lg font-bold text-slate-800 mb-4">Edit Module Title</h3>
                                <input type="text" placeholder="Module Title" value={editModuleTitle} onChange={e => setEditModuleTitle(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm mb-4 focus:ring-2 focus:ring-blue-500 outline-none" />
                                <div className="flex justify-end gap-3">
                                    <button onClick={() => setEditModuleModal(null)} className="px-4 py-2 rounded-xl text-sm text-slate-500 hover:text-slate-700">Cancel</button>
                                    <button onClick={updateModule} className="px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium shadow-lg shadow-blue-600/20 hover:bg-blue-700">Save</button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
