import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProfileDropdown from '../../components/ProfileDropdown';
import api from '../../services/api';
import '../../index.css';

const LessonContent = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lessonsByModule, setLessonsByModule] = useState([]);
  const [allLessons, setAllLessons] = useState([]);

  const userName = localStorage.getItem('userName') || 'User';
  const userEmail = localStorage.getItem('userEmail') || '';
  const userRole = localStorage.getItem('userRole') || 'Learner';

  const [isPlaying, setIsPlaying] = useState(false);
  const [transcriptExpanded, setTranscriptExpanded] = useState(true);
  const [autoFollowEnabled, setAutoFollowEnabled] = useState(true);
  const [knowledgeLevel, setKnowledgeLevel] = useState('beginner');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatMessage, setChatMessage] = useState('');

  // Header state
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef(null);

  // Notification data
  const notifications = [
    {
      id: 1,
      title: 'New Lesson Available',
      message: 'Check out the new lesson on Advanced Functions in your Python course.',
      time: '5 minutes ago',
      icon: 'school',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      unread: true
    },
    {
      id: 2,
      title: 'Assignment Due Soon',
      message: 'Your "Variables & Data Types" assignment is due in 2 days.',
      time: '1 hour ago',
      icon: 'assignment',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      unread: true
    },
    {
      id: 3,
      title: 'Achievement Unlocked',
      message: 'You earned the "Quick Learner" badge for completing 5 lessons this week!',
      time: '3 hours ago',
      icon: 'workspace_premium',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      unread: false
    },
    {
      id: 4,
      title: 'Course Update',
      message: 'New AI-generated content added to "Introduction to Python Programming".',
      time: '1 day ago',
      icon: 'update',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      unread: false
    }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  // AI Enhancement Panel States
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showWalkthroughOverlay, setShowWalkthroughOverlay] = useState(false);
  const [walkthroughStep, setWalkthroughStep] = useState(0);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English (US)');
  const [audioProgress, setAudioProgress] = useState(45);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch course structure for sidebar and breadcrumbs
        const courseRes = await api.get(`/courses/${courseId}`);
        const courseData = courseRes.data;
        setCourse(courseData);

        // Flatten lessons for navigation (prev/next)
        const flattened = [];
        const grouped = (courseData.modules || []).sort((a, b) => a.order_index - b.order_index).map(m => {
          const moduleLessons = (m.lessons || []).sort((a, b) => a.order_index - b.order_index).map(l => ({
            ...l,
            module: m.title,
            icon: l.processed ? 'check_circle' : 'play_circle',
            status: l.processed ? 'completed' : 'unlocked'
          }));
          flattened.push(...moduleLessons);
          return {
            moduleName: m.title,
            lessons: moduleLessons
          };
        });
        setLessonsByModule(grouped);
        setAllLessons(flattened);

        // Fetch specific lesson content
        const lessonRes = await api.get(`/lessons/${lessonId}`);
        setCurrentLesson(lessonRes.data);
      } catch (err) {
        console.error("Failed to fetch lesson data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId, lessonId]);

  if (loading || !course || !currentLesson) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-950">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Determine previous and next lessons for navigation
  const currentLessonIndex = allLessons.findIndex(l => l.id === parseInt(lessonId));
  const previousLesson = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex >= 0 && currentLessonIndex < allLessons.length - 1
    ? allLessons[currentLessonIndex + 1]
    : null;

  const aiEnhancements = [
    { icon: 'mic', title: 'Audio Summary', subtitle: 'Listen to 2-min recap', color: 'indigo' },
    { icon: 'movie', title: 'Video Explainer', subtitle: 'Simplified visual recap', color: 'amber' },
    { icon: 'explore', title: 'Walkthrough', subtitle: 'Step-by-step guide', color: 'emerald' },
  ];

  const relatedConcepts = currentLesson.related_concepts || [
    { id: 2, title: 'Variables Explained', description: 'Core programming concept', isPrerequisite: false },
    { id: 7, title: 'Defining Functions', description: 'Organize your code', isPrerequisite: false },
    { id: 10, title: 'Lists & Arrays', description: 'Work with collections', isPrerequisite: false },
  ];

  const transcriptLines = currentLesson.transcript || [
    { time: '00:15', text: '"Transcript not available for this lesson."', highlighted: false },
  ];

  const walkthroughSteps = currentLesson.walkthrough || [
    {
      title: 'No Walkthrough Available',
      description: 'A step-by-step guide is not yet available for this lesson.',
      icon: 'info'
    },
  ];

  const languageOptions = [
    { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
    { code: 'es-ES', name: 'Español (España)', flag: '🇪🇸' },
    { code: 'fr-FR', name: 'Français (France)', flag: '🇫🇷' },
    { code: 'de-DE', name: 'Deutsch (Deutschland)', flag: '🇩🇪' },
    { code: 'zh-CN', name: '中文 (简体)', flag: '🇨🇳' },
    { code: 'ja-JP', name: '日本語 (Japan)', flag: '🇯🇵' },
  ];

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      console.log('Message sent:', chatMessage);
      setChatMessage('');
    }
  };

  const handleAIEnhancement = (toolTitle) => {
    switch (toolTitle) {
      case 'Audio Summary':
        setShowAudioPlayer(true);
        break;
      case 'Video Explainer':
        setShowVideoModal(true);
        break;
      case 'Walkthrough':
        setShowWalkthroughOverlay(true);
        setWalkthroughStep(0);
        break;
      default:
        break;
    }
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    setShowLanguageModal(false);
    // In real app, this would trigger content reload with new language
    console.log('Language changed to:', language);
  };

  const handleKnowledgeLevelChange = (level) => {
    setKnowledgeLevel(level);
    // In real app, this would refresh content with appropriate difficulty
    console.log('Knowledge level changed to:', level);
  };

  // Header handlers
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      // Navigate to search results page
      navigate(`/learner/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  const handleAskAI = () => {
    console.log('Opening Ask AI');
    // Navigate to AI Hub or open AI chat
    navigate('/learner/ai-hub');
  };

  const handleNotificationsToggle = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased">
      <div className="flex h-screen flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-3 shrink-0 z-20">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                <span className="material-symbols-outlined text-2xl">auto_awesome</span>
              </div>
              <h2 className="text-lg font-bold tracking-tight">AI Learning LMS</h2>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <button
                onClick={() => navigate('/learner/dashboard')}
                className="text-sm font-medium hover:text-primary transition-colors cursor-pointer"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate('/learner/courses')}
                className="text-sm font-medium text-primary cursor-pointer"
              >
                My Courses
              </button>
              <button
                onClick={() => navigate('/learner/ai-hub')}
                className="text-sm font-medium hover:text-primary transition-colors cursor-pointer"
              >
                AI Hub
              </button>
              <button
                onClick={() => navigate('/learner/analytics')}
                className="text-sm font-medium hover:text-primary transition-colors cursor-pointer"
              >
                Analytics
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center flex-1 max-w-xl">
              <form onSubmit={handleSearch} className="relative w-full group">
                <button
                  type="submit"
                  className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600 hover:text-blue-600 cursor-pointer z-10"
                >
                  search
                </button>
                <input
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-blue-600/20 text-sm placeholder:text-slate-400"
                  placeholder="Search courses, concepts, or files..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                />
              </form>
            </div>

            <div className="flex items-center gap-4 ml-8">
              <button
                onClick={handleAskAI}
                className="flex items-center gap-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                <span>Ask AI</span>
              </button>

              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={handleNotificationsToggle}
                  className="relative p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined">notifications</span>
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-[9999] animate-in fade-in slide-in-from-top-2 duration-200 max-h-[500px] flex flex-col">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Notifications</h3>
                        {unreadCount > 0 && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">{unreadCount} unread</p>
                        )}
                      </div>
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      >
                        <span className="material-symbols-outlined text-lg">close</span>
                      </button>
                    </div>

                    {/* Notifications List */}
                    <div className="overflow-y-auto flex-1">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer border-b border-slate-100 dark:border-slate-700 last:border-0 transition-colors ${notification.unread ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                            }`}
                        >
                          <div className="flex gap-3">
                            <div className={`flex-shrink-0 w-10 h-10 ${notification.iconBg} dark:${notification.iconBg.replace('100', '900/30')} rounded-full flex items-center justify-center`}>
                              <span className={`material-symbols-outlined text-lg ${notification.iconColor}`}>
                                {notification.icon}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                                  {notification.title}
                                </p>
                                {notification.unread && (
                                  <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-1.5"></span>
                                )}
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-slate-400 dark:text-slate-500">
                                {notification.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                      <button
                        onClick={() => {
                          setShowNotifications(false);
                          // Navigate to notifications page if you have one
                        }}
                        className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:hover:text-blue-500 w-full text-center"
                      >
                        View All Notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

              <div className="flex items-center gap-3 pl-2">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold">{userName}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Pro {userRole}</p>
                </div>
                <ProfileDropdown
                  userName={userName}
                  userEmail={userEmail}
                  profileImage="https://lh3.googleusercontent.com/aida-public/AB6AXuDN3sIvMh27FT-1-5l63OFnJ96JCK02FnDfa-Jh7VCVLJtChF_DbUbjPXcSJaFL0xsMOdZ_3WrctqFTyQ76LwNYfnyTRGJSgp7x8gfEpZOUSmcrcomqGrkI1HzLgZ5wwtFpSPV3juSlq0S4dMI3hWsqpx9YrQl6r0VTM3rC4a9sICjU7H0jDrmFU5vn4_N7KYqAoCjCli95Dxc_2wpaC-KfhtkpGZwjOM8rriR-jihG9Fcgde5s5BVY-bI6q47y5U5MtXghVwNGiYM"
                />
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar: Course Tree */}
          <aside className={`${sidebarCollapsed ? 'w-0' : 'w-72'} border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 transition-all duration-300 overflow-hidden`}>
            {/* Course Progress */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">{course.title}</h3>
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">{course.progress_percentage || 0}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-500" style={{ width: `${course.progress_percentage || 0}%` }}></div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
              {lessonsByModule.map((module, moduleIndex) => (
                <div key={module.moduleName}>
                  <div className={`px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider ${moduleIndex > 0 ? 'mt-4 border-t border-slate-100 dark:border-slate-800 pt-4' : ''}`}>
                    {module.moduleName}
                  </div>

                  {module.lessons.map((lesson) => (
                    <button
                      key={lesson.id}
                      onClick={() => {
                        if (lesson.status === 'locked') {
                          alert('Complete previous lessons to unlock this content!');
                        } else {
                          navigate(`/learner/courses/${courseId}/lessons/${lesson.id}`);
                        }
                      }}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer w-full text-left ${lesson.id === parseInt(lessonId)
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : lesson.status === 'locked'
                          ? 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 opacity-60'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                    >
                      <span className={`material-symbols-outlined text-xl ${lesson.status === 'completed' ? 'text-green-500 font-bold' :
                        lesson.id === parseInt(lessonId) ? 'text-primary' : ''
                        }`}>
                        {lesson.icon}
                      </span>
                      <span className={`text-sm ${lesson.id === parseInt(lessonId) ? 'font-bold' : 'font-medium'}`}>
                        {lesson.title}
                      </span>
                    </button>
                  ))}
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">first_page</span>
                Collapse Menu
              </button>
            </div>
          </aside>

          {/* Main Content: Video & Transcript */}
          <main className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-background-dark">
            <div className="max-w-5xl mx-auto p-6 md:p-8">
              {/* Breadcrumbs */}
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-6 font-medium">
                <button
                  onClick={() => navigate('/learner/dashboard')}
                  className="hover:text-primary cursor-pointer transition-colors"
                >
                  Home
                </button>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
                <button
                  onClick={() => navigate('/learner/courses')}
                  className="hover:text-primary cursor-pointer transition-colors"
                >
                  Courses
                </button>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
                <button
                  onClick={() => navigate(`/learner/courses/${courseId}`)}
                  className="hover:text-primary cursor-pointer transition-colors"
                >
                  {course.title}
                </button>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
                <span className="text-primary">{currentLesson.title}</span>
              </div>

              {/* Video Section */}
              <div className="relative group rounded-xl overflow-hidden bg-black aspect-video mb-8 shadow-2xl shadow-primary/5">
                <img
                  className="w-full h-full object-cover opacity-60"
                  alt="Abstract coding screen background"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-PCcw5qCgzh9KiGApEO48B2H0KjEdbhC_oZPkPvvoQ6O7MvtyGtX75lG2PskSC9jiFF2bm57CMc_l587SS4ZIhU6DZrscPz4C6FgBRTZK1VgNsuZyS6oIO5AV0xjYJSw5agqHnGosDYntufZUEkg2UylYd09RIkrfu312UimZIV9ID1aAjNN0hUDuQIZipoghMmYzg0sJdO1IxnrR3nxsC-8onVwS2z031D00JHh0jPDUOaCFvyBIpM-nhTHqcQyzYXwOgzqGPh8"
                />

                {/* Overlay Controls */}
                <div
                  className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all cursor-pointer"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  <div className="bg-primary text-white w-20 h-20 rounded-full flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-5xl translate-x-1">play_arrow</span>
                  </div>
                </div>

                {/* Video UI */}
                <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex flex-col gap-2">
                    <div className="h-1.5 w-full bg-white/20 rounded-full cursor-pointer relative group/progress">
                      <div className="absolute h-full w-[45%] bg-primary rounded-full transition-all"></div>
                      <div className="absolute h-4 w-4 bg-white rounded-full -top-1.5 left-[45%] shadow-lg shadow-black/50 opacity-0 group-hover/progress:opacity-100 transition-opacity"></div>
                    </div>
                    <div className="flex items-center justify-between text-white text-xs font-medium">
                      <div className="flex items-center gap-4">
                        <span className="material-symbols-outlined cursor-pointer hover:text-primary transition-colors">
                          {isPlaying ? 'pause_circle' : 'play_circle'}
                        </span>
                        <span className="material-symbols-outlined cursor-pointer hover:text-primary transition-colors">volume_up</span>
                        <span>04:12 / 09:45</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="material-symbols-outlined cursor-pointer hover:text-primary transition-colors">closed_caption</span>
                        <span className="material-symbols-outlined cursor-pointer hover:text-primary transition-colors">settings</span>
                        <span className="material-symbols-outlined cursor-pointer hover:text-primary transition-colors">fullscreen</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lesson Header & Transcript */}
              <div className="flex flex-col gap-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{currentLesson.title}</h1>
                    <p className="text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
                      {currentLesson.summary || "This lesson content is currently being prepared by our AI agents."}
                    </p>
                  </div>
                  <button className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0">
                    <span className="material-symbols-outlined text-lg">bookmark</span>
                    Save
                  </button>
                </div>

                {/* Transcript Section */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/50">
                  <button
                    onClick={() => setTranscriptExpanded(!transcriptExpanded)}
                    className="w-full px-6 py-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">description</span>
                      <span className="font-bold">Clean Lesson Transcript</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 font-medium">Auto-follow enabled</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          checked={autoFollowEnabled}
                          onChange={(e) => {
                            e.stopPropagation();
                            setAutoFollowEnabled(!autoFollowEnabled);
                          }}
                          className="sr-only peer"
                          type="checkbox"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </button>

                  {transcriptExpanded && (
                    <div className="p-6 max-h-[300px] overflow-y-auto custom-scrollbar text-slate-600 dark:text-slate-400 text-base leading-loose space-y-4">
                      {transcriptLines.map((line, idx) => (
                        <p
                          key={idx}
                          className={`${line.highlighted ? 'bg-primary/5 dark:bg-primary/10 rounded p-2 border-l-4 border-primary' : ''}`}
                        >
                          <span className="text-primary font-bold mr-2">{line.time}</span>
                          {line.text}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Related Concepts Section */}
              <div className="mt-10 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">link</span>
                    <h3 className="font-bold text-sm tracking-wide uppercase">Related Concepts</h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Explore connected topics to deepen your understanding
                  </p>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {relatedConcepts.map((concept) => (
                    <button
                      key={concept.id}
                      onClick={() => navigate(`/learner/courses/${courseId}/lessons/${concept.id}`)}
                      className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all text-left group"
                    >
                      <div className={`w-10 h-10 rounded-lg ${concept.isPrerequisite ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-primary/10 text-primary'} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                        <span className="material-symbols-outlined">
                          {concept.isPrerequisite ? 'priority_high' : 'school'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">
                            {concept.title}
                          </h4>
                          {concept.isPrerequisite && (
                            <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                              Prerequisite
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          {concept.description}
                        </p>
                      </div>
                      <span className="material-symbols-outlined text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition-all">
                        arrow_forward
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quiz Section */}
              <div className="mt-8 bg-gradient-to-br from-primary/10 to-purple-500/10 dark:from-primary/20 dark:to-purple-500/20 rounded-xl p-6 border border-primary/20">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-primary">quiz</span>
                      <h3 className="font-bold">Test Your Knowledge</h3>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      Ready to check your understanding? Take a quick 5-minute quiz on {currentLesson.title}.
                    </p>
                    <button
                      onClick={() => navigate(`/learner/courses/${courseId}/assessments/ch2-quiz`)}
                      className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-semibold shadow-lg shadow-primary/20 hover:brightness-110 transition-all"
                    >
                      <span className="material-symbols-outlined">play_arrow</span>
                      Start Quiz
                    </button>
                  </div>
                  <div className="hidden md:block text-6xl opacity-20">
                    📝
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Navigation */}
            <div className="max-w-5xl mx-auto px-6 py-10 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 mt-8">
              {previousLesson ? (
                <button
                  onClick={() => navigate(`/learner/courses/${courseId}/lessons/${previousLesson.id}`)}
                  className="flex items-center gap-3 group px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  <span className="material-symbols-outlined text-slate-400 group-hover:-translate-x-1 transition-transform">arrow_back</span>
                  <div className="text-left">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Previous</p>
                    <p className="text-sm font-semibold">{previousLesson.title}</p>
                  </div>
                </button>
              ) : (
                <div></div>
              )}

              {nextLesson ? (
                <button
                  onClick={() => navigate(`/learner/courses/${courseId}/lessons/${nextLesson.id}`)}
                  className="flex items-center gap-3 group px-4 py-2 rounded-lg bg-primary text-white shadow-lg shadow-primary/20 hover:brightness-110 transition-all"
                >
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-white/70">Next Lesson</p>
                    <p className="text-sm font-semibold">{nextLesson.title}</p>
                  </div>
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
              ) : (
                <button
                  onClick={() => navigate(`/learner/courses/${courseId}`)}
                  className="flex items-center gap-3 group px-4 py-2 rounded-lg bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:brightness-110 transition-all"
                >
                  <span className="material-symbols-outlined">check_circle</span>
                  <span className="font-semibold">Complete Course</span>
                </button>
              )}
            </div>
          </main>

          {/* Right Sidebar: AI Learning Enhancements */}
          <aside className="w-80 border-l border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col shrink-0 overflow-hidden">
            <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary">auto_awesome</span>
                <h3 className="font-bold text-sm tracking-wide uppercase">AI Enhancements</h3>
              </div>

              {/* AI Tool Grid */}
              <div className="grid grid-cols-1 gap-3">
                {aiEnhancements.map((tool, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAIEnhancement(tool.title)}
                    className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-primary transition-all text-left group cursor-pointer"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-${tool.color}-100 dark:bg-${tool.color}-900/30 text-${tool.color}-600 dark:text-${tool.color}-400 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <span className="material-symbols-outlined">{tool.icon}</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold">{tool.title}</p>
                      <p className="text-[10px] text-slate-500">{tool.subtitle}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Selectors */}
              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Knowledge Level</label>
                  <div className="flex p-1 bg-slate-200 dark:bg-slate-800 rounded-lg">
                    <button
                      onClick={() => handleKnowledgeLevelChange('beginner')}
                      className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-all ${knowledgeLevel === 'beginner'
                        ? 'bg-white dark:bg-slate-700 shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                    >
                      Beginner
                    </button>
                    <button
                      onClick={() => handleKnowledgeLevelChange('advanced')}
                      className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-all ${knowledgeLevel === 'advanced'
                        ? 'bg-white dark:bg-slate-700 shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                    >
                      Advanced
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Language</label>
                  <button
                    onClick={() => setShowLanguageModal(true)}
                    className="w-full flex items-center justify-between px-3 py-2 bg-white dark:bg-slate-800 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 hover:border-primary transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-base">language</span>
                      <span>{selectedLanguage}</span>
                    </div>
                    <span className="material-symbols-outlined text-base text-slate-400">expand_more</span>
                  </button>
                </div>
              </div>

              {/* AI Q&A Chat */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-3 flex items-center justify-between">
                  AI Q&A Assistant
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                </label>
                <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-3 mb-3 border border-primary/10">
                  <p className="text-[11px] text-primary/80 leading-relaxed italic">
                    "Hi there! I can help you understand variables better. Feel free to ask anything about this lesson."
                  </p>
                </div>
                <div className="relative mb-3">
                  <input
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-4 pr-10 text-xs focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Ask a question..."
                    type="text"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 min-w-[2rem] min-h-[2rem] flex items-center justify-center shrink-0 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl leading-none">send</span>
                  </button>
                </div>
                <button
                  onClick={() => navigate('/learner/search')}
                  className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">search</span>
                  Open Full Search & Q&A
                </button>
              </div>
            </div>

            {/* AI Quick Stat */}
            <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mb-2">
                <span>AI PROCESSING UNITS</span>
                <span>420 / 1000</span>
              </div>
              <div className="h-1 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full w-[42%] bg-primary rounded-full transition-all duration-500"></div>
              </div>
            </div>
          </aside>
        </div>

        {/* Collapsed Sidebar Button */}
        {
          sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="fixed left-0 top-1/2 -translate-y-1/2 bg-primary text-white p-2 rounded-r-lg shadow-lg hover:px-3 transition-all z-30"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          )
        }

        {/* Floating Audio Player */}
        {
          showAudioPlayer && (
            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-2xl z-40 animate-slide-up">
              <div className="max-w-5xl mx-auto px-6 py-4">
                <div className="flex items-center gap-4">
                  <button className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center hover:brightness-110 transition-all">
                    <span className="material-symbols-outlined text-3xl">play_arrow</span>
                  </button>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">Audio Summary: Variables Explained</h4>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500">01:23</span>
                      <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full relative cursor-pointer group">
                        <div className="absolute h-full bg-primary rounded-full transition-all" style={{ width: `${audioProgress}%` }}></div>
                        <div
                          className="absolute h-4 w-4 bg-white border-2 border-primary rounded-full top-1/2 -translate-y-1/2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ left: `${audioProgress}%`, transform: 'translate(-50%, -50%)' }}
                        ></div>
                      </div>
                      <span className="text-xs text-slate-500">02:45</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-slate-500 hover:text-primary transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                      <span className="material-symbols-outlined">volume_up</span>
                    </button>
                    <button
                      onClick={() => console.log('Downloading transcript...')}
                      className="p-2 text-slate-500 hover:text-primary transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                      title="Download Transcript"
                    >
                      <span className="material-symbols-outlined">download</span>
                    </button>
                    <button
                      onClick={() => navigate('/learner/ai-hub')}
                      className="p-2 text-slate-500 hover:text-primary transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                      title="Open in AI Hub"
                    >
                      <span className="material-symbols-outlined">open_in_new</span>
                    </button>
                    <button
                      onClick={() => setShowAudioPlayer(false)}
                      className="p-2 text-slate-500 hover:text-red-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        }

        {/* Video Explainer Modal */}
        {
          showVideoModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden">
                <div className="relative aspect-video bg-black">
                  <img
                    className="w-full h-full object-cover opacity-60"
                    alt="Video thumbnail"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-PCcw5qCgzh9KiGApEO48B2H0KjEdbhC_oZPkPvvoQ6O7MvtyGtX75lG2PskSC9jiFF2bm57CMc_l587SS4ZIhU6DZrscPz4C6FgBRTZK1VgNsuZyS6oIO5AV0xjYJSw5agqHnGosDYntufZUEkg2UylYd09RIkrfu312UimZIV9ID1aAjNN0hUDuQIZipoghMmYzg0sJdO1IxnrR3nxsC-8onVwS2z031D00JHh0jPDUOaCFvyBIpM-nhTHqcQyzYXwOgzqGPh8"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-5xl translate-x-1">play_arrow</span>
                    </button>
                  </div>
                  <button
                    onClick={() => setShowVideoModal(false)}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">Simplified Video: Variables in 3 Minutes</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Watch this alternative explanation with visual demonstrations and real-world examples.
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setShowVideoModal(false);
                        navigate('/learner/ai-hub');
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:brightness-110 transition-all"
                    >
                      <span className="material-symbols-outlined">open_in_new</span>
                      Open in AI Hub
                    </button>
                    <button
                      onClick={() => setShowVideoModal(false)}
                      className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        }

        {/* Interactive Walkthrough Overlay */}
        {
          showWalkthroughOverlay && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl">{walkthroughSteps[walkthroughStep].icon}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{walkthroughSteps[walkthroughStep].title}</h3>
                      <p className="text-xs text-slate-500">Step {walkthroughStep + 1} of {walkthroughSteps.length}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowWalkthroughOverlay(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-8 text-lg">
                  {walkthroughSteps[walkthroughStep].description}
                </p>

                {/* Progress Dots */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  {walkthroughSteps.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-2 rounded-full transition-all ${idx === walkthroughStep
                        ? 'w-8 bg-primary'
                        : idx < walkthroughStep
                          ? 'w-2 bg-emerald-500'
                          : 'w-2 bg-slate-300 dark:bg-slate-700'
                        }`}
                    ></div>
                  ))}
                </div>

                <div className="flex items-center justify-between gap-4">
                  <button
                    onClick={() => setWalkthroughStep(Math.max(0, walkthroughStep - 1))}
                    disabled={walkthroughStep === 0}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg border border-slate-300 dark:border-slate-700 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined">arrow_back</span>
                    Previous
                  </button>
                  {walkthroughStep < walkthroughSteps.length - 1 ? (
                    <button
                      onClick={() => setWalkthroughStep(walkthroughStep + 1)}
                      className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:brightness-110 transition-all shadow-lg shadow-primary/20"
                    >
                      Next
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setShowWalkthroughOverlay(false);
                        setWalkthroughStep(0);
                      }}
                      className="flex items-center gap-2 px-6 py-3 rounded-lg bg-emerald-500 text-white font-semibold hover:brightness-110 transition-all shadow-lg shadow-emerald-500/20"
                    >
                      <span className="material-symbols-outlined">check_circle</span>
                      Complete
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        }

        {/* Language Selection Modal */}
        {
          showLanguageModal && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">Select Language</h3>
                    <button
                      onClick={() => setShowLanguageModal(false)}
                      className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">Choose your preferred learning language</p>
                </div>
                <div className="p-4 max-h-96 overflow-y-auto custom-scrollbar">
                  {languageOptions.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.name)}
                      className={`w-full flex items-center justify-between p-4 rounded-lg mb-2 transition-all ${selectedLanguage === lang.name
                        ? 'bg-primary/10 border-2 border-primary'
                        : 'border-2 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{lang.flag}</span>
                        <span className="font-medium">{lang.name}</span>
                      </div>
                      {selectedLanguage === lang.name && (
                        <span className="material-symbols-outlined text-primary">check_circle</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )
        }
      </div >
    </div >
  );
};

export default LessonContent;

