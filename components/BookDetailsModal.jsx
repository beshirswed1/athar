'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faCalendar, faBookOpen } from '@fortawesome/free-solid-svg-icons';

const statusConfig = {
  completed: { label: 'أتممت قراءته', color: 'bg-green-100 text-green-800' },
  reading: { label: 'أقرأه حاليًا', color: 'bg-blue-100 text-blue-800' },
  planned: { label: 'سأقرأه لاحقًا', color: 'bg-amber-100 text-amber-800' },
  'on-hold': { label: 'متوقف مؤقتاً', color: 'bg-gray-100 text-gray-800' },
  dropped: { label: 'ملغي', color: 'bg-red-100 text-red-800' },
};

export default function BookDetailsModal({ book, onClose }) {
  if (!book) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-lg sm:max-w-2xl max-h-[90vh] overflow-y-auto my-4 sm:my-8">
        <div className="p-3 sm:p-6">
          <div className="flex justify-between items-start mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold pr-8">{book.title}</h2>
            <button onClick={onClose} className="text-xl sm:text-2xl text-gray-500 hover:text-gray-700 p-1">
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
            {book.coverImage ? (
              <div className="relative w-full h-56 sm:h-80 rounded-lg shadow-md overflow-hidden">
                <img
                  src={book.coverImage} 
                  alt={book.title} 
                  className="w-full h-full object-cover rounded-lg"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              </div>
            ) : (
              <div className="bg-gray-200 rounded-lg h-56 sm:h-80 flex items-center justify-center">
                <span className="text-gray-500">لا توجد صورة</span>
              </div>
            )}

            <div className="space-y-3 sm:space-y-4">
              <p className="text-sm sm:text-base"><strong className="text-gray-800">المؤلف:</strong> <span className="text-gray-600">{book.author}</span></p>
              <p className="text-sm sm:text-base"><strong className="text-gray-800">عدد الصفحات:</strong> <span className="text-gray-600">{book.pages}</span></p>

              <div>
                <span className={`px-3 py-1 rounded-full text-xs sm:text-sm ${(statusConfig[book.status] || { color: 'bg-stone-100 text-stone-800' }).color}`}>
                  {(statusConfig[book.status] || { label: 'سأقرأه لاحقاً' }).label}
                </span>
              </div>

              {book.rating && (
                <div>
                  <strong className="text-gray-800 text-sm sm:text-base">التقييم:</strong>
                  <div className="flex gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <FontAwesomeIcon
                        key={i}
                        icon={faStar}
                        className={i < book.rating ? 'text-yellow-500 text-sm sm:text-base' : 'text-gray-300 text-sm sm:text-base'}
                      />
                    ))}
                  </div>
                </div>
              )}

              {book.finishedAt && (
                <p className="flex items-center gap-2 text-sm sm:text-base">
                  <FontAwesomeIcon icon={faCalendar} className="text-gray-500" />
                  <strong className="text-gray-800">انتهى في:</strong> <span className="text-gray-600">{new Date(book.finishedAt).toLocaleDateString('ar')}</span>
                </p>
              )}

              {book.summary && (
                <div>
                  <strong className="flex items-center gap-2 mb-2 text-gray-800 text-sm sm:text-base">
                    <FontAwesomeIcon icon={faBookOpen} />
                    الملخص:
                  </strong>
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{book.summary}</p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="mt-6 sm:mt-8 w-full bg-amber-600 text-white py-3 sm:py-3.5 rounded-lg sm:rounded-xl hover:bg-amber-700 transition-all text-sm sm:text-base font-medium"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}