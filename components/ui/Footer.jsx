'use client';

export default function Footer({ totalBooks, totalAuthors, totalCategories }) {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-700 pt-8 pb-4 text-center">
      <p className="text-gray-600 dark:text-gray-400 mb-2">
        © 2026 أثَر - مكتبتك الرقمية الشاملة
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-500">
        {totalBooks} كتاب • {totalAuthors} مؤلف • {totalCategories} تصنيف
      </p>
    </footer>
  );
}