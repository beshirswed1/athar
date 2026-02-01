'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, X, ChevronDown, ChevronUp, BookOpen, Star, Hash, Filter,BookHeart, Minimize2, BookOpenCheck, LibraryBig  } from 'lucide-react';
import suggestedBooksData from '@/app/data/suggestedBooks.json';

export default function LibraryFilters({ onFilterChange, isSuggested = false, totalBooks = 0, filteredCount = 0 }) {
  // State management
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [rating, setRating] = useState(0);
  const [pagesMin, setPagesMin] = useState('');
  const [pagesMax, setPagesMax] = useState('');
  const [category, setCategory] = useState('الكل');
  const [isExpanded, setIsExpanded] = useState(true);
  const [searchDebounce, setSearchDebounce] = useState('');

  // استخراج الفئات من البيانات
  const categories = useMemo(() => {
    const catNames = suggestedBooksData.categories.map(c => c.name);
    return ['الكل', ...catNames];
  }, []);

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
      category: category === 'الكل' ? null : category
    });
  }, [searchDebounce, status, rating, pagesMin, pagesMax, category, onFilterChange]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // حفظ الفلاتر في LocalStorage
  useEffect(() => {
    const filters = { search, status, rating, pagesMin, pagesMax, category };
    localStorage.setItem('libraryFilters', JSON.stringify(filters));
  }, [search, status, rating, pagesMin, pagesMax, category]);

  // استرجاع الفلاتر من LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('libraryFilters');
    if (saved) {
      try {
        const filters = JSON.parse(saved);
        setSearch(filters.search || '');
        setStatus(filters.status || 'all');
        setRating(filters.rating || 0);
        setPagesMin(filters.pagesMin || '');
        setPagesMax(filters.pagesMax || '');
        setCategory(filters.category || 'الكل');
      } catch (e) {
        console.error('Error loading filters:', e);
      }
    }
  }, []);

  // إعادة تعيين الفلاتر
  const resetFilters = () => {
    setSearch('');
    setStatus('all');
    setRating(0);
    setPagesMin('');
    setPagesMax('');
    setCategory('الكل');
    localStorage.removeItem('libraryFilters');
  };

  // التحقق من وجود فلاتر نشطة
  const hasActiveFilters = search || status !== 'all' || rating > 0 || pagesMin || pagesMax || category !== 'الكل';

  // التحقق من صحة نطاق الصفحات
  const isPagesRangeValid = !pagesMin || !pagesMax || Number(pagesMin) <= Number(pagesMax);

  // Presets ذكية
  const quickFilters = [
    { label: 'أقرأه الآن', icon: <BookOpenCheck className="w-4 h-4" />, action: () => setStatus('reading') },
    { label: 'المفضلة', icon: <BookHeart className="w-4 h-4" />, action: () => setRating(5) },
    { label: 'كتب قصيرة', icon: <Minimize2 className="w-4 h-4" />, action: () => { setPagesMin(''); setPagesMax('200'); } },
  ];

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg border border-amber-200/50 overflow-hidden transition-all duration-300">
      {/* Header */}
      <div className="px-6 py-4 bg-white/50 backdrop-blur-sm border-b border-amber-200/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Filter className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">تصفية الكتب</h3>
            {totalBooks > 0 && (
              <p className="text-sm text-gray-600">
                يتم عرض <span className="font-bold text-amber-700">{filteredCount}</span> من أصل {totalBooks} كتاب
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-sm font-medium text-amber-700 hover:text-amber-800 hover:bg-amber-100 rounded-lg transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              إعادة تعيين
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-amber-100 rounded-lg transition-colors"
            aria-label={isExpanded ? 'إخفاء الفلاتر' : 'إظهار الفلاتر'}
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Filters Content */}
      <div className={`transition-all duration-300 ${isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="p-6 space-y-6">
          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            {quickFilters.map((filter, idx) => (
              <button
                key={idx}
                onClick={filter.action}
                className="px-4 py-2 bg-white border border-amber-200 hover:border-amber-400 hover:bg-amber-50 rounded-lg transition-all text-sm font-medium text-gray-700 flex items-center gap-2"
              >
                <span>{filter.icon}</span>
                {filter.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">البحث</label>
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="ابحث باسم الكتاب أو المؤلف..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-11 pr-12 pl-4 border-2 border-amber-200 rounded-xl focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all outline-none bg-white"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="مسح البحث"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              )}
            </div>
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Status */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-600" />
                حالة القراءة
              </label>
              <div className="relative">
                <select 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value)} 
                  className={`w-full h-11 px-4 pr-10 border-2 rounded-xl focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all outline-none appearance-none bg-white cursor-pointer ${
                    status !== 'all' ? 'border-amber-400 bg-amber-50' : 'border-amber-200'
                  }`}
                >
                  <option value="all">جميع الكتب</option>
                  <option value="completed">ما قرأته</option>
                  <option value="reading">أقرأه الآن</option>
                  <option value="planned">سأقرأه لاحقًا</option>
                </select>
                <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                <LibraryBig className="w-4 h-4 text-amber-600" />
                التصنيف
              </label>
              <div className="relative">
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)} 
                  className={`w-full h-11 px-4 pr-10 border-2 rounded-xl focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all outline-none appearance-none bg-white cursor-pointer ${
                    category !== 'الكل' ? 'border-amber-400 bg-amber-50' : 'border-amber-200'
                  }`}
                >
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Rating */}
            {!isSuggested && (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-600 fill-amber-600" />
                  التقييم
                </label>
                <div className="relative">
                  <select 
                    value={rating} 
                    onChange={(e) => setRating(e.target.value)} 
                    className={`w-full h-11 px-4 pr-10 border-2 rounded-xl focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all outline-none appearance-none bg-white cursor-pointer ${
                      rating > 0 ? 'border-amber-400 bg-amber-50' : 'border-amber-200'
                    }`}
                    title="يعرض الكتب التي قيّمتها بالنجوم المحددة أو أكثر"
                  >
                    <option value={0}>كل التقييمات</option>
                    <option value={1}>⭐ نجمة فأكثر</option>
                    <option value={2}>⭐⭐ نجمتان فأكثر</option>
                    <option value={3}>⭐⭐⭐ ثلاث نجوم فأكثر</option>
                    <option value={4}>⭐⭐⭐⭐ أربع نجوم فأكثر</option>
                    <option value={5}>⭐⭐⭐⭐⭐ خمس نجوم</option>
                  </select>
                  <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Pages Range */}
            <div className="space-y-2 md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Hash className="w-4 h-4 text-amber-600" />
                عدد الصفحات (اختياري)
              </label>
              <div className="flex gap-3 items-center">
                <input 
                  type="number" 
                  placeholder="من" 
                  value={pagesMin} 
                  onChange={(e) => setPagesMin(e.target.value)} 
                  className={`flex-1 h-11 px-4 border-2 rounded-xl focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all outline-none bg-white ${
                    pagesMin ? 'border-amber-400 bg-amber-50' : 'border-amber-200'
                  }`}
                  min="0"
                />
                <span className="text-gray-500 font-medium">-</span>
                <input 
                  type="number" 
                  placeholder="إلى" 
                  value={pagesMax} 
                  onChange={(e) => setPagesMax(e.target.value)} 
                  className={`flex-1 h-11 px-4 border-2 rounded-xl focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all outline-none bg-white ${
                    pagesMax ? 'border-amber-400 bg-amber-50' : 'border-amber-200'
                  }`}
                  min="0"
                />
                <span className="text-gray-700 font-medium whitespace-nowrap">صفحة</span>
              </div>
              {!isPagesRangeValid && (
                <p className="text-sm text-red-600 flex items-center gap-2 mt-2">
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