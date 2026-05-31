'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, X, ChevronDown, ChevronUp, BookOpen, Star, Hash, Filter, BookHeart, Minimize2, BookOpenCheck, LibraryBig, ArrowUpDown, RefreshCw } from 'lucide-react';
import suggestedBooksData from '@/app/data/suggestedBooks.json';

export default function LibraryFilters({ onFilterChange, books = [], filteredCount = 0, isSuggested = false }) {
  const totalBooks = books.length;

  // State management & LocalStorage retrieval
  const [initialFilters] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('libraryFilters');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Error loading saved filters:', e);
        }
      }
    }
    return {};
  });

  const [search, setSearch] = useState(initialFilters.search || '');
  const [status, setStatus] = useState(initialFilters.status || 'all');
  const [rating, setRating] = useState(initialFilters.rating || 0);
  const [pagesMin, setPagesMin] = useState(initialFilters.pagesMin || '');
  const [pagesMax, setPagesMax] = useState(initialFilters.pagesMax || '');
  const [category, setCategory] = useState(initialFilters.category || 'الكل');
  const [sortBy, setSortBy] = useState(initialFilters.sortBy || 'recent');
  const [isExpanded, setIsExpanded] = useState(true);
  const [searchDebounce, setSearchDebounce] = useState(initialFilters.search || '');

  // حساب أعداد الكتب لكل حالة قراءة
  const statusCounts = useMemo(() => {
    const counts = { all: books.length, completed: 0, reading: 0, planned: 0 };
    books.forEach(b => {
      if (b.status && b.status in counts) {
        counts[b.status]++;
      }
    });
    return counts;
  }, [books]);

  // حساب أعداد الكتب لكل تصنيف
  const categoryCounts = useMemo(() => {
    const counts = {};
    books.forEach(b => {
      if (b.category) {
        counts[b.category] = (counts[b.category] || 0) + 1;
      }
    });
    return counts;
  }, [books]);

  // استخراج الفئات بشكل ديناميكي من كتب المستخدم
  const categories = useMemo(() => {
    if (isSuggested) {
      const catNames = suggestedBooksData.categories.map(c => c.name);
      return ['الكل', ...catNames];
    }
    const activeCats = new Set();
    books.forEach(b => {
      if (b.category) activeCats.add(b.category);
    });
    return ['الكل', ...Array.from(activeCats)];
  }, [books, isSuggested]);

  // حساب أعداد الكتب لكل تقييم
  const ratingCounts = useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    books.forEach(b => {
      const r = Math.round(b.rating || 0);
      if (r >= 1 && r <= 5) {
        for (let i = 1; i <= r; i++) {
          counts[i]++;
        }
      }
    });
    return counts;
  }, [books]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(search);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // تطبيق الفلاتر
  const applyFilters = useCallback(() => {
    onFilterChange({ 
      search: searchDebounce, 
      status, 
      rating: Number(rating), 
      pagesMin: Number(pagesMin) || 0, 
      pagesMax: Number(pagesMax) || Infinity, 
      category: category === 'الكل' ? null : category,
      sortBy
    });
  }, [searchDebounce, status, rating, pagesMin, pagesMax, category, sortBy, onFilterChange]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // حفظ الفلاتر في LocalStorage
  useEffect(() => {
    const filters = { search, status, rating, pagesMin, pagesMax, category, sortBy };
    localStorage.setItem('libraryFilters', JSON.stringify(filters));
  }, [search, status, rating, pagesMin, pagesMax, category, sortBy]);

  // إعادة تعيين الفلاتر
  const resetFilters = () => {
    setSearch('');
    setStatus('all');
    setRating(0);
    setPagesMin('');
    setPagesMax('');
    setCategory('الكل');
    setSortBy('recent');
    localStorage.removeItem('libraryFilters');
  };

  // التحقق من وجود فلاتر نشطة
  const hasActiveFilters = search || status !== 'all' || rating > 0 || pagesMin || pagesMax || category !== 'الكل' || sortBy !== 'recent';

  // التحقق من صحة نطاق الصفحات
  const isPagesRangeValid = !pagesMin || !pagesMax || Number(pagesMin) <= Number(pagesMax);

  // Presets ذكية
  const quickFilters = [
    { 
      label: 'أقرأه الآن', 
      icon: <BookOpenCheck className="w-4 h-4" />, 
      action: () => setStatus(status === 'reading' ? 'all' : 'reading'),
      isActive: () => status === 'reading'
    },
    { 
      label: 'المفضلة', 
      icon: <BookHeart className="w-4 h-4" />, 
      action: () => setRating(rating === 5 ? 0 : 5),
      isActive: () => rating === 5
    },
    { 
      label: 'كتب قصيرة', 
      icon: <Minimize2 className="w-4 h-4" />, 
      action: () => { 
        if (pagesMax === 200 && pagesMin === '') {
          setPagesMax('');
        } else {
          setPagesMin(''); 
          setPagesMax(200); 
        }
      },
      isActive: () => pagesMax === 200 && pagesMin === ''
    },
  ];

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl sm:rounded-2xl shadow-lg border border-amber-200/50 overflow-hidden transition-all duration-300">
      {/* Header */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 bg-white/50 backdrop-blur-sm border-b border-amber-200/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Filter className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-800">تصفية الكتب</h3>
            {totalBooks > 0 && (
              <p className="text-xs sm:text-sm text-gray-600">
                يتم عرض <span className="font-bold text-amber-700">{filteredCount}</span> من أصل {totalBooks} كتاب
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="group px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold text-amber-700 hover:text-amber-800 hover:bg-amber-100/80 rounded-xl transition-all duration-300 flex items-center gap-1.5 sm:gap-2 touch-manipulation cursor-pointer border border-amber-200/40 hover:scale-105"
            >
              <RefreshCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500 ease-out" />
              <span>إعادة تعيين</span>
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-amber-100 rounded-lg transition-colors touch-manipulation"
            aria-label={isExpanded ? 'إخفاء الفلاتر' : 'إظهار الفلاتر'}
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Filters Content */}
      <div className={`transition-all duration-300 ${isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            {quickFilters.map((filter, idx) => {
              const active = filter.isActive();
              return (
                <button
                  key={idx}
                  onClick={filter.action}
                  className={`
                    px-3 py-2 sm:px-4 sm:py-2 border rounded-lg transition-all text-xs sm:text-sm font-medium flex items-center gap-2 touch-manipulation cursor-pointer
                    ${active 
                      ? 'bg-amber-600 border-amber-600 text-white shadow-md shadow-amber-500/20' 
                      : 'bg-white border-amber-200 hover:border-amber-400 hover:bg-amber-50 text-gray-700'}
                  `}
                >
                  <span>{filter.icon}</span>
                  {filter.label}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="space-y-2">
            <label className="block text-xs sm:text-sm font-semibold text-gray-700">البحث</label>
            <div className="relative">
              <Search className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="ابحث باسم الكتاب أو المؤلف..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 sm:h-11 pr-10 sm:pr-12 pl-3 sm:pl-4 border-2 border-amber-200 focus:border-amber-400 rounded-xl focus:ring-4 focus:ring-amber-500/10 transition-all duration-300 outline-none bg-white text-sm sm:text-base font-semibold shadow-sm focus:shadow-md"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 p-1.5 sm:p-1 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="مسح البحث"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              )}
            </div>
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Status */}
            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-bold text-gray-700 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-600 animate-pulse" />
                حالة القراءة
              </label>
              <div className="relative">
                <select 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value)} 
                  className={`w-full h-10 sm:h-11 px-3 sm:px-4 pr-8 sm:pr-10 border-2 rounded-xl focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 transition-all duration-300 outline-none appearance-none bg-white cursor-pointer text-sm sm:text-base font-semibold ${
                    status !== 'all' ? 'border-amber-400 bg-amber-50/40 text-amber-900' : 'border-amber-200 text-gray-700'
                  }`}
                >
                  <option value="all">جميع الكتب ({statusCounts.all})</option>
                  <option value="completed">ما قرأته ({statusCounts.completed})</option>
                  <option value="reading">أقرأه الآن ({statusCounts.reading})</option>
                  <option value="planned">سأقرأه لاحقًا ({statusCounts.planned})</option>
                </select>
                <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-bold text-gray-700 flex items-center gap-2">
                <LibraryBig className="w-4 h-4 text-amber-600" />
                التصنيف
              </label>
              <div className="relative">
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)} 
                  className={`w-full h-10 sm:h-11 px-3 sm:px-4 pr-8 sm:pr-10 border-2 rounded-xl focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 transition-all duration-300 outline-none appearance-none bg-white cursor-pointer text-sm sm:text-base font-semibold ${
                    category !== 'الكل' ? 'border-amber-400 bg-amber-50/40 text-amber-900' : 'border-amber-200 text-gray-700'
                  }`}
                >
                  {categories.map((c) => {
                    const count = c === 'الكل' ? books.length : (categoryCounts[c] || 0);
                    return (
                      <option key={c} value={c}>
                        {c} {count > 0 ? `(${count})` : ''}
                      </option>
                    );
                  })}
                </select>
                <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Rating */}
            {!isSuggested && (
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-600 fill-amber-500/10" />
                  التقييم
                </label>
                <div className="relative">
                  <select 
                    value={rating} 
                    onChange={(e) => setRating(e.target.value)} 
                    className={`w-full h-10 sm:h-11 px-3 sm:px-4 pr-8 sm:pr-10 border-2 rounded-xl focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 transition-all duration-300 outline-none appearance-none bg-white cursor-pointer text-sm sm:text-base font-semibold ${
                      rating > 0 ? 'border-amber-400 bg-amber-50/40 text-amber-900' : 'border-amber-200 text-gray-700'
                    }`}
                    title="يعرض الكتب التي قيّمتها بالنجوم المحددة أو أكثر"
                  >
                    <option value={0}>كل التقييمات ({books.length})</option>
                    <option value={1}>⭐ نجمة فأكثر ({ratingCounts[1]})</option>
                    <option value={2}>⭐⭐ نجمتان فأكثر ({ratingCounts[2]})</option>
                    <option value={3}>⭐⭐⭐ ثلاث نجوم فأكثر ({ratingCounts[3]})</option>
                    <option value={4}>⭐⭐⭐⭐ أربع نجوم فأكثر ({ratingCounts[4]})</option>
                    <option value={5}>⭐⭐⭐⭐⭐ خمس نجوم ({ratingCounts[5]})</option>
                  </select>
                  <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Sort By */}
            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-bold text-gray-700 flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-amber-600" />
                ترتيب الكتب
              </label>
              <div className="relative">
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)} 
                  className={`w-full h-10 sm:h-11 px-3 sm:px-4 pr-8 sm:pr-10 border-2 rounded-xl focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 transition-all duration-300 outline-none appearance-none bg-white cursor-pointer text-sm sm:text-base font-semibold ${
                    sortBy !== 'recent' ? 'border-amber-400 bg-amber-50/40 text-amber-900' : 'border-amber-200 text-gray-700'
                  }`}
                >
                  <option value="recent">أحدث الإضافات</option>
                  <option value="oldest">أقدم الإضافات</option>
                  <option value="rating">التقييم (الأعلى أولاً)</option>
                  <option value="pages">عدد الصفحات (الأكثر أولاً)</option>
                  <option value="title">أبجدياً (أ - ي)</option>
                </select>
                <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Pages Range */}
            <div className="space-y-2 sm:col-span-2 lg:col-span-4">
              <label className="block text-xs sm:text-sm font-bold text-gray-700 flex items-center gap-2">
                <Hash className="w-4 h-4 text-amber-600 animate-bounce" />
                عدد الصفحات (اختياري)
              </label>
              <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
                <input 
                  type="number" 
                  placeholder="من" 
                  value={pagesMin} 
                  onChange={(e) => setPagesMin(e.target.value)} 
                  className={`flex-1 h-10 sm:h-11 px-3 sm:px-4 border-2 rounded-xl focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 transition-all duration-300 outline-none bg-white text-sm sm:text-base font-semibold ${
                    pagesMin ? 'border-amber-400 bg-amber-50/40 text-amber-900' : 'border-amber-200 text-gray-700'
                  }`}
                  min="0"
                />
                <span className="text-gray-500 font-bold hidden sm:inline">-</span>
                <input 
                  type="number" 
                  placeholder="إلى" 
                  value={pagesMax} 
                  onChange={(e) => setPagesMax(e.target.value)} 
                  className={`flex-1 h-10 sm:h-11 px-3 sm:px-4 border-2 rounded-xl focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 transition-all duration-300 outline-none bg-white text-sm sm:text-base font-semibold ${
                    pagesMax ? 'border-amber-400 bg-amber-50/40 text-amber-900' : 'border-amber-200 text-gray-700'
                  }`}
                  min="0"
                />
                <span className="text-gray-700 font-bold whitespace-nowrap">صفحة</span>
              </div>
              {!isPagesRangeValid && (
                <p className="text-xs sm:text-sm text-red-600 flex items-center gap-2 mt-2">
                  <span>⚠️</span>
                  الحد الأدنى يجب أن يكون أقل من أو يساوي الحد الأقصى
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
