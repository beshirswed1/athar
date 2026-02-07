'use client';

/* =========================================================
   📚 BookForm.updated.jsx
   نسخة مُحسّنة من BookForm — منطق أنظف، تحكم أفضل بالمسودة
   - تصميم عصري (Glassmorphism)
   - تجربة مستخدم (UX) محسنة
   ========================================================= */

import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { addBookAsync, updateBookAsync, fetchBooks } from '@/store/booksSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBook,
  faUser,
  faFileLines,
  faImage,
  faStar,
  faCheckCircle,
  faTriangleExclamation,
  faArrowRight,
  faArrowLeft,
  faSave,
  faCircleNotch
} from '@fortawesome/free-solid-svg-icons';

const CATEGORIES = [
  { id: 'novel', name: 'الرواية', subcategories: ['رواية واقعية', 'رواية تاريخية', 'رواية خيال علمي', 'رواية فانتازيا', 'رواية بوليسية / جريمة', 'رواية رعب', 'رواية نفسية', 'رواية سياسية'] },
  { id: 'poetry', name: 'الشعر', subcategories: ['ديوان شعر'] },
  { id: 'religion', name: 'الكتب الدينية', subcategories: ['تفسير القرآن', 'الحديث الشريف', 'الفقه', 'العقيدة', 'السيرة النبوية', 'مقارنة الأديان', 'كتب التصوف', 'الفكر الإسلامي'] },
  { id: 'history', name: 'التاريخ', subcategories: ['التاريخ الإسلامي', 'تاريخ الدول والحضارات', 'تاريخ الحروب', 'تاريخ حديث ومعاصر', 'السير التاريخية', 'الوثائق والمخطوطات'] },
];

const STEPS = [
  { id: 'basic', label: 'المعلومات الأساسية' },
  { id: 'status', label: 'حالة القراءة' },
  { id: 'review', label: 'التقييم والملاحظات' },
];

const genres = ["غير مصنف","رواية","تطوير ذاتي","فلسفة","سيرة ذاتية","علم نفس","تاريخ","خيال علمي","فانتازيا","أدب كلاسيكي","شعر","أعمال"];

const DEFAULT_FORM_STATE = {
  title: '',
  author: '',
  pages: '',
  coverImage: '',
  category: '',
  subcategory: '',
  status: 'planned',
  rating: 0,
  summary: '',
  finishedAt: '',
  genre: 'غير مصنف',
};

export default function BookForm({ book = null }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const books = useSelector((state) => state.books?.items ?? []);
  const userId = useSelector((state) => state.auth?.user?.uid);

  const isEdit = Boolean(book);
  const firstInputRef = useRef(null);

  const [step, setStep] = useState(0);
  const [savedInfo, setSavedInfo] = useState(null); // { message, details[] }
  const [error, setError] = useState('');
  const [inlineErrors, setInlineErrors] = useState({});
  const [formData, setFormData] = useState(null);
  const [saving, setSaving] = useState(false);
  const initialSnapshot = useRef(null); // JSON snapshot of initial state

  // init
  useEffect(() => {
    if (book) {
      const initial = { ...DEFAULT_FORM_STATE, ...book };
      setFormData(initial);
      initialSnapshot.current = JSON.stringify(sanitizeForCompare(initial));
    } else {
      // Start with default state (no localStorage)
      setFormData(DEFAULT_FORM_STATE);
      initialSnapshot.current = JSON.stringify(sanitizeForCompare(DEFAULT_FORM_STATE));
    }
    // focus after mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book]);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  // Auto-submit when reaching the last step
  useEffect(() => {
    if (step === STEPS.length - 1 && !saving && !savedInfo) {
      // Trigger form submission when reaching last step
      const form = document.querySelector('form');
      if (form) {
        form.requestSubmit();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // warn before unload only if there are unsaved changes
  useEffect(() => {
    const handler = (e) => {
      if (!formData) return;
      const dirty = isDirty();
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  if (!formData) return null;

  function sanitizeForCompare(obj) {
    // ignore timestamps/id when comparing for dirty check
    const copy = { ...obj };
    delete copy.createdAt;
    delete copy.updatedAt;
    delete copy.id;
    return copy;
  }

  function isDirty() {
    try {
      const current = JSON.stringify(sanitizeForCompare(formData));
      return current !== initialSnapshot.current;
    } catch (e) {
      return false;
    }
  }

  const progress = Math.round(((step + 1) / STEPS.length) * 100);
  const selectedCategory = CATEGORIES.find((c) => c.id === formData.category);

  const validateStep = () => {
    setError('');
    setInlineErrors({});
    const errs = {};

    if (step === 0) {
      if (!formData.title.trim()) errs.title = 'اسم الكتاب مطلوب';
      if (!formData.author.trim()) errs.author = 'اسم المؤلف مطلوب';
      if (!formData.category) errs.category = 'اختر نوع الكتاب';
      if (!formData.subcategory) errs.subcategory = 'اختر التصنيف التفصيلي';
    }

    if (step === 2 && formData.status === 'completed') {
      if (!formData.rating) errs.rating = 'قيّم الكتاب';
      if (!formData.finishedAt) errs.finishedAt = 'حدد تاريخ الانتهاء';
    }

    if (Object.keys(errs).length) {
      setInlineErrors(errs);
      return 'يرجى إكمال الحقول المطلوبة للمتابعة';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInlineErrors({});
    setSaving(true);

    const stepErr = validateStep();
    if (stepErr) return setError(stepErr);

    if (!userId) {
      setError('يرجى تسجيل الدخول أولاً لإضافة كتاب');
      console.error('User ID not found in auth state');
      return;
    }

    const exists = books.find(
      (b) =>
        b.title.trim().toLowerCase() === formData.title.trim().toLowerCase() &&
        b.author.trim().toLowerCase() === formData.author.trim().toLowerCase() &&
        (book?.id && b.id !== book.id)
    );

    if (exists) {
      setError('هذا الكتاب موجود مسبقًا في مكتبتك');
      return;
    }

    const payload = {
      ...formData,
      id: book?.id || undefined, // Don't send local ID to Firestore, let it generate its own
      pages: Number(formData.pages) || 0,
      title: formData.title.trim(),
      author: formData.author.trim(),
      userId: userId, // Ensure userId is explicitly included
      status: formData.status || 'planned', // Ensure status has default
      createdAt: book?.createdAt || undefined, // Let Firestore handle timestamps
      updatedAt: new Date().toISOString(),
    };

    // حساب عدد الحقول المختلفة بين البداية والنهاية (للرسالة الودية)
    const before = initialSnapshot.current ? JSON.parse(initialSnapshot.current) : {};
    const after = sanitizeForCompare(payload);
    let diffCount = 0;
    Object.keys(after).forEach((k) => {
      const a = typeof after[k] === 'string' ? after[k].trim() : after[k];
      const b = typeof before[k] === 'string' ? (before[k] || '').trim() : before[k];
      if (a !== b) diffCount++;
    });

    // Await the async dispatch
    try {
      console.log('Submitting book with payload:', JSON.stringify(payload, null, 2));
      if (isEdit) {
        await dispatch(updateBookAsync({ bookId: book.id, bookData: payload, userId })).unwrap();
      } else {
        await dispatch(addBookAsync({ userId, bookData: payload })).unwrap();
      }
      console.log('Book saved successfully!');
      
      // جلب الكتب المحدثة من Firestore
      await dispatch(fetchBooks(userId)).unwrap();
    } catch (err) {
      console.error('Error saving book:', err);
      setError('حدث خطأ أثناء حفظ الكتاب: ' + (err?.message || err || '未知错误'));
      setSaving(false);
      return;
    }

    // تحديث الـ snapshot حتى يعتبر النموذج "نظيف" الآن
    initialSnapshot.current = JSON.stringify(sanitizeForCompare(payload));

    setSavedInfo({
      message: isEdit ? 'تم تحديث بيانات الكتاب' : 'تم إضافة الكتاب للمكتبة',
      details: isEdit ? [`تم تعديل ${diffCount} حقل بنجاح`] : ['يمكنك الآن تصفحه في مكتبتك'],
    });

    // الانتقال مباشرة بعد التأكد من الحفظ
    router.push('/library');
  };

  return (
    <div className="min-h-screen py-10 px-4 flex items-center justify-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-50 via-orange-50/50 to-stone-50">
      <form onSubmit={handleSubmit} className="w-full max-w-4xl relative z-10">
        
        {/* Main Card Container with Glassmorphism */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-white/60 overflow-hidden ring-1 ring-white/50">
          
          {/* Header Area */}
          <div className="relative bg-gradient-to-r from-amber-700 to-amber-900 p-8 md:p-10 text-white overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-400 opacity-10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                 <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2 font-sans">
                  {isEdit ? 'تعديل بيانات الكتاب' : 'إضافة كتاب جديد'}
                </h1>
                <p className="text-amber-100/90 text-sm md:text-base font-medium max-w-md leading-relaxed">
                  {isEdit 
                    ? 'قم بتحديث المعلومات لتبقى مكتبتك منظمة ودقيقة.' 
                    : 'وثّق رحلتك المعرفية؛ كل كتاب تقرؤه هو حياة جديدة تضاف لحياتك.'}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10 shadow-inner">
                <FontAwesomeIcon icon={isEdit ? faFileLines : faBook} className="text-4xl text-amber-100" />
              </div>
            </div>
          </div>

          {/* Progress Bar & Steps Indicator */}
          <div className="bg-amber-50/50 border-b border-amber-100/50">
            <div className="flex justify-between px-8 py-4 text-xs font-bold text-amber-800/60 uppercase tracking-wider">
               {STEPS.map((s, idx) => (
                 <span key={s.id} className={`transition-colors duration-300 ${idx <= step ? 'text-amber-700' : ''}`}>
                   {idx + 1}. {s.label}
                 </span>
               ))}
            </div>
            <div className="h-1.5 w-full bg-amber-100/30">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-orange-600 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-[0_0_15px_rgba(245,158,11,0.6)]" 
                style={{ width: `${progress}%` }} 
              />
            </div>
          </div>

          {/* Content Area */}
          <div className="p-8 md:p-12 min-h-[500px] flex flex-col">
            
            {/* Error Banner */}
            {error && (
              <div className="animate-fade-in-down mb-8 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-4 shadow-sm">
                <div className="bg-red-100 text-red-600 p-2 rounded-xl shrink-0 mt-0.5">
                  <FontAwesomeIcon icon={faTriangleExclamation} />
                </div>
                <div>
                  <h3 className="text-red-800 font-bold text-sm">تنبيه</h3>
                  <p className="text-red-600 text-sm mt-1 leading-relaxed">{error}</p>
                </div>
              </div>
            )}

            {/* Success Banner */}
            {savedInfo && (
              <div className="animate-fade-in p-6 bg-emerald-50 border border-emerald-100 rounded-2xl mb-6 shadow-sm">
                <div className="flex items-center gap-3 font-bold text-emerald-800 text-lg mb-2">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-500" />
                  {savedInfo.message}
                </div>
                <ul className="mr-8 list-disc text-sm text-emerald-700 space-y-1 opacity-80">
                  {savedInfo.details.map((d, i) => <li key={i}>{d}</li>)}
                </ul>
              </div>
            )}

            {/* Steps Animation Container */}
            <div className="flex-1 transition-all duration-500 ease-in-out">
              {step === 0 && (
                <div className="space-y-8 animate-slide-in-up">
                  <Section title="بيانات الهوية" description="المعلومات الأساسية لتوثيق الكتاب">
                    <div className="grid md:grid-cols-2 gap-6">
                      <Input ref={firstInputRef} icon={faBook} label="عنوان الكتاب" hint="العنوان الرئيسي" value={formData.title} onChange={(v) => setFormData({ ...formData, title: v })} error={inlineErrors.title} />
                      <Input icon={faUser} label="المؤلف" hint="الاسم الكامل" value={formData.author} onChange={(v) => setFormData({ ...formData, author: v })} error={inlineErrors.author} />
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                       <Input icon={faFileLines} label="عدد الصفحات" type="number" hint="رقمي" value={formData.pages} onChange={(v) => setFormData({ ...formData, pages: v })} />
                       <Input icon={faImage} label="رابط الغلاف" hint="URL للصورة" value={formData.coverImage} onChange={(v) => setFormData({ ...formData, coverImage: v })} />
                    </div>

                    <div className="space-y-3 pt-2">
                      <label className="text-sm font-bold text-gray-700">التصنيف العام</label>
                      <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((cat) => (
                          <button 
                            key={cat.id} 
                            type="button" 
                            onClick={() => setFormData({ ...formData, category: cat.id, subcategory: '' })} 
                            className={`
                              px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border
                              ${formData.category === cat.id 
                                ? 'bg-amber-600 text-white border-amber-600 shadow-lg shadow-amber-600/30 scale-105' 
                                : 'bg-white text-gray-600 border-gray-200 hover:border-amber-300 hover:bg-amber-50'}
                            `}
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                      {inlineErrors.category && <InlineError text={inlineErrors.category} />}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 pt-2">
                      {selectedCategory && (
                        <div className="animate-fade-in space-y-2">
                          <label className="text-sm font-bold text-gray-700">التصنيف الفرعي</label>
                          <select 
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all cursor-pointer" 
                            value={formData.subcategory} 
                            onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                          >
                            <option value="">اختر التصنيف الدقيق...</option>
                            {selectedCategory.subcategories.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          {inlineErrors.subcategory && <InlineError text={inlineErrors.subcategory} />}
                        </div>
                      )}

                      <div className="space-y-2">
                         <label className="text-sm font-bold text-gray-700">النوع الأدبي</label>
                         <select 
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all cursor-pointer"
                            value={formData.genre || 'غير مصنف'} 
                            onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                         >
                          {genres.map((g) => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </Section>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-8 animate-slide-in-up">
                  <Section title="أين وصلت؟" description="تتبع تقدمك في قراءة هذا الكتاب">
                    <div className="grid gap-4">
                       {[
                         { val: 'planned', label: 'سأقرأه لاحقًا', desc: 'في قائمة الانتظار', icon: '📅' },
                         { val: 'reading', label: 'أقرأه حاليًا', desc: 'جارِ القراءة والاستمتاع', icon: '📖' },
                         { val: 'completed', label: 'أنهيت قراءته', desc: 'تمت الإضافة لرصيدك المعرفي', icon: '✅' }
                       ].map((opt) => (
                         <label key={opt.val} className={`
                            relative flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200
                            ${formData.status === opt.val 
                              ? 'border-amber-500 bg-amber-50/60 shadow-md ring-1 ring-amber-500' 
                              : 'border-gray-100 hover:border-amber-200 hover:bg-gray-50'}
                         `}>
                           <input 
                              type="radio" 
                              name="status" 
                              value={opt.val} 
                              checked={formData.status === opt.val} 
                              onChange={(e) => setFormData({ ...formData, status: e.target.value, rating: 0, finishedAt: '' })}
                              className="hidden" 
                            />
                           <span className="text-3xl filter drop-shadow-sm">{opt.icon}</span>
                           <div>
                             <div className={`font-bold text-lg ${formData.status === opt.val ? 'text-amber-900' : 'text-gray-700'}`}>{opt.label}</div>
                             <div className="text-sm text-gray-500">{opt.desc}</div>
                           </div>
                           {formData.status === opt.val && (
                             <div className="absolute left-5 text-amber-600">
                               <FontAwesomeIcon icon={faCheckCircle} className="text-xl" />
                             </div>
                           )}
                         </label>
                       ))}
                    </div>
                  </Section>
                </div>
              )}

              {step === 2 && formData.status === 'completed' && (
                <div className="space-y-8 animate-slide-in-up">
                   <Section title="رأيك يهمنا" description="شارك تقييمك وملاحظاتك حول الكتاب">
                    <div className="flex flex-col items-center justify-center p-6 bg-amber-50/30 rounded-2xl border border-amber-100/50">
                       <label className="text-sm font-bold text-gray-600 mb-3">تقييمك العام</label>
                       <div className="flex gap-3 mb-2" onMouseLeave={() => {}}>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button 
                            type="button" 
                            key={n} 
                            onClick={() => setFormData({ ...formData, rating: n })} 
                            className="group transition-transform hover:scale-110 focus:outline-none"
                            aria-label={`تقييم ${n}`}
                          >
                            <FontAwesomeIcon 
                              icon={faStar} 
                              className={`text-4xl transition-colors duration-200 filter drop-shadow-sm ${n <= formData.rating ? 'text-yellow-400' : 'text-gray-200 group-hover:text-yellow-200'}`} 
                            />
                          </button>
                        ))}
                      </div>
                      <div className="h-6 text-sm font-medium text-amber-700">
                        {formData.rating > 0 ? ['سيء جدًا', 'سيء', 'متوسط', 'جيد', 'ممتاز'][formData.rating - 1] : 'اختر التقييم'}
                      </div>
                      {inlineErrors.rating && <InlineError text={inlineErrors.rating} />}
                    </div>

                    <div className="space-y-2">
                       <label className="text-sm font-bold text-gray-700">ملاحظات ومقتطفات</label>
                       <textarea 
                          className="w-full p-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none shadow-sm transition-all resize-none text-gray-700 leading-relaxed" 
                          rows="6" 
                          placeholder="اكتب انطباعك، أفكارًا ألهمتك، أو اقتباسات أعجبتك..." 
                          value={formData.summary} 
                          onChange={(e) => setFormData({ ...formData, summary: e.target.value })} 
                        />
                    </div>

                    <div className="space-y-2">
                       <label className="text-sm font-bold text-gray-700">تاريخ الإنتهاء</label>
                       <input 
                          type="date" 
                          max={new Date().toISOString().split('T')[0]} 
                          value={formData.finishedAt} 
                          onChange={(e) => setFormData({ ...formData, finishedAt: e.target.value })} 
                          className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none shadow-sm" 
                        />
                       {inlineErrors.finishedAt && <InlineError text={inlineErrors.finishedAt} />}
                    </div>
                   </Section>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-gray-50/80 backdrop-blur-md p-6 md:px-12 border-t border-gray-200 flex justify-between items-center">
             {step > 0 ? (
                <button 
                  type="button" 
                  onClick={() => setStep(step - 1)} 
                  className="group flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-white hover:text-amber-700 hover:shadow-md transition-all duration-300"
                >
                  <FontAwesomeIcon icon={faArrowRight} className="group-hover:-translate-x-1 transition-transform" />
                  <span>السابق</span>
                </button>
             ) : (
               <div></div> // Spacer
             )}

            {step < STEPS.length - 1 ? (
              <button 
                type="button" 
                onClick={() => { const err = validateStep(); if (err) { setError(err); return; } setStep(step + 1); }} 
                className="group flex items-center gap-3 px-8 py-3 bg-gray-900 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-black transition-all duration-300 hover:-translate-y-0.5"
              >
                <span>التالي</span>
                <FontAwesomeIcon icon={faArrowLeft} className="group-hover:-translate-x-1 transition-transform" />
              </button>
            ) : saving ? (
              <div className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-bold shadow-lg shadow-amber-500/30 transition-all duration-300">
                <FontAwesomeIcon icon={faCircleNotch} spin className="text-white" />
                <span>جاري الحفظ...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold shadow-lg shadow-amber-500/30 opacity-70">
                <FontAwesomeIcon icon={faSave} className="text-white" />
                <span>تم الحفظ</span>
              </div>
            )}
          </div>

        </div>
      </form>
    </div>
  );
}

/* Helper Components */
const Section = ({ title, description, children }) => (
  <div className="space-y-6">
    <div className="border-b border-gray-100 pb-2">
      <h2 className="text-2xl font-black text-amber-900">{title}</h2>
      {description && <p className="text-gray-500 text-sm mt-1">{description}</p>}
    </div>
    <div className="pt-2">
      {children}
    </div>
  </div>
);

const Input = forwardRef(({ label, hint, icon, value, onChange, error, ...props }, ref) => (
  <div className="group space-y-2">
    <div className="flex justify-between items-baseline">
      <label className="text-sm font-bold text-gray-700 group-focus-within:text-amber-600 transition-colors">{label}</label>
      {hint && <span className="text-xs text-gray-400 font-medium">{hint}</span>}
    </div>
    <div className={`
      flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300
      ${error 
        ? 'bg-red-50 border-red-200 ring-1 ring-red-200' 
        : 'bg-gray-50/50 border-gray-200 focus-within:bg-white focus-within:border-amber-400 focus-within:ring-4 focus-within:ring-amber-500/10 hover:border-gray-300'}
    `}>
      <FontAwesomeIcon icon={icon} className={`transition-colors ${error ? 'text-red-400' : 'text-gray-400 group-focus-within:text-amber-500'}`} />
      <input 
        ref={ref} 
        {...props} 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        className="flex-1 bg-transparent border-none outline-none text-gray-800 placeholder-gray-400 font-medium" 
      />
    </div>
    {error && <div className="animate-fade-in text-xs font-bold text-red-500 mt-1 flex items-center gap-1"><FontAwesomeIcon icon={faTriangleExclamation} /> {error}</div>}
  </div>
));

const InlineError = ({ text }) => (
  <div className="animate-fade-in text-xs font-bold text-red-500 mt-1.5 flex items-center gap-1.5 bg-red-50 px-2 py-1 rounded w-fit">
    <FontAwesomeIcon icon={faTriangleExclamation} />
    {text}
  </div>
);

Section.displayName = 'Section';
Input.displayName = 'Input';