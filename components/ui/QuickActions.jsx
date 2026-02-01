'use client';

import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookOpen, faPlus } from '@fortawesome/free-solid-svg-icons';

export default function QuickActions({ myBooksCount }) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center py-8">
      <Link
        href="/library"
        className="group relative overflow-hidden bg-gradient-to-r from-amber-600 to-orange-600 text-white px-8 py-5 rounded-2xl font-bold text-lg hover:from-amber-700 hover:to-orange-700 transition-all shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-3"
      >
        <span className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-2xl"></span>
        <FontAwesomeIcon icon={faBookOpen} className="relative z-10 text-xl" />
        <span className="relative z-10">مكتبتي ({myBooksCount})</span>
      </Link>

      <Link
        href="/add"
        className="bg-white dark:bg-gray-800 border-2 border-amber-600 text-amber-600 dark:text-amber-500 px-8 py-5 rounded-2xl font-bold text-lg hover:bg-amber-50 dark:hover:bg-gray-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-3"
      >
        <FontAwesomeIcon icon={faPlus} className="text-xl" />
        <span>إضافة كتاب</span>
      </Link>
    </div>
  );
}