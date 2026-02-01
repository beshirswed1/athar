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
  const [activeTab, setActiveTab] = useState('category'); // 'category' or 'author'
  const [showAuthorDropdown, setShowAuthorDropdown] = useState(false);
  const [authorSearch, setAuthorSearch] = useState('');

  // Filter authors based on search
  const filteredAuthors = authors?.filter(author =>
    author.toLowerCase().includes(authorSearch.toLowerCase())
  ) || [];

  const handleAuthorSelect = (author) => {
    setSelectedAuthor(author);
    setShowAuthorDropdown(false);
    setAuthorSearch('');
  };

  return (
    <div className="relative">
      {/* Main Search Container */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden backdrop-blur-xl bg-white/95 dark:bg-gray-800/95">
        
        {/* Top Bar - Search & Controls */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
          <div className="flex flex-col lg:flex-row gap-4">
            
            {/* Advanced Search Input */}
            <div className="flex-1 relative group">
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-amber-500 transition-colors">
                <FontAwesomeIcon icon={faSearch} className="text-lg" />
              </div>
              <input 
                type="text"
                placeholder="ابحث عن كتاب، مؤلف، أو كلمة مفتاحية..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-14 pl-14 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 transition-all text-lg font-medium placeholder:text-gray-400 shadow-inner"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-all hover:scale-110"
                  aria-label="Clear search"
                >
                  <FontAwesomeIcon icon={faTimes} className="text-lg" />
                </button>
              )}
             
            </div>

            {/* Sort Control */}
            <div className="relative group">
              <FontAwesomeIcon 
                icon={faSort} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-amber-500 transition-colors pointer-events-none" 
              />
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none min-w-[200px] pr-12 pl-6 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 transition-all cursor-pointer font-medium shadow-inner"
              >
                <option value="title">الترتيب: الأبجدي (أ-ي)</option>
                <option value="author">الترتيب: المؤلف</option>
                <option value="pages">الترتيب: عدد الصفحات</option>
                <option value="latest">الترتيب: الأحدث</option>
              </select>
              <FontAwesomeIcon 
                icon={faChevronDown} 
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm" 
              />
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`relative px-8 py-4 rounded-2xl font-bold transition-all shadow-lg flex items-center gap-3 justify-center overflow-hidden group ${
                showFilters 
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-amber-500/30' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 opacity-0 group-hover:opacity-20 transition-opacity"></span>
              <FontAwesomeIcon icon={faFilter} className="relative z-10" />
              <span className="relative z-10">الفلاتر</span>
              {showFilters && (
                <span className="relative z-10 bg-white/20 px-2 py-1 rounded-full text-xs">
                  مفعّل
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="p-6 bg-gray-50 dark:bg-gray-900/50 animate-fade-in">
            
            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-inner">
              <button
                onClick={() => setActiveTab('category')}
                className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'category'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <FontAwesomeIcon icon={faLayerGroup} />
                <span>التصنيفات</span>
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                  {categories?.length || 0}
                </span>
              </button>
              
              <button
                onClick={() => setActiveTab('author')}
                className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'author'
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <FontAwesomeIcon icon={faUser} />
                <span>المؤلفين</span>
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                  {authors?.length || 0}
                </span>
              </button>
            </div>

            {/* Categories Tab */}
            {activeTab === 'category' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-4">
                  اختر تصنيف
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {/* All Button */}
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`relative p-4 rounded-2xl font-bold transition-all duration-300 overflow-hidden group ${
                      selectedCategory === 'all'
                        ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-xl scale-105 ring-4 ring-amber-500/30'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-lg hover:scale-102 border-2 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10 flex flex-col items-center gap-2">
                      <div className="text-2xl">📚</div>
                      <div className="text-sm">الكل</div>
                      <div className={`text-xs ${selectedCategory === 'all' ? 'text-white/80' : 'text-gray-500'}`}>
                        ({totalBooks})
                      </div>
                    </div>
                    {selectedCategory === 'all' && (
                      <div className="absolute top-2 right-2">
                        <FontAwesomeIcon icon={faCheckCircle} className="text-white" />
                      </div>
                    )}
                  </button>

                  {/* Category Buttons */}
                  {categories?.map((cat) => (
                    <button
                      key={cat.name}
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`relative p-4 rounded-2xl font-bold transition-all duration-300 overflow-hidden group ${
                        selectedCategory === cat.name
                          ? `bg-gradient-to-br ${categoryColors[cat.name]} text-white shadow-xl scale-105 ring-4 ring-offset-2 ring-current/30`
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-lg hover:scale-102 border-2 border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="relative z-10 flex flex-col items-center gap-2">
                        <FontAwesomeIcon icon={categoryIcons[cat.name]} className="text-2xl" />
                        <div className="text-sm line-clamp-1">{cat.name}</div>
                        <div className={`text-xs ${selectedCategory === cat.name ? 'text-white/80' : 'text-gray-500'}`}>
                          ({cat.count})
                        </div>
                      </div>
                      {selectedCategory === cat.name && (
                        <div className="absolute top-2 right-2">
                          <FontAwesomeIcon icon={faCheckCircle} className="text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Authors Tab */}
            {activeTab === 'author' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    اختر مؤلف
                  </h3>
                  {selectedAuthor && (
                    <button
                      onClick={() => setSelectedAuthor(null)}
                      className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                      إلغاء الاختيار
                    </button>
                  )}
                </div>

                {/* Author Search */}
                <div className="relative mb-4">
                  <FontAwesomeIcon 
                    icon={faSearch} 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" 
                  />
                  <input
                    type="text"
                    placeholder="ابحث عن مؤلف..."
                    value={authorSearch}
                    onChange={(e) => setAuthorSearch(e.target.value)}
                    className="w-full pr-12 pl-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all"
                  />
                </div>

                {/* Authors Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto custom-scrollbar">
                  {/* All Authors Button */}
                  <button
                    onClick={() => setSelectedAuthor(null)}
                    className={`relative p-4 rounded-2xl font-medium transition-all duration-300 ${
                      !selectedAuthor
                        ? 'bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-xl scale-105 ring-4 ring-purple-500/30'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-lg hover:scale-102 border-2 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <FontAwesomeIcon icon={faUser} className="text-xl" />
                      <div className="text-xs">الكل</div>
                    </div>
                  </button>

                  {/* Author Buttons */}
                  {filteredAuthors.map((author, index) => (
                    <button
                      key={index}
                      onClick={() => handleAuthorSelect(author)}
                      className={`relative p-4 rounded-2xl font-medium transition-all duration-300 text-right ${
                        selectedAuthor === author
                          ? 'bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-xl scale-105 ring-4 ring-purple-500/30'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-lg hover:scale-102 border-2 border-gray-200 dark:border-gray-700'
                      }`}
                      title={author}
                    >
                      <div className="flex flex-col items-start gap-1">
                        <div className="flex items-center gap-2 w-full">
                          <FontAwesomeIcon 
                            icon={faUser} 
                            className={`text-sm ${selectedAuthor === author ? 'text-white/80' : 'text-gray-400'}`} 
                          />
                          <div className="text-xs line-clamp-2 flex-1">{author}</div>
                        </div>
                      </div>
                      {selectedAuthor === author && (
                        <div className="absolute top-2 left-2">
                          <FontAwesomeIcon icon={faCheckCircle} className="text-white text-sm" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {filteredAuthors.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FontAwesomeIcon icon={faUser} className="text-4xl mb-2 opacity-20" />
                    <p>لا يوجد مؤلفين</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Active Filters Badge */}
      {(selectedCategory !== 'all' || selectedAuthor || searchQuery) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {searchQuery && (
            <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-4 py-2 rounded-full text-sm font-medium">
              <FontAwesomeIcon icon={faSearch} />
              <span>بحث: "{searchQuery}"</span>
              <button onClick={() => setSearchQuery('')} className="hover:text-red-600">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          )}
          
          {selectedCategory !== 'all' && (
            <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${categoryColors[selectedCategory]} text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg`}>
              <FontAwesomeIcon icon={categoryIcons[selectedCategory]} />
              <span>{selectedCategory}</span>
              <button onClick={() => setSelectedCategory('all')} className="hover:text-red-200">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          )}
          
          {selectedAuthor && (
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
              <FontAwesomeIcon icon={faUser} />
              <span>{selectedAuthor}</span>
              <button onClick={() => setSelectedAuthor(null)} className="hover:text-red-200">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #a855f7, #6366f1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #9333ea, #4f46e5);
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}