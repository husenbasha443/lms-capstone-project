import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // ── Call real API login ──
      const body = new URLSearchParams();
      body.append('username', formData.email);
      body.append('password', formData.password);

      const loginRes = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });

      if (!loginRes.ok) {
        const err = await loginRes.json();
        const detail = err.detail || 'Login failed';

        // Show specific messages for pending / revoked
        if (loginRes.status === 403) {
          setErrors({ submit: detail });
        } else {
          setErrors({ submit: detail });
        }
        setIsLoading(false);
        return;
      }

      const { access_token } = await loginRes.json();

      // ── Fetch user profile ──
      const meRes = await fetch(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      if (!meRes.ok) {
        setErrors({ submit: 'Failed to retrieve user profile.' });
        setIsLoading(false);
        return;
      }

      const user = await meRes.json();

      // ── Store auth data ──
      localStorage.setItem('token', access_token);
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userName', user.full_name);
      localStorage.setItem('userId', user.id);
      if (formData.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }

      // ── Route to role-specific dashboard ──
      const dashboards = {
        admin: '/dashboard/admin',
        trainer: '/dashboard/trainer',
        learner: '/dashboard/learner',
      };
      navigate(dashboards[user.role] || '/dashboard/learner');
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ submit: 'Network error. Please check your connection and try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <main className="w-full h-screen flex flex-col md:flex-row bg-slate-50 overflow-hidden">
      {/* Left Section:  Knowledge Intelligence Branding */}
      <section className="hidden md:flex md:w-1/2 lg:w-3/5 relative overflow-hidden bg-white border-r border-slate-100">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            alt="Intelligence and Growth"
            className="w-full h-full object-cover opacity-20 mix-blend-multiply"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCYAfZjF9ZfjKjoLpq9kBZeofxZb3D-bltjzYWhctYxJ9QZqGiM1YCZMFxte0EpF5tfGvPvs6mOZhap_7XjDeWlTrzMvjXUT459GVOUJ7_1ejLM2YjcivNh8CfrxPqby9ztnio8ZSwP7xpAAbc-cgMPfeACh5WwcOJOpK6bMPKaEm9TkOqbvFr2q1XH5k0flvmPcvXZqOI-3JF4wXdgEttmDLjMTI-_0lQIEZhSu9HdTuukx2g0swlYfjRbvyte-thdpyAHxie_5xoc"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-blue-50/30 to-white/80"></div>
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 30%, #DBEAFE 0%, transparent 40%), radial-gradient(circle at 80% 70%, #F1F5F9 0%, transparent 40%)'
            }}
          ></div>
        </div>

        {/* Content */}
        <div className="relative z-10 p-8 lg:p-16 flex flex-col justify-between h-full w-full">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-2 mb-8">
              <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                <span className="material-symbols-outlined text-xl">auto_awesome</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">LTC Platform</span>
            </div>

            {/* Heading */}
            <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight max-w-lg">
              Next-gen <span className="text-blue-600">Knowledge Intelligence.</span>
            </h1>

            {/* Subheading */}
            <p className="mt-4 text-base text-slate-500 max-w-md font-light leading-relaxed">
              A unified learning ecosystem powered by AI to empower learners, trainers, and executive
              leadership.
            </p>

            {/* GPT-4 Badge */}
            <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-xs font-medium text-blue-700">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
              Now with GPT-4 Core Integration
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-100">
            <div>
              <div className="text-2xl font-bold text-slate-900">99%</div>
              <div className="text-[10px] uppercase tracking-widest font-semibold text-slate-400 mt-1">
                Accuracy
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">24/7</div>
              <div className="text-[10px] uppercase tracking-widest font-semibold text-slate-400 mt-1">
                Insights
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">500+</div>
              <div className="text-[10px] uppercase tracking-widest font-semibold text-slate-400 mt-1">
                Partners
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Right Section: Login Form */}
      <section className="w-full md:w-1/2 lg:w-2/5 flex flex-col justify-center items-center px-6 py-6 lg:px-12 bg-slate-50 overflow-y-auto">
        <div className="w-full max-w-md bg-white p-6 md:p-7 rounded-2xl shadow-sm border border-slate-100">
          {/* Mobile Logo */}
          <div className="md:hidden flex items-center gap-2 mb-6 justify-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[18px]">psychology</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">LTC Platform</span>
          </div>

          {/* Form Header */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Welcome Back</h2>
            <p className="text-sm text-slate-500">Log in to your account to continue.</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">
                  mail
                </span>
                <input
                  className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border ${errors.email ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-blue-600/20 focus:border-blue-600'
                    } rounded-lg transition-all outline-none placeholder:text-slate-400 text-slate-900`}
                  id="email"
                  name="email"
                  placeholder="you@example.com"
                  required
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-700" htmlFor="password">
                  Password
                </label>
                <button
                  className="text-xs font-bold text-blue-600 hover:underline"
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">
                  lock
                </span>
                <input
                  className={`w-full pl-10 pr-11 py-2.5 text-sm bg-slate-50 border ${errors.password ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-blue-600/20 focus:border-blue-600'
                    } rounded-lg transition-all outline-none placeholder:text-slate-400 text-slate-900`}
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  type="button"
                  onClick={togglePasswordVisibility}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center">
              <input
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-600 transition-colors cursor-pointer"
                id="remember"
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              <label
                className="ml-2 text-sm text-slate-600 cursor-pointer select-none"
                htmlFor="remember"
              >
                Keep me signed in
              </label>
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              className="w-full py-2.5 px-4 text-sm bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md shadow-blue-200 transition-all active:scale-[0.99] flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Logging In...
                </>
              ) : (
                <>
                  Log In
                  <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">
                    arrow_forward
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs text-center text-slate-500">
              Don't have an account?{' '}
              <button
                className="text-blue-600 font-bold hover:underline cursor-pointer bg-transparent border-0 text-xs"
                onClick={() => navigate('/signup')}
                type="button"
              >
                Sign Up
              </button>
            </p>

            {/* Terms/Privacy/Support */}
            <div className="mt-4 flex items-center justify-center gap-4 text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
              <a className="hover:text-slate-600 transition-colors cursor-pointer" href="#">
                Terms
              </a>
              <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
              <a className="hover:text-slate-600 transition-colors cursor-pointer" href="#">
                Privacy
              </a>
              <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
              <a className="hover:text-slate-600 transition-colors cursor-pointer" href="#">
                Support
              </a>
            </div>
          </div>

          {/* Powered By Footer */}
          <div className="mt-6 flex justify-center border-t border-slate-50 pt-5">
            <div className="flex items-center gap-2 group cursor-default">
              <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                Powered by
              </span>
              <div className="flex items-center gap-1 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                <span className="material-symbols-outlined text-[14px] text-blue-600">
                  psychology
                </span>
                <span className="text-[11px] font-bold text-slate-500">LTC Intelligence</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Login;
