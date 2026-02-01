'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faChevronLeft } from '@fortawesome/free-solid-svg-icons';

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange 
}) {
  if (totalPages <= 1) return null;

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-12">
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
        aria-label="Previous page"
      >
        <FontAwesomeIcon icon={faChevronRight} />
      </button>

      {[...Array(totalPages)].map((_, i) => {
        const pageNumber = i + 1;
        
        // Show first, last, current, and adjacent pages
        const showPage = 
          pageNumber === 1 || 
          pageNumber === totalPages || 
          Math.abs(pageNumber - currentPage) <= 1;

        // Show ellipsis
        const showEllipsisBefore = pageNumber === currentPage - 2 && currentPage > 3;
        const showEllipsisAfter = pageNumber === currentPage + 2 && currentPage < totalPages - 2;

        if (showEllipsisBefore || showEllipsisAfter) {
          return (
            <span 
              key={i} 
              className="px-2 text-gray-500 dark:text-gray-400"
            >
              ...
            </span>
          );
        }

        if (!showPage) return null;

        return (
          <button
            key={i}
            onClick={() => onPageChange(pageNumber)}
            className={`px-4 py-3 rounded-xl font-medium transition-all ${
              currentPage === pageNumber
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg scale-110'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {pageNumber}
          </button>
        );
      })}

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
        aria-label="Next page"
      >
        <FontAwesomeIcon icon={faChevronLeft} />
      </button>
    </div>
  );
}