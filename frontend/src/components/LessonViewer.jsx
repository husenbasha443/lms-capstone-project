import React, { useRef, useEffect, useState } from "react";
import api from "../services/api";

const LessonViewer = ({ lesson }) => {
  const BASE_URL = "http://localhost:8000/media/";
  const videoRef = useRef(null);
  const lastSentPercentage = useRef(0);

  const [resumePosition, setResumePosition] = useState(0);

  if (!lesson) return null;

  const videoUrl = lesson.video_url
    ? `${BASE_URL}${lesson.video_url}`
    : null;

  const audioUrl = lesson.audio_url
    ? `${BASE_URL}${lesson.audio_url}`
    : null;

  const pdfUrl = lesson.pdf_url
    ? `${BASE_URL}${lesson.pdf_url}`
    : null;

  // 🔥 STEP 7 — Fetch Last Progress When Lesson Loads
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await api.get(`/learning/progress/${lesson.id}`);
        setResumePosition(res.data.last_position_seconds || 0);
      } catch (err) {
        console.log("No previous progress found");
      }
    };

    fetchProgress();
  }, [lesson.id]);

  // 🔥 When video loads → jump to last position
  const handleLoadedMetadata = () => {
    if (videoRef.current && resumePosition > 0) {
      videoRef.current.currentTime = resumePosition;
    }
  };

  // 🔥 Auto Progress Tracking
  const handleProgress = async (e) => {
    const video = e.target;

    if (!video.duration) return;

    const percentage = Math.floor(
      (video.currentTime / video.duration) * 100
    );

    if (percentage - lastSentPercentage.current < 5) return;

    lastSentPercentage.current = percentage;

    const isCompleted = percentage >= 80;

    try {
      await api.post("/learning/progress", {
        lesson_id: lesson.id,
        completion_percentage: percentage,
        last_position_seconds: Math.floor(video.currentTime),
        is_completed: isCompleted,
      });
    } catch (err) {
      console.error("Progress update failed", err);
    }
  };

  return (
    <div className="space-y-8">

      {/* 🎥 VIDEO PLAYER */}
      {videoUrl && (
        <div>
          <h3 className="text-lg font-bold mb-2">Video Lesson</h3>
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            className="w-full rounded-lg shadow"
            onTimeUpdate={handleProgress}
            onLoadedMetadata={handleLoadedMetadata}
          />
        </div>
      )}

      {/* 🎵 AUDIO PLAYER */}
      {audioUrl && (
        <div>
          <h3 className="text-lg font-bold mb-2">Audio Summary</h3>
          <audio
            src={audioUrl}
            controls
            className="w-full"
          />
        </div>
      )}

      {/* 📄 PDF VIEWER */}
      {pdfUrl && (
        <div>
          <h3 className="text-lg font-bold mb-2">Lesson PDF</h3>
          <iframe
            src={pdfUrl}
            title="Lesson PDF"
            className="w-full h-[600px] border rounded-lg"
          />
        </div>
      )}

      {/* ❌ EMPTY STATE */}
      {!videoUrl && !audioUrl && !pdfUrl && (
        <div className="p-10 bg-gray-100 rounded-lg text-center">
          <p className="text-gray-600">
            No resources available for this lesson.
          </p>
        </div>
      )}
    </div>
  );
};

export default LessonViewer;