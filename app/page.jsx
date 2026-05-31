'use client';

import { useSelector, useDispatch } from 'react-redux';
import { selectAllBooks, addBookAsync, fetchBooks } from '@/store/booksSlice';
import { 
  faMosque,
  faFeather,
  faBookOpen,
  faCompass,
  faAtom,
  faLaptopCode,
  faHeartPulse,
  faBrain,
  faChartLine,
  faGavel,
  faLightbulb,
  faPalette,
  faLanguage,
  faGraduationCap,
  faChild,
  faHeart,
  faSeedling,
} from '@fortawesome/free-solid-svg-icons';
import booksData from './data/books_library.json';
import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';

// Components
import HomeHero from '@/components/ui/HomeHero';
import SearchBar from '@/components/ui/SearchBar'; // استخدم النسخة المتقدمة
import ResultsHeader from '@/components/ui/ResultsHeader';
import BooksGrid from '@/components/ui/BooksGrid';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '@/components/ui/Pagination';
import QuickActions from '@/components/ui/QuickActions';
import Footer from '@/components/ui/Footer';

// أيقونات التصنيفات
const CATEGORY_ICONS = {
  'الكتب الدينية': faMosque,
  'الأدب': faFeather,
  'الروايات والقصص': faBookOpen,
  'التاريخ والجغرافيا': faCompass,
  'العلوم الطبيعية': faAtom,
  'التكنولوجيا والحاسوب': faLaptopCode,
  'الطب والصحة': faHeartPulse,
  'علم النفس والاجتماع': faBrain,
  'الاقتصاد والأعمال': faChartLine,
  'السياسة والقانون': faGavel,
  'الفلسفة والفكر': faLightbulb,
  'الفنون': faPalette,
  'اللغات': faLanguage,
  'التعليم والمراجع': faGraduationCap,
  'الأطفال والناشئة': faChild,
  'الهوايات ونمط الحياة': faHeart,
  'الديناميكيات الحديثة': faSeedling
};

// ألوان التصنيفات
const CATEGORY_COLORS = {
  'الكتب الدينية': 'from-emerald-500 to-teal-700',
  'الأدب': 'from-amber-500 to-orange-700',
  'الروايات والقصص': 'from-rose-500 to-pink-700',
  'التاريخ والجغرافيا': 'from-stone-500 to-neutral-700',
  'العلوم الطبيعية': 'from-cyan-500 to-blue-700',
  'التكنولوجيا والحاسوب': 'from-violet-600 to-indigo-800',
  'الطب والصحة': 'from-red-500 to-rose-600',
  'علم النفس والاجتماع': 'from-purple-500 to-indigo-700',
  'الاقتصاد والأعمال': 'from-blue-600 to-cyan-700',
  'السياسة والقانون': 'from-slate-600 to-slate-800',
  'الفلسفة والفكر': 'from-yellow-500 to-amber-700',
  'الفنون': 'from-fuchsia-500 to-pink-700',
  'اللغات': 'from-teal-500 to-emerald-600',
  'التعليم والمراجع': 'from-indigo-500 to-purple-600',
  'الأطفال والناشئة': 'from-lime-500 to-green-600',
  'الهوايات ونمط الحياة': 'from-orange-400 to-red-500',
  'الديناميكيات الحديثة': 'from-sky-500 to-indigo-600'
};

export default function Home() {
  const dispatch = useDispatch();
  const myBooks = useSelector(selectAllBooks);
  const user = useSelector((state) => state.auth?.user);
  const userId = user?.uid;
  
  const reduxBooksLoading = useSelector((state) => state.books?.loading);
  const [initLoaded, setInitLoaded] = useState(false);

  // State
  const [darkMode, setDarkMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAuthor, setSelectedAuthor] = useState(null); // فلتر المؤلف
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('title');
  const [currentPage, setCurrentPage] = useState(1);
  
  const booksPerPage = 12;

  // Fetch books when user is logged in
  useEffect(() => {
    if (userId) {
      dispatch(fetchBooks(userId));
    }
  }, [dispatch, userId]);

  // Track initial load completion
  useEffect(() => {
    if (!reduxBooksLoading) {
      setInitLoaded(true);
    }
  }, [reduxBooksLoading]);

  const isLoading = userId ? (!initLoaded || reduxBooksLoading) : false;

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
      
      {/* HomeHero */}
      <HomeHero
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        totalBooks={booksData.metadata.totalBooks}
        totalCategories={booksData.metadata.totalCategories}
        categories={booksData.categories}
        categoryIcons={CATEGORY_ICONS}
        onCategoryClick={setSelectedCategory}
        selectedCategory={selectedCategory}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        
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