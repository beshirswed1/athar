'use client';

import { useState, useEffect, useMemo } from 'react';
import suggestedBooksData from '@/app/data/suggestedBooks.json';

export default function LibraryFilters({ onFilterChange, isSuggested = false }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [rating, setRating] = useState(0);
  const [pagesMin, setPagesMin] = useState('');
  const [pagesMax, setPagesMax] = useState('');
  const [category, setCategory] = useState('الكل');

  // استخراج الفئات من البيانات
  const categories = useMemo(() => {
    const catNames = suggestedBooksData.categories.map(c => c.name);
    return ['الكل', ...catNames];
  }, []);

  useEffect(() => {
    onFilterChange({ 
      search, 
      status, 
      rating: Number(rating), 
      pagesMin: Number(pagesMin) || 0, 
      pagesMax: Number(pagesMax) || Infinity, 
      category: category === 'الكل' ? null : category
    });
  }, [search, status, rating, pagesMin, pagesMax, category, onFilterChange]);

  return (
    <div className="bg-amber-100 p-6 rounded-xl shadow-md space-y-4">
      <input
        type="text"
        placeholder="ابحث باسم الكتاب أو المؤلف..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-2 border border-amber-300 rounded-lg"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-4 py-2 border border-amber-300 rounded-lg">
          <option value="all">كل الحالات</option>
          <option value="completed">أتممت قراءته</option>
          <option value="reading">أقرأه حاليًا</option>
          <option value="planned">سأقرأه لاحقًا</option>
        </select>

        <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-4 py-2 border border-amber-300 rounded-lg">
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        {!isSuggested && (
          <select value={rating} onChange={(e) => setRating(e.target.value)} className="px-4 py-2 border border-amber-300 rounded-lg">
            <option value={0}>كل التقييمات</option>
            <option value={1}>1 نجمة فأكثر</option>
            <option value={2}>2 نجوم فأكثر</option>
            <option value={3}>3 نجوم فأكثر</option>
            <option value={4}>4 نجوم فأكثر</option>
            <option value={5}>5 نجوم</option>
          </select>
        )}

        <div className="flex gap-2 items-center">
          <input type="number" placeholder="من" value={pagesMin} onChange={(e) => setPagesMin(e.target.value)} className="w-full px-4 py-2 border border-amber-300 rounded-lg" />
          <span>-</span>
          <input type="number" placeholder="إلى" value={pagesMax} onChange={(e) => setPagesMax(e.target.value)} className="w-full px-4 py-2 border border-amber-300 rounded-lg" />
          <span className="whitespace-nowrap">صفحة</span>
        </div>
      </div>
    </div>
  );
}