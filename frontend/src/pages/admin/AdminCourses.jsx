import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import ProfileDropdown from '../../components/ProfileDropdown';
import api from '../../services/api';

export default function AdminCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [moduleModal, setModuleModal] = useState(null);
    const [moduleTitle, setModuleTitle] = useState('');
    const [uploadModal, setUploadModal] = useState(null);
    const [uploadType, setUploadType] = useState('video');
    const [uploadFile, setUploadFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [editModal, setEditModal] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [editModuleModal, setEditModuleModal] = useState(null);
    const [editModuleTitle, setEditModuleTitle] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/courses');
            setCourses(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error("Failed to fetch courses:", error);
            setCourses([]);
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
            await api.post('/admin/courses', { title: newTitle, description: newDesc });
            setShowCreate(false); setNewTitle(''); setNewDesc('');
            fetchCourses();
        } catch (error) {
            console.error("Failed to create course:", error);
        }
    };

    const deleteCourse = async (id) => {
        if (!confirm('Delete this course?')) return;
        try {
            await api.delete(`/admin/courses/${id}`);
            fetchCourses();
        } catch (error) {
            console.error("Failed to delete course:", error);
        }
    };

    const updateCourse = async () => {
        if (!editModal) return;
        try {
            await api.put(`/admin/courses/${editModal.id}`, { title: editTitle, description: editDesc });
            setEditModal(null); fetchCourses();
        } catch (error) {
            console.error("Failed to update course:", error);
        }
    };

    const addModule = async (courseId) => {
        if (!moduleTitle.trim()) return;
        try {
            await api.post(`/admin/courses/${courseId}/modules`, { title: moduleTitle, order_index: 0 });
            setModuleModal(null); setModuleTitle('');
            fetchCourses();
            showSuccess('Module added successfully!');
        } catch (error) {
            console.error("Failed to add module:", error);
        }
    };

    const updateModule = async () => {
        if (!editModuleModal || !editModuleTitle.trim()) return;
        try {
            await api.put(`/admin/modules/${editModuleModal.id}`, { title: editModuleTitle });
            setEditModuleModal(null);
            fetchCourses();
            showSuccess('Module updated successfully!');
        } catch (error) {
            console.error("Failed to update module:", error);
        }
    };

    const handleUpload = async () => {
        if (!uploadModal || !uploadFile) return;
        setUploading(true);
        const form = new FormData();
        form.append('file', uploadFile);
        const endpoint = uploadType === 'video'
            ? `/admin/modules/${uploadModal}/upload-video`
            : `/admin/modules/${uploadModal}/upload-pdf`;

        try {
            await api.post(endpoint, form);
            setUploading(false); setUploadModal(null); setUploadFile(null);
            fetchCourses();
            showSuccess(`${uploadType === 'video' ? 'Video' : 'PDF'} uploaded successfully!`);
        } catch (error) {
            console.error("Upload failed:", error);
            setUploading(false);
        }
    };

    const publishCourse = async (id) => {
        try {
            await api.post(`/admin/courses/${id}/publish`);
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
            <AdminSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between flex-shrink-0">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Course Management</h1>
                        <p className="text-xs text-slate-500 mt-0.5">Create, edit, and manage courses & modules</p>
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
                    {/* Course Cards */}
                    {loading ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            {[1, 2, 3].map(i => <div key={i} className="h-48 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>)}
                        </div>
                    ) : courses.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-blue-600 text-3xl">school</span>
                            </div>
                            <p className="text-slate-500">No courses yet. Create your first course!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            {courses.map(c => (
                                <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-all">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="font-bold text-slate-800">{c.title}</h3>
                                            <p className="text-sm text-slate-500 mt-1 line-clamp-2">{c.description || 'No description'}</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => { setEditModal(c); setEditTitle(c.title); setEditDesc(c.description || ''); }}
                                                className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors">
                                                <span className="material-symbols-outlined text-lg">edit</span>
                                            </button>
                                            <button onClick={() => deleteCourse(c.id)}
                                                className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors">
                                                <span className="material-symbols-outlined text-lg">delete</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-100">
                                            <span className="material-symbols-outlined text-[14px] text-blue-500">person</span>
                                            <span className="text-[10px] font-semibold text-blue-700">{c.trainer_name || 'System'}</span>
                                        </div>
                                        <div className="text-[10px] text-slate-400">Created: {c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}</div>
                                    </div>

                                    {/* Modules */}
                                    <div className="space-y-2 mb-3">
                                        {(c.modules || []).map(m => (
                                            <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                                                <div className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-blue-600 text-base">folder</span>
                                                    <span className="text-sm text-slate-700">{m.title}</span>
                                                    <span className="text-[10px] text-slate-400">({(m.lessons || []).length} lessons)</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button onClick={() => { setEditModuleModal(m); setEditModuleTitle(m.title); }} title="Edit Module"
                                                        className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-blue-600 transition-colors">
                                                        <span className="material-symbols-outlined text-base">edit</span>
                                                    </button>
                                                    <button onClick={() => { setUploadModal(m.id); setUploadType('video'); }} title="Upload Video"
                                                        className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-emerald-600 transition-colors">
                                                        <span className="material-symbols-outlined text-base">videocam</span>
                                                    </button>
                                                    <button onClick={() => { setUploadModal(m.id); setUploadType('pdf'); }} title="Upload PDF"
                                                        className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-amber-600 transition-colors">
                                                        <span className="material-symbols-outlined text-base">picture_as_pdf</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-2">
                                        <button onClick={() => setModuleModal(c.id)}
                                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-slate-200 transition-all">
                                            <span className="material-symbols-outlined text-base">add</span> Add Module
                                        </button>
                                        <button onClick={() => publishCourse(c.id)}
                                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 text-sm text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-all">
                                            <span className="material-symbols-outlined text-base">publish</span> Publish
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Create Course Modal */}
                    {showCreate && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowCreate(false)}>
                            <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                                <h3 className="text-lg font-bold text-slate-800 mb-4">Create Course</h3>
                                <input type="text" placeholder="Course title" value={newTitle} onChange={e => setNewTitle(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none mb-3" />
                                <textarea placeholder="Description" value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={3}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none mb-4 resize-none" />
                                <div className="flex justify-end gap-3">
                                    <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-xl text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50">Cancel</button>
                                    <button onClick={createCourse} className="px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium shadow-lg shadow-blue-600/20 hover:bg-blue-700">Create</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Edit Course Modal */}
                    {editModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setEditModal(null)}>
                            <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                                <h3 className="text-lg font-bold text-slate-800 mb-4">Edit Course</h3>
                                <input type="text" placeholder="Course title" value={editTitle} onChange={e => setEditTitle(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none mb-3" />
                                <textarea placeholder="Description" value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={3}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none mb-4 resize-none" />
                                <div className="flex justify-end gap-3">
                                    <button onClick={() => setEditModal(null)} className="px-4 py-2 rounded-xl text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50">Cancel</button>
                                    <button onClick={updateCourse} className="px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium shadow-lg shadow-blue-600/20 hover:bg-blue-700">Save</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Add Module Modal */}
                    {moduleModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setModuleModal(null)}>
                            <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                                <h3 className="text-lg font-bold text-slate-800 mb-4">Add Module</h3>
                                <input type="text" placeholder="Module title" value={moduleTitle} onChange={e => setModuleTitle(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none mb-4" />
                                <div className="flex justify-end gap-3">
                                    <button onClick={() => setModuleModal(null)} className="px-4 py-2 rounded-xl text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50">Cancel</button>
                                    <button onClick={() => addModule(moduleModal)} className="px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium shadow-lg shadow-blue-600/20 hover:bg-blue-700">Add</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Edit Module Modal */}
                    {editModuleModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setEditModuleModal(null)}>
                            <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                                <h3 className="text-lg font-bold text-slate-800 mb-4">Edit Module</h3>
                                <input type="text" placeholder="Module title" value={editModuleTitle} onChange={e => setEditModuleTitle(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none mb-4" />
                                <div className="flex justify-end gap-3">
                                    <button onClick={() => setEditModuleModal(null)} className="px-4 py-2 rounded-xl text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50">Cancel</button>
                                    <button onClick={updateModule} className="px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium shadow-lg shadow-blue-600/20 hover:bg-blue-700">Save</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Upload Modal */}
                    {uploadModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setUploadModal(null)}>
                            <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                                <h3 className="text-lg font-bold text-slate-800 mb-2">Upload {uploadType === 'video' ? 'Video' : 'PDF'}</h3>
                                <p className="text-sm text-slate-500 mb-4">File will be stored securely on the server</p>
                                <div className="flex gap-3 mb-4">
                                    <button onClick={() => setUploadType('video')}
                                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${uploadType === 'video' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                                        <span className="material-symbols-outlined text-base align-middle mr-1">videocam</span> Video
                                    </button>
                                    <button onClick={() => setUploadType('pdf')}
                                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${uploadType === 'pdf' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                                        <span className="material-symbols-outlined text-base align-middle mr-1">picture_as_pdf</span> PDF
                                    </button>
                                </div>
                                <input type="file" accept={uploadType === 'video' ? 'video/*' : 'application/pdf'} onChange={e => setUploadFile(e.target.files[0])}
                                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-4" />
                                <div className="flex justify-end gap-3">
                                    <button onClick={() => setUploadModal(null)} className="px-4 py-2 rounded-xl text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50">Cancel</button>
                                    <button onClick={handleUpload} disabled={uploading || !uploadFile}
                                        className="px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-40">
                                        {uploading ? 'Uploading...' : 'Upload'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div >
        </div >
    );
}
