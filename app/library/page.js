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
    <div className="py-12 mt-12 px-4 md:px-8 lg:px-16">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-bold">مكتبتي</h1>
        <Link
          href="/add"
          className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faPlus} />
          إضافة كتاب
        </Link>
      </div>

      {/* مكوّن الفلتر */}
      <div className="mb-8">
        <LibraryFilters onFilterChange={setFilters} />
      </div>

      {filteredBooks.length === 0 ? (
        <p className="text-center text-xl text-gray-500 py-20">
          لا توجد كتب تطابق الفلاتر الحالية.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredBooks.map((book) => (
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-screen overflow-y-auto p-8">
            <h2 className="text-2xl font-bold mb-6">تعديل الكتاب</h2>
            <BookForm book={editBook} onSuccess={() => setEditBook(null)} />
            <button
              onClick={() => setEditBook(null)}
              className="mt-4 text-gray-600 hover:text-gray-800"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Toast */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 animate-scale-in">
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
  );
}