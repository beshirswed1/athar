'use client';

import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun, faUser, faSignInAlt, faSignOutAlt, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { logoutUser } from '@/store/authSlice';

export default function Header({ 
  darkMode, 
  setDarkMode, 
  totalBooks, 
  totalCategories, 
  categories, 
  categoryIcons, 
  onCategoryClick 
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const { user, loading, isAuthenticated } = useSelector((state) => state.auth || { 
    user: null, 
    loading: true, 
    isAuthenticated: false 
  });
  
  const dispatch = useDispatch();
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setShowDropdown(false);
    await dispatch(logoutUser());
    router.push('/');
  };

  return (
    <header className="relative overflow-hidden mt-20 rounded-b-3xl shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 dark:from-amber-800 dark:via-orange-700 dark:to-amber-800"></div>
      <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-3 tracking-tight">
              أثَر
            </h1>
            <p className="text-white/90 text-lg md:text-xl max-w-2xl leading-relaxed">
              مكتبة رقمية شاملة  في مختلف المجالات،  لإدارة قراءتك واكتشاف المزيد من الكتب التي تحبها.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Auth Button / Profile */}
            {loading ? (
              <div className="w-10 h-10 rounded-full bg-white/20 animate-pulse"></div>
            ) : isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 p-2 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all shadow-lg group"
                >
                  {user?.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user?.displayName || 'User'}
                      className="w-8 h-8 rounded-full border-2 border-white/50"
                    />
                  ) : (
                    <FontAwesomeIcon 
                      icon={faUser} 
                      className="text-white text-lg group-hover:scale-110 transition-transform" 
                    />
                  )}
                  <FontAwesomeIcon 
                    icon={faCaretDown} 
                    className={`text-white/80 text-sm transition-transform ${showDropdown ? 'rotate-180' : ''}`}
                  />
                </button>
                
                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {user?.displayName || 'مستخدم'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user?.email}
                      </p>
                    </div>
                    <Link 
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <FontAwesomeIcon icon={faUser} />
                      الملف الشخصي
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <FontAwesomeIcon icon={faSignOutAlt} />
                      تسجيل الخروج
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                href="/login"
                className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all shadow-lg group"
              >
                <FontAwesomeIcon 
                  icon={faSignInAlt} 
                  className="text-white text-lg group-hover:scale-110 transition-transform" 
                />
                <span className="text-white font-medium">تسجيل الدخول</span>
              </Link>
            )}
            
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-4 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all shadow-lg"
              aria-label="Toggle Dark Mode"
            >
              <FontAwesomeIcon 
                icon={darkMode ? faSun : faMoon} 
                className="text-white text-xl" 
              />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div 
              key={cat.name}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all cursor-pointer group"
              onClick={() => onCategoryClick(cat.name)}
            >
              <div className="flex items-center gap-3 mb-2">
                <FontAwesomeIcon 
                  icon={categoryIcons[cat.name]} 
                  className="text-white text-lg group-hover:scale-110 transition-transform" 
                />
                <span className="text-white font-bold text-2xl">{cat.count}</span>
              </div>
              <p className="text-white/80 text-sm">{cat.name}</p>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
