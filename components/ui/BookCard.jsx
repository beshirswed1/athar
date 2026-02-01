'use client';

import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faBookOpen, 
  faBook, 
  faGraduationCap, 
  faBookmark 
} from '@fortawesome/free-solid-svg-icons';

export default function BookCard({ 
  book, 
  isInLibrary, 
  onAddToLibrary, 
  categoryColors 
}) {
  return (
    <div 
      className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 dark:border-gray-700 hover:scale-[1.02] hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative h-72 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
        {book.coverImage ? (
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FontAwesomeIcon 
              icon={faBook} 
              className="text-6xl text-gray-400 dark:text-gray-500" 
            />
          </div>
        )}
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Category Badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-lg text-white text-xs font-bold bg-gradient-to-r ${categoryColors[book.category]} shadow-lg`}>
            {book.category}
          </span>
        </div>

        {/* Library Status */}
        {isInLibrary && (
          <div className="absolute top-3 left-3">
            <div className="bg-green-500 text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg">
              <FontAwesomeIcon icon={faBookmark} />
              <span>في مكتبتي</span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors min-h-[3.5rem]">
          {book.title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-1">
          <FontAwesomeIcon icon={faGraduationCap} className="ml-2 text-amber-600" />
          {book.author}
        </p>

        <div className="flex items-center justify-between mb-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <FontAwesomeIcon icon={faBook} className="text-amber-600" />
            {book.pages} صفحة
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
          {isInLibrary ? (
            <Link
              href="/library"
              className="flex-1 bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <FontAwesomeIcon icon={faBookOpen} />
              <span>عرض في المكتبة</span>
            </Link>
          ) : (
            <button
              onClick={() => onAddToLibrary(book)}
              className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 text-white py-3 rounded-xl font-medium hover:from-amber-700 hover:to-orange-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <FontAwesomeIcon icon={faPlus} />
              <span>أضف للمكتبة</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}