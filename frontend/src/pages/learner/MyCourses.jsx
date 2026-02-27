import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const MyCourses = () => {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // ================= FETCH ENROLLED COURSES =================
  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const res = await api.get('/courses/my-courses');
        setCourses(res.data || []);
      } catch (err) {
        console.error("Failed to fetch my courses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyCourses();
  }, []);

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

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Courses</h1>

        <button
          onClick={() => navigate('/learner/courses')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Browse More Courses
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search your courses..."
        className="w-full mb-8 px-4 py-3 border rounded-lg"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* ================= NO ENROLLMENT STATE ================= */}
      {courses.length === 0 ? (
        <div className="text-center py-20 border border-dashed rounded-2xl">
          <span className="material-symbols-outlined text-6xl text-blue-500">
            school
          </span>

          <h2 className="text-2xl font-bold mt-4">
            You haven't enrolled in any courses yet
          </h2>

          <p className="text-gray-500 mt-2 mb-6">
            Start learning today by browsing our catalog.
          </p>

          <button
            onClick={() => navigate('/learner/courses')}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Browse Courses
          </button>
        </div>

      ) : filteredCourses.length === 0 ? (

        // ================= SEARCH EMPTY STATE =================
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-6xl text-gray-400">
            search_off
          </span>
          <h2 className="text-xl font-bold mt-4">
            No matching courses found
          </h2>
        </div>

      ) : (

        // ================= COURSE GRID =================
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {filteredCourses.map(course => (

            <div
              key={course.id}
              className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-slate-100 group"
            >

              {/* Course Image */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={course.image || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800"}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Level Badge */}
                <div className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                  {course.level || "Beginner"}
                </div>

                {/* Duration Badge */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 text-xs font-bold rounded-full shadow">
                  {course.duration || "6h"}
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6">

                {/* Title */}
                <h2 className="text-xl font-bold text-slate-800 mb-2 line-clamp-1">
                  {course.title}
                </h2>

                {/* Instructor */}
                <p className="text-sm text-slate-500 mb-4">
                  Instructor: {course.instructor || "Expert Instructor"}
                </p>

                {/* Progress Section */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm font-semibold mb-1">
                    <span>Progress</span>
                    <span className="text-blue-600">
                      {course.progress_percentage}%
                    </span>
                  </div>

                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-700 rounded-full transition-all duration-700"
                      style={{ width: `${course.progress_percentage}%` }}
                    ></div>
                  </div>

                  <div className="text-xs text-slate-400 mt-2">
                    {course.completed_lessons} / {course.total_lessons} Lessons Completed
                  </div>
                </div>

                {/* Continue Button */}
                <button
                  onClick={() => navigate(`/learner/courses/${course.id}`)}
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg shadow-green-500/20"
                >
                  {course.progress_percentage === 100
                    ? "Review Course"
                    : "Continue Learning"}
                </button>
              </div>

            </div>

          ))}

        </div>
      )}

    </div>
  );
};

export default MyCourses;