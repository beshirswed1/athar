'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faTimes, 
  faFilter, 
  faSort,
  faUser,
  faLayerGroup,
  faChevronDown,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';

export default function SearchBar({ 
  searchQuery, 
  setSearchQuery, 
  sortBy, 
  setSortBy, 
  showFilters, 
  setShowFilters,
  selectedCategory,
  setSelectedCategory,
  selectedAuthor,
  setSelectedAuthor,
  categories,
  authors,
  categoryIcons,
  categoryColors,
  totalBooks
}) {
  const [activeTab, setActiveTab] = useState('category');
  const [authorSearch, setAuthorSearch] = useState('');

  const filteredAuthors = authors?.filter(author =>
    author.toLowerCase().includes(authorSearch.toLowerCase())
  ) || [];

  const handleAuthorSelect = (author) => {
    setSelectedAuthor(author);
    setAuthorSearch('');
  };

  return (
    <div className="relative w-full">
      {/* Main Search Container */}
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-lg sm:shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        
        {/* Top Bar - Search & Controls */}
        <div className="p-4 sm:p-5 lg:p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
          <div className="flex flex-col gap-3 sm:gap-4">
            
            {/* Search Input */}
            <div className="relative group w-full">
              <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-amber-500 transition-colors z-10">
                <FontAwesomeIcon icon={faSearch} className="text-base sm:text-lg" />
              </div>
              <input 
                type="text"
                placeholder="ابحث عن كتاب أو مؤلف..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 sm:pr-12 pl-10 sm:pl-12 py-3 sm:py-3.5 rounded-lg sm:rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all text-sm sm:text-base font-medium placeholder:text-gray-400"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-all p-1"
                  aria-label="Clear search"
                >
                  <FontAwesomeIcon icon={faTimes} className="text-sm sm:text-base" />
                </button>
              )}
            </div>

            {/* Sort & Filter Row */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              {/* Sort */}
              <div className="relative group flex-1">
                <FontAwesomeIcon 
                  icon={faSort} 
                  className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-amber-500 transition-colors pointer-events-none z-10" 
                />
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full appearance-none pr-10 sm:pr-12 pl-3 sm:pl-4 py-3 sm:py-3.5 rounded-lg sm:rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all cursor-pointer font-medium text-sm sm:text-base"
                >
                  <option value="title">ترتيب: الأبجدي</option>
                  <option value="author">ترتيب: المؤلف</option>
                  <option value="pages">ترتيب: الصفحات</option>
                  <option value="latest">ترتيب: الأحدث</option>
                </select>
                <FontAwesomeIcon 
                  icon={faChevronDown} 
                  className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs sm:text-sm z-10" 
                />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 sm:px-6 py-3 sm:py-3.5 rounded-lg sm:rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 text-sm sm:text-base ${
                  showFilters 
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <FontAwesomeIcon icon={faFilter} className="text-sm sm:text-base" />
                <span>الفلاتر</span>
                {showFilters && <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full">✓</span>}
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="p-4 sm:p-5 lg:p-6 bg-gray-50 dark:bg-gray-900/50 animate-fade-in">
            
            {/* Filter Tabs */}
            <div className="flex gap-2 mb-4 sm:mb-5 bg-white dark:bg-gray-800 p-1.5 rounded-lg sm:rounded-xl shadow-inner">
              <button
                onClick={() => setActiveTab('category')}
                className={`flex-1 px-3 py-2.5 sm:px-5 sm:py-3 rounded-lg sm:rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 text-sm ${
                  activeTab === 'category'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <FontAwesomeIcon icon={faLayerGroup} />
                <span>التصنيفات</span>
                <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-xs">{categories?.length || 0}</span>
              </button>
              
              <button
                onClick={() => setActiveTab('author')}
                className={`flex-1 px-3 py-2.5 sm:px-5 sm:py-3 rounded-lg sm:rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 text-sm ${
                  activeTab === 'author'
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <FontAwesomeIcon icon={faUser} />
                <span>المؤلفين</span>
                <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-xs">{authors?.length || 0}</span>
              </button>
            </div>

            {/* Categories Tab */}
            {activeTab === 'category' && (
              <div className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                  {/* All Button */}
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`relative p-3.5 sm:p-4 rounded-xl sm:rounded-2xl font-bold transition-all duration-300 cursor-pointer select-none ${
                      selectedCategory === 'all'
                        ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg scale-[1.02]'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-md border border-amber-500/10 dark:border-gray-700/50 hover:border-amber-500/40 dark:hover:border-amber-500/40'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1.5">
                      <span className="text-xl sm:text-2xl">📚</span>
                      <span className="text-xs sm:text-sm font-bold">الكل</span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        selectedCategory === 'all' 
                          ? 'bg-white/20 text-white' 
                          : 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                      }`}>
                        {totalBooks}
                      </span>
                    </div>
                    {selectedCategory === 'all' && (
                      <div className="absolute top-2 right-2">
                        <FontAwesomeIcon icon={faCheckCircle} className="text-white text-xs sm:text-sm" />
                      </div>
                    )}
                  </button>

                  {/* Category Buttons */}
                  {categories?.map((cat) => {
                    const isSelected = selectedCategory === cat.name;
                    const isEmpty = cat.count === 0;
                    
                    return (
                      <button
                        key={cat.name}
                        onClick={() => setSelectedCategory(isSelected ? 'all' : cat.name)}
                        className={`relative p-3.5 sm:p-4 rounded-xl sm:rounded-2xl font-bold transition-all duration-300 cursor-pointer select-none
                          ${isSelected
                            ? `bg-gradient-to-br ${categoryColors[cat.name] || 'from-amber-500 to-orange-600'} text-white shadow-lg scale-[1.02]`
                            : isEmpty
                              ? 'bg-gray-50/50 dark:bg-gray-900/40 text-gray-400 dark:text-gray-500 border border-dashed border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/60 hover:text-gray-600 dark:hover:text-gray-400'
                              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-md border border-amber-500/10 dark:border-gray-700/50 hover:border-amber-500/40 dark:hover:border-amber-500/40'
                          }`}
                      >
                        <div className="flex flex-col items-center gap-1.5">
                          <FontAwesomeIcon 
                            icon={categoryIcons[cat.name]} 
                            className={`text-lg sm:text-xl transition-transform duration-300 ${
                              isSelected 
                                ? 'scale-110 text-white' 
                                : isEmpty ? 'text-gray-300 dark:text-gray-600' : 'text-amber-600 dark:text-amber-500'
                            }`} 
                          />
                          <span className="text-xs sm:text-sm font-bold truncate w-full text-center">{cat.name}</span>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            isSelected 
                              ? 'bg-white/20 text-white' 
                              : isEmpty ? 'bg-gray-100 dark:bg-gray-900/80 text-gray-400' : 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                          }`}>
                            {cat.count}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2">
                            <FontAwesomeIcon icon={faCheckCircle} className="text-white text-xs sm:text-sm" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Authors Tab */}
            {activeTab === 'author' && (
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-400">اختر مؤلف</span>
                  {selectedAuthor && (
                    <button
                      onClick={() => setSelectedAuthor(null)}
                      className="text-xs sm:text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                      إلغاء
                    </button>
                  )}
                </div>

                {/* Author Search */}
                <div className="relative">
                  <FontAwesomeIcon icon={faSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="ابحث عن مؤلف..."
                    value={authorSearch}
                    onChange={(e) => setAuthorSearch(e.target.value)}
                    className="w-full pr-10 pl-3 py-2.5 sm:py-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm sm:text-base"
                  />
                </div>

                {/* Authors Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 max-h-64 overflow-y-auto scrollbar-hide">
                  <button
                    onClick={() => setSelectedAuthor(null)}
                    className={`relative p-3 rounded-xl font-medium transition-all ${
                      !selectedAuthor
                        ? 'bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-lg'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-md border-2 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <FontAwesomeIcon icon={faUser} className="text-lg" />
                      <span className="text-xs sm:text-sm">الكل</span>
                    </div>
                  </button>

                  {filteredAuthors.map((author, index) => (
                    <button
                      key={index}
                      onClick={() => handleAuthorSelect(author)}
                      className={`relative p-3 rounded-xl font-medium transition-all text-right ${
                        selectedAuthor === author
                          ? 'bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-lg'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-md border-2 border-gray-200 dark:border-gray-700'
                      }`}
                      title={author}
                    >
                      <div className="flex items-center gap-1 sm:gap-2">
                        <FontAwesomeIcon icon={faUser} className={`text-xs sm:text-sm ${selectedAuthor === author ? 'text-white/80' : 'text-gray-400'} shrink-0`} />
                        <span className="text-xs sm:text-sm truncate">{author}</span>
                      </div>
                      {selectedAuthor === author && (
                        <div className="absolute top-1 left-1">
                          <FontAwesomeIcon icon={faCheckCircle} className="text-white text-xs" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {filteredAuthors.length === 0 && (
                  <div className="text-center py-6 text-gray-500">
                    <FontAwesomeIcon icon={faUser} className="text-3xl mb-2 opacity-30" />
                    <p className="text-sm">لا يوجد مؤلفين</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Active Filters Badge */}
      {(selectedCategory !== 'all' || selectedAuthor || searchQuery) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {searchQuery && (
            <div className="inline-flex items-center gap-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium">
              <FontAwesomeIcon icon={faSearch} />
              <span>&quot;{searchQuery}&quot;</span>
              <button onClick={() => setSearchQuery('')} className="hover:text-red-600">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          )}
          
          {selectedCategory !== 'all' && (
            <div className={`inline-flex items-center gap-1.5 bg-gradient-to-r ${categoryColors[selectedCategory]} text-white px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium shadow-md`}>
              <FontAwesomeIcon icon={categoryIcons[selectedCategory]} />
              <span>{selectedCategory}</span>
              <button onClick={() => setSelectedCategory('all')} className="hover:text-red-200">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          )}
          
          {selectedAuthor && (
            <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium shadow-md">
              <FontAwesomeIcon icon={faUser} />
              <span className="truncate max-w-[80px] sm:max-w-none">{selectedAuthor}</span>
              <button onClick={() => setSelectedAuthor(null)} className="hover:text-red-200">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
      `}</style>
    </div>
  );
}
