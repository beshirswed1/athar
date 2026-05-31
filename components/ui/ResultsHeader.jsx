'use client';

export default function ResultsHeader({ 
  selectedCategory, 
  displayedCount, 
  totalCount 
}) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
      <div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
          {selectedCategory === 'all' ? 'جميع الكتب' : selectedCategory}
        </h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          عرض {displayedCount} من {totalCount} كتاب
        </p>
      </div>
    </div>
  );
}