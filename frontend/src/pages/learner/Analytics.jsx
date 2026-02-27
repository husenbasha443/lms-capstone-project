import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileDropdown from '../../components/ProfileDropdown';
import api from '../../services/api';

export default function Analytics() {
  const navigate = useNavigate();
  const notificationsRef = useRef(null);

  const [timeRange, setTimeRange] = useState('Last 7 days');
  const [hoveredDay, setHoveredDay] = useState(null);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    overall_progress: 0,
    enrolled_courses_count: 0,
    completed_lessons_count: 0,
    weekly_activity: [],
    difficult_topics: []
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/learning/analytics');
        setAnalyticsData(res.data);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const userName = localStorage.getItem('userName') || 'Alex';
  const userEmail = localStorage.getItem('userEmail') || '';
  const userRole = localStorage.getItem('userRole') || 'learner';

  // Mock notifications data
  const notifications = [
    {
      id: 1,
      type: 'deadline',
      icon: 'schedule',
      iconColor: 'text-rose-600',
      iconBg: 'bg-rose-100',
      title: 'Neural Nets Quiz Due Soon',
      message: 'Quiz deadline is tomorrow at 11:59 PM',
      time: '2 hours ago',
      unread: true
    },
    {
      id: 2,
      type: 'achievement',
      icon: 'military_tech',
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-100',
      title: 'New Badge Earned!',
      message: 'You earned "Python Master" badge',
      time: '5 hours ago',
      unread: true
    },
    {
      id: 3,
      type: 'ai',
      icon: 'psychology',
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      title: 'AI Generated Summary Ready',
      message: 'Your study session recap is available',
      time: 'Yesterday',
      unread: false
    },
    {
      id: 4,
      type: 'course',
      icon: 'auto_stories',
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-100',
      title: 'New Lesson Available',
      message: 'Module 4: Deep Learning has been released',
      time: '2 days ago',
      unread: false
    }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/learner/search', {
        state: { query: searchQuery }
      });
    }
  };

  // Handle search on Enter key
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  // Handle Ask AI button click
  const handleAskAI = () => {
    navigate('/learner/ai-hub', {
      state: { openChat: true }
    });
  };

  // Handle notifications toggle
  const handleNotificationsToggle = () => {
    setShowNotifications(!showNotifications);
  };

  // Weekly activity data (hours per day)
  // Weekly activity data (hours per day) mapping from backend
  const weeklyData = analyticsData.weekly_activity.map(item => ({
    day: item.day,
    hours: item.hours,
    height: Math.min(item.hours * 20, 100) // Scale hours to height percentage
  }));

  // Current courses data
  // Real course data will be mapping from analyticsData.current_courses

  // Achievements data
  const achievements = [
    {
      id: 1,
      title: 'Python Basics Master',
      icon: 'workspace_premium',
      earned: 'May 12',
      gradient: 'from-yellow-300 to-orange-500',
      shadowColor: 'shadow-orange-200',
      locked: false
    },
    {
      id: 2,
      title: 'AI Explorer',
      icon: 'rocket_launch',
      earned: 'Jun 05',
      gradient: 'from-blue-300 to-blue-600',
      shadowColor: 'shadow-blue-200',
      locked: false
    },
    {
      id: 3,
      title: 'Neural Networker',
      icon: 'psychology',
      progress: 80,
      locked: 'progress'
    },
    {
      id: 4,
      title: 'Data Wizard',
      icon: 'military_tech',
      locked: true
    },
    {
      id: 5,
      title: 'Creative AI',
      icon: 'auto_awesome',
      locked: true
    },
    {
      id: 6,
      title: 'Fast Learner',
      icon: 'speed',
      locked: true
    }
  ];

  // AI content usage data
  const aiContentUsage = [
    { type: 'Videos', icon: 'movie', hours: '12.4h', color: 'text-purple-500' },
    { type: 'Audio', icon: 'mic', hours: '8.1h', color: 'text-blue-500' },
    { type: 'Walks', icon: 'explore', hours: '15.0h', color: 'text-emerald-500' },
    { type: 'AI Q&A', icon: 'smart_toy', hours: '10.0h', color: 'text-orange-500' }
  ];

  // Streak days
  const streakDays = [
    { day: 'M', active: true, level: 'partial' },
    { day: 'T', active: true, level: 'partial' },
    { day: 'W', active: true, level: 'full' },
    { day: 'T', active: false, level: 'none' },
    { day: 'F', active: false, level: 'none' }
  ];

  const handleCourseClick = (courseId) => {
    navigate(`/learner/courses/${courseId}`);
  };

  const handleContinueLearning = (courseId) => {
    // In a real app, check if user was mid-lesson
    // For now, navigate to course overview
    navigate(`/learner/courses/${courseId}`);
  };

  const handleProgressBarClick = (courseId) => {
    navigate(`/learner/courses/${courseId}`);
  };

  const handleAIContentClick = (contentType) => {
    // Navigate to AI Hub with filtered view based on content type
    const filterMap = {
      'Videos': 'video',
      'Audio': 'audio',
      'Walks': 'walkthrough',
      'AI Q&A': 'qa'
    };
    navigate('/learner/ai-hub', { state: { filter: filterMap[contentType] } });
  };

  const handleBadgeClick = (badge) => {
    if (!badge.locked) {
      setSelectedBadge(badge);
      setShowBadgeModal(true);
    }
  };

  const closeBadgeModal = () => {
    setShowBadgeModal(false);
    setSelectedBadge(null);
  };

  const handleExploreCourses = () => {
    navigate('/learner/courses');
  };

  const handleDashboardClick = () => {
    navigate('/learner/dashboard');
  };

  const handleCoursesClick = () => {
    navigate('/learner/courses');
  };

  const handleCommunityClick = () => {
    navigate('/learner/community');
  };

  const handleViewAllBadges = () => {
    // Could navigate to a dedicated badges page or open a modal
    console.log('View all badges');
  };

  const handleNotifications = () => {
    console.log('Show notifications');
  };

  const handleSettings = () => {
    navigate('/learner/settings');
  };

  const handleProfileClick = () => {
    navigate('/learner/profile');
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar Navigation */}
      <aside className="w-64 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg">
            <span className="material-symbols-outlined text-2xl">auto_awesome</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-blue-600">AI LMS</h2>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <button
            onClick={() => navigate('/learner/dashboard')}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer w-full text-left"
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => navigate('/learner/my-courses')}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer w-full text-left"
          >
            <span className="material-symbols-outlined">book_5</span>
            <span>My Courses</span>
          </button>
          <button
            onClick={() => navigate('/learner/courses')}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer w-full text-left"
          >
            <span className="material-symbols-outlined">explore</span>
            <span>Explore Catalog</span>
          </button>
          <button
            onClick={() => navigate('/learner/ai-hub')}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer w-full text-left"
          >
            <span className="material-symbols-outlined">psychology</span>
            <span>AI Learning Hub</span>
          </button>
          <button
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600/10 text-blue-600 font-semibold cursor-pointer w-full text-left"
          >
            <span className="material-symbols-outlined">monitoring</span>
            <span>Analytics</span>
          </button>
          <button
            onClick={() => navigate('/learner/search')}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer w-full text-left"
          >
            <span className="material-symbols-outlined">search</span>
            <span>Search & QA</span>
          </button>

          <div className="pt-8 pb-2 px-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Personal</p>
          </div>

          <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer" href="#">
            <span className="material-symbols-outlined">bookmark</span>
            <span>Saved Resources</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer" href="#">
            <span className="material-symbols-outlined">settings</span>
            <span>Settings</span>
          </a>
        </nav>

        <div className="p-4 mt-auto border-t border-slate-100 dark:border-slate-800">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
            <p className="text-xs font-medium text-slate-500 mb-2 uppercase">Storage Used</p>
            <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full w-[65%]"></div>
            </div>
            <p className="text-[10px] mt-2 text-slate-400">1.3GB of 2GB cloud sync used</p>
          </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation */}
        <header className="relative h-16 flex items-center justify-between px-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-10">
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
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 px-10 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col gap-2 mb-8">
              <h1 className="text-slate-900 dark:text-slate-100 text-4xl font-black leading-tight tracking-tight">Learning Progress & Analytics</h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg font-normal">Welcome back, {userName}. Your AI-powered growth insights are ready.</p>
            </div>

            {/* Summary KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Overall Progress */}
              <div className="flex flex-col gap-4 rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center">
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider">Overall Progress</p>
                  <span className="material-symbols-outlined text-blue-600">donut_large</span>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-slate-900 dark:text-slate-100 text-3xl font-bold leading-tight">{analyticsData.overall_progress}%</p>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full transition-all duration-300" style={{ width: `${analyticsData.overall_progress}%` }}></div>
                  </div>
                  <p className="text-blue-600 dark:text-blue-400 text-sm font-medium mt-2 flex items-center gap-1">
                    Your average progress across all courses
                  </p>
                </div>
              </div>

              {/* Total Courses */}
              <div className="flex flex-col gap-4 rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center">
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider">Total Courses</p>
                  <span className="material-symbols-outlined text-blue-600">book</span>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-slate-900 dark:text-slate-100 text-3xl font-bold leading-tight">{analyticsData.enrolled_courses_count}</p>
                  <p className="text-blue-600 dark:text-blue-400 text-sm font-medium mt-2 flex items-center gap-1">
                    Courses you've started learning
                  </p>
                </div>
              </div>

              {/* Completed Lessons */}
              <div className="flex flex-col gap-4 rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center">
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider">Completed Lessons</p>
                  <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-slate-900 dark:text-slate-100 text-3xl font-bold leading-tight">{analyticsData.completed_lessons_count}</p>
                  <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium mt-2 flex items-center gap-1">
                    Great progress so far!
                  </p>
                </div>
              </div>
            </div>

            {/* Main Stats & Courses Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
              {/* Weekly Activity Chart */}
              <div className="lg:col-span-2 flex flex-col gap-6 rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-center">
                  <h3 className="text-slate-900 dark:text-slate-100 text-xl font-bold">Learning Stats</h3>
                  <select
                    className="text-sm border-slate-200 dark:border-slate-700 rounded-lg bg-slate-100 dark:bg-slate-800 py-1 pr-8 focus:ring-blue-600 focus:border-blue-600 cursor-pointer"
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                  >
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                  </select>
                </div>

                {/* Bar Chart */}
                <div className="flex items-end justify-between h-48 w-full px-2 gap-2 md:gap-4 mt-4">
                  {weeklyData.length > 0 ? weeklyData.map((data, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center flex-1 gap-2"
                      onMouseEnter={() => setHoveredDay(index)}
                      onMouseLeave={() => setHoveredDay(null)}
                    >
                      <div
                        className={`w-full rounded-t transition-all duration-300 cursor-pointer relative ${hoveredDay === index
                          ? 'bg-blue-600/60'
                          : 'bg-blue-600/30'
                          }`}
                        style={{ height: `${data.height}%` }}
                      >
                        {hoveredDay === index && (
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-700 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap animate-fade-in z-20">
                            {data.hours}h
                          </div>
                        )}
                      </div>
                      <span className={`text-[10px] md:text-xs font-medium transition-colors text-slate-500 dark:text-slate-400`}>
                        {data.day}
                      </span>
                    </div>
                  )) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 italic">
                      No activity data yet
                    </div>
                  )}
                </div>

                {/* Difficult Topics Breakdown */}
                <div className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-6">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">Focus Areas: Difficult Topics</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {analyticsData.difficult_topics.length > 0 ? analyticsData.difficult_topics.map((topic, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-rose-50 dark:bg-rose-900/20 rounded-lg border border-rose-100 dark:border-rose-800/30"
                      >
                        <span className="material-symbols-outlined text-rose-600">warning</span>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{topic.topic}</p>
                          <p className="text-xs text-rose-600 font-medium">{topic.count} struggles identified</p>
                        </div>
                      </div>
                    )) : (
                      <div className="col-span-full py-4 text-center text-slate-500 italic">
                        No difficult topics identified yet. Keep learning!
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Achievements sidebar removed or simplified if data not available */}
              <div className="flex flex-col gap-6">
                <h3 className="text-slate-900 dark:text-slate-100 text-xl font-bold">Quick Insights</h3>
                <div className="p-6 rounded-xl bg-blue-600/5 border border-blue-600/10">
                  <h4 className="font-bold text-blue-600 mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">psychology</span>
                    AI Learning Tip
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Based on your patterns, you learn best in the morning. Try scheduling your next lesson before 10 AM for better retention.
                  </p>
                </div>

                <button
                  onClick={handleExploreCourses}
                  className="w-full py-3 text-sm font-bold text-blue-600 hover:bg-blue-600/10 rounded-lg transition-colors border border-dashed border-blue-600/30"
                >
                  Find More Challenges
                </button>
              </div>
            </div>

            {/* Achievements Section */}
            <div className="flex flex-col gap-6 pb-12 mt-8">
              <div className="flex items-center justify-between">
                <h3 className="text-slate-900 dark:text-slate-100 text-xl font-bold">Achievements</h3>
                <button
                  onClick={handleViewAllBadges}
                  className="text-blue-600 text-sm font-semibold hover:underline"
                >
                  View all badges
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {achievements.map((badge) => (
                  <div
                    key={badge.id}
                    onClick={() => handleBadgeClick(badge)}
                    className={`flex flex-col items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center shadow-sm hover:shadow-md transition-all ${badge.locked === true ? 'opacity-40 grayscale cursor-not-allowed' : badge.locked === 'progress' ? 'opacity-60 grayscale cursor-pointer' : 'cursor-pointer'
                      }`}
                  >
                    <div className={`size-16 rounded-full flex items-center justify-center ${badge.locked
                      ? 'bg-slate-200 dark:bg-slate-700'
                      : `bg-gradient-to-br ${badge.gradient} shadow-lg ${badge.shadowColor}`
                      }`}>
                      <span className={`material-symbols-outlined text-3xl ${badge.locked ? 'text-slate-500 dark:text-slate-400' : 'text-white'
                        }`}>
                        {badge.icon}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{badge.title}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {badge.locked === true
                          ? 'Locked'
                          : badge.locked === 'progress'
                            ? `In progress (${badge.progress}%)`
                            : `Earned ${badge.earned}`
                        }
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Achievement Details Modal */}
      {showBadgeModal && selectedBadge && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeBadgeModal}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-8 shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center gap-6">
              {/* Badge Icon */}
              <div className={`size-24 rounded-full flex items-center justify-center bg-gradient-to-br ${selectedBadge.gradient} shadow-lg ${selectedBadge.shadowColor}`}>
                <span className="material-symbols-outlined text-white text-5xl">
                  {selectedBadge.icon}
                </span>
              </div>

              {/* Badge Title */}
              <div className="text-center">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">{selectedBadge.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Earned on {selectedBadge.earned}</p>
              </div>

              {/* Badge Description */}
              <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 w-full">
                <p className="text-sm text-slate-900 dark:text-slate-100 leading-relaxed">
                  {selectedBadge.id === 1 && "Congratulations! You've mastered the fundamentals of Python programming. This achievement recognizes your dedication to learning the core concepts of variables, data types, functions, and control structures."}
                  {selectedBadge.id === 2 && "You've explored the exciting world of AI! This badge celebrates your curiosity and engagement with AI-powered learning features including video explainers, audio summaries, and interactive walkthroughs."}
                </p>
              </div>

              {/* Badge Stats */}
              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">Rarity</p>
                  <p className="text-lg font-bold text-blue-600">
                    {selectedBadge.id === 1 ? 'Common' : 'Uncommon'}
                  </p>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">Earned By</p>
                  <p className="text-lg font-bold text-blue-600">
                    {selectedBadge.id === 1 ? '1,234' : '856'} learners
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={closeBadgeModal}
                className="mt-4 w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.2s ease-in;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(2px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        .animate-scale-in {
          animation: scaleIn 0.3s ease-out;
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
