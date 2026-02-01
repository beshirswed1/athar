'use client';

export default function ResultsHeader({ 
  selectedCategory, 
  displayedCount, 
  totalCount 
}) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {selectedCategory === 'all' ? 'جميع الكتب' : selectedCategory}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          عرض {displayedCount} من {totalCount} كتاب
        </p>
      </div>
    </div>
  );
}