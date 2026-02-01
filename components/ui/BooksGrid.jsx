'use client';

import BookCard from './BookCard';

export default function BooksGrid({ 
  books, 
  isInLibrary, 
  onAddToLibrary, 
  categoryColors,
  isLoading 
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div 
            key={i} 
            className="h-[480px] bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"
          ></div>
        ))}
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          لا توجد نتائج
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          جرب تغيير معايير البحث
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          isInLibrary={isInLibrary(book.id)}
          onAddToLibrary={onAddToLibrary}
          categoryColors={categoryColors}
        />
      ))}
    </div>
  );
}