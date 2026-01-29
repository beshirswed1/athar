'use client';

import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectAllBooks, deleteBook } from '@/store/booksSlice';
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

  const [selectedBook, setSelectedBook] = useState(null);
  const [editBook, setEditBook] = useState(null);

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

  const handleDelete = (id) => {
    if (confirm('هل أنت متأكد من حذف هذا الكتاب؟')) {
      dispatch(deleteBook(id));
    }
  };

  return (
    <div className="py-12">
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
                  onClick={() => handleDelete(book.id)}
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
    </div>
  );
}