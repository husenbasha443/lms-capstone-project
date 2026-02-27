import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import ProfileDropdown from '../../components/ProfileDropdown';
import api from '../../services/api';
import '../../index.css';

const CourseOverview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { courseId } = useParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef(null);

  const userName = localStorage.getItem('userName') || 'User';
  const userEmail = localStorage.getItem('userEmail') || '';
  const userRole = localStorage.getItem('userRole') || 'learner';

  const [activeTab, setActiveTab] = useState('content');
  const [expandedChapter, setExpandedChapter] = useState(null);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  // ================= FETCH COURSE =================
  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const res = await api.get(`/courses/${courseId}`);
        const data = res.data;

        const enhancedCourse = {
          ...data,
          chapters: (data.modules || []).map((m) => ({
            id: m.id,
            title: m.title,
            lessons_list: m.lessons || []
          }))
        };

        setCourse(enhancedCourse);
      } catch (err) {
        console.error("Failed to fetch course:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId]);

  // ================= HANDLE LESSON RESOURCE =================
  const handleLessonResource = (lesson) => {
    if (!lesson.video_url && !lesson.audio_url && !lesson.pdf_url) {
      setSelectedMedia({
        type: 'empty',
        title: lesson.title
      });
    } else if (lesson.video_url) {
      setSelectedMedia({
        type: 'video',
        title: lesson.title,
        video_url: lesson.video_url
      });
    } else if (lesson.audio_url) {
      setSelectedMedia({
        type: 'audio',
        title: lesson.title,
        audio_url: lesson.audio_url
      });
    } else if (lesson.pdf_url) {
      setSelectedMedia({
        type: 'pdf',
        title: lesson.title,
        pdf_url: lesson.pdf_url
      });
    }

    setShowMediaModal(true);
  };

  if (loading || !course) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 overflow-y-auto p-10">

        <button
          onClick={() => navigate('/learner/courses')}
          className="mb-6 text-blue-600 font-semibold"
        >
          ← Back to My Courses
        </button>

        <h1 className="text-3xl font-bold mb-3">{course.title}</h1>
        <p className="text-gray-600 mb-8">{course.description}</p>

        {/* ================= MODULES ================= */}
        {course.chapters.map((chapter) => (
          <div key={chapter.id} className="mb-6 border rounded-xl overflow-hidden">

            <div
              className="bg-gray-100 px-6 py-4 font-bold cursor-pointer"
              onClick={() =>
                setExpandedChapter(
                  expandedChapter === chapter.id ? null : chapter.id
                )
              }
            >
              {chapter.title}
            </div>

            {expandedChapter === chapter.id && (
              <div className="divide-y">
                {chapter.lessons_list.map((lesson) => (
                  <div
                    key={lesson.id}
                    onClick={() => handleLessonResource(lesson)}
                    className="px-6 py-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                  >
                    <span>{lesson.title}</span>

                    <div className="flex gap-2 text-xs">
                      {lesson.video_url && (
                        <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded">
                          Video
                        </span>
                      )}
                      {lesson.audio_url && (
                        <span className="bg-green-100 text-green-600 px-2 py-1 rounded">
                          Audio
                        </span>
                      )}
                      {lesson.pdf_url && (
                        <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded">
                          PDF
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        ))}

      </div>

      {/* ================= MEDIA MODAL ================= */}
      {showMediaModal && selectedMedia && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50"
          onClick={() => setShowMediaModal(false)}
        >
          <div
            className="bg-white rounded-xl max-w-3xl w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">{selectedMedia.title}</h2>
              <button onClick={() => setShowMediaModal(false)}>✖</button>
            </div>

            {/* VIDEO */}
            {selectedMedia.type === 'video' && (
              <video controls className="w-full rounded-lg">
                <source src={selectedMedia.video_url} type="video/mp4" />
              </video>
            )}

            {/* AUDIO */}
            {selectedMedia.type === 'audio' && (
              <audio controls className="w-full">
                <source src={selectedMedia.audio_url} type="audio/mpeg" />
              </audio>
            )}

            {/* PDF */}
            {selectedMedia.type === 'pdf' && (
              <iframe
                src={selectedMedia.pdf_url}
                className="w-full h-[500px] border rounded"
                title="PDF Viewer"
              />
            )}

            {/* EMPTY */}
            {selectedMedia.type === 'empty' && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-6 rounded text-center">
                Resource not uploaded yet by instructor.
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default CourseOverview;