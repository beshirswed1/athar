'use client';

import { useEffect } from 'react';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectAllBooks, fetchBooks, deleteBookAsync } from '@/store/booksSlice';
import BookCard from '@/components/BookCard';
import BookDetailsModal from '@/components/BookDetailsModal';
import BookForm from '@/components/BookForm';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEdit, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import LibraryFilters from '@/components/LibraryFilters'; // استيراد مكوّن الفلتر
import ProtectedRoute from '@/components/ProtectedRoute';

export default function MyLibrary() {
  const books = useSelector(selectAllBooks);
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.auth?.user?.uid);

  const [selectedBook, setSelectedBook] = useState(null);
  const [editBook, setEditBook] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { bookId, bookTitle }

  // جلب الكتب عند تحميل الصفحة
  useEffect(() => {
    if (userId) {
      dispatch(fetchBooks(userId));
    }
  }, [dispatch, userId]);

  // حالة الفلتر
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    rating: 0,
    pagesMin: 0,
    pagesMax: Infinity,
    category: null,
    sortBy: 'recent',
  });

  // تصفية الكتب بناءً على الفلتر
  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      (book.title || '').toLowerCase().includes(filters.search.toLowerCase()) ||
      (book.author || '').toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = filters.status === 'all' || book.status === filters.status;
    const matchesRating = (book.rating || 0) >= filters.rating;
    const matchesPages = (book.pages || 0) >= filters.pagesMin && (book.pages || 0) <= filters.pagesMax;
    const matchesCategory = !filters.category || book.category === filters.category;

    return matchesSearch && matchesStatus && matchesRating && matchesPages && matchesCategory;
  });

  // ترتيب الكتب بناءً على الترتيب المختار
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    if (filters.sortBy === 'recent') {
      return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0);
    }
    if (filters.sortBy === 'oldest') {
      return new Date(a.updatedAt || a.createdAt || 0) - new Date(b.updatedAt || b.createdAt || 0);
    }
    if (filters.sortBy === 'rating') {
      return (b.rating || 0) - (a.rating || 0);
    }
    if (filters.sortBy === 'pages') {
      return (b.pages || 0) - (a.pages || 0);
    }
    if (filters.sortBy === 'title') {
      return (a.title || '').localeCompare(b.title || '', 'ar');
    }
    return 0;
  });

  const handleDelete = (book) => {
    setDeleteConfirm({ bookId: book.id, bookTitle: book.title });
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      dispatch(deleteBookAsync({ bookId: deleteConfirm.bookId, userId }));
      setDeleteConfirm(null);
    }
  };

  return (
    <ProtectedRoute>
      <div className="py-8 sm:py-10 md:py-12 mt-20 sm:mt-24 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8 md:mb-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">مكتبتي</h1>
        <Link
          href="/add"
          className="bg-amber-600 text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg hover:bg-amber-700 transition flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <FontAwesomeIcon icon={faPlus} />
          <span className="text-sm sm:text-base">إضافة كتاب</span>
        </Link>
      </div>

      {/* مكوّن الفلتر */}
      <div className="mb-8">
        <LibraryFilters 
          onFilterChange={setFilters} 
          books={books} 
          filteredCount={filteredBooks.length} 
        />
      </div>

      {filteredBooks.length === 0 ? (
        <p className="text-center text-base sm:text-lg md:text-xl text-gray-500 py-12 sm:py-16 md:py-20 px-4">
          لا توجد كتب تطابق الفلاتر الحالية.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {sortedBooks.map((book) => (
            <div key={book.id} className="relative group">
              <BookCard book={book} />
              <div className="absolute top-2 left-2 right-2 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition">
                <button
                  onClick={() => setSelectedBook(book)}
                  className="bg-white p-2 rounded-full shadow hover:bg-gray-100"
                  title="عرض التفاصيل"
                >
                  <FontAwesomeIcon icon={faEye} className="text-blue-600" />
                </button>
                <button
                  onClick={() => setEditBook(book)}
                  className="bg-white p-2 rounded-full shadow hover:bg-gray-100"
                  title="تعديل"
                >
                  <FontAwesomeIcon icon={faEdit} className="text-amber-600" />
                </button>
                <button
                  onClick={() => handleDelete(book)}
                  className="bg-white p-2 rounded-full shadow hover:bg-gray-100"
                  title="حذف"
                >
                  <FontAwesomeIcon icon={faTrash} className="text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedBook && (
        <BookDetailsModal book={selectedBook} onClose={() => setSelectedBook(null)} />
      )}

      {editBook && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="w-full max-w-4xl my-4 sm:my-8 animate-scale-in">
            <BookForm
              book={editBook}
              onCancel={() => setEditBook(null)}
              onSuccess={() => setEditBook(null)}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Toast */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md mx-4 animate-scale-in">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faTrash} className="text-3xl text-red-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-center mb-2">هل أنت متأكد؟</h3>
            <p className="text-gray-600 text-center mb-6">
              سيتم حذف الكتاب <span className="font-bold text-red-600">&quot;{deleteConfirm.bookTitle}&quot;</span> من مكتبتك نهائياً.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-6 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
              >
                إلغاء
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all"
              >
                نعم، احذف
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </ProtectedRoute>
  );
}