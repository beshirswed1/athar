

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { selectAllBooks } from '@/store/booksSlice'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faBookOpen, 
  faSearch, 
  faTimes, 
  faFilter, 
  faMoon, 
  faSun, 
  faChevronRight,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import suggestedBooksData from './data/suggestedBooks.json'; // تأكد من المسار

// Lazy-load components
const AddSuggestedModalComp = React.lazy(() => import('@/components/AddSuggestedModal'));

// مكون Skeleton للتحميل
const BookSkeleton = () => (
  <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden h-96 shadow-sm">
    <div className="h-56 bg-gray-300 dark:bg-gray-600"></div>
    <div className="p-4 space-y-3">
      <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
      <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded mt-4"></div>
    </div>
  </div>
);

export default function Home() {
  // Redux State
  const books = useSelector(selectAllBooks);

  // Local State
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [suggestedToAdd, setSuggestedToAdd] = useState(null);
  const [displayCount, setDisplayCount] = useState(8); // Infinite scroll simulation
  const [AddSuggestedModal, setAddSuggestedModal] = useState(null);

  // Filter State
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    pagesMin: 0,
    pagesMax: 1000,
  });

  // Load Dependencies & Theme
  useEffect(() => {
    let mounted = true;
    
    // Simulate Loading
    setTimeout(() => setIsLoading(false), 800);

    // Dynamic Import
    import('@/components/AddSuggestedModal').then((m) => {
      if (mounted) setAddSuggestedModal(() => m.default);
    }).catch(() => {});

    // Check System Theme preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }

    return () => { mounted = false; };
  }, []);

  // Toggle Dark Mode Class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Derived Data (Filtering & Sorting)
  const filteredSuggestedBooks = useMemo(() => {
    let result = suggestedBooksData.books.filter((book) => {
      const matchesSearch =
        (book.title || '').toLowerCase().includes(filters.search.toLowerCase()) ||
        (book.author || '').toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesCategory = filters.category === 'all' || book.category === filters.category;
      const matchesPages = (book.pages || 0) >= filters.pagesMin && (book.pages || 0) <= filters.pagesMax;

      return matchesSearch && matchesCategory && matchesPages;
    });

    return result;
  }, [filters]);

  const displayedBooks = filteredSuggestedBooks.slice(0, displayCount);

  // Handlers
  const handleLoadMore = () => setDisplayCount((prev) => prev + 4);
  const uniqueCategories = ['all', ...new Set(suggestedBooksData.books.map(b => b.category))];

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans ${darkMode ? 'bg-slate-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
      
      {/* Container الرئيسي مع ظل ناعم */}
      <div className="max-w-7xl mx-auto bg-white dark:bg-slate-800 shadow-xl min-h-screen flex flex-col transition-colors duration-300">
        
        {/* Breadcrumbs & Theme Toggle */}


        {/* Header Section with Gradient */}
        <header className="relative py-16 px-6 text-center overflow-hidden bg-linear-to-br from-amber-50 to-orange-100 dark:from-slate-800 dark:to-slate-900 transition-colors">
          <div className="relative z-10 animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 text-amber-800 dark:text-amber-500 font-display tracking-tight">
              أثَر
            </h1>
            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed opacity-0 animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
              رحلتك المعرفية تبدأ هنا. تتبع قراءاتك، اكتشف عوالم جديدة، واصنع أثراً يدوم.
            </p>
          </div>
          {/* Decorative Circle */}
          <div className="absolute top-[-50%] left-[-10%] w-96 h-96 bg-amber-300/20 rounded-full blur-3xl pointer-events-none"></div>
        </header>

        <main className="flex-1 p-6 md:p-12 space-y-12">
          
          {/* Actions Bar */}
          <section className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Link
              href="/add"
              className="group relative overflow-hidden bg-amber-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-amber-500/30 hover:-translate-y-1 transition duration-300 flex items-center justify-center gap-2"
            >
              <FontAwesomeIcon icon={faPlus} className="group-hover:rotate-90 transition-transform duration-300" />
              <span>إضافة كتاب جديد</span>
            </Link>
            <Link
              href="/library"
              className="group bg-white dark:bg-slate-700 text-amber-800 dark:text-amber-400 border-2 border-amber-800/20 dark:border-amber-500/20 px-8 py-3 rounded-full font-bold hover:bg-amber-50 dark:hover:bg-slate-600 transition duration-300 flex items-center justify-center gap-2"
            >
              <FontAwesomeIcon icon={faBookOpen} />
              <span>مكتبتي ({books.length})</span>
            </Link>
          </section>

          {/* Filters Section */}
          <section className="max-w-5xl mx-auto bg-gray-50 dark:bg-slate-700/50 p-6 rounded-2xl shadow-inner border border-gray-100 dark:border-slate-600">
            <div className="flex items-center gap-2 mb-4 text-gray-500 dark:text-gray-300">
              <FontAwesomeIcon icon={faFilter} />
              <h3 className="font-bold text-lg">تصفية المقترحات</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
              {/* Search */}
              <div className="md:col-span-6 relative group">
                <label className="block text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">بحث</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="عنوان الكتاب أو المؤلف..."
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition outline-none"
                  />
                  <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3.5 text-gray-400" />
                  {filters.search && (
                    <button onClick={() => setFilters({...filters, search: ''})} className="absolute right-3 top-3.5 text-gray-400 hover:text-red-500">
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  )}
                </div>
              </div>

              {/* Category Dropdown */}
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">التصنيف</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-amber-500 outline-none appearance-none cursor-pointer"
                >
                  {uniqueCategories.map(cat => (
                    <option key={cat} value={cat}>{cat === 'all' ? 'جميع التصنيفات' : cat}</option>
                  ))}
                </select>
              </div>

              {/* Page Range Slider */}
              <div className="md:col-span-3">
                 <div className="flex justify-between mb-1">
                    <label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">الصفحات (الحد الأقصى)</label>
                    <span className="text-xs font-bold text-amber-600">{filters.pagesMax}</span>
                 </div>
                 <input 
                   type="range" 
                   min="0" 
                   max="10000" 
                   step="50"
                   value={filters.pagesMax}
                   onChange={(e) => setFilters({...filters, pagesMax: Number(e.target.value)})}
                   className="w-full h-2 bg-gray-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-amber-600"
                 />
              </div>
            </div>
          </section>

          {/* Suggestions Grid */}
          <section>
            <div className="flex justify-between items-end mb-8 border-b dark:border-slate-700 pb-4">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white relative">
                كتب مقترحة لك
                <span className="absolute -bottom-4 right-0 w-1/3 h-1 bg-amber-500 rounded-full"></span>
              </h2>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-3 py-1 rounded-full">
                {filteredSuggestedBooks.length} نتيجة
              </span>
            </div>
            
            {isLoading ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                 {[...Array(4)].map((_, i) => <BookSkeleton key={i} />)}
               </div>
            ) : filteredSuggestedBooks.length === 0 ? (
              <div className="text-center py-20 flex flex-col items-center justify-center opacity-70">
                <div className="bg-gray-100 dark:bg-slate-700 p-8 rounded-full mb-6">
                   <FontAwesomeIcon icon={faSearch} className="text-6xl text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-600 dark:text-gray-300 mb-2">لا توجد نتائج</h3>
                <p className="text-gray-500">حاول تغيير معايير البحث أو التصفية للعثور على كتب.</p>
                <button 
                  onClick={() => setFilters({ search: '', category: 'all', pagesMin: 0, pagesMax: 1000 })}
                  className="mt-6 text-amber-600 hover:underline font-medium"
                >
                  إعادة تعيين الفلتر
                </button>
              </div>
            ) : (
              /* Auto-fit responsive grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 auto-rows-fr">
                {displayedBooks.map((book, index) => (
                  <div 
                    key={index} 
                    className="group relative bg-white dark:bg-slate-700 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-105 flex flex-col overflow-hidden border border-gray-100 dark:border-slate-600"
                  >
                    {/* Category Badge */}
                    <div className="absolute top-4 right-4 z-20">
                      <span className="bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 text-xs font-bold px-3 py-1 rounded-full shadow-sm backdrop-blur-md border border-amber-200 dark:border-amber-700">
                        {book.category}
                      </span>
                    </div>

                    {/* Image Container */}
                    <div className="relative h-64 overflow-hidden bg-gray-200 dark:bg-slate-800 w-full">
                      {book.coverImage ? (
     <img
  src={book.coverImage}
  alt={book.title}
  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
  loading="lazy"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  onError={(e) => {
    e.currentTarget.src = "https://via.placeholder.com/300x450?text=No+Cover";
  }}
/>

                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-800 text-gray-400">
                          <FontAwesomeIcon icon={faBookOpen} className="text-4xl opacity-50" />
                        </div>
                      )}
                      
                      {/* Dark Overlay on Hover */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                         <button
                           onClick={() => setSuggestedToAdd(book)}
                           className="bg-amber-600 text-white px-6 py-2 rounded-full font-bold transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-amber-700 flex items-center gap-2 shadow-lg"
                           aria-label={`أضف كتاب ${book.title} للمكتبة`}
                         >
                           <FontAwesomeIcon icon={faPlus} />
                           أضف للمكتبة
                         </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 line-clamp-1" title={book.title}>
                        {book.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1">
                        بقلم: <span className="font-medium text-amber-700 dark:text-amber-400 truncate">{book.author}</span>
                      </p>
                      
                      <div className="mt-auto flex justify-between items-center text-xs text-gray-400 pt-3 border-t dark:border-slate-600">
                        <span>{book.pages || '?'} صفحة</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Infinite Scroll / Load More */}
            {!isLoading && displayedBooks.length < filteredSuggestedBooks.length && (
              <div className="text-center mt-12">
                 <button 
                   onClick={handleLoadMore}
                   className="bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 px-8 py-3 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600 transition shadow-sm font-medium flex items-center gap-2 mx-auto"
                 >
                   {isLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'عرض المزيد من الكتب'}
                 </button>
              </div>
            )}
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-gray-100 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 py-8 text-center text-sm text-gray-500 dark:text-gray-400 transition-colors">
          <p className="mb-2 font-medium">مشروع أثَر - مكتبتك الشخصية</p>
          <p dir="ltr" className="opacity-70">&copy; {new Date().getFullYear()} Athar Library App. v1.2.0</p>
        </footer>

        {/* Lazy Loaded Modal */}
        {suggestedToAdd && AddSuggestedModal && (
          <AddSuggestedModal
            book={suggestedToAdd}
            onClose={() => setSuggestedToAdd(null)}
          />
        )}
      </div>

      {/* Global Style for simple Fade In Animation if Tailwind config doesn't have it */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fadeIn 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}