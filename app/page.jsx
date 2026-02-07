'use client';

import { useSelector, useDispatch } from 'react-redux';
import { selectAllBooks, addBookAsync, fetchBooks } from '@/store/booksSlice';
import { 
  faBook,
  faGraduationCap,
  faHistory,
  faBrain,
  faFeather,
  faScroll,
  faMosque,
} from '@fortawesome/free-solid-svg-icons';
import booksData from './data/books_library.json';
import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';

// Components
import Header from '@/components/ui/Header';
import SearchBar from '@/components/ui/SearchBar'; // استخدم النسخة المتقدمة
import ResultsHeader from '@/components/ui/ResultsHeader';
import BooksGrid from '@/components/ui/BooksGrid';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '@/components/ui/Pagination';
import QuickActions from '@/components/ui/QuickActions';
import Footer from '@/components/ui/Footer';

// أيقونات التصنيفات
const CATEGORY_ICONS = {
  'الفقه': faBook,
  'العقيدة': faMosque,
  'السيرة': faGraduationCap,
  'الحديث': faScroll,
  'التاريخ': faHistory,
  'الفكر': faBrain,
  'الرواية': faFeather,
  'الشعر': faFeather
};

// ألوان التصنيفات
const CATEGORY_COLORS = {
  'الفقه': 'from-blue-500 to-blue-700',
  'العقيدة': 'from-green-500 to-green-700',
  'السيرة': 'from-purple-500 to-purple-700',
  'الحديث': 'from-amber-500 to-amber-700',
  'التاريخ': 'from-red-500 to-red-700',
  'الفكر': 'from-indigo-500 to-indigo-700',
  'الرواية': 'from-pink-500 to-pink-700',
  'الشعر': 'from-teal-500 to-teal-700'
};

export default function Home() {
  const dispatch = useDispatch();
  const myBooks = useSelector(selectAllBooks);
  const user = useSelector((state) => state.auth?.user);
  const userId = user?.uid;
  
  // State
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAuthor, setSelectedAuthor] = useState(null); // فلتر المؤلف
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('title');
  const [currentPage, setCurrentPage] = useState(1);
  const [booksLoading, setBooksLoading] = useState(true);
  
  const booksPerPage = 12;

  // Fetch books when user is logged in
  useEffect(() => {
    if (userId) {
      dispatch(fetchBooks(userId));
    }
  }, [dispatch, userId]);

  // Dark Mode
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedMode);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Filter and Sort Books
  const filteredBooks = useMemo(() => {
    let books = booksData.books;

    // Filter by category
    if (selectedCategory !== 'all') {
      books = books.filter(book => book.category === selectedCategory);
    }

    // Filter by author
    if (selectedAuthor) {
      books = books.filter(book => book.author === selectedAuthor);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      books = books.filter(book => 
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query)
      );
    }

    // Sort
    books = [...books].sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title, 'ar');
      if (sortBy === 'author') return a.author.localeCompare(b.author, 'ar');
      if (sortBy === 'pages') return b.pages - a.pages;
      if (sortBy === 'latest') return b.id - a.id;
      return 0;
    });

    return books;
  }, [selectedCategory, selectedAuthor, searchQuery, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  const paginatedBooks = filteredBooks.slice(
    (currentPage - 1) * booksPerPage,
    currentPage * booksPerPage
  );

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedAuthor, searchQuery, sortBy]);

  // Check if books are loaded
  useEffect(() => {
    if (userId && myBooks.length > 0) {
      setBooksLoading(false);
    } else if (userId) {
      // User logged in but no books yet
      setBooksLoading(false);
    }
  }, [userId, myBooks.length]);

  // Check if book is in my library (by original book id OR by title+author)
  const isInLibrary = (bookId) => {
    // Check by id
    if (myBooks.some(book => book.id === bookId)) return true;
    // Check by title + author (for books added from booksData)
    const sourceBook = booksData?.books?.find(b => b.id === bookId);
    if (sourceBook && myBooks.some(book => 
      book.title === sourceBook.title && book.author === sourceBook.author
    )) return true;
    return false;
  };

  // Add book to library
  const handleAddToLibrary = (book) => {
    if (!userId) {
      toast.error('يرجى تسجيل الدخول أولاً لإضافة الكتب إلى مكتبتك');
      return;
    }
    // Check if book is already in local state
    if (isInLibrary(book.id)) {
      toast('الكتاب موجود مسبقاً في مكتبتك', { icon: 'ℹ️' });
      return;
    }
    // Add book
    const { id, ...bookData } = book;
    dispatch(addBookAsync({
      userId: userId,
      bookData: {
        ...bookData,
        status: 'planned',
        dateAdded: new Date().toISOString()
      }
    }))
      .unwrap()
      .then(() => {
        toast.success('✅ تم إضافة الكتاب إلى مكتبتك بنجاح!');
      })
      .catch((error) => {
        console.error('Error adding book:', error);
        toast.error(`❌ حدث خطأ: ${error.message || 'حدث خطأ غير معروف'}`);
      });
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedAuthor(null);
  };

  return (
    <div className={`min-h-screen transition-all duration-300  ${
      darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-50'
    }`}>
      
      {/* Header */}
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        totalBooks={booksData.metadata.totalBooks}
        totalCategories={booksData.metadata.totalCategories}
        categories={booksData.categories}
        categoryIcons={CATEGORY_ICONS}
        onCategoryClick={setSelectedCategory}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Advanced Search & Filters Bar */}
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortBy={sortBy}
          setSortBy={setSortBy}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedAuthor={selectedAuthor}
          setSelectedAuthor={setSelectedAuthor}
          categories={booksData.categories}
          authors={booksData.authors}
          categoryIcons={CATEGORY_ICONS}
          categoryColors={CATEGORY_COLORS}
          totalBooks={booksData.metadata.totalBooks}
        />

        {/* Results Header */}
        <ResultsHeader
          selectedCategory={selectedCategory}
          displayedCount={paginatedBooks.length}
          totalCount={filteredBooks.length}
        />

        {/* Books Grid or Empty State */}
        {filteredBooks.length === 0 ? (
          <EmptyState onReset={handleResetFilters} />
        ) : (
          <>
            <BooksGrid
              books={paginatedBooks}
              isInLibrary={isInLibrary}
              onAddToLibrary={handleAddToLibrary}
              categoryColors={CATEGORY_COLORS}
              isLoading={isLoading}
            />

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}

        {/* Quick Actions */}
        <QuickActions 
          myBooksCount={myBooks.length} 
          isLoading={!userId} 
        />

        {/* Footer */}
        <Footer
          totalBooks={booksData.metadata.totalBooks}
          totalAuthors={booksData.metadata.totalAuthors}
          totalCategories={booksData.metadata.totalCategories}
        />
      </div>
    </div>
  );
}















































// 'use client';

// import Link from 'next/link';
// import { useSelector, useDispatch } from 'react-redux';
// import { selectAllBooks, selectBooksByCategory, addBook } from '@/store/booksSlice';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { 
//   faPlus, 
//   faBookOpen, 
//   faSearch, 
//   faTimes, 
//   faMoon, 
//   faSun, 
//   faHeart, 
//   faShareAlt, 
//   faStar,
//   faFilter,
//   faBook,
//   faGraduationCap,
//   faHistory,
//   faBrain,
//   faFeather,
//   faScroll,
//   faMosque,
//   faLightbulb,
//   faChevronRight,
//   faChevronLeft,
//   faSpinner,
//   faBookmark
// } from '@fortawesome/free-solid-svg-icons';
// import booksData from './data/books_library.json';
// import React, { useState, useEffect, useMemo } from 'react';
// import Image from 'next/image';

// // أيقونات التصنيفات
// const CATEGORY_ICONS = {
//   'الفقه': faBook,
//   'العقيدة': faMosque,
//   'السيرة': faGraduationCap,
//   'الحديث': faScroll,
//   'التاريخ': faHistory,
//   'الفكر': faBrain,
//   'الرواية': faFeather,
//   'الشعر': faFeather
// };

// // ألوان التصنيفات
// const CATEGORY_COLORS = {
//   'الفقه': 'from-blue-500 to-blue-700',
//   'العقيدة': 'from-green-500 to-green-700',
//   'السيرة': 'from-purple-500 to-purple-700',
//   'الحديث': 'from-amber-500 to-amber-700',
//   'التاريخ': 'from-red-500 to-red-700',
//   'الفكر': 'from-indigo-500 to-indigo-700',
//   'الرواية': 'from-pink-500 to-pink-700',
//   'الشعر': 'from-teal-500 to-teal-700'
// };

// export default function Home() {
//   const dispatch = useDispatch();
//   const myBooks = useSelector(selectAllBooks);
  
//   const [darkMode, setDarkMode] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [selectedCategory, setSelectedCategory] = useState('all');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [viewMode, setViewMode] = useState('grid'); // grid or list
//   const [showFilters, setShowFilters] = useState(false);
//   const [sortBy, setSortBy] = useState('title'); // title, author, pages
  
//   // Pagination
//   const [currentPage, setCurrentPage] = useState(1);
//   const booksPerPage = 12;

//   // Dark Mode
//   useEffect(() => {
//     const savedMode = localStorage.getItem('darkMode') === 'true';
//     setDarkMode(savedMode);
//   }, []);

//   useEffect(() => {
//     if (darkMode) {
//       document.documentElement.classList.add('dark');
//       localStorage.setItem('darkMode', 'true');
//     } else {
//       document.documentElement.classList.remove('dark');
//       localStorage.setItem('darkMode', 'false');
//     }
//   }, [darkMode]);

//   // Simulate loading
//   useEffect(() => {
//     const timer = setTimeout(() => setIsLoading(false), 800);
//     return () => clearTimeout(timer);
//   }, []);

//   // Filter and Sort Books
//   const filteredBooks = useMemo(() => {
//     let books = booksData.books;

//     // Filter by category
//     if (selectedCategory !== 'all') {
//       books = books.filter(book => book.category === selectedCategory);
//     }

//     // Filter by search
//     if (searchQuery.trim()) {
//       const query = searchQuery.toLowerCase();
//       books = books.filter(book => 
//         book.title.toLowerCase().includes(query) ||
//         book.author.toLowerCase().includes(query)
//       );
//     }

//     // Sort
//     books = [...books].sort((a, b) => {
//       if (sortBy === 'title') return a.title.localeCompare(b.title, 'ar');
//       if (sortBy === 'author') return a.author.localeCompare(b.author, 'ar');
//       if (sortBy === 'pages') return b.pages - a.pages;
//       return 0;
//     });

//     return books;
//   }, [selectedCategory, searchQuery, sortBy]);

//   // Pagination
//   const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
//   const paginatedBooks = filteredBooks.slice(
//     (currentPage - 1) * booksPerPage,
//     currentPage * booksPerPage
//   );

//   // Reset pagination when filters change
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [selectedCategory, searchQuery, sortBy]);

//   // Check if book is in my library
//   const isInLibrary = (bookId) => {
//     return myBooks.some(book => book.id === bookId);
//   };

//   // Add book to library
//   const handleAddToLibrary = (book) => {
//     if (!isInLibrary(book.id)) {
//       dispatch(addBook({
//         ...book,
//         status: 'planned',
//         dateAdded: new Date().toISOString()
//       }));
//     }
//   };

//   return (
//     <div className={`min-h-screen transition-all duration-300 ${
//       darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-50'
//     }`}>
      
//       {/* Header with Gradient */}
//       <header className="relative overflow-hidden">
//         <div className="absolute inset-0 bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 dark:from-amber-800 dark:via-orange-700 dark:to-amber-800"></div>
//         <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        
//         <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//           <div className="flex justify-between items-start mb-8">
//             <div>
//               <h1 className="text-5xl md:text-7xl font-black text-white mb-3 tracking-tight">
//                 أثَر
//               </h1>
//               <p className="text-white/90 text-lg md:text-xl max-w-2xl leading-relaxed">
//                 مكتبة رقمية شاملة تضم {booksData.metadata.totalBooks} كتاباً من {booksData.metadata.totalCategories} تصنيفات
//               </p>
//             </div>
            
//             <button 
//               onClick={() => setDarkMode(!darkMode)}
//               className="p-4 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all shadow-lg"
//               aria-label="Toggle Dark Mode"
//             >
//               <FontAwesomeIcon 
//                 icon={darkMode ? faSun : faMoon} 
//                 className="text-white text-xl" 
//               />
//             </button>
//           </div>

//           {/* Stats Cards */}
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//             {booksData.categories.map((cat) => (
//               <div 
//                 key={cat.name}
//                 className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all cursor-pointer group"
//                 onClick={() => setSelectedCategory(cat.name)}
//               >
//                 <div className="flex items-center gap-3 mb-2">
//                   <FontAwesomeIcon 
//                     icon={CATEGORY_ICONS[cat.name]} 
//                     className="text-white text-lg group-hover:scale-110 transition-transform" 
//                   />
//                   <span className="text-white font-bold text-2xl">{cat.count}</span>
//                 </div>
//                 <p className="text-white/80 text-sm">{cat.name}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </header>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
//         {/* Search & Filters Bar */}
//         <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sticky top-4 z-40 border border-gray-100 dark:border-gray-700">
//           <div className="flex flex-col lg:flex-row gap-4">
            
//             {/* Search */}
//             <div className="flex-1 relative">
//               <FontAwesomeIcon 
//                 icon={faSearch} 
//                 className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" 
//               />
//               <input 
//                 type="text"
//                 placeholder="ابحث عن كتاب أو مؤلف..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="w-full pr-12 pl-4 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 transition-all text-lg"
//               />
//               {searchQuery && (
//                 <button 
//                   onClick={() => setSearchQuery('')}
//                   className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
//                 >
//                   <FontAwesomeIcon icon={faTimes} />
//                 </button>
//               )}
//             </div>

//             {/* Sort Dropdown */}
//             <select 
//               value={sortBy}
//               onChange={(e) => setSortBy(e.target.value)}
//               className="px-6 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 transition-all cursor-pointer"
//             >
//               <option value="title">ترتيب: العنوان</option>
//               <option value="author">ترتيب: المؤلف</option>
//               <option value="pages">ترتيب: الصفحات</option>
//             </select>

//             {/* Filter Toggle */}
//             <button
//               onClick={() => setShowFilters(!showFilters)}
//               className="px-6 py-4 rounded-xl bg-amber-600 text-white hover:bg-amber-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 justify-center font-medium"
//             >
//               <FontAwesomeIcon icon={faFilter} />
//               <span>التصنيفات</span>
//             </button>
//           </div>

//           {/* Category Filters */}
//           {showFilters && (
//             <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
//               <div className="flex flex-wrap gap-3">
//                 <button
//                   onClick={() => setSelectedCategory('all')}
//                   className={`px-6 py-3 rounded-xl font-medium transition-all ${
//                     selectedCategory === 'all'
//                       ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg scale-105'
//                       : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
//                   }`}
//                 >
//                   الكل ({booksData.metadata.totalBooks})
//                 </button>
                
//                 {booksData.categories.map((cat) => (
//                   <button
//                     key={cat.name}
//                     onClick={() => setSelectedCategory(cat.name)}
//                     className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
//                       selectedCategory === cat.name
//                         ? `bg-gradient-to-r ${CATEGORY_COLORS[cat.name]} text-white shadow-lg scale-105`
//                         : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
//                     }`}
//                   >
//                     <FontAwesomeIcon icon={CATEGORY_ICONS[cat.name]} />
//                     <span>{cat.name}</span>
//                     <span className="opacity-75">({cat.count})</span>
//                   </button>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Results Header */}
//         <div className="flex justify-between items-center">
//           <div>
//             <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
//               {selectedCategory === 'all' ? 'جميع الكتب' : selectedCategory}
//             </h2>
//             <p className="text-gray-600 dark:text-gray-400">
//               عرض {paginatedBooks.length} من {filteredBooks.length} كتاب
//             </p>
//           </div>
//         </div>

//         {/* Books Grid */}
//         {isLoading ? (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//             {[...Array(8)].map((_, i) => (
//               <div key={i} className="h-[480px] bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
//             ))}
//           </div>
//         ) : filteredBooks.length === 0 ? (
//           <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
//             <div className="text-6xl mb-4">📚</div>
//             <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
//               لا توجد نتائج
//             </h3>
//             <p className="text-gray-600 dark:text-gray-400 mb-6">
//               جرب تغيير معايير البحث
//             </p>
//             <button
//               onClick={() => {
//                 setSearchQuery('');
//                 setSelectedCategory('all');
//               }}
//               className="px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all"
//             >
//               إعادة تعيين
//             </button>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//             {paginatedBooks.map((book) => (
//               <div 
//                 key={book.id}
//                 className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 dark:border-gray-700 hover:scale-[1.02] hover:-translate-y-1"
//               >
//                 {/* Image */}
//                 <div className="relative h-72 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
//                   {book.coverImage ? (
//                     <img
//                       src={book.coverImage}
//                       alt={book.title}
//                       className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
//                       loading="lazy"
//                     />
//                   ) : (
//                     <div className="w-full h-full flex items-center justify-center">
//                       <FontAwesomeIcon 
//                         icon={faBook} 
//                         className="text-6xl text-gray-400 dark:text-gray-500" 
//                       />
//                     </div>
//                   )}
                  
//                   {/* Overlay Gradient */}
//                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
//                   {/* Category Badge */}
//                   <div className="absolute top-3 right-3">
//                     <span className={`px-3 py-1 rounded-lg text-white text-xs font-bold bg-gradient-to-r ${CATEGORY_COLORS[book.category]} shadow-lg`}>
//                       {book.category}
//                     </span>
//                   </div>

//                   {/* Library Status */}
//                   {isInLibrary(book.id) && (
//                     <div className="absolute top-3 left-3">
//                       <div className="bg-green-500 text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg">
//                         <FontAwesomeIcon icon={faBookmark} />
//                         <span>في مكتبتي</span>
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 {/* Content */}
//                 <div className="p-5">
//                   <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors min-h-[3.5rem]">
//                     {book.title}
//                   </h3>
                  
//                   <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-1">
//                     <FontAwesomeIcon icon={faGraduationCap} className="ml-2 text-amber-600" />
//                     {book.author}
//                   </p>

//                   <div className="flex items-center justify-between mb-4 text-sm text-gray-500 dark:text-gray-400">
//                     <span className="flex items-center gap-1">
//                       <FontAwesomeIcon icon={faBook} className="text-amber-600" />
//                       {book.pages} صفحة
//                     </span>
//                   </div>

//                   {/* Actions */}
//                   <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
//                     {isInLibrary(book.id) ? (
//                       <Link
//                         href="/library"
//                         className="flex-1 bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
//                       >
//                         <FontAwesomeIcon icon={faBookOpen} />
//                         <span>عرض في المكتبة</span>
//                       </Link>
//                     ) : (
//                       <button
//                         onClick={() => handleAddToLibrary(book)}
//                         className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 text-white py-3 rounded-xl font-medium hover:from-amber-700 hover:to-orange-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
//                       >
//                         <FontAwesomeIcon icon={faPlus} />
//                         <span>أضف للمكتبة</span>
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* Pagination */}
//         {totalPages > 1 && (
//           <div className="flex justify-center items-center gap-2 mt-12">
//             <button
//               onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
//               disabled={currentPage === 1}
//               className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
//             >
//               <FontAwesomeIcon icon={faChevronRight} />
//             </button>

//             {[...Array(totalPages)].map((_, i) => (
//               <button
//                 key={i}
//                 onClick={() => setCurrentPage(i + 1)}
//                 className={`px-4 py-3 rounded-xl font-medium transition-all ${
//                   currentPage === i + 1
//                     ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg scale-110'
//                     : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
//                 }`}
//               >
//                 {i + 1}
//               </button>
//             ))}

//             <button
//               onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
//               disabled={currentPage === totalPages}
//               className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
//             >
//               <FontAwesomeIcon icon={faChevronLeft} />
//             </button>
//           </div>
//         )}

//         {/* Quick Actions */}
//         <div className="flex flex-col sm:flex-row gap-4 justify-center py-8">
//           <Link
//             href="/library"
//             className="group relative overflow-hidden bg-gradient-to-r from-amber-600 to-orange-600 text-white px-8 py-5 rounded-2xl font-bold text-lg hover:from-amber-700 hover:to-orange-700 transition-all shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-3"
//           >
//             <span className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-2xl"></span>
//             <FontAwesomeIcon icon={faBookOpen} className="relative z-10 text-xl" />
//             <span className="relative z-10">مكتبتي ({myBooks.length})</span>
//           </Link>

//           <Link
//             href="/add"
//             className="bg-white dark:bg-gray-800 border-2 border-amber-600 text-amber-600 dark:text-amber-500 px-8 py-5 rounded-2xl font-bold text-lg hover:bg-amber-50 dark:hover:bg-gray-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-3"
//           >
//             <FontAwesomeIcon icon={faPlus} className="text-xl" />
//             <span>إضافة كتاب</span>
//           </Link>
//         </div>

//         {/* Footer */}
//         <footer className="border-t border-gray-200 dark:border-gray-700 pt-8 pb-4 text-center">
//           <p className="text-gray-600 dark:text-gray-400 mb-2">
//             © 2026 أثَر - مكتبتك الرقمية الشاملة
//           </p>
//           <p className="text-sm text-gray-500 dark:text-gray-500">
//             {booksData.metadata.totalBooks} كتاب • {booksData.metadata.totalAuthors} مؤلف • {booksData.metadata.totalCategories} تصنيف
//           </p>
//         </footer>
//       </div>
//     </div>
//   );
// }