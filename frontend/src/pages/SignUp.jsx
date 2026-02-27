import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'learner',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and privacy policy';
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
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.fullName.trim(),
          email: formData.email.toLowerCase(),
          password: formData.password,
          role: formData.role,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setErrors({ submit: err.detail || 'Registration failed. Please try again.' });
        setIsLoading(false);
        return;
      }

      // Success — show pending approval message
      setSuccess(true);
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ submit: 'Network error. Please check your connection and try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(prev => !prev);
  };

  // ── Success Screen ──
  if (success) {
    return (
      <main className="w-full h-screen flex items-center justify-center bg-slate-50">
        <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-amber-600 text-3xl">hourglass_top</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Registration Submitted!</h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            Your account has been created and is <span className="font-semibold text-amber-600">pending admin approval</span>.
            You'll be able to log in once the administrator approves your account.
          </p>
          <button
            className="w-full py-2.5 px-4 text-sm bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md shadow-blue-200 transition-all flex items-center justify-center gap-2"
            onClick={() => navigate('/login')}
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Go to Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full h-screen flex flex-col md:flex-row bg-white overflow-hidden">
      {/* Left Section: Visual/Branding */}
      <section className="relative w-full md:w-1/2 flex flex-col justify-between p-8 md:p-12 lg:p-16 overflow-hidden bg-slate-50">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232563eb' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2v-4h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2v-4h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        ></div>

        {/* Gradient Orbs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-400/10 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]"></div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <span className="material-symbols-outlined text-xl">auto_awesome</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">LTC Platform</span>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-xl">
          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-[1.1] mb-6 tracking-tight text-slate-900">
            Next-gen <br />
            <span className="text-blue-600">Knowledge Intelligence.</span>
          </h1>
          <p className="text-base text-slate-500 mb-8 leading-relaxed max-w-md">
            A unified learning ecosystem powered by AI to empower learners, trainers, and executive leadership.
          </p>
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span className="text-xs font-medium text-slate-600">Now with GPT-4 Core Integration</span>
          </div>
        </div>

        {/* Stats Section */}
        <div className="relative z-10 grid grid-cols-3 gap-6 pt-8 border-t border-slate-200">
          <div>
            <div className="text-2xl font-bold mb-1 text-slate-900">99%</div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Accuracy</div>
          </div>
          <div>
            <div className="text-2xl font-bold mb-1 text-slate-900">24/7</div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Insights</div>
          </div>
          <div>
            <div className="text-2xl font-bold mb-1 text-slate-900">500+</div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Partners</div>
          </div>
        </div>
      </section>

      {/* Right Section: Sign Up Form */}
      <section className="w-full md:w-1/2 flex items-center justify-center p-4 lg:p-8 bg-white overflow-y-auto pb-10">
        <div className="w-full max-w-md bg-white rounded-3xl p-5 lg:p-7 shadow-2xl shadow-slate-200/50 border border-slate-50">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-slate-900 mb-0.5">Create Account</h2>
            <p className="text-slate-500 text-xs">Join the next generation of AI-driven learning.</p>
          </div>

          <form className="space-y-2.5" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1" htmlFor="fullName">Full Name</label>
              <div className="relative group">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg transition-colors group-focus-within:text-blue-600">person</span>
                <input
                  className={`w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-600/20 text-sm transition-all outline-none ${errors.fullName ? 'ring-2 ring-red-500/20 bg-red-50/50' : ''}`}
                  id="fullName"
                  name="fullName"
                  placeholder="John Doe"
                  type="text"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
              {errors.fullName && <p className="mt-0.5 text-[10px] text-red-500 font-medium">{errors.fullName}</p>}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1" htmlFor="email">Email Address</label>
              <div className="relative group">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg transition-colors group-focus-within:text-blue-600">mail</span>
                <input
                  className={`w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-600/20 text-sm transition-all outline-none ${errors.email ? 'ring-2 ring-red-500/20 bg-red-50/50' : ''}`}
                  id="email"
                  name="email"
                  placeholder="jane.doe@company.com"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
              {errors.email && <p className="mt-0.5 text-[10px] text-red-500 font-medium">{errors.email}</p>}
            </div>

            {/* Role Selection — NO admin option */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1" htmlFor="role">Select Your Role</label>
              <div className="relative group">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg transition-colors group-focus-within:text-blue-600">groups</span>
                <select
                  className="w-full pl-10 pr-10 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-600/20 text-sm transition-all outline-none appearance-none bg-none cursor-pointer"
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  disabled={isLoading}
                >
                  <option value="learner">Learner</option>
                  <option value="trainer">Trainer</option>
                </select>
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 pointer-events-none text-lg">expand_more</span>
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1" htmlFor="password">Password</label>
                <div className="relative group">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg transition-colors group-focus-within:text-blue-600">lock</span>
                  <input
                    className={`w-full pl-10 pr-10 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-600/20 text-sm transition-all outline-none ${errors.password ? 'ring-2 ring-red-500/20 bg-red-50/50' : ''}`}
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 outline-none"
                    type="button"
                    onClick={togglePasswordVisibility}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {errors.password && <p className="mt-0.5 text-[10px] text-red-500 font-medium">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1" htmlFor="confirm">Confirm</label>
                <div className="relative group">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg transition-colors group-focus-within:text-blue-600">lock</span>
                  <input
                    className={`w-full pl-10 pr-10 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-600/20 text-sm transition-all outline-none ${errors.confirmPassword ? 'ring-2 ring-red-500/20 bg-red-50/50' : ''}`}
                    id="confirm"
                    name="confirmPassword"
                    placeholder="••••••••"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 outline-none"
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showConfirmPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-0.5 text-[10px] text-red-500 font-medium">{errors.confirmPassword}</p>}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start gap-2.5 pt-0.5">
              <input
                className={`mt-0.5 h-3.5 w-3.5 rounded text-blue-600 focus:ring-offset-0 focus:ring-blue-600/20 border-slate-300 bg-white transition-colors cursor-pointer ${errors.agreeToTerms ? 'border-red-500 ring-1 ring-red-500/20' : ''}`}
                id="terms"
                name="agreeToTerms"
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              <label className="text-[10px] text-slate-500 leading-tight" htmlFor="terms">
                I agree to the <a className="text-blue-600 hover:underline font-semibold" href="#">Terms</a> and <a className="text-blue-600 hover:underline font-semibold" href="#">Privacy Policy</a>.
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 group active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-1.5"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  Create Account
                  <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Section */}
          <div className="mt-4 text-center">
            <p className="text-[11px] text-slate-500">
              Already have an account?
              <button
                className="text-blue-600 font-bold hover:underline bg-transparent border-0 ml-1"
                onClick={() => navigate('/login')}
                type="button"
              >
                Sign In
              </button>
            </p>

            <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-slate-100">
              <a className="text-[9px] uppercase tracking-widest font-bold text-slate-400 hover:text-slate-600 transition-colors" href="#">Terms</a>
              <span className="w-1 h-1 rounded-full bg-slate-200"></span>
              <a className="text-[9px] uppercase tracking-widest font-bold text-slate-400 hover:text-slate-600 transition-colors" href="#">Privacy</a>
              <span className="w-1 h-1 rounded-full bg-slate-200"></span>
              <a className="text-[9px] uppercase tracking-widest font-bold text-slate-400 hover:text-slate-600 transition-colors" href="#">Support</a>
            </div>

            <div className="mt-3 flex items-center justify-center gap-2 opacity-30 grayscale group hover:opacity-70 transition-all duration-300 cursor-default">
              <span className="text-[8px] uppercase tracking-[0.2em] font-bold text-slate-400">Powered by</span>
              <span className="material-symbols-outlined text-[10px]">lightbulb</span>
              <span className="text-[8px] uppercase tracking-[0.2em] font-bold text-slate-400">LTC Platform</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default SignUp;
