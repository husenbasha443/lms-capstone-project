import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProfileDropdown from '../../components/ProfileDropdown';
import '../../index.css';

// Assessment data for different courses
const assessmentData = {
  '1': {
    title: 'Python Basics Assessment',
    module: 'Module 1: Fundamentals',
    icon: 'terminal',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-600/10',
    question: {
      text: 'What is the output of the following Python code snippet when executed?',
      code: `def my_func(x):
    if x > 0:
        return x * 2
    return x / 2

print(my_func(5))`,
      hint: 'Remember: In Python, the condition <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">x > 0</code> evaluates to true when x is positive. The function returns different values based on this condition.',
      answers: [
        { value: '2.5', text: '2.5', correct: false },
        { value: '10', text: '10', correct: true },
        { value: '5', text: '5', correct: false },
        { value: 'error', text: 'Error: indentation mismatch', correct: false }
      ]
    },
    aiTutor: {
      text: 'Confused about the <code className="bg-white/20 px-1 rounded">if</code> statement logic? Ask me for a conceptual explanation without giving away the answer.',
      keyword: 'if'
    },
    quickTip: '"In Python, the return statement ends function execution. Pay close attention to the value of \'x\' passed as an argument."'
  },
  '2': {
    title: 'Neural Networks Quiz',
    module: 'Module 2: Backpropagation',
    icon: 'psychology',
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-600/10',
    question: {
      text: 'During backpropagation in a neural network, what is the primary purpose of computing gradients?',
      code: `# Forward pass
z = w * x + b
a = sigmoid(z)

# Backward pass
dL/dw = ?`,
      hint: 'Gradients indicate the direction and magnitude of weight updates needed to minimize the loss function. They flow backward from output to input layers.',
      answers: [
        { value: 'store', text: 'To store intermediate activations for later use', correct: false },
        { value: 'update', text: 'To update weights in the direction that reduces loss', correct: true },
        { value: 'initialize', text: 'To initialize weight values randomly', correct: false },
        { value: 'normalize', text: 'To normalize input features', correct: false }
      ]
    },
    aiTutor: {
      text: 'Need help understanding <code className="bg-white/20 px-1 rounded">gradient descent</code> or chain rule? I can break down the math step-by-step.',
      keyword: 'gradient descent'
    },
    quickTip: '"Backpropagation applies the chain rule to compute partial derivatives layer by layer. Start from the loss and work backward through the network."'
  },
  '3': {
    title: 'UI/UX Design Principles',
    module: 'Module 2: Visual Hierarchy',
    icon: 'palette',
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-600/10',
    question: {
      text: 'Which design principle best describes using size, color, and placement to guide user attention?',
      code: null,
      hint: 'Visual hierarchy helps users understand the importance and relationships between different elements on a page. Larger, bolder, or contrasting elements naturally draw more attention.',
      answers: [
        { value: 'proximity', text: 'Proximity – grouping related elements together', correct: false },
        { value: 'hierarchy', text: 'Visual Hierarchy – guiding attention through size and contrast', correct: true },
        { value: 'alignment', text: 'Alignment – creating clean edges and structure', correct: false },
        { value: 'repetition', text: 'Repetition – maintaining consistency across pages', correct: false }
      ]
    },
    aiTutor: {
      text: 'Wondering how to apply <code className="bg-white/20 px-1 rounded">visual hierarchy</code> in your designs? I can show you real-world examples.',
      keyword: 'visual hierarchy'
    },
    quickTip: '"Visual hierarchy isn\'t just about making things bigger. Consider color contrast, whitespace, and positioning to create a natural reading flow."'
  }
};

const Assessment = () => {
  const navigate = useNavigate();
  const { courseId, assessmentId } = useParams();
  
  // Get assessment data for current course
  const currentAssessment = assessmentData[courseId] || assessmentData['1'];
  
  const userName = localStorage.getItem('userName') || 'User';
  const userEmail = localStorage.getItem('userEmail') || '';
  
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [totalQuestions] = useState(10);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showAIDrawer, setShowAIDrawer] = useState(false);
  const [questions, setQuestions] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const [completedQuestions, setCompletedQuestions] = useState([]);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (currentQuestion / totalQuestions) * 100;

  const handleNext = () => {
    if (currentQuestion < totalQuestions) {
      setCompletedQuestions([...completedQuestions, currentQuestion]);
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer('');
      setShowHint(false);
    } else {
      // Navigate to results page
      navigate(`/learner/courses/${courseId}/assessments/${assessmentId}/results`);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer('');
      setShowHint(false);
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const handleQuestionClick = (questionNum) => {
    setCurrentQuestion(questionNum);
    setSelectedAnswer('');
    setShowHint(false);
  };

  const handleSaveExit = () => {
    navigate(`/learner/courses/${courseId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`${currentAssessment.iconBg} p-2 rounded-lg ${currentAssessment.iconColor}`}>
                <span className="material-symbols-outlined block">{currentAssessment.icon}</span>
              </div>
              <div>
                <h1 className="text-lg font-bold leading-tight text-slate-900 dark:text-white">{currentAssessment.title}</h1>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{currentAssessment.module}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-xs text-slate-500 font-medium">Progress</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{currentQuestion} of {totalQuestions} Questions</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700">
                <span className="material-symbols-outlined text-primary text-xl">timer</span>
                <span className="text-lg font-bold tabular-nums text-slate-900 dark:text-white">{formatTime(timeElapsed)}</span>
              </div>
              <button 
                onClick={handleSaveExit}
                className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
              >
                Save &amp; Exit
              </button>
              <ProfileDropdown
                userName={userName}
                userEmail={userEmail}
              />
            </div>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800">
          <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-12 flex gap-8">
        {/* Main Assessment Content */}
        <div className="flex-1 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Question {currentQuestion}</h2>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-2 text-primary bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                <span className="material-symbols-outlined text-sm">lightbulb</span>
                Show Hint
              </button>
            </div>
          </div>

          {/* Hint Display */}
          {showHint && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3">
              <span className="material-symbols-outlined text-amber-600 text-xl">info</span>
              <div>
                <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Hint</p>
                <p className="text-sm text-amber-800 dark:text-amber-200" dangerouslySetInnerHTML={{ __html: currentAssessment.question.hint }}></p>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-8">
              <p className="text-lg leading-relaxed mb-6 text-slate-900 dark:text-white">
                {currentAssessment.question.text}
              </p>
              {currentAssessment.question.code && (
                <div className="bg-slate-900 dark:bg-slate-950 p-6 rounded-lg mb-8 relative group">
                  <pre className="text-sm md:text-base leading-relaxed text-slate-200">
                    <code>{currentAssessment.question.code}</code>
                  </pre>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-slate-400 hover:text-slate-200 transition-colors" title="Copy code">
                      <span className="material-symbols-outlined cursor-pointer">content_copy</span>
                    </button>
                  </div>
                </div>
              )}
              <div className="space-y-4">
                {currentAssessment.question.answers.map((answer, idx) => (
                  <label key={idx} className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all group ${
                    selectedAnswer === answer.value
                      ? 'border-primary bg-primary/5' 
                      : 'border-slate-100 dark:border-slate-800 hover:border-primary/50'
                  }`}>
                    <input 
                      className="w-5 h-5 text-primary border-slate-300 focus:ring-primary" 
                      name="answer" 
                      type="radio"
                      checked={selectedAnswer === answer.value}
                      onChange={() => setSelectedAnswer(answer.value)}
                    />
                    <span className={`ml-4 ${selectedAnswer === answer.value ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                      {answer.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="flex items-center justify-between pt-4 flex-wrap gap-4">
            <button 
              onClick={handlePrevious}
              disabled={currentQuestion === 1}
              className="flex items-center gap-2 px-6 py-3 border border-slate-300 dark:border-slate-700 rounded-lg font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              Previous
            </button>

            {/* Question Navigator */}
            <div className="hidden md:flex items-center gap-3">
              {questions.slice(0, 3).map((q) => (
                <button
                  key={q}
                  onClick={() => handleQuestionClick(q)}
                  className="w-8 h-8 rounded-full border-2 border-primary bg-primary flex items-center justify-center text-white font-bold text-sm hover:scale-110 transition-transform"
                >
                  <span className="material-symbols-outlined text-sm">check</span>
                </button>
              ))}
              <div 
                className="w-10 h-10 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center text-primary font-bold shadow-[0_0_15px_rgba(19,127,236,0.3)] cursor-pointer hover:scale-110 transition-transform"
              >
                {currentQuestion}
              </div>
              {questions.slice(4, 5).map((q) => (
                <button
                  key={q}
                  onClick={() => handleQuestionClick(q)}
                  className="w-8 h-8 rounded-full border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 font-bold text-xs hover:border-primary hover:text-primary transition-colors"
                >
                  {q}
                </button>
              ))}
              <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700"></div>
              <button
                onClick={() => handleQuestionClick(10)}
                className="w-8 h-8 rounded-full border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 font-bold text-xs hover:border-primary hover:text-primary transition-colors"
              >
                10
              </button>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={handleSkip}
                className="px-6 py-3 text-slate-500 dark:text-slate-400 font-semibold hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                Skip
              </button>
              <button 
                onClick={handleNext}
                className="flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold shadow-lg shadow-primary/20 transition-all"
              >
                Next Question
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar / AI Panel */}
        <aside className="w-80 hidden xl:block">
          <div className="sticky top-32 space-y-6">
            {/* AI Assistant Card */}
            <div className="bg-gradient-to-br from-primary to-blue-600 rounded-xl p-6 text-white shadow-xl shadow-primary/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/20 p-2 rounded-lg">
                  <span className="material-symbols-outlined">smart_toy</span>
                </div>
                <h3 className="font-bold">AI Tutor</h3>
              </div>
              <p className="text-sm text-blue-50 leading-relaxed mb-6" dangerouslySetInnerHTML={{ __html: currentAssessment.aiTutor.text }}></p>
              <button 
                onClick={() => setShowAIDrawer(true)}
                className="w-full bg-white text-primary py-3 rounded-lg font-bold text-sm hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">chat_bubble</span>
                Ask AI Assistant
              </button>
            </div>

            {/* Tips Card */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
              <h4 className="font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                <span className="material-symbols-outlined text-primary">info</span>
                Quick Tip
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                {currentAssessment.quickTip}
              </p>
            </div>

            {/* Learning Progress Visual */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-6 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 relative mb-4">
                <svg className="w-full h-full transform -rotate-90">
                  <circle className="text-slate-200 dark:text-slate-700" cx="48" cy="48" fill="transparent" r="40" stroke="currentColor" strokeWidth="8"></circle>
                  <circle className="text-primary" cx="48" cy="48" fill="transparent" r="40" stroke="currentColor" strokeDasharray="251.2" strokeDashoffset="150.7" strokeWidth="8"></circle>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-bold text-xl text-slate-900 dark:text-white">40%</div>
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase">Assessment Score Potential</span>
            </div>
          </div>
        </aside>
      </main>

      {/* Mobile FAB */}
      <div className="fixed bottom-6 right-6 xl:hidden z-40">
        <button 
          onClick={() => setShowAIDrawer(true)}
          className="bg-primary text-white p-4 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"
        >
          <span className="material-symbols-outlined">smart_toy</span>
        </button>
      </div>

      {/* AI Drawer */}
      {showAIDrawer && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-50 xl:hidden"
            onClick={() => setShowAIDrawer(false)}
          ></div>
          <div className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 transform transition-transform z-[60] ${
            showAIDrawer ? 'translate-x-0' : 'translate-x-full'
          }`}>
            <div className="h-full flex flex-col">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">smart_toy</span>
                  <h3 className="font-bold text-slate-900 dark:text-white">AI Learning Assistant</h3>
                </div>
                <button 
                  onClick={() => setShowAIDrawer(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg text-sm max-w-[80%] text-slate-900 dark:text-white">
                  How can I help you understand this question?
                </div>
                <div className="bg-primary text-white p-4 rounded-lg text-sm max-w-[80%] ml-auto">
                  Can you explain how indentation works in Python functions?
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg text-sm max-w-[80%] text-slate-900 dark:text-white">
                  Great question! Indentation in Python is not just for readability; it defines the scope of code blocks...
                </div>
              </div>
              <div className="p-6 border-t border-slate-200 dark:border-slate-800">
                <div className="relative">
                  <input 
                    className="w-full pl-4 pr-12 py-3 bg-slate-100 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary text-slate-900 dark:text-white" 
                    placeholder="Ask a question..." 
                    type="text"
                  />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-primary">
                    <span className="material-symbols-outlined">send</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Assessment;
