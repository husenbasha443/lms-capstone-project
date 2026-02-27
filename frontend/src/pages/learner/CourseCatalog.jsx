import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import '../../index.css';

const CourseCatalog = () => {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrolling, setEnrolling] = useState(false);

  // ================= FETCH COURSES =================
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/courses');
        setCourses(res.data || []);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // ================= ENROLL FUNCTION =================
  const handleEnroll = async (courseId) => {
    setEnrolling(true);
    try {
      await api.post(`/courses/${courseId}/enroll`);
      setShowEnrollModal(false);
      navigate('/learner/my-courses', { replace: true });
    } catch (err) {
      console.error("Enrollment failed:", err);
    } finally {
      setEnrolling(false);
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-10 max-w-7xl mx-auto">

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Explore Courses</h1>

        <button
          onClick={() => navigate('/learner/my-courses')}
          className="bg-slate-900 text-white px-6 py-2 rounded-lg"
        >
          My Courses
        </button>
      </div>

      <input
        type="text"
        placeholder="Search courses..."
        className="w-full mb-8 px-4 py-3 border rounded-lg"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {filteredCourses.length === 0 ? (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-6xl text-slate-300">
            search_off
          </span>
          <h2 className="text-2xl font-bold mt-4">No courses available</h2>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => (
            <div
              key={course.id}
              className="border p-6 rounded-xl shadow hover:shadow-lg transition"
            >
              <h2 className="text-lg font-bold mb-2">{course.title}</h2>

              <p className="text-sm text-gray-600 mb-4">
                {course.description || "No description available"}
              </p>

              <button
                onClick={() => {
                  if (course.is_enrolled) {
                    navigate(`/learner/courses/${course.id}`);
                  } else {
                    setSelectedCourse(course);
                    setShowEnrollModal(true);
                  }
                }}
                className={`w-full py-2 rounded-lg font-semibold ${
                  course.is_enrolled
                    ? "bg-green-600 text-white"
                    : "bg-blue-600 text-white"
                }`}
              >
                {course.is_enrolled ? "Continue Learning" : "Enroll Now"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ENROLL MODAL */}
      {showEnrollModal && selectedCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">
              Enroll in {selectedCourse.title}
            </h2>

            <button
              onClick={() => handleEnroll(selectedCourse.id)}
              disabled={enrolling}
              className="bg-blue-600 text-white px-4 py-2 rounded w-full"
            >
              {enrolling ? "Enrolling..." : "Confirm Enrollment"}
            </button>

            <button
              onClick={() => setShowEnrollModal(false)}
              className="mt-3 text-gray-500 w-full"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseCatalog;