import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProfileDropdown from '../../components/ProfileDropdown';
import api from '../../services/api';
import '../../index.css';

const AILearningHub = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const notificationsRef = React.useRef(null);

  const userName = localStorage.getItem('userName') || 'User';
  const userEmail = localStorage.getItem('userEmail') || '';
  const userRole = localStorage.getItem('userRole') || 'learner';

  const [searchQuery, setSearchQuery] = useState('');
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [currentAudioProgress, setCurrentAudioProgress] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showWalkthroughOverlay, setShowWalkthroughOverlay] = useState(false);
  const [showWalkthroughPreview, setShowWalkthroughPreview] = useState(false);
  const [selectedWalkthrough, setSelectedWalkthrough] = useState(null);
  const [currentWalkthroughStep, setCurrentWalkthroughStep] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hubData, setHubData] = useState({
    recommendations: [],
    video_explainers: [],
    audio_summaries: [],
    walkthroughs: []
  });

  React.useEffect(() => {
    const fetchHubData = async () => {
      try {
        const res = await api.get('/learning/dashboard'); // Get streak/recap from dashboard
        // Actually we need ai-hub endpoint
        const hubRes = await api.get('/learning/ai-hub');
        setHubData(hubRes.data);
      } catch (err) {
        console.error("Failed to fetch AI Hub data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHubData();
  }, []);

  // Get first name for welcome message
  const firstName = userName.split(' ')[0];

  // Check if specific content should autoplay (from navigation state)
  const autoPlayContent = location.state?.autoPlay || false;
  const contentType = location.state?.contentType || null;
  const contentId = location.state?.contentId || null;

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
  React.useEffect(() => {
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

  // Real video and audio data will be mapping from hubData

  // Walkthrough data
  const walkthroughs = [
    {
      id: 1,
      title: 'JSON Masterclass',
      description: 'A step-by-step interactive lab for handling complex data structures.',
      fullDescription: 'Master JSON data manipulation with this comprehensive interactive walkthrough. Learn to parse, serialize, and work with complex nested structures. Perfect for API integration and data processing tasks.',
      level: 'Intermediate',
      duration: '25 min',
      icon: 'data_object',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      steps: [
        { name: 'JSON Syntax Basics', instruction: 'Learn the fundamental structure of JSON objects and arrays.', completed: false },
        { name: 'Nested Objects', instruction: 'Work with deeply nested data structures and access properties.', completed: false },
        { name: 'Data Validation', instruction: 'Validate JSON data and handle parsing errors gracefully.', completed: false },
        { name: 'Practical Exercise', instruction: 'Build a complete JSON processor for API responses.', completed: false }
      ],
      progress: 0,
      started: false
    },
    {
      id: 2,
      title: 'Python Setup Walkthrough',
      description: 'Complete guide to setting up your Python development environment.',
      fullDescription: 'Get your Python environment configured perfectly. Install Python, set up virtual environments, configure your IDE, and install essential packages. Everything you need to start coding.',
      level: 'Beginner',
      duration: '15 min',
      icon: 'settings',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      steps: [
        { name: 'Install Python', instruction: 'Download and install Python from python.org', completed: false },
        { name: 'Setup Virtual Environment', instruction: 'Create and activate a virtual environment for your project.', completed: false },
        { name: 'Install Packages', instruction: 'Use pip to install essential Python packages.', completed: false }
      ],
      progress: 0,
      started: false
    },
    {
      id: 3,
      title: 'Building Your First Program',
      description: 'Create a complete Python application from scratch.',
      fullDescription: 'Build your first real Python program step-by-step. Learn project structure, write clean code, handle user input, and create a working calculator application.',
      level: 'Beginner',
      duration: '30 min',
      icon: 'code',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      steps: [
        { name: 'Project Setup', instruction: 'Create project folders and main Python file.', completed: false },
        { name: 'Write Core Logic', instruction: 'Implement the main functionality of your program.', completed: false },
        { name: 'Add User Interface', instruction: 'Create an interactive command-line interface.', completed: false },
        { name: 'Test & Debug', instruction: 'Test your program and fix any issues.', completed: false }
      ],
      progress: 0,
      started: false
    },
    {
      id: 4,
      title: 'SQL Query Builder',
      description: 'Visualize joins and selections through a guided interface.',
      fullDescription: 'Master SQL queries with visual step-by-step guidance. Learn SELECT, JOIN, WHERE clauses, and complex queries. Build a complete understanding of relational databases.',
      level: 'Intermediate',
      duration: '20 min',
      icon: 'database',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      steps: [
        { name: 'Basic SELECT', instruction: 'Learn to query data from single tables.', completed: true },
        { name: 'WHERE Clauses', instruction: 'Filter data with conditions.', completed: true },
        { name: 'JOIN Operations', instruction: 'Combine data from multiple tables.', completed: true },
        { name: 'Advanced Queries', instruction: 'Use subqueries and aggregations.', completed: false }
      ],
      progress: 75,
      started: true
    }
  ];

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
    setShowVideoModal(true);
    setIsVideoPlaying(false);
  };

  const handleVideoTitleClick = (video) => {
    // Navigate to related Lesson Content (Page 7)
    // In real app, would use video.lessonId to navigate to specific lesson
    navigate('/learner/courses/1/lessons/7'); // Example: Functions lesson
  };

  const handleViewAllVideos = () => {
    console.log('Showing all videos...');
    alert('Filtering to show all video content...');
    // In real app, would filter/expand video section or navigate to dedicated videos page
  };

  const handlePlayVideoInModal = () => {
    setIsVideoPlaying(true);
    // In real app, would start actual video playback
  };

  const handleStartWalkthrough = (walkthrough) => {
    setSelectedWalkthrough(walkthrough);
    setCurrentWalkthroughStep(0);
    setShowWalkthroughOverlay(true);
  };

  const handleWalkthroughTitleClick = (walkthrough) => {
    setSelectedWalkthrough(walkthrough);
    setShowWalkthroughPreview(true);
  };

  const handleViewAllWalkthroughs = () => {
    console.log('Showing all walkthroughs...');
    alert('Filtering to show all walkthrough content...');
    // In real app, would filter/expand walkthrough section
  };

  const handleNextWalkthroughStep = () => {
    if (selectedWalkthrough && currentWalkthroughStep < selectedWalkthrough.steps.length - 1) {
      setCurrentWalkthroughStep(currentWalkthroughStep + 1);
    }
  };

  const handlePreviousWalkthroughStep = () => {
    if (currentWalkthroughStep > 0) {
      setCurrentWalkthroughStep(currentWalkthroughStep - 1);
    }
  };

  const handleCompleteWalkthrough = () => {
    alert(`Walkthrough "${selectedWalkthrough.title}" completed! 🎉`);
    setShowWalkthroughOverlay(false);
    setSelectedWalkthrough(null);
    setCurrentWalkthroughStep(0);
  };

  const handleAudioPlay = (audio) => {
    console.log('Playing audio:', audio.title);
    setPlayingAudioId(playingAudioId === audio.id ? null : audio.id);
    setSelectedAudio(audio);
    setShowAudioPlayer(true);
    setCurrentAudioProgress(audio.progress);
    // Add actual audio player logic here
  };

  const handleTranscriptView = (audio) => {
    setSelectedAudio(audio);
    setShowTranscriptModal(true);
  };

  const handleAudioDownload = (audio) => {
    console.log('Downloading audio:', audio.title);
    // In real app, this would trigger audio file download
    alert(`Downloading "${audio.title}"...`);
  };

  const handleStartReviewSession = () => {
    // Navigate to Revision Assistant or Lesson Content with review mode
    navigate('/learner/revision', {
      state: {
        topic: 'Python Functions',
        quizScore: 65,
        weakAreas: ['modular code', 'argument scoping']
      }
    });
  };

  const handleRecommendedQuiz = (quizId, topic) => {
    // Navigate to Assessment & Quiz (Page 12)
    navigate(`/learner/courses/1/assessments/${quizId}`, {
      state: {
        topic: topic,
        mode: 'practice'
      }
    });
  };

  // Personalized recommendations based on weak areas
  const recommendations = {
    videos: [
      {
        id: 'func-video-01',
        title: 'Understanding Scopes in Python',
        duration: '3:45',
        learners: '482',
        thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCo0AVYMJ5PkewHnLOOx2mfdZGRE8924W9V6vrlE5IWrH9xlij6wWCLZ9EDtM6IzRhgTDoteP90yXGfFhBWmvv7mjXVFvGh4x3pl0Nqt8hpnd-51BbPGwVtvbwHPCFcBvRg2074naCDUT1TyUscnv1pHa-JSr8FF-6hi0i3aqOdYe32uCm71GkQQvfdREDWkO514bmjGZqNwZ4D6fooCtbN0OduQTexK0t8403QH9N_9UIT06XjI1jaLUUwrjKIVyzWL6sKObAg2NQ',
        weakArea: 'argument scoping'
      },
      {
        id: 'lambda-video-03',
        title: 'Lambda Functions Explained',
        duration: '2:30',
        learners: '905',
        thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBq_Olb-r8AHbhoL52Bkb1burBLCrVgRI-DT6sGFF7HLw3LjPsKO3qKcimynlwgnBeu6o6CBSmqkIZjmbGs5fth6DDyjGk1f6xMizhS-jAuWm2HcPMDbubnBNhTwdnTPHOodMc8r5knaa4p5iPMe6-_ekNfktHh1BdnQ4HZPzBFrHv5LHW3FElFdr505PvygRqTiaoWa9j8euXeSjaTOBF1ijyf22bw7b6Xck0QwpnlXsdNfYReHd1ah93jQsJ-Oar62FF1PicxIoI',
        weakArea: 'modular code'
      }
    ],
    audio: [
      {
        id: 'func-audio-01',
        title: 'Python Functions Explained',
        duration: '12:04',
        progress: 33,
        transcript: 'Welcome to this comprehensive guide on Python functions. Functions are reusable blocks of code that perform specific tasks. They help organize your code and make it more maintainable. In Python, we define functions using the "def" keyword followed by the function name and parentheses...',
        weakArea: 'modular code'
      }
    ],
    quizzes: [
      {
        id: 'func-quiz-01',
        title: 'Python Functions Practice',
        questions: 15,
        duration: '20 min',
        difficulty: 'Intermediate',
        topic: 'Python Functions'
      }
    ]
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
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
            onClick={() => navigate('/learner/courses')}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer w-full text-left"
          >
            <span className="material-symbols-outlined">book_5</span>
            <span>My Courses</span>
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600/10 text-blue-600 font-semibold cursor-pointer w-full text-left">
            <span className="material-symbols-outlined">psychology</span>
            <span>AI Learning Hub</span>
          </button>
          <button
            onClick={() => navigate('/learner/analytics')}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer w-full text-left"
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
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

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 px-10 py-8">
          {/* Welcome Header */}
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h1 className="text-slate-900 dark:text-slate-100 text-4xl font-black tracking-tight mb-2">
                Welcome back, {firstName}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg">
                Your personalized learning path for today is ready.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Daily Streak</span>
                <span className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                  12 Days <span className="material-symbols-outlined text-orange-500 text-[20px] fill-1">local_fire_department</span>
                </span>
              </div>
            </div>
          </div>

          {/* Personalized Revision Assistant Hero */}
          <div className="mb-12">
            <h2 className="text-slate-900 dark:text-slate-100 text-xl font-bold mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">psychology</span>
              Personalized Revision Assistant
            </h2>
            <div className="relative overflow-hidden rounded-xl bg-white dark:bg-slate-900 p-1 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
              <div className="flex flex-col md:flex-row items-stretch bg-gradient-to-r from-white to-blue-600/5 dark:from-slate-900 dark:to-blue-600/10 rounded-lg overflow-hidden">
                <div className="flex-[1.5] p-8 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 text-blue-600 text-xs font-bold mb-4 w-fit">
                    <span className="material-symbols-outlined text-xs">bolt</span> AI RECOMMENDATION
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                    {hubData.recommendations.length > 0 ? `Mastering ${hubData.recommendations[0].title}` : `Keep Exploring!`}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-lg mb-6 leading-relaxed">
                    {hubData.recommendations.length > 0 ?
                      hubData.recommendations[0].reason :
                      "You've completed all your current recommendations. Enroll in more courses to get personalized AI learning paths!"}
                  </p>
                  <div className="flex gap-4 flex-wrap">
                    <button
                      onClick={handleStartReviewSession}
                      className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      <span className="material-symbols-outlined">auto_fix_high</span>
                      Start Review Session
                    </button>
                    <button className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-6 py-3 rounded-lg font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                      View Performance Analysis
                    </button>
                  </div>
                </div>
                <div className="flex-1 relative min-h-[300px] md:min-h-0">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBGeijTArNJDd1FDHmGwDwp6Xw_2mzQne37Dt-ubieUYUrCWGpBrP3MnPasfwPuKmptA9MM3K9t-b2eTismEEnVut5ArNw7N_gu_0-R9KBrwNN71WyTo6ezQBK-Ovpa7Jo0Qcvss1hGx6O-NyS6Cx3WpOhzpsr72t2mQwqTBU4WVQRZMsZvJH7NEhU739-dt2oXcoFvVAK325rmDWEL0weBOOyTcVX46lFFXjsTWoHbPQgoEkVhfuw4TlPIr-Kkyz9uhZJYAM1wom4')" }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-white md:from-transparent to-transparent dark:from-slate-900"></div>
                </div>
              </div>
            </div>

            {/* Personalized Recommendations Section */}
            <div className="mt-8">
              <h3 className="text-slate-900 dark:text-slate-100 text-lg font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[20px]">recommend</span>
                Recommended for You
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {hubData.recommendations.length > 0 ? (
                  hubData.recommendations.slice(0, 3).map((rec) => (
                    <div
                      key={rec.id}
                      onClick={() => navigate(`/learner/courses/1/lessons/${rec.id}`)}
                      className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:ring-2 hover:ring-blue-600/20 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-blue-600 text-[20px]">psychology</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {rec.title}
                          </h4>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {rec.concepts && rec.concepts.map((c, i) => (
                          <span key={i} className="px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-[10px] font-bold rounded">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 py-6 text-center text-slate-500 italic">No specific recommendations yet. Keep learning!</div>
                )}
              </div>
            </div>
          </div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left & Middle: Audio & Video */}
            <div className="lg:col-span-2 space-y-12">
              {/* Video Explainers Section */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-slate-900 dark:text-slate-100 text-xl font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600">play_circle</span>
                    Video Explainers
                  </h2>
                  <button
                    onClick={handleViewAllVideos}
                    className="text-blue-600 text-sm font-semibold hover:underline flex items-center gap-1"
                  >
                    View All Videos
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>
                <div className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar snap-x">
                  {hubData.video_explainers.length > 0 ? (
                    hubData.video_explainers.map((video) => (
                      <div
                        key={video.id}
                        className="flex-none w-72 snap-start group"
                      >
                        <div
                          onClick={() => handleVideoClick(video)}
                          className="relative aspect-video rounded-xl overflow-hidden mb-3 cursor-pointer bg-slate-200 dark:bg-slate-800"
                        >
                          <img src={`https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60`} alt={video.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                            <div className="bg-white/90 backdrop-blur rounded-full size-12 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300 shadow-xl">
                              <span className="material-symbols-outlined text-blue-600 fill-1">play_arrow</span>
                            </div>
                          </div>
                          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 backdrop-blur text-white text-[10px] font-bold rounded">
                            {video.duration}
                          </div>
                        </div>
                        <h4
                          onClick={() => handleVideoTitleClick(video)}
                          className="font-bold text-slate-800 dark:text-slate-200 leading-tight mb-1 group-hover:text-blue-600 transition-colors cursor-pointer"
                        >
                          {video.title}
                        </h4>
                        <p className="text-slate-500 dark:text-slate-400 text-xs">
                          Micro-learning • {video.learners} learners
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="w-full py-10 text-center text-slate-400 italic">No video explainers available yet.</div>
                  )}
                </div>
              </section>

              {/* Audio Learning Section */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-slate-900 dark:text-slate-100 text-xl font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600">headphones</span>
                    Audio Summaries & Podcasts
                  </h2>
                  <button
                    onClick={() => alert('Showing all audio content...')}
                    className="text-blue-600 text-sm font-semibold hover:underline cursor-pointer"
                  >
                    View All Audio Content →
                  </button>
                </div>
                <div className="space-y-4">
                  {hubData.audio_summaries.length > 0 ? (
                    hubData.audio_summaries.map((audio) => (
                      <div
                        key={audio.id}
                        className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-600/30 transition-all hover:shadow-md group"
                      >
                        <button
                          onClick={() => handleAudioPlay(audio)}
                          className={`size-12 rounded-full flex items-center justify-center transition-all ${playingAudioId === audio.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-blue-600/10 text-blue-600 hover:bg-blue-600 hover:text-white'
                            }`}
                          title="Play Audio"
                        >
                          <span className="material-symbols-outlined fill-1">
                            {playingAudioId === audio.id ? 'pause' : 'play_arrow'}
                          </span>
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 truncate">{audio.title}</h4>
                            <span className="text-xs font-medium text-slate-400">{audio.duration}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-slate-400 italic">No audio summaries available.</div>
                  )}
                </div>
              </section>
            </div>

            {/* Right Column: Interactive Walkthroughs */}
            <div className="lg:col-span-1">
              <section className="sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-slate-900 dark:text-slate-100 text-xl font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600">route</span>
                    Walkthroughs
                  </h2>
                  <button
                    onClick={handleViewAllWalkthroughs}
                    className="text-blue-600 text-sm font-semibold hover:underline flex items-center gap-1"
                  >
                    View All
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>
                <div className="space-y-6">
                  {walkthroughs.map((walkthrough) => (
                    <div
                      key={walkthrough.id}
                      className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm group hover:ring-2 hover:ring-blue-600/20 transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={`size-12 rounded-xl ${walkthrough.iconBg} ${walkthrough.iconColor} flex items-center justify-center`}>
                          <span className="material-symbols-outlined">{walkthrough.icon}</span>
                        </div>
                        <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                          {walkthrough.level}
                        </span>
                      </div>
                      <h4
                        onClick={() => handleWalkthroughTitleClick(walkthrough)}
                        className="font-bold text-slate-900 dark:text-slate-100 text-lg mb-2 cursor-pointer hover:text-blue-600 transition-colors"
                      >
                        {walkthrough.title}
                      </h4>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                        {walkthrough.description}
                      </p>

                      {walkthrough.steps.length > 0 && (
                        <div className="space-y-3 mb-6">
                          {walkthrough.steps.map((step, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <div className={`size-2 rounded-full ${step.completed ? 'bg-blue-600' : 'bg-blue-600/30'}`}></div>
                              <span className={`text-xs font-medium ${step.completed ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}`}>
                                {step.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {walkthrough.progress > 0 && (
                        <div className="flex items-center gap-2 mb-6">
                          <div className="flex-1 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 transition-all duration-500"
                              style={{ width: `${walkthrough.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400">{walkthrough.progress}% Done</span>
                        </div>
                      )}

                      <button
                        onClick={() => handleStartWalkthrough(walkthrough)}
                        className={`w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${walkthrough.started
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-blue-600 group-hover:text-white'
                          }`}
                      >
                        {walkthrough.started ? 'Continue Lab' : 'Start Guided Path'}
                        <span className="material-symbols-outlined text-[18px]">
                          {walkthrough.started ? 'forward' : 'chevron_right'}
                        </span>
                      </button>
                    </div>
                  ))}

                  {/* Premium CTA */}
                  <div className="bg-blue-600 rounded-xl p-6 text-white text-center">
                    <span className="material-symbols-outlined text-4xl mb-3">workspace_premium</span>
                    <h4 className="font-bold text-lg mb-1">Unlock AI Mentor</h4>
                    <p className="text-white/80 text-xs mb-4">Get real-time feedback and voice-guided support.</p>
                    <button className="w-full bg-white text-blue-600 py-2 rounded-lg font-bold text-sm hover:bg-slate-50 transition-colors">
                      Upgrade to Premium
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>

      {/* Transcript Modal */}
      {showTranscriptModal && selectedAudio && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                  {selectedAudio.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Full Transcript • {selectedAudio.duration}
                </p>
              </div>
              <button
                onClick={() => setShowTranscriptModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {selectedAudio.transcript}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-slate-200 dark:border-slate-800 gap-3">
              <button
                onClick={() => handleAudioDownload(selectedAudio)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">download</span>
                Download Transcript
              </button>
              <button
                onClick={() => {
                  setShowTranscriptModal(false);
                  handleAudioPlay(selectedAudio);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                Play Audio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Audio Player */}
      {showAudioPlayer && selectedAudio && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-2xl z-40 animate-slide-up">
          <div className="max-w-7xl mx-auto px-8 py-4">
            <div className="flex items-center gap-4">
              {/* Play/Pause Button */}
              <button
                onClick={() => setPlayingAudioId(playingAudioId === selectedAudio.id ? null : selectedAudio.id)}
                className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-all shadow-lg"
              >
                <span className="material-symbols-outlined fill-1 text-2xl">
                  {playingAudioId === selectedAudio.id ? 'pause' : 'play_arrow'}
                </span>
              </button>

              {/* Audio Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate mb-1">
                  {selectedAudio.title}
                </h4>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {Math.floor(currentAudioProgress * parseInt(selectedAudio.duration) / 100)}:
                    {String(Math.floor((currentAudioProgress * parseInt(selectedAudio.duration) / 100) % 60)).padStart(2, '0')}
                  </span>
                  <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden cursor-pointer">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all"
                      style={{ width: `${currentAudioProgress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedAudio.duration}
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTranscriptView(selectedAudio)}
                  className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  title="View Transcript"
                >
                  <span className="material-symbols-outlined">description</span>
                </button>
                <button
                  onClick={() => handleAudioDownload(selectedAudio)}
                  className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  title="Download"
                >
                  <span className="material-symbols-outlined">download</span>
                </button>
                <button
                  onClick={() => setShowAudioPlayer(false)}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  title="Close"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      {showVideoModal && selectedVideo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-5xl w-full shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-400">play_circle</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {selectedVideo.title}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {selectedVideo.duration} • {selectedVideo.learners} learners
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowVideoModal(false);
                  setIsVideoPlaying(false);
                }}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Video Player Area */}
            <div className="relative aspect-video bg-black">
              {!isVideoPlaying ? (
                // Video Thumbnail with Play Button
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url('${selectedVideo.thumbnail}')` }}
                >
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <button
                      onClick={handlePlayVideoInModal}
                      className="w-20 h-20 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition-all shadow-2xl hover:scale-110"
                    >
                      <span className="material-symbols-outlined fill-1 text-white text-5xl">play_arrow</span>
                    </button>
                  </div>
                </div>
              ) : (
                // Video Playing State (simulated)
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center mx-auto mb-4">
                      <span className="material-symbols-outlined text-blue-400 text-4xl fill-1">play_circle</span>
                    </div>
                    <p className="text-slate-400 text-sm">Video playing...</p>
                    <p className="text-slate-500 text-xs mt-2">(In production, actual video player would be embedded here)</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-800/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePlayVideoInModal}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">{isVideoPlaying ? 'pause' : 'play_arrow'}</span>
                  {isVideoPlaying ? 'Pause' : 'Play Video'}
                </button>
                <button
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                  title="Download Video"
                >
                  <span className="material-symbols-outlined">download</span>
                </button>
              </div>
              <button
                onClick={() => handleVideoTitleClick(selectedVideo)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-600 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">school</span>
                Go to Lesson
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Walkthrough Preview Modal */}
      {showWalkthroughPreview && selectedWalkthrough && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className={`size-14 rounded-xl ${selectedWalkthrough.iconBg} ${selectedWalkthrough.iconColor} flex items-center justify-center`}>
                  <span className="material-symbols-outlined text-2xl">{selectedWalkthrough.icon}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                    {selectedWalkthrough.title}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                      {selectedWalkthrough.duration}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
                      {selectedWalkthrough.level}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowWalkthroughPreview(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-6">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2 uppercase tracking-wider">About This Walkthrough</h4>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {selectedWalkthrough.fullDescription}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 uppercase tracking-wider">
                  What You'll Learn ({selectedWalkthrough.steps.length} Steps)
                </h4>
                <div className="space-y-3">
                  {selectedWalkthrough.steps.map((step, idx) => (
                    <div key={idx} className="flex gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">
                          {step.name}
                        </h5>
                        <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                          {step.instruction}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <button
                onClick={() => setShowWalkthroughPreview(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowWalkthroughPreview(false);
                  handleStartWalkthrough(selectedWalkthrough);
                }}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                Start Walkthrough
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Walkthrough Interactive Overlay */}
      {showWalkthroughOverlay && selectedWalkthrough && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
            {/* Overlay Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className={`size-12 rounded-xl ${selectedWalkthrough.iconBg} ${selectedWalkthrough.iconColor} flex items-center justify-center`}>
                  <span className="material-symbols-outlined">{selectedWalkthrough.icon}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {selectedWalkthrough.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Step {currentWalkthroughStep + 1} of {selectedWalkthrough.steps.length}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowWalkthroughOverlay(false);
                  setSelectedWalkthrough(null);
                  setCurrentWalkthroughStep(0);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Progress Bar */}
            <div className="px-6 pt-4">
              <div className="flex items-center gap-2 mb-2">
                {selectedWalkthrough.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${idx < currentWalkthroughStep
                      ? 'bg-green-600'
                      : idx === currentWalkthroughStep
                        ? 'bg-blue-600'
                        : 'bg-slate-200 dark:bg-slate-800'
                      }`}
                  ></div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>{Math.round(((currentWalkthroughStep + 1) / selectedWalkthrough.steps.length) * 100)}% Complete</span>
                <span>{selectedWalkthrough.steps.length - currentWalkthroughStep - 1} steps remaining</span>
              </div>
            </div>

            {/* Step Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-2xl mx-auto">
                {/* Step Number Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-bold mb-4">
                  <span className="material-symbols-outlined text-[18px]">route</span>
                  Step {currentWalkthroughStep + 1}
                </div>

                {/* Step Title */}
                <h4 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                  {selectedWalkthrough.steps[currentWalkthroughStep].name}
                </h4>

                {/* Step Instruction */}
                <p className="text-slate-700 dark:text-slate-300 text-lg leading-relaxed mb-8">
                  {selectedWalkthrough.steps[currentWalkthroughStep].instruction}
                </p>

                {/* Interactive Area (Simulated) */}
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-8 border-2 border-dashed border-slate-300 dark:border-slate-700">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4">
                      <span className="material-symbols-outlined text-3xl">play_circle</span>
                    </div>
                    <h5 className="font-bold text-slate-900 dark:text-slate-100 mb-2">Interactive Exercise Area</h5>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                      In production, this area would contain the actual interactive coding environment, terminal, or guided UI for completing the step.
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm font-medium">
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      Step simulated as complete
                    </div>
                  </div>
                </div>

                {/* Tips Section */}
                <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-amber-600 dark:text-amber-400">lightbulb</span>
                    <div>
                      <h6 className="font-bold text-amber-900 dark:text-amber-200 text-sm mb-1">Pro Tip</h6>
                      <p className="text-amber-800 dark:text-amber-300 text-sm">
                        Take your time with each step. You can always go back and review previous steps if needed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Footer */}
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={handlePreviousWalkthroughStep}
                disabled={currentWalkthroughStep === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${currentWalkthroughStep === 0
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
              >
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                Previous
              </button>

              {currentWalkthroughStep < selectedWalkthrough.steps.length - 1 ? (
                <button
                  onClick={handleNextWalkthroughStep}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
                >
                  Next Step
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </button>
              ) : (
                <button
                  onClick={handleCompleteWalkthrough}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                  Complete Walkthrough
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AILearningHub;
