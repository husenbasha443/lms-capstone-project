import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProfileDropdown from '../../components/ProfileDropdown';
import '../../index.css';

// Results data for different courses
const resultsData = {
  '1': {
    performanceData: [
      { topic: "Variables", status: "mastered", icon: "verified", color: "emerald" },
      { topic: "Loops", status: "mastered", icon: "verified", color: "emerald" },
      { topic: "Functions", status: "review", icon: "error", color: "amber" },
      { topic: "Return Statements", status: "review", icon: "report", color: "rose" }
    ],
    aiInsight: 'You consistently identify loop logic but struggle with function scope. Focus on the "Return Statements" module to boost your score to 100%.',
    recommendations: [
      {
        type: "video",
        title: "Function Parameters Deep Dive",
        description: "Master how data flows in and out of your Python functions.",
        duration: "12:45",
        icon: "video_library",
        thumbnail: "https://lh3.googleusercontent.com/aida-public/AB6AXuAPL7TEVDvo1mqZO_kcH1TxtoO7jrz0Ephj39CwSFHbMWLIgqLVB5NKd5dmfWgKM-BNOX5jDAMR0glmwYH8CcT5_ZeO4-Q2rgbO4D7B4VtZB-B4nsXILUaOHiPMC8CWvy2dpoI40V0XNAR67DY_cDUClhXsfk6QTUU98NMzshA4xpNvy5sb7cgakygOJuEVaCukcBEQKE7wLUKwIzQB86sQ9UXWLEOD-NEUuwZKchzfrB8XRTVSuW9rFMsgaphIrdVCOGosxT99eds"
      },
      {
        type: "audio",
        title: "Return Statements Explained",
        description: "A 5-minute refresher on when and why to use the return keyword.",
        duration: "5:00",
        icon: "podcasts",
        bgColor: "primary"
      },
      {
        type: "practice",
        title: "Return Value Exercises",
        description: "15 targeted challenges to solidify your understanding through coding.",
        duration: "15 exercises",
        icon: "quiz",
        bgColor: "emerald"
      }
    ]
  },
  '2': {
    performanceData: [
      { topic: "Activation Functions", status: "mastered", icon: "verified", color: "emerald" },
      { topic: "Forward Pass", status: "mastered", icon: "verified", color: "emerald" },
      { topic: "Gradient Computation", status: "review", icon: "error", color: "amber" },
      { topic: "Weight Updates", status: "review", icon: "report", color: "rose" }
    ],
    aiInsight: 'Your understanding of forward propagation is strong, but gradient calculation and optimization steps need more practice. Review the chain rule and gradient descent algorithms.',
    recommendations: [
      {
        type: "video",
        title: "Backpropagation Step-by-Step",
        description: "Visual walkthrough of how gradients flow backward through neural networks.",
        duration: "18:30",
        icon: "video_library",
        thumbnail: "https://lh3.googleusercontent.com/aida-public/AB6AXuCEwCakavR3A6U55aIk20ecNCSiHfO5-8XkHl7owlqewa-s_YC2HvlP4Yj9YcLmbvZcsxllvuZ1OFu655TVftAvhdyIewOeUeIiADmmSTJW8TAGPuZxtjPmfS1PuQ7y4EjMa6ULSAAi8PPocjemGCLhIA_qtmaZP2-GeObETmtdcFb0x-1GDFMDNhm98bTASVFeXY6LpfAOiAR_Igmk4Y1gHXscZSd3wfd2cKevnV9rGdss-oxqbPMZmYJzColbgPhgTdK0y7A6tu4"
      },
      {
        type: "audio",
        title: "Chain Rule Simplified",
        description: "An audio explanation of how the chain rule enables backpropagation.",
        duration: "8:15",
        icon: "podcasts",
        bgColor: "primary"
      },
      {
        type: "practice",
        title: "Gradient Descent Drills",
        description: "20 hands-on exercises to strengthen your optimization intuition.",
        duration: "20 exercises",
        icon: "quiz",
        bgColor: "emerald"
      }
    ]
  },
  '3': {
    performanceData: [
      { topic: "Color Theory", status: "mastered", icon: "verified", color: "emerald" },
      { topic: "Typography", status: "mastered", icon: "verified", color: "emerald" },
      { topic: "Visual Hierarchy", status: "review", icon: "error", color: "amber" },
      { topic: "User Flow", status: "review", icon: "report", color: "rose" }
    ],
    aiInsight: 'You have a solid grasp of foundational design elements, but structuring information and guiding user behavior needs more attention. Practice creating user journey maps.',
    recommendations: [
      {
        type: "video",
        title: "Visual Hierarchy Masterclass",
        description: "Learn how to guide user attention through size, color, and placement.",
        duration: "14:20",
        icon: "video_library",
        thumbnail: "https://lh3.googleusercontent.com/aida-public/AB6AXuAZGqjGEsJtIJdLpr2eHWtA_mxTA8JjXKD0oAC8TNRtZ2iLTiAVYxVYboHriKP-kP3KCVtmdxSd_IbzcBrk3QXfD_RZ5nrv_H8kogpeoFDqliYPns4c6lHxUNRwkBXeeJWbiKGArqcNw-dwxEXfZ1Pni3p2pQ29wXzEGJ6LBqOZ4eaYmzzr3guWnv1-hGbwcb-JRiSs9kv3DU4HnNPdBXZevNwD3LXJZNwUA9QVLEGD-I20ADhoVLOi8pWpBKQxyxYiKdYi_0AuwJ8"
      },
      {
        type: "audio",
        title: "User Flow Fundamentals",
        description: "An 8-minute guide to mapping user journeys and decision points.",
        duration: "8:00",
        icon: "podcasts",
        bgColor: "primary"
      },
      {
        type: "practice",
        title: "Wireframe Challenges",
        description: "12 real-world scenarios to practice hierarchy and layout design.",
        duration: "12 exercises",
        icon: "quiz",
        bgColor: "emerald"
      }
    ]
  }
};

const AssessmentResults = () => {
  const navigate = useNavigate();
  const { courseId, assessmentId } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef(null);
  
  // Get results data for current course
  const currentResults = resultsData[courseId] || resultsData['1'];
  
  const userName = localStorage.getItem('userName') || 'Alex';
  const userEmail = localStorage.getItem('userEmail') || '';
  const userRole = localStorage.getItem('userRole') || 'learner';
  
  const score = 80;
  const correctAnswers = 8;
  const incorrectAnswers = 2;
  const totalTime = "12m 30s";

  const stars = Array(5).fill(0).map((_, i) => i < 4);

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
            onClick={() => navigate('/learner/analytics')}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer w-full text-left"
          >
            <span className="material-symbols-outlined">monitoring</span>
            <span>Analytics</span>
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
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 py-8">
        <div className="flex flex-col max-w-[1400px] flex-1 px-6">
          {/* Celebratory Hero Card */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row items-stretch justify-start rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
              <div className="w-full md:w-1/3 bg-primary/5 dark:bg-primary/10 flex flex-col items-center justify-center p-8 border-r border-slate-200 dark:border-slate-800 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                  <div className="absolute top-[-20%] left-[-20%] w-64 h-64 rounded-full bg-primary blur-3xl"></div>
                  <div className="absolute bottom-[-20%] right-[-20%] w-64 h-64 rounded-full bg-primary blur-3xl"></div>
                </div>
                <p className="text-primary text-sm font-bold uppercase tracking-wider mb-2 relative z-10">Quiz Score</p>
                <div className="text-primary text-6xl font-black leading-tight mb-4 relative z-10">{score}%</div>
                <div className="flex gap-1 mb-2 relative z-10">
                  {stars.map((filled, i) => (
                    <span 
                      key={i}
                      className="material-symbols-outlined"
                      style={{ 
                        fontVariationSettings: filled ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                        color: filled ? '#fbbf24' : '#d1d5db'
                      }}
                    >
                      star
                    </span>
                  ))}
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium relative z-10">{correctAnswers} out of {correctAnswers + incorrectAnswers} correct</p>
              </div>
              <div className="flex w-full md:w-2/3 flex-col justify-center p-8 gap-4">
                <div>
                  <h1 className="text-slate-900 dark:text-white text-3xl font-bold leading-tight tracking-tight mb-2">Great job, {userName}!</h1>
                  <p className="text-slate-600 dark:text-slate-400 text-lg font-normal leading-relaxed">
                    You've shown a strong grasp of the fundamentals. With a quick review of a few key concepts, you'll be ready for the certification exam.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 mt-2">
                  <button 
                    onClick={() => navigate('/learner/revision')}
                    className="flex min-w-[140px] items-center gap-2 justify-center rounded-lg h-12 px-6 bg-primary text-white text-sm font-bold transition-all hover:bg-primary/90 shadow-md shadow-primary/20"
                  >
                    <span className="material-symbols-outlined text-[20px]">play_circle</span>
                    <span>Start Review Session</span>
                  </button>
                  <button 
                    onClick={() => navigate(`/learner/courses/${courseId}/assessments/${assessmentId}`)}
                    className="flex min-w-[140px] items-center gap-2 justify-center rounded-lg h-12 px-6 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-bold transition-all hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <span className="material-symbols-outlined text-[20px]">refresh</span>
                    <span>Retake Quiz</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Correct Answers</p>
              </div>
              <p className="text-slate-900 dark:text-white text-3xl font-bold">{correctAnswers}</p>
            </div>
            <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-rose-500">cancel</span>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Incorrect Answers</p>
              </div>
              <p className="text-slate-900 dark:text-white text-3xl font-bold">{incorrectAnswers}</p>
            </div>
            <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">schedule</span>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Total Time</p>
              </div>
              <p className="text-slate-900 dark:text-white text-3xl font-bold">{totalTime}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Breakdown */}
            <div className="lg:col-span-1 space-y-6">
              <div>
                <h3 className="text-slate-900 dark:text-white text-xl font-bold mb-4">Performance Breakdown</h3>
                <div className="space-y-3">
                  {currentResults.performanceData.map((item, idx) => (
                    <div 
                      key={idx}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        item.color === 'emerald' 
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800' 
                          : item.color === 'amber'
                          ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800'
                          : 'bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`material-symbols-outlined ${
                          item.color === 'emerald' 
                            ? 'text-emerald-600' 
                            : item.color === 'amber'
                            ? 'text-amber-600'
                            : 'text-rose-600'
                        }`}>
                          {item.icon}
                        </span>
                        <span className={`font-medium ${
                          item.color === 'emerald' 
                            ? 'text-emerald-900 dark:text-emerald-100' 
                            : item.color === 'amber'
                            ? 'text-amber-900 dark:text-amber-100'
                            : 'text-rose-900 dark:text-rose-100'
                        }`}>
                          {item.topic}
                        </span>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${
                        item.color === 'emerald' 
                          ? 'text-emerald-600 bg-emerald-100 dark:bg-emerald-800' 
                          : item.color === 'amber'
                          ? 'text-amber-600 bg-amber-100 dark:bg-amber-800'
                          : 'text-rose-600 bg-rose-100 dark:bg-rose-800'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/10 dark:border-primary/20">
                <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">lightbulb</span>
                  AI Insight
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {currentResults.aiInsight}
                </p>
              </div>
            </div>

            {/* Right Column: AI Recommendations */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-slate-900 dark:text-white text-xl font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">auto_awesome</span>
                  Personalized Recommendations
                </h3>
                <button 
                  onClick={() => navigate('/learner/ai-hub')}
                  className="text-primary text-sm font-semibold hover:underline"
                >
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {currentResults.recommendations.map((rec, idx) => (
                  <div 
                    key={idx}
                    className="group flex flex-col md:flex-row gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer"
                  >
                    {rec.type === 'video' ? (
                      <div 
                        className="w-full md:w-40 h-24 bg-cover bg-center rounded-lg shrink-0 relative overflow-hidden" 
                        style={{ backgroundImage: `url("${rec.thumbnail}")` }}
                      >
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="material-symbols-outlined text-white text-4xl">play_circle</span>
                        </div>
                        <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1 rounded">{rec.duration}</div>
                      </div>
                    ) : (
                      <div className={`w-full md:w-40 h-24 flex items-center justify-center rounded-lg shrink-0 transition-colors ${
                        rec.bgColor === 'primary' 
                          ? 'bg-primary/10 group-hover:bg-primary/20' 
                          : 'bg-emerald-50 dark:bg-emerald-900/20 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30'
                      }`}>
                        <span className={`material-symbols-outlined text-4xl ${
                          rec.bgColor === 'primary' ? 'text-primary' : 'text-emerald-600'
                        }`}>
                          {rec.type === 'audio' ? 'headphones' : 'terminal'}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-col justify-center flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="material-symbols-outlined text-[16px] text-slate-600 dark:text-slate-400">{rec.icon}</span>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">
                          {rec.type === 'video' ? 'Video Lesson' : rec.type === 'audio' ? 'Audio Summary' : 'Interactive Practice'}
                        </span>
                      </div>
                      <h4 className="text-slate-900 dark:text-white font-bold text-lg leading-tight group-hover:text-primary transition-colors">{rec.title}</h4>
                      <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">{rec.description}</p>
                    </div>
                    <div className="flex items-center pr-2">
                      <span className="material-symbols-outlined text-slate-300 dark:text-slate-700 group-hover:text-primary transition-colors">arrow_forward_ios</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Final Actions */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-slate-600 dark:text-slate-400 text-sm italic">Ready to move on? You can always come back to these reviews later.</p>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => navigate(`/learner/courses/${courseId}`)}
                    className="text-slate-600 dark:text-slate-400 text-sm font-bold hover:text-primary transition-colors underline underline-offset-4"
                  >
                    Skip for now
                  </button>
                  <button 
                    onClick={() => navigate(`/learner/courses/${courseId}`)}
                    className="flex items-center gap-2 justify-center rounded-lg h-12 px-8 bg-primary text-white text-sm font-bold transition-all hover:bg-primary/90 shadow-md shadow-primary/20"
                  >
                    <span>Continue Course</span>
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

          {/* Footer */}
          <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 px-10">
            <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <span className="material-symbols-outlined text-[18px]">copyright</span>
                <span className="text-sm font-medium">2024 AI Learning Lab. All rights reserved.</span>
              </div>
              <div className="flex gap-8">
                <a className="text-slate-600 dark:text-slate-400 hover:text-primary text-sm font-medium cursor-pointer">Privacy Policy</a>
                <a className="text-slate-600 dark:text-slate-400 hover:text-primary text-sm font-medium cursor-pointer">Terms of Service</a>
                <a className="text-slate-600 dark:text-slate-400 hover:text-primary text-sm font-medium cursor-pointer">Help Center</a>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default AssessmentResults;
