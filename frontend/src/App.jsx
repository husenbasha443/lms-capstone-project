import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import ForgotPassword from './pages/ForgotPassword'
import LearnerDashboard from './pages/learner/LearnerDashboard'
import CourseCatalog from './pages/learner/CourseCatalog'
import MyCourses from './pages/learner/MyCourses'
import CourseOverview from './pages/learner/CourseOverview'
import LessonContent from './pages/learner/LessonContent'
import Assessment from './pages/learner/Assessment'
import AssessmentResults from './pages/learner/AssessmentResults'
import AILearningHub from './pages/learner/AILearningHub'
import Search from './pages/learner/Search'
import RevisionAssistant from './pages/learner/RevisionAssistant'
import Analytics from './pages/learner/Analytics'
import TrainerDashboard from './pages/trainer/TrainerDashboard'
import TrainerCourses from './pages/trainer/TrainerCourses'
import TrainerStudents from './pages/trainer/TrainerStudents'
import TrainerAnalytics from './pages/trainer/TrainerAnalytics'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminCourses from './pages/admin/AdminCourses'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AdminCertificates from './pages/admin/AdminCertificates'
import AdminAIInsights from './pages/admin/AdminAIInsights'
import AdminSettings from './pages/admin/AdminSettings'
import TrainerSettings from './pages/trainer/TrainerSettings'
import LearnerSettings from './pages/learner/LearnerSettings'
import LeadershipDashboard from './pages/leadership/LeadershipDashboard'
import AIChatbot from './components/AIChatbot'
import LessonPage from './pages/learner/LessonPage'

function App() {
  return (
    <Router>
      <AIChatbot />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard/learner" element={<LearnerDashboard />} />
        <Route path="/learner/dashboard" element={<LearnerDashboard />} />
        <Route path="/learner/courses" element={<CourseCatalog />} />
        <Route path="/learner/my-courses" element={<MyCourses />} />
        <Route path="/learner/courses/:courseId" element={<CourseOverview />} />
        <Route path="/learner/courses/:courseId/lessons/:lessonId" element={<LessonContent />} />
        <Route path="/learner/courses/:courseId/assessments/:assessmentId" element={<Assessment />} />
        <Route path="/learner/courses/:courseId/assessments/:assessmentId/results" element={<AssessmentResults />} />
        <Route path="/learner/ai-hub" element={<AILearningHub />} />
        <Route path="/learner/search" element={<Search />} />
        <Route path="/learner/revision" element={<RevisionAssistant />} />
        <Route path="/learner/analytics" element={<Analytics />} />
        <Route path="/learner/progress" element={<Analytics />} />
        <Route path="/dashboard/trainer" element={<TrainerDashboard />} />
        <Route path="/trainer/courses" element={<TrainerCourses />} />
        <Route path="/trainer/students" element={<TrainerStudents />} />
        <Route path="/trainer/analytics" element={<TrainerAnalytics />} />
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/courses" element={<AdminCourses />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/certificates" element={<AdminCertificates />} />
        <Route path="/admin/ai-insights" element={<AdminAIInsights />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/trainer/settings" element={<TrainerSettings />} />
        <Route path="/learner/settings" element={<LearnerSettings />} />
        <Route path="/dashboard/leadership" element={<LeadershipDashboard />} />
        <Route path="/dashboard" element={<div>Dashboard - Coming Soon</div>} />
        <Route path="/courses" element={<div>Courses - Coming Soon</div>} />
        <Route path="/learn/:courseId" element={<div>Learning Interface - Coming Soon</div>} />
        <Route path="/learner/courses/:courseId/lessons/:lessonId" element={<LessonPage />} />
      </Routes>
    </Router>
  )
}

export default App

