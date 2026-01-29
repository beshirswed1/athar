'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faCalendar, faBookOpen } from '@fortawesome/free-solid-svg-icons';

const statusConfig = {
  completed: { label: 'أتممت قراءته', color: 'bg-green-100 text-green-800' },
  reading: { label: 'أقرأه حاليًا', color: 'bg-blue-100 text-blue-800' },
  planned: { label: 'سأقرأه لاحقًا', color: 'bg-amber-100 text-amber-800' },
};

export default function BookDetailsModal({ book, onClose }) {
  if (!book) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold">{book.title}</h2>
            <button onClick={onClose} className="text-2xl text-gray-500 hover:text-gray-700">
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {book.coverImage ? (
              <div className="relative w-full h-96 rounded-lg shadow-md overflow-hidden">
                <img
                  src={book.coverImage} 
                  alt={book.title} 
                  className="w-full h-full object-cover rounded-lg"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            ) : (
              <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
                <span className="text-gray-500">لا توجد صورة</span>
              </div>
            )}

            <div className="space-y-4">
              <p><strong>المؤلف:</strong> {book.author}</p>
              <p><strong>عدد الصفحات:</strong> {book.pages}</p>

              <div>
                <span className={`px-3 py-1 rounded-full text-sm ${statusConfig[book.status].color}`}>
                  {statusConfig[book.status].label}
                </span>
              </div>

              {book.rating && (
                <div>
                  <strong>التقييم:</strong>
                  <div className="flex gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <FontAwesomeIcon
                        key={i}
                        icon={faStar}
                        className={i < book.rating ? 'text-yellow-500' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                </div>
              )}

              {book.finishedAt && (
                <p className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faCalendar} />
                  <strong>انتهى في:</strong> {new Date(book.finishedAt).toLocaleDateString('ar')}
                </p>
              )}

              {book.summary && (
                <div>
                  <strong className="flex items-center gap-2 mb-2">
                    <FontAwesomeIcon icon={faBookOpen} />
                    الملخص:
                  </strong>
                  <p className="text-gray-700 leading-relaxed">{book.summary}</p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="mt-8 w-full bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}