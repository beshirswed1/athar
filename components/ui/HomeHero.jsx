'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun, faUser, faSignInAlt, faSignOutAlt, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { logoutUser } from '@/store/authSlice';

export default function HomeHero({ 
  darkMode, 
  setDarkMode, 
  totalBooks, 
  totalCategories, 
  categories, 
  categoryIcons, 
  onCategoryClick,
  selectedCategory
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
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

  // Sort categories by book count descending
  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => b.count - a.count);
  }, [categories]);

  // Categories that have books
  const activeCategories = useMemo(() => {
    return sortedCategories.filter(cat => cat.count > 0);
  }, [sortedCategories]);

  // Fallback to top 4 categories if no books are added yet
  const defaultVisible = useMemo(() => {
    return activeCategories.length > 0 ? activeCategories : sortedCategories.slice(0, 4);
  }, [activeCategories, sortedCategories]);

  const displayedCategories = showAllCategories ? sortedCategories : defaultVisible;
  const hasMore = sortedCategories.length > defaultVisible.length;

  return (
    <header className="relative overflow-hidden mt-20 sm:mt-24 rounded-b-2xl sm:rounded-b-3xl shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 dark:from-amber-800 dark:via-orange-700 dark:to-amber-800"></div>
      <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-2 sm:mb-3 tracking-tight">
              أثَر
            </h1>
            <p className="text-white/90 text-base sm:text-lg md:text-xl max-w-xl sm:max-w-2xl leading-relaxed">
              مكتبة رقمية شاملة في مختلف المجالات، لإدارة قراءتك واكتشاف المزيد من الكتب التي تحبها.
            </p>
          </div>
          
          <div className="flex items-center gap-3 sm:order-last">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-3 sm:p-4 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all shadow-lg cursor-pointer"
              aria-label="Toggle Dark Mode"
            >
              <FontAwesomeIcon 
                icon={darkMode ? faSun : faMoon} 
                className="text-white text-lg sm:text-xl" 
              />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 transition-all duration-500 ease-in-out">
            {displayedCategories.map((cat) => {
              const isSelected = selectedCategory === cat.name;
              const isEmpty = cat.count === 0;
              
              return (
                <div 
                  key={cat.name}
                  className={`
                    relative backdrop-blur-md rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border transition-all duration-300 cursor-pointer group overflow-hidden select-none
                    ${isSelected 
                      ? 'bg-white dark:bg-gray-800 text-amber-900 dark:text-white border-amber-400 dark:border-amber-500 shadow-lg scale-[1.03] ring-2 ring-amber-400 dark:ring-amber-500/50' 
                      : isEmpty
                        ? 'bg-white/5 dark:bg-black/10 border-white/10 dark:border-white/5 text-white/50 hover:bg-white/10 hover:border-white/25 hover:text-white/80 opacity-70 hover:opacity-100 border-dashed'
                        : 'bg-white/10 dark:bg-black/20 border-white/20 dark:border-white/10 text-white hover:bg-white/20 hover:border-white/40 hover:shadow-xl hover:-translate-y-0.5'
                    }
                  `}
                  onClick={() => onCategoryClick(isSelected ? 'all' : cat.name)}
                >
                  {/* Decorative indicator for selected state */}
                  {isSelected && (
                    <span className="absolute top-2.5 left-2.5 w-2 h-2 bg-amber-500 rounded-full animate-pulse z-20"></span>
                  )}
                  
                  <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2 relative z-10">
                    <FontAwesomeIcon 
                      icon={categoryIcons[cat.name]} 
                      className={`text-sm sm:text-lg transition-transform duration-300 group-hover:scale-110 ${
                        isSelected 
                          ? 'text-amber-600 dark:text-amber-400' 
                          : isEmpty ? 'text-white/60 group-hover:text-white' : 'text-white'
                      }`} 
                    />
                    <span className={`font-black text-lg sm:text-2xl tracking-tight transition-colors ${
                      isSelected 
                        ? 'text-amber-800 dark:text-amber-400' 
                        : isEmpty ? 'text-white/60 group-hover:text-white' : 'text-white'
                    }`}>{cat.count}</span>
                  </div>
                  <p className={`text-xs sm:text-sm font-bold truncate transition-colors ${
                    isSelected 
                      ? 'text-gray-800 dark:text-gray-200' 
                      : isEmpty ? 'text-white/50 group-hover:text-white/90' : 'text-white/80'
                  }`}>{cat.name}</p>
                </div>
              );
            })}
          </div>

          {hasMore && (
            <div className="flex justify-center pt-2">
              <button
                onClick={() => setShowAllCategories(!showAllCategories)}
                className="px-5 py-2 sm:px-6 sm:py-2.5 rounded-full bg-white/15 backdrop-blur-md hover:bg-white/25 border border-white/20 text-white font-bold text-xs sm:text-sm transition-all duration-300 shadow-md hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <span>{showAllCategories ? 'عرض أقل' : `عرض كافة التصنيفات (${sortedCategories.length})`}</span>
                <FontAwesomeIcon icon={faCaretDown} className={`text-xs transition-transform duration-300 ${showAllCategories ? 'rotate-180' : ''}`} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
