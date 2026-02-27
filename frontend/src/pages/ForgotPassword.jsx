import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './forgotpassword.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!email) {
      setError('Email is required');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // TODO: Replace with actual API call
      console.log('Password reset requested for:', email);
      
      setIsSuccess(true);
      
      // Show success message and redirect after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (err) {
      setError('Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) {
      setError('');
    }
  };

  return (
    <div className="forgot-password-container">
      {/* Header Navigation */}
      <header className="forgot-password-header">
        <div className="header-content">
          <div className="logo-section" onClick={() => navigate('/')}>
            <div className="logo-icon">
              <svg 
                className="w-6 h-6 text-primary" 
                fill="none" 
                viewBox="0 0 48 48" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M13.8261 30.5736C16.7203 29.8826 20.2244 29.4783 24 29.4783C27.7756 29.4783 31.2797 29.8826 34.1739 30.5736C36.9144 31.2278 39.9967 32.7669 41.3563 33.8352L24.8486 7.36089C24.4571 6.73303 23.5429 6.73303 23.1514 7.36089L6.64374 33.8352C8.00331 32.7669 11.0856 31.2278 13.8261 30.5736Z" 
                  fill="currentColor"
                />
                <path 
                  clipRule="evenodd" 
                  d="M39.998 35.764C39.9944 35.7463 39.9875 35.7155 39.9748 35.6706C39.9436 35.5601 39.8949 35.4259 39.8346 35.2825C39.8168 35.2403 39.7989 35.1993 39.7813 35.1602C38.5103 34.2887 35.9788 33.0607 33.7095 32.5189C30.9875 31.8691 27.6413 31.4783 24 31.4783C20.3587 31.4783 17.0125 31.8691 14.2905 32.5189C12.0012 33.0654 9.44505 34.3104 8.18538 35.1832C8.17384 35.2075 8.16216 35.233 8.15052 35.2592C8.09919 35.3751 8.05721 35.4886 8.02977 35.589C8.00356 35.6848 8.00039 35.7333 8.00004 35.7388C8.00004 35.739 8 35.7393 8.00004 35.7388C8.00004 35.7641 8.0104 36.0767 8.68485 36.6314C9.34546 37.1746 10.4222 37.7531 11.9291 38.2772C14.9242 39.319 19.1919 40 24 40C28.8081 40 33.0758 39.319 36.0709 38.2772C37.5778 37.7531 38.6545 37.1746 39.3151 36.6314C39.9006 36.1499 39.9857 35.8511 39.998 35.764ZM4.95178 32.7688L21.4543 6.30267C22.6288 4.4191 25.3712 4.41909 26.5457 6.30267L43.0534 32.777C43.0709 32.8052 43.0878 32.8338 43.104 32.8629L41.3563 33.8352C43.104 32.8629 43.1038 32.8626 43.104 32.8629L43.1051 32.865L43.1065 32.8675L43.1101 32.8739L43.1199 32.8918C43.1276 32.906 43.1377 32.9246 43.1497 32.9473C43.1738 32.9925 43.2062 33.0545 43.244 33.1299C43.319 33.2792 43.4196 33.489 43.5217 33.7317C43.6901 34.1321 44 34.9311 44 35.7391C44 37.4427 43.003 38.7775 41.8558 39.7209C40.6947 40.6757 39.1354 41.4464 37.385 42.0552C33.8654 43.2794 29.133 44 24 44C18.867 44 14.1346 43.2794 10.615 42.0552C8.86463 41.4464 7.30529 40.6757 6.14419 39.7209C4.99695 38.7775 3.99999 37.4427 3.99999 35.7391C3.99999 34.8725 4.29264 34.0922 4.49321 33.6393C4.60375 33.3898 4.71348 33.1804 4.79687 33.0311C4.83898 32.9556 4.87547 32.8935 4.9035 32.8471C4.91754 32.8238 4.92954 32.8043 4.93916 32.7889L4.94662 32.777L4.95178 32.7688ZM35.9868 29.004L24 9.77997L12.0131 29.004C12.4661 28.8609 12.9179 28.7342 13.3617 28.6282C16.4281 27.8961 20.0901 27.4783 24 27.4783C27.9099 27.4783 31.5719 27.8961 34.6383 28.6282C35.082 28.7342 35.5339 28.8609 35.9868 29.004Z" 
                  fill="currentColor" 
                  fillRule="evenodd"
                />
              </svg>
            </div>
            <span className="logo-text">AI Learning Hub</span>
          </div>
          
          <nav className="header-nav">
            <a href="#" className="nav-link">Courses</a>
            <a href="#" className="nav-link">Library</a>
            <a href="#" className="nav-link">Community</a>
          </nav>
          
          <button className="signin-btn" onClick={() => navigate('/login')}>
            Sign In
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="forgot-password-main">
        <div className="forgot-password-card">
          {!isSuccess ? (
            <>
              {/* Lock Icon */}
              <div className="icon-container">
                <div className="lock-icon">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="24" cy="24" r="24" fill="#EFF6FF"/>
                    <path d="M24 12C20.686 12 18 14.686 18 18V21H17C15.346 21 14 22.346 14 24V32C14 33.654 15.346 35 17 35H31C32.654 35 34 33.654 34 32V24C34 22.346 32.654 21 31 21H30V18C30 14.686 27.314 12 24 12ZM24 14C26.206 14 28 15.794 28 18V21H20V18C20 15.794 21.794 14 24 14ZM24 25C25.105 25 26 25.895 26 27C26 27.738 25.596 28.371 25 28.723V30C25 30.552 24.552 31 24 31C23.448 31 23 30.552 23 30V28.723C22.404 28.371 22 27.738 22 27C22 25.895 22.895 25 24 25Z" fill="#137FEC"/>
                  </svg>
                </div>
              </div>

              {/* Title and Description */}
              <h1 className="page-title">Reset Your Password</h1>
              <p className="page-description">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              {/* Form */}
              <form className="reset-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="email">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 4H2C0.9 4 0.00999999 4.9 0.00999999 6L0 14C0 15.1 0.9 16 2 16H18C19.1 16 20 15.1 20 14V6C20 4.9 19.1 4 18 4ZM18 8L10 12.5L2 8V6L10 10.5L18 6V8Z" fill="#137FEC"/>
                    </svg>
                    Email Address
                  </label>
                  <input
                    className={`form-input ${error ? 'input-error' : ''}`}
                    id="email"
                    name="email"
                    placeholder="name@company.com"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    disabled={isLoading}
                  />
                  {error && (
                    <p className="error-message">{error}</p>
                  )}
                </div>

                <button
                  className="submit-btn"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="loading-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>

              {/* Back to Login Link */}
              <button 
                className="back-link"
                onClick={() => navigate('/login')}
                type="button"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 18L2 10L10 2L11.4 3.4L5.8 9H18V11H5.8L11.4 16.6L10 18Z" fill="currentColor"/>
                </svg>
                Back to Login
              </button>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="icon-container">
                <div className="success-icon">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="24" cy="24" r="24" fill="#ECFDF5"/>
                    <path d="M20 24L22 26L28 20" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="24" cy="24" r="10" stroke="#10B981" strokeWidth="2"/>
                  </svg>
                </div>
              </div>

              <h1 className="page-title">Check Your Email</h1>
              <p className="page-description">
                We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and follow the instructions.
              </p>

              <button 
                className="back-link"
                onClick={() => navigate('/login')}
                type="button"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 18L2 10L10 2L11.4 3.4L5.8 9H18V11H5.8L11.4 16.6L10 18Z" fill="currentColor"/>
                </svg>
                Back to Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
