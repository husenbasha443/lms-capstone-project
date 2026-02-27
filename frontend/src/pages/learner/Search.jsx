import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProfileDropdown from '../../components/ProfileDropdown';

export default function Search() {
  const navigate = useNavigate();
  const location = useLocation();
  const notificationsRef = useRef(null);
  
  const userName = localStorage.getItem('userName') || 'User';
  const userEmail = localStorage.getItem('userEmail') || '';
  const userRole = localStorage.getItem('userRole') || 'learner';
  
  const [searchQuery, setSearchQuery] = useState(location.state?.query || '');
  const [hasSearched, setHasSearched] = useState(!!location.state?.query);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFullAnswer, setShowFullAnswer] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [showWalkthroughOverlay, setShowWalkthroughOverlay] = useState(false);
  const [currentWalkthroughStep, setCurrentWalkthroughStep] = useState(0);

  // Sample suggested searches
  const suggestedSearches = [
    "What is a Python function?",
    "How do loops work?",
    "Explain variables and data types",
    "What is the difference between list and tuple?",
    "How to use if-else statements?"
  ];

  // Sample AI answer data
  const aiAnswer = {
    question: searchQuery || "What is a Python function?",
    shortAnswer: "A Python function is a reusable block of code that performs a specific task. It's defined using the 'def' keyword followed by a function name, parameters in parentheses, and a colon.",
    fullAnswer: "A Python function is a reusable block of code that performs a specific task. It's defined using the 'def' keyword followed by a function name, parameters in parentheses, and a colon. Functions help organize code, make it reusable, and improve readability. They can accept input parameters, process data, and return output values using the 'return' statement. Functions are fundamental building blocks in Python programming and follow the DRY (Don't Repeat Yourself) principle.",
    video: {
      id: 'vid-func-01',
      title: "Understanding Python Functions",
      duration: "5:30",
      thumbnail: "https://placehold.co/400x225/4F46E5/white?text=Functions+Video"
    },
    audio: {
      id: 'aud-func-01',
      title: "Python Functions Audio Summary",
      duration: "3:15"
    },
    tutorial: {
      id: 'tut-func-01',
      title: "Build Your First Function",
      steps: 4,
      duration: "10 min"
    }
  };

  // Sample related content
  const relatedLessons = [
    {
      id: 'lesson-3-1',
      courseId: '1',
      lessonId: '3',
      chapter: "Chapter 3",
      title: "Defining Functions",
      description: "Learn how to create and call functions"
    },
    {
      id: 'lesson-3-2',
      courseId: '1',
      lessonId: '4',
      chapter: "Chapter 3",
      title: "Function Parameters",
      description: "Understanding function arguments and parameters"
    },
    {
      id: 'lesson-3-3',
      courseId: '1',
      lessonId: '5',
      chapter: "Chapter 3",
      title: "Return Statements",
      description: "How functions return values"
    }
  ];

  // Sample cross-references
  const crossReferences = [
    {
      id: 'ref-1',
      title: "Variables and Data Types",
      type: "prerequisite",
      lessonId: '2'
    },
    {
      id: 'ref-2',
      title: "Return Statements",
      type: "related",
      lessonId: '5'
    },
    {
      id: 'ref-3',
      title: "Lambda Functions",
      type: "advanced",
      lessonId: '8'
    },
    {
      id: 'ref-4',
      title: "Scope and Closures",
      type: "advanced",
      lessonId: '9'
    }
  ];

  // Sample courses containing this topic
  const foundInCourses = [
    {
      id: '1',
      title: "Python 101: Introduction to Programming",
      chapter: "Chapter 3: Functions & Methods",
      progress: 60
    },
    {
      id: '2',
      title: "Advanced Python Programming",
      chapter: "Chapter 1: Function Deep Dive",
      progress: 0
    }
  ];

  // Walkthrough data for tutorial
  const tutorialWalkthrough = {
    id: 'tut-func-01',
    title: "Build Your First Function",
    steps: [
      {
        name: "Define the Function",
        instruction: "Start by using the 'def' keyword followed by your function name. Try creating a function called 'greet'."
      },
      {
        name: "Add Parameters",
        instruction: "Add a parameter called 'name' inside the parentheses. This allows your function to accept input."
      },
      {
        name: "Write Function Body",
        instruction: "Inside the function, write code to print a greeting message using the name parameter."
      },
      {
        name: "Call Your Function",
        instruction: "Outside the function, call it by typing greet('World') to see it in action!"
      }
    ]
  };

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

  // Handle search on Enter key
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
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

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setHasSearched(true);
      setShowFullAnswer(false);
    }
  };

  const handleSuggestedSearch = (query) => {
    setSearchQuery(query);
    setHasSearched(true);
    setShowFullAnswer(false);
  };

  const handleWatchVideo = () => {
    setSelectedVideo(aiAnswer.video);
    setShowVideoModal(true);
  };

  const handleListenAudio = () => {
    setSelectedAudio(aiAnswer.audio);
    setShowAudioPlayer(true);
    setIsAudioPlaying(true);
  };

  const handleStartTutorial = () => {
    setShowWalkthroughOverlay(true);
    setCurrentWalkthroughStep(0);
  };

  const handleViewLesson = (courseId, lessonId) => {
    navigate(`/learner/courses/${courseId}/lessons/${lessonId}`);
  };

  const handleCrossReferenceClick = (lessonId, title) => {
    // Can either navigate to lesson or do new search
    // For now, we'll navigate to the lesson
    navigate(`/learner/courses/1/lessons/${lessonId}`);
  };

  const handleCourseClick = (courseId, chapter) => {
    navigate(`/learner/courses/${courseId}`);
  };

  const handleNextWalkthroughStep = () => {
    if (currentWalkthroughStep < tutorialWalkthrough.steps.length - 1) {
      setCurrentWalkthroughStep(prev => prev + 1);
    }
  };

  const handlePreviousWalkthroughStep = () => {
    if (currentWalkthroughStep > 0) {
      setCurrentWalkthroughStep(prev => prev - 1);
    }
  };

  const handleCompleteWalkthrough = () => {
    alert('🎉 Tutorial completed! Great job!');
    setShowWalkthroughOverlay(false);
    setCurrentWalkthroughStep(0);
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
            onClick={() => navigate('/learner/courses')}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer w-full text-left"
          >
            <span className="material-symbols-outlined">book_5</span>
            <span>My Courses</span>
          </button>
          <button 
            onClick={() => navigate('/learner/ai-hub')}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer w-full text-left"
          >
            <span className="material-symbols-outlined">psychology</span>
            <span>AI Learning Hub</span>
          </button>
          <button 
            onClick={() => navigate('/learner/search')}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600/10 text-blue-600 font-semibold cursor-pointer w-full text-left"
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
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="relative h-16 flex items-center justify-between px-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-10">
          <div className="flex items-center flex-1 max-w-xl">
            <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="relative w-full group">
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
                        className={`px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer border-b border-slate-100 dark:border-slate-700 last:border-0 transition-colors ${
                          notification.unread ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
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

        {/* Search Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
          <div className="px-8 py-8">
            {/* Page Title */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">Search & Q&A</h1>
              <p className="text-slate-600 dark:text-slate-400">Ask questions and get AI-powered answers with related learning content</p>
            </div>

            {/* Search Bar Section */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 mb-6">
              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Ask anything... (e.g., What is a Python function?)"
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleSearch}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                >
                  <span className="material-symbols-outlined">search</span>
                  Search
                </button>
              </div>

              {/* Suggested Searches */}
              {!hasSearched && (
                <div>
                  <p className="text-sm text-slate-600 mb-3 font-medium">Suggested searches:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedSearches.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestedSearch(suggestion)}
                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm hover:bg-slate-200 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Search Results */}
            {hasSearched && (
              <>
                {/* AI Answer Section */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-sm border border-blue-200 p-6 mb-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-white text-xl">psychology</span>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-slate-800 mb-2">AI Answer</h2>
                      <p className="text-slate-700 leading-relaxed mb-3">
                        {showFullAnswer ? aiAnswer.fullAnswer : aiAnswer.shortAnswer}
                      </p>
                      <button
                        onClick={() => setShowFullAnswer(!showFullAnswer)}
                        className="text-blue-600 text-sm font-medium hover:underline"
                      >
                        {showFullAnswer ? 'Show less' : 'Read full answer'}
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
                    <button
                      onClick={handleWatchVideo}
                      className="flex items-center gap-3 p-4 bg-white rounded-lg hover:bg-slate-50 transition-colors border border-slate-200"
                    >
                      <span className="material-symbols-outlined text-blue-600 text-2xl">play_circle</span>
                      <div className="text-left">
                        <div className="font-medium text-slate-800">Watch Video</div>
                        <div className="text-sm text-slate-600">{aiAnswer.video.duration}</div>
                      </div>
                    </button>

                    <button
                      onClick={handleListenAudio}
                      className="flex items-center gap-3 p-4 bg-white rounded-lg hover:bg-slate-50 transition-colors border border-slate-200"
                    >
                      <span className="material-symbols-outlined text-purple-600 text-2xl">headphones</span>
                      <div className="text-left">
                        <div className="font-medium text-slate-800">Listen to Audio</div>
                        <div className="text-sm text-slate-600">{aiAnswer.audio.duration}</div>
                      </div>
                    </button>

                    <button
                      onClick={handleStartTutorial}
                      className="flex items-center gap-3 p-4 bg-white rounded-lg hover:bg-slate-50 transition-colors border border-slate-200"
                    >
                      <span className="material-symbols-outlined text-green-600 text-2xl">explore</span>
                      <div className="text-left">
                        <div className="font-medium text-slate-800">Start Tutorial</div>
                        <div className="text-sm text-slate-600">{aiAnswer.tutorial.duration}</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Related Content Section */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Related Lessons</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {relatedLessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer"
                        onClick={() => handleViewLesson(lesson.courseId, lesson.lessonId)}
                      >
                        <div className="text-sm text-blue-600 font-medium mb-2">{lesson.chapter}</div>
                        <h4 className="font-semibold text-slate-800 mb-2">{lesson.title}</h4>
                        <p className="text-sm text-slate-600 mb-3">{lesson.description}</p>
                        <button className="text-blue-600 text-sm font-medium hover:underline">
                          View Lesson →
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cross-References Section */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-slate-600">link</span>
                    <h3 className="text-lg font-bold text-slate-800">Cross-References</h3>
                  </div>
                  <div className="space-y-3">
                    {crossReferences.map((ref) => (
                      <button
                        key={ref.id}
                        onClick={() => handleCrossReferenceClick(ref.lessonId, ref.title)}
                        className="w-full flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-slate-400">arrow_forward</span>
                          <span className="font-medium text-slate-800">{ref.title}</span>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full ${
                          ref.type === 'prerequisite' ? 'bg-amber-100 text-amber-700' :
                          ref.type === 'advanced' ? 'bg-purple-100 text-purple-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {ref.type}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Found in Courses Section */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Found in Courses</h3>
                  <div className="space-y-3">
                    {foundInCourses.map((course) => (
                      <button
                        key={course.id}
                        onClick={() => handleCourseClick(course.id, course.chapter)}
                        className="w-full flex items-start gap-4 p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
                      >
                        <span className="material-symbols-outlined text-blue-600 text-2xl">school</span>
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-800 mb-1">{course.title}</h4>
                          <p className="text-sm text-slate-600 mb-2">{course.chapter}</p>
                          {course.progress > 0 && (
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-600 rounded-full"
                                  style={{ width: `${course.progress}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-slate-600">{course.progress}%</span>
                            </div>
                          )}
                        </div>
                        <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Empty State */}
            {!hasSearched && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-slate-400 text-5xl">search</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">Start Your Search</h3>
                <p className="text-slate-600">Ask any question about your courses and get AI-powered answers</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Video Player Modal */}
      {showVideoModal && selectedVideo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-slate-800 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold text-lg">{selectedVideo.title}</h3>
                <p className="text-slate-400 text-sm">{selectedVideo.duration}</p>
              </div>
              <button
                onClick={() => setShowVideoModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {/* Video Player Area */}
            <div className="aspect-video bg-slate-950 flex items-center justify-center">
              <img src={selectedVideo.thumbnail} alt={selectedVideo.title} className="w-full h-full object-cover" />
              <button className="absolute w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all">
                <span className="material-symbols-outlined text-white text-5xl">play_arrow</span>
              </button>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-800 px-6 py-4 flex items-center justify-between">
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center gap-2">
                  <span className="material-symbols-outlined">play_arrow</span>
                  Play
                </button>
                <button className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center gap-2">
                  <span className="material-symbols-outlined">download</span>
                  Download
                </button>
              </div>
              <button
                onClick={() => {
                  setShowVideoModal(false);
                  navigate('/learner/courses/1/lessons/7');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined">arrow_forward</span>
                Go to Lesson
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Audio Player */}
      {showAudioPlayer && selectedAudio && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-2xl z-40">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
            <button 
              onClick={() => setIsAudioPlaying(!isAudioPlaying)}
              className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
            >
              <span className="material-symbols-outlined text-2xl">
                {isAudioPlaying ? 'pause' : 'play_arrow'}
              </span>
            </button>
            
            <div className="flex-1">
              <div className="font-semibold">{selectedAudio.title}</div>
              <div className="text-sm text-white/80">{selectedAudio.duration} • Audio Summary</div>
            </div>

            <div className="flex-1 max-w-md">
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full w-1/3"></div>
              </div>
            </div>

            <button 
              onClick={() => setShowAudioPlayer(false)}
              className="w-10 h-10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>
      )}

      {/* Interactive Walkthrough Overlay */}
      {showWalkthroughOverlay && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Overlay Header */}
            <div className="bg-gradient-to-r from-green-600 to-blue-600 px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl">explore</span>
                <div>
                  <h3 className="font-semibold text-lg">{tutorialWalkthrough.title}</h3>
                  <p className="text-sm text-white/90">
                    Step {currentWalkthroughStep + 1} of {tutorialWalkthrough.steps.length}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowWalkthroughOverlay(false);
                  setCurrentWalkthroughStep(0);
                }}
                className="hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {/* Progress Bar */}
            <div className="bg-slate-100 px-6 py-3">
              <div className="flex items-center gap-2">
                {tutorialWalkthrough.steps.map((_, index) => (
                  <div
                    key={index}
                    className={`flex-1 h-2 rounded-full transition-all ${
                      index < currentWalkthroughStep ? 'bg-green-500' :
                      index === currentWalkthroughStep ? 'bg-blue-500' :
                      'bg-slate-300'
                    }`}
                  ></div>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full mb-3">
                    Step {currentWalkthroughStep + 1}
                  </span>
                  <h4 className="text-2xl font-bold text-slate-800 mb-3">
                    {tutorialWalkthrough.steps[currentWalkthroughStep].name}
                  </h4>
                  <p className="text-slate-600 text-lg leading-relaxed">
                    {tutorialWalkthrough.steps[currentWalkthroughStep].instruction}
                  </p>
                </div>

                {/* Interactive Exercise Area */}
                <div className="bg-slate-900 rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-slate-400 text-sm font-mono">exercise.py</span>
                    <span className="material-symbols-outlined text-slate-500">code</span>
                  </div>
                  <div className="font-mono text-sm text-green-400">
                    <div className="mb-2"># Try it yourself:</div>
                    <div className="text-slate-300">
                      {currentWalkthroughStep === 0 && "def greet():"}
                      {currentWalkthroughStep === 1 && "def greet(name):"}
                      {currentWalkthroughStep === 2 && "def greet(name):\n    print(f'Hello, {name}!')"}
                      {currentWalkthroughStep === 3 && "def greet(name):\n    print(f'Hello, {name}!')\n\ngreet('World')"}
                    </div>
                  </div>
                </div>

                {/* Pro Tip */}
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
                  <div className="flex gap-3">
                    <span className="material-symbols-outlined text-amber-600">lightbulb</span>
                    <div>
                      <div className="font-semibold text-amber-900 mb-1">Pro Tip</div>
                      <p className="text-sm text-amber-800">
                        {currentWalkthroughStep === 0 && "Function names should be lowercase with underscores for readability."}
                        {currentWalkthroughStep === 1 && "Parameters are like variables that exist only within the function."}
                        {currentWalkthroughStep === 2 && "Indentation matters in Python! Use 4 spaces for the function body."}
                        {currentWalkthroughStep === 3 && "Functions can be called multiple times with different arguments!"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Footer */}
            <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-t border-slate-200">
              <button
                onClick={handlePreviousWalkthroughStep}
                disabled={currentWalkthroughStep === 0}
                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                  currentWalkthroughStep === 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                <span className="material-symbols-outlined">arrow_back</span>
                Previous
              </button>

              {currentWalkthroughStep < tutorialWalkthrough.steps.length - 1 ? (
                <button
                  onClick={handleNextWalkthroughStep}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
                >
                  Next Step
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              ) : (
                <button
                  onClick={handleCompleteWalkthrough}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
                >
                  <span className="material-symbols-outlined">check_circle</span>
                  Complete Tutorial
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
