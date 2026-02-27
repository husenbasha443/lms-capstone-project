import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

const ProfileDropdown = ({ userName = 'User', userEmail = '', profileImage = null }) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleProfileSettings = () => {
    setIsDropdownOpen(false);
    const role = localStorage.getItem('userRole');
    if (role === 'admin') navigate('/admin/settings');
    else if (role === 'trainer') navigate('/trainer/settings');
    else navigate('/learner/settings');
  };

  const handleHelpSupport = () => {
    setIsDropdownOpen(false);
    navigate('/learner/help');
  };

  const handleLogoutClick = () => {
    setIsDropdownOpen(false);
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    // Clear all session data
    localStorage.clear();
    sessionStorage.clear();

    // Navigate to login page
    navigate('/login');
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  // Default profile image if none provided
  const defaultProfileImage = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop';
  const imageUrl = profileImage || defaultProfileImage;

  return (
    <>
      {/* Profile Icon with Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={toggleDropdown}
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-white shadow-sm cursor-pointer hover:border-[#137fec] hover:ring-2 hover:ring-[#137fec]/20 transition-all focus:outline-none focus:ring-2 focus:ring-[#137fec]/40"
          style={{ backgroundImage: `url("${imageUrl}")` }}
          aria-label="Profile menu"
          aria-expanded={isDropdownOpen}
        />

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-[9999] animate-in fade-in slide-in-from-top-2 duration-200">
            {/* User Info Header */}
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{userName}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{userEmail}</p>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              {/* Profile/Settings */}
              <button
                onClick={handleProfileSettings}
                className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-3"
              >
                <span className="material-symbols-outlined text-xl text-slate-600 dark:text-slate-400">person</span>
                <span className="font-medium">Profile & Settings</span>
              </button>

              {/* Help & Support */}
              <button
                onClick={handleHelpSupport}
                className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-3"
              >
                <span className="material-symbols-outlined text-xl text-slate-600 dark:text-slate-400">help</span>
                <span className="font-medium">Help & Support</span>
              </button>
            </div>

            {/* Logout Section */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-1 mt-1">
              <button
                onClick={handleLogoutClick}
                className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-3"
              >
                <span className="material-symbols-outlined text-xl">logout</span>
                <span className="font-semibold">Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[10000] animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full mx-4 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Confirm Logout</h3>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-6">
              <div className="flex items-start gap-4">
                <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full shrink-0">
                  <span className="material-symbols-outlined text-2xl text-amber-600 dark:text-amber-400">logout</span>
                </div>
                <div>
                  <p className="text-slate-900 dark:text-slate-100 font-medium">
                    Are you sure you want to logout?
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 rounded-b-xl flex gap-3 justify-end">
              <button
                onClick={handleLogoutCancel}
                className="px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">logout</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default ProfileDropdown;
