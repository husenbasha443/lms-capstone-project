import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import ProfileDropdown from '../../components/ProfileDropdown';
import '../../index.css';

const SearchQA = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState(location.state?.query || '');
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  // Fetch enrolled courses for sidebar/filter
  useEffect(() => {
    const fetchEnrolled = async () => {
      try {
        const res = await api.get('/learning/dashboard');
        setEnrolledCourses(res.data.courses || []);
      } catch (err) {
        console.error("Failed to fetch enrolled courses:", err);
      }
    };
    fetchEnrolled();
  }, []);

  // Trigger search if query exists in state
  useEffect(() => {
    if (location.state?.query) {
      handleSearch(location.state.query);
    }
  }, [location.state?.query]);

  const handleSearch = async (q) => {
    const queryToUse = q || searchQuery;
    if (!queryToUse.trim()) return;

    setLoading(true);
    try {
      // Mocking for now to match UI
      setSearchResult({
        title: "Understanding " + queryToUse,
        content: `Refined insights about ${queryToUse} based on your enrolled courses.`,
        tags: ["Core Concept", "Important"],
        found_in: enrolledCourses.slice(0, 1)
      });
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const userName = localStorage.getItem('userName') || 'User';

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Sidebar Navigation */}
      <aside className="w-64 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg">
            <span className="material-symbols-outlined text-2xl">auto_awesome</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-blue-600">AI LMS</h2>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          <a
            onClick={() => navigate('/learner/dashboard')}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </a>
          <a
            onClick={() => navigate('/learner/courses')}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined">book_5</span>
            <span>My Courses</span>
          </a>
          <a
            onClick={() => navigate('/learner/ai-hub')}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined">psychology</span>
            <span>AI Learning Hub</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600/10 text-blue-600 font-semibold cursor-pointer">
            <span className="material-symbols-outlined">search</span>
            <span>Search & Q&A</span>
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navigation */}
        <header className="h-16 flex items-center justify-between px-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-10">
          <div className="flex items-center flex-1 max-w-xl">
            <div className="relative w-full group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600">search</span>
              <input
                className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-blue-600/20 text-sm placeholder:text-slate-400"
                placeholder="Search courses, concepts, or files..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 ml-8">
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer">
              <span className="material-symbols-outlined">notifications</span>
            </button>

            <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer">
              <span className="material-symbols-outlined">settings</span>
            </button>

            <ProfileDropdown
              userName={userName}
              userEmail={""}
              profileImage="https://lh3.googleusercontent.com/aida-public/AB6AXuDN3sIvMh27FT-1-5l63OFnJ96JCK02FnDfa-Jh7VCVLJtChF_DbUbjPXcSJaFL0xsMOdZ_3WrctqFTyQ76LwNYfnyTRGJSgp7x8gfEpZOUSmcrcomqGrkI1HzLgZ5wwtFpSPV3juSlq0S4dMI3hWsqpx9YrQl6r0VTM3rC4a9sICjU7H0jDrmFU5vn4_N7KYqAoCjCli95Dxc_2wpaC-KfhtkpGZwjOM8rriR-jihG9Fcgde5s5BVY-bI6q47y5U5MtXghVwNGiYM"
            />
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 px-6 py-8">
          <div className="w-full max-w-7xl mx-auto">
            {/* Search Section */}
            <div className="max-w-3xl mx-auto mb-12 text-center">
              <h2 className="text-4xl font-black mb-4 tracking-tight">AI Concept Search</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8 text-lg">
                Ask any question in natural language to get instant educational insights.
              </p>
              <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-blue-600">search</span>
                </div>
                <input
                  className="w-full pl-12 pr-32 py-4 bg-white dark:bg-slate-800 border-2 border-blue-600/20 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 rounded-xl text-lg shadow-xl shadow-blue-600/5 transition-all outline-none"
                  placeholder="e.g., What is a Python function?"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute inset-y-2 right-2 flex items-center">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <span>{loading ? 'Searching...' : 'Ask AI'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Main Content (AI Answer) */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                {searchResult ? (
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
                    {/* AI Brand Accent */}
                    <div className="absolute top-0 right-0 p-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/10 text-blue-600 text-xs font-bold uppercase tracking-wider">
                        <span className="material-symbols-outlined text-xs">auto_awesome</span> AI Verified
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">
                      {searchResult.title}
                    </h3>

                    <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed space-y-4">
                      <p>{searchResult.content}</p>
                    </div>

                    {/* Action Toolbar */}
                    <div className="mt-8 flex flex-wrap gap-3 border-t border-slate-100 dark:border-slate-700 pt-6">
                      <button
                        onClick={() => navigate('/learner/ai-hub')}
                        className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                      >
                        <span className="material-symbols-outlined">play_circle</span>
                        Watch Video
                      </button>
                      <button
                        onClick={() => navigate('/learner/ai-hub')}
                        className="flex items-center gap-2 bg-blue-600/10 text-blue-600 px-5 py-2.5 rounded-lg font-bold hover:bg-blue-600/20 transition-colors"
                      >
                        <span className="material-symbols-outlined">headphones</span>
                        Listen to Audio
                      </button>
                      <button className="flex items-center gap-2 bg-blue-600/10 text-blue-600 px-5 py-2.5 rounded-lg font-bold hover:bg-blue-600/20 transition-colors">
                        <span className="material-symbols-outlined">school</span>
                        Start Tutorial
                      </button>
                      <div className="flex-grow"></div>
                      <button className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <span className="material-symbols-outlined">bookmark</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-12 border border-dashed border-slate-200 dark:border-slate-700 text-center">
                    <span className="material-symbols-outlined text-6xl text-slate-300 mb-4 uppercase">search_insights</span>
                    <p className="text-slate-500 font-medium">Search for something to see AI insights</p>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-4 flex flex-col gap-8">
                {/* Found in Courses */}
                <section>
                  <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600">local_library</span>
                    Found in Courses
                  </h4>
                  <div className="space-y-4">
                    {enrolledCourses.length > 0 ? enrolledCourses.map((course) => (
                      <div
                        key={course.id}
                        onClick={() => navigate(`/learner/courses/${course.id}`)}
                        className="group bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <div className="size-12 rounded-lg overflow-hidden bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                            <span className="material-symbols-outlined">book</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold group-hover:text-blue-600 transition-colors truncate">{course.title}</p>
                            <p className="text-xs text-slate-500">{course.progress}% Completed</p>
                          </div>
                          <span className="material-symbols-outlined text-slate-300 group-hover:text-blue-600 flex-shrink-0">chevron_right</span>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-4 text-slate-500 italic text-sm">No courses enrolled yet.</div>
                    )}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SearchQA;
