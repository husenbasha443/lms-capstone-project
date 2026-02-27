import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import LessonViewer from "../../components/LessonViewer";

const LessonPage = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const res = await api.get(`/courses/${courseId}`);
        const course = res.data;

        setCourseTitle(course.title);

        let foundLesson = null;

        course.modules.forEach((module) => {
          module.lessons.forEach((l) => {
            if (l.id === parseInt(lessonId)) {
              foundLesson = l;
            }
          });
        });

        setLesson(foundLesson);
      } catch (err) {
        console.error("Failed to load lesson:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [courseId, lessonId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h2 className="text-xl font-bold">Loading Lesson...</h2>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h2 className="text-red-500 font-bold">Lesson not found</h2>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">

      {/* Back Button */}
      <button
        onClick={() => navigate(`/learner/courses/${courseId}`)}
        className="text-blue-600 mb-6 hover:underline"
      >
        ← Back to Course
      </button>

      {/* Course Title */}
      <h1 className="text-2xl font-bold mb-2">
        {courseTitle}
      </h1>

      {/* Lesson Title */}
      <h2 className="text-xl font-semibold mb-6">
        {lesson.title}
      </h2>

      {/* Media */}
      <LessonViewer lesson={lesson} />

      {/* Description */}
      {lesson.description && (
        <div className="mt-10">
          <h3 className="text-lg font-bold mb-2">
            Lesson Description
          </h3>
          <p className="text-gray-700">
            {lesson.description}
          </p>
        </div>
      )}
    </div>
  );
};

export default LessonPage;