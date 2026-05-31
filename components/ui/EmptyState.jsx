'use client';

export default function EmptyState({ onReset }) {
  return (
    <div className="text-center py-12 sm:py-16 md:py-20 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg">
      <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">📚</div>
      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
        لا توجد نتائج
      </h3>
      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 px-4">
        جرب تغيير معايير البحث
      </p>
      <button
        onClick={onReset}
        className="px-5 py-2.5 sm:px-6 sm:py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all text-sm sm:text-base"
      >
        إعادة تعيين
      </button>
    </div>
  );
}