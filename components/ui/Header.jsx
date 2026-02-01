'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';

export default function Header({ 
  darkMode, 
  setDarkMode, 
  totalBooks, 
  totalCategories, 
  categories, 
  categoryIcons, 
  onCategoryClick 
}) {
  return (
    <header className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 dark:from-amber-800 dark:via-orange-700 dark:to-amber-800"></div>
      <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-3 tracking-tight">
              أثَر
            </h1>
            <p className="text-white/90 text-lg md:text-xl max-w-2xl leading-relaxed">
              مكتبة رقمية شاملة تضم {totalBooks} كتاباً من {totalCategories} تصنيفات
            </p>
          </div>
          
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