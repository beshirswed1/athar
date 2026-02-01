'use client';

export default function EmptyState({ onReset }) {
  return (
    <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
      <div className="text-6xl mb-4">📚</div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        لا توجد نتائج
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        جرب تغيير معايير البحث
      </p>
      <button
        onClick={onReset}
        className="px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all"
      >
        إعادة تعيين
      </button>
    </div>
  );
}