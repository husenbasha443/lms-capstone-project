import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProfileDropdown from '../../components/ProfileDropdown';

export default function RevisionAssistant() {
  const navigate = useNavigate();
  const location = useLocation();
  const notificationsRef = useRef(null);
  
  const userName = localStorage.getItem('userName') || 'User';
  const userEmail = localStorage.getItem('userEmail') || '';
  const userRole = localStorage.getItem('userRole') || 'learner';
  
  // Get data from navigation state (from AI Learning Hub or Dashboard)
  const passedData = location.state || {};
  const initialTopic = passedData.topic || null;
  const quizScore = passedData.quizScore || null;
  const weakAreas = passedData.weakAreas || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      type: 'ai',
      text: initialTopic 
        ? `I see you struggled with ${initialTopic} (scored ${quizScore}%). Let me help you improve in this area. What specific aspect would you like to focus on?`
        : "Hi! I'm your AI revision assistant. I can help you understand topics you're struggling with. What would you like to review today?"
    }
  ]);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showStudyPlanEditor, setShowStudyPlanEditor] = useState(false);

  // Quick prompts for chat
  const quickPrompts = [
    "Explain what I struggled with in simple terms",
    "Show me examples of common mistakes",
    "Give me practice problems",
    "What are the key concepts I need to master?"
  ];

  // Areas needing attention (based on quiz performance)
  const [areasNeedingAttention] = useState([
    {
      id: 1,
      topic: "Python Functions",
      quizScore: 40,
      courseId: '1',
      lessonId: '3',
      resources: {
        video: { id: 'vid-func-params', title: "Function Parameters", duration: "8:30" },
        audio: { id: 'aud-func-exp', title: "Functions Explained", duration: "6:15" },
        exercises: { count: 10, assessmentId: 'func-practice-01' }
      }
    },
    {
      id: 2,
      topic: "Loop Structures",
      quizScore: 55,
      courseId: '1',
      lessonId: '6',
      resources: {
        video: { id: 'vid-loops', title: "Mastering Loops", duration: "10:00" },
        audio: { id: 'aud-loops', title: "Loop Fundamentals", duration: "5:30" },
        exercises: { count: 8, assessmentId: 'loops-practice-01' }
      }
    },
    {
      id: 3,
      topic: "Data Types & Variables",
      quizScore: 65,
      courseId: '1',
      lessonId: '2',
      resources: {
        video: { id: 'vid-datatypes', title: "Understanding Data Types", duration: "7:45" },
        audio: { id: 'aud-vars', title: "Variables Deep Dive", duration: "4:20" },
        exercises: { count: 12, assessmentId: 'vars-practice-01' }
      }
    }
  ]);

  // Personalized study plan
  const [studyPlan, setStudyPlan] = useState([
    {
      id: 1,
      title: "Review Python Functions",
      duration: 30,
      type: "review", // review, practice, watch, listen
      completed: false,
      courseId: '1',
      lessonId: '3',
      resources: ['video', 'audio']
    },
    {
      id: 2,
      title: "Practice Loop Exercises",
      duration: 20,
      type: "practice",
      completed: false,
      assessmentId: 'loops-practice-01'
    },
    {
      id: 3,
      title: "Watch: Data Types Explained",
      duration: 15,
      type: "watch",
      completed: true,
      videoId: 'vid-datatypes'
    },
    {
      id: 4,
      title: "Complete Functions Quiz",
      duration: 25,
      type: "practice",
      completed: false,
      assessmentId: 'func-quiz-02'
    }
  ]);

  // Commonly misunderstood areas
  const commonlyMisunderstoodAreas = [
    {
      id: 1,
      title: "Function Parameters vs Arguments",
      description: "Understanding the difference between parameters and arguments",
      video: { id: 'vid-params-args', title: "Parameters vs Arguments", duration: "5:30" }
    },
    {
      id: 2,
      title: "Mutable vs Immutable Types",
      description: "How different data types behave when modified",
      video: { id: 'vid-mutable', title: "Mutable vs Immutable", duration: "7:15" }
    },
    {
      id: 3,
      title: "Scope and Variable Lifetime",
      description: "Where variables can be accessed and how long they exist",
      video: { id: 'vid-scope', title: "Understanding Scope", duration: "6:45" }
    },
    {
      id: 4,
      title: "List vs Tuple Differences",
      description: "When to use lists versus tuples in Python",
      video: { id: 'vid-list-tuple', title: "Lists vs Tuples", duration: "4:50" }
    }
  ];

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

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      // Add user message
      setChatMessages(prev => [...prev, { type: 'user', text: chatInput }]);
      
      // Simulate AI response
      setTimeout(() => {
        const aiResponse = generateAIResponse(chatInput);
        setChatMessages(prev => [...prev, { type: 'ai', text: aiResponse }]);
      }, 800);

      setChatInput('');
    }
  };

  const handleQuickPrompt = (prompt) => {
    setChatInput(prompt);
    // Auto-submit
    setChatMessages(prev => [...prev, { type: 'user', text: prompt }]);
    
    setTimeout(() => {
      const aiResponse = generateAIResponse(prompt);
      setChatMessages(prev => [...prev, { type: 'ai', text: aiResponse }]);
    }, 800);
  };

  const generateAIResponse = (input) => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('simple') || lowerInput.includes('explain')) {
      return "Let me break it down: Functions are like recipes - they take ingredients (parameters), follow steps (code), and produce a result (return value). The key is understanding that parameters are the placeholders you define, while arguments are the actual values you pass when calling the function.";
    } else if (lowerInput.includes('mistake') || lowerInput.includes('common')) {
      return "Common mistakes include: 1) Forgetting to return a value, 2) Confusing local vs global scope, 3) Not handling edge cases. I recommend watching the 'Function Parameters' video and practicing with the 10 exercises available.";
    } else if (lowerInput.includes('practice') || lowerInput.includes('problem')) {
      return "Great! I've prepared 10 practice exercises focusing on function definitions, parameters, and return statements. Click 'Practice: 10 Exercises' in the Python Functions section below to start.";
    } else if (lowerInput.includes('key') || lowerInput.includes('concept')) {
      return "Key concepts to master: 1) Function syntax (def, parameters, return), 2) Scope (local vs global), 3) Arguments (positional, keyword, default), 4) Return values. Focus on these and you'll see improvement quickly!";
    } else {
      return "That's a great question! Based on your performance, I suggest starting with the fundamentals. Watch the 'Function Parameters' video (8:30), then practice with exercises. This will build a strong foundation. Would you like me to create a custom study plan?";
    }
  };

  const handleStartReviewSession = (area) => {
    // Navigate to AI Learning Hub with curated content
    navigate('/learner/ai-hub', {
      state: {
        focusTopic: area.topic,
        reviewMode: true,
        courseId: area.courseId,
        lessonId: area.lessonId
      }
    });
  };

  const handleWatchVideo = (resource, area) => {
    navigate('/learner/ai-hub', {
      state: {
        autoPlayVideo: resource.id,
        topic: area.topic
      }
    });
  };

  const handleListenAudio = (resource, area) => {
    navigate('/learner/ai-hub', {
      state: {
        autoPlayAudio: resource.id,
        topic: area.topic
      }
    });
  };

  const handlePracticeExercises = (assessmentId, courseId = '1') => {
    navigate(`/learner/courses/${courseId}/assessments/${assessmentId}`, {
      state: { practiceMode: true }
    });
  };

  const handleToggleTaskComplete = (taskId) => {
    setStudyPlan(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleTaskClick = (task) => {
    if (task.type === 'review' && task.lessonId) {
      navigate(`/learner/courses/${task.courseId}/lessons/${task.lessonId}`);
    } else if (task.type === 'practice' && task.assessmentId) {
      navigate(`/learner/courses/1/assessments/${task.assessmentId}`, {
        state: { practiceMode: true }
      });
    } else if (task.type === 'watch' && task.videoId) {
      navigate('/learner/ai-hub', {
        state: { autoPlayVideo: task.videoId }
      });
    }
  };

  const handleWatchExplainer = (video) => {
    setSelectedVideo(video);
    setShowVideoModal(true);
  };

  const handleMisunderstoodTopicClick = (topic) => {
    navigate('/learner/search', {
      state: { query: topic.title }
    });
  };

  const getScoreColor = (score) => {
    if (score < 50) return 'text-red-600 bg-red-50';
    if (score < 70) return 'text-amber-600 bg-amber-50';
    return 'text-green-600 bg-green-50';
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
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
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

        {/* Revision Assistant Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-8 py-8">
            {/* Page Title */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-800 mb-2">AI Revision Assistant</h1>
              <p className="text-slate-600">Personalized guidance to help you improve in areas where you're struggling</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Chat Interface */}
              <div className="lg:col-span-2 space-y-6">
                {/* Chat Interface */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                  <div className="p-6 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-white">psychology</span>
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-800">Ask Your AI Assistant</h2>
                        <p className="text-sm text-slate-600">Get personalized help with topics you're struggling with</p>
                      </div>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                    {chatMessages.map((message, index) => (
                      <div key={index} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {message.type === 'ai' && (
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-blue-600 text-sm">psychology</span>
                          </div>
                        )}
                        <div className={`max-w-lg p-4 rounded-lg ${
                          message.type === 'user' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-slate-100 text-slate-800'
                        }`}>
                          <p className="text-sm leading-relaxed">{message.text}</p>
                        </div>
                        {message.type === 'user' && (
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Quick Prompts */}
                  <div className="px-6 pb-4">
                    <p className="text-xs text-slate-600 mb-2 font-medium">Quick prompts:</p>
                    <div className="flex flex-wrap gap-2">
                      {quickPrompts.map((prompt, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickPrompt(prompt)}
                          className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-xs hover:bg-slate-200 transition-colors"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Chat Input */}
                  <div className="p-6 border-t border-slate-200 bg-slate-50">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Ask me anything about your studies..."
                        className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      />
                      <button
                        onClick={handleSendMessage}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined">send</span>
                        Ask
                      </button>
                    </div>
                  </div>
                </div>

                {/* Areas Needing Attention */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-amber-600">warning</span>
                    <h2 className="text-xl font-bold text-slate-800">Areas Needing Attention</h2>
                  </div>

                  <div className="space-y-4">
                    {areasNeedingAttention.map((area, index) => (
                      <div key={area.id} className="border border-slate-200 rounded-lg p-5 hover:border-blue-300 transition-all">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-lg font-semibold text-slate-800">{index + 1}. {area.topic}</span>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getScoreColor(area.quizScore)}`}>
                                {area.quizScore}% quiz score
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Resources */}
                        <div className="space-y-2 mb-4 ml-4">
                          <button
                            onClick={() => handleWatchVideo(area.resources.video, area)}
                            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            <span className="material-symbols-outlined text-lg">play_circle</span>
                            Watch: {area.resources.video.title} ({area.resources.video.duration})
                          </button>
                          <button
                            onClick={() => handleListenAudio(area.resources.audio, area)}
                            className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
                          >
                            <span className="material-symbols-outlined text-lg">headphones</span>
                            Listen: {area.resources.audio.title} ({area.resources.audio.duration})
                          </button>
                          <button
                            onClick={() => handlePracticeExercises(area.resources.exercises.assessmentId, area.courseId)}
                            className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium"
                          >
                            <span className="material-symbols-outlined text-lg">edit_note</span>
                            Practice: {area.resources.exercises.count} Exercises
                          </button>
                        </div>

                        {/* Start Review Session Button */}
                        <button
                          onClick={() => handleStartReviewSession(area)}
                          className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined">play_arrow</span>
                          Start Review Session
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Commonly Misunderstood Areas */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-purple-600">help</span>
                    <h2 className="text-xl font-bold text-slate-800">Commonly Misunderstood Areas</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {commonlyMisunderstoodAreas.map((topic, index) => (
                      <div key={topic.id} className="border border-slate-200 rounded-lg p-4 hover:border-purple-300 hover:bg-purple-50 transition-all">
                        <button
                          onClick={() => handleMisunderstoodTopicClick(topic)}
                          className="w-full text-left mb-3"
                        >
                          <h3 className="font-semibold text-slate-800 mb-1">{index + 1}. {topic.title}</h3>
                          <p className="text-sm text-slate-600">{topic.description}</p>
                        </button>
                        <button
                          onClick={() => handleWatchExplainer(topic.video)}
                          className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
                        >
                          <span className="material-symbols-outlined text-lg">play_circle</span>
                          Watch Explainer ({topic.video.duration})
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Study Plan */}
              <div className="space-y-6">
                {/* Personalized Study Plan */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-green-600">task_alt</span>
                      <h2 className="text-lg font-bold text-slate-800">Today's Study Plan</h2>
                    </div>
                    <button
                      onClick={() => setShowStudyPlanEditor(!showStudyPlanEditor)}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Customize
                    </button>
                  </div>

                  <div className="space-y-3">
                    {studyPlan.map((task) => (
                      <div
                        key={task.id}
                        className={`border rounded-lg p-4 transition-all ${
                          task.completed 
                            ? 'border-green-200 bg-green-50' 
                            : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => handleToggleTaskComplete(task.id)}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                              task.completed
                                ? 'bg-green-600 border-green-600'
                                : 'border-slate-300 hover:border-blue-500'
                            }`}
                          >
                            {task.completed && (
                              <span className="material-symbols-outlined text-white text-sm">check</span>
                            )}
                          </button>
                          <button
                            onClick={() => handleTaskClick(task)}
                            className={`flex-1 text-left ${task.completed ? 'opacity-60' : ''}`}
                          >
                            <div className={`font-medium mb-1 ${task.completed ? 'line-through text-slate-600' : 'text-slate-800'}`}>
                              {task.title}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-600">{task.duration} min</span>
                              {task.resources && task.resources.includes('video') && (
                                <span className="material-symbols-outlined text-blue-600 text-sm">play_circle</span>
                              )}
                              {task.resources && task.resources.includes('audio') && (
                                <span className="material-symbols-outlined text-purple-600 text-sm">headphones</span>
                              )}
                            </div>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Study Plan Stats */}
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-slate-600">Progress Today</span>
                      <span className="font-semibold text-slate-800">
                        {studyPlan.filter(t => t.completed).length} / {studyPlan.length} tasks
                      </span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all"
                        style={{ width: `${(studyPlan.filter(t => t.completed).length / studyPlan.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Quick Navigation Card */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
                  <h3 className="font-bold text-slate-800 mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => navigate('/learner/dashboard')}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-white rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <span className="material-symbols-outlined text-blue-600">dashboard</span>
                      <span className="text-sm font-medium text-slate-800">Back to Dashboard</span>
                    </button>
                    <button
                      onClick={() => navigate('/learner/courses/1')}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-white rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <span className="material-symbols-outlined text-green-600">school</span>
                      <span className="text-sm font-medium text-slate-800">View Course</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Video Modal */}
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
              <div className="text-center">
                <button className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all mx-auto mb-4">
                  <span className="material-symbols-outlined text-white text-5xl">play_arrow</span>
                </button>
                <p className="text-slate-400">Video player simulation</p>
              </div>
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
                  navigate('/learner/ai-hub');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined">arrow_forward</span>
                Go to AI Hub
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
