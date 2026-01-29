'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addBook } from '@/store/booksSlice';
import { selectAllBooks } from '@/store/booksSlice';

const statusOptions = [
  { value: 'planned', label: 'سأقرأه لاحقًا' },
  { value: 'reading', label: 'أقرأه حاليًا' },
  { value: 'completed', label: 'أتممت قراءته' },
];

export default function AddSuggestedModal({ book, onClose }) {
  const dispatch = useDispatch();
  const existingBooks = useSelector(selectAllBooks);
  const [status, setStatus] = useState('planned');

  const handleAdd = () => {
    // تحقق من التكرار
    const isDuplicate = existingBooks.some(
      (b) => b.title === book.title && b.author === book.author
    );

    if (isDuplicate) {
      alert('هذا الكتاب موجود بالفعل في مكتبتك!');
      onClose();
      return;
    }

    const newBook = {
      id: crypto.randomUUID(),
      title: book.title,
      author: book.author,
      pages: book.pages,
      coverImage: book.coverImage || '',
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch(addBook(newBook));
    alert('تم إضافة الكتاب إلى مكتبتك بنجاح!');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">أضف إلى مكتبتي</h2>
        <div className="mb-6 text-center">
          <p className="font-semibold text-lg">{book.title}</p>
          <p className="text-gray-600">تأليف: {book.author}</p>
        </div>

        <div className="space-y-4 mb-8">
          <p className="font-medium">اختر حالة القراءة:</p>
          {statusOptions.map((option) => (
            <label key={option.value} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="status"
                value={option.value}
                checked={status === option.value}
                onChange={(e) => setStatus(e.target.value)}
                className="w-5 h-5 text-amber-600"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleAdd}
            className="flex-1 bg-amber-600 text-white py-3 rounded-lg font-medium hover:bg-amber-700 transition"
          >
            إضافة
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-400 transition"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}