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
  faCircleNotch,
  faChevronDown,
  faLayerGroup
} from '@fortawesome/free-solid-svg-icons';

const CATEGORIES = [
  { id: 'religion', name: 'الكتب الدينية', subcategories: ['القرآن وعلومه', 'الحديث وعلومه', 'العقيدة', 'الفقه', 'السيرة النبوية', 'الدعوة والإرشاد', 'مقارنة الأديان'] },
  { id: 'literature', name: 'الأدب', subcategories: ['الشعر', 'النثر', 'النقد الأدبي', 'البلاغة', 'الأدب العربي', 'الأدب العالمي'] },
  { id: 'novels_stories', name: 'الروايات والقصص', subcategories: ['الروايات التاريخية', 'الروايات الاجتماعية', 'الروايات الرومانسية', 'الروايات البوليسية والجريمة', 'روايات الرعب', 'روايات الخيال العلمي', 'روايات الفانتازيا', 'روايات المغامرات', 'الروايات الدرامية', 'القصص القصيرة', 'القصص المصورة', 'الحكايات والأساطير'] },
  { id: 'history_geography', name: 'التاريخ والجغرافيا', subcategories: ['التاريخ الإسلامي', 'التاريخ العربي', 'التاريخ العالمي', 'الحضارات', 'التراجم والسير', 'الرحلات', 'الجغرافيا'] },
  { id: 'natural_sciences', name: 'العلوم الطبيعية', subcategories: ['الفيزياء', 'الكيمياء', 'الأحياء', 'الفلك', 'علوم الأرض', 'البيئة'] },
  { id: 'technology', name: 'التكنولوجيا والحاسوب', subcategories: ['البرمجة', 'الذكاء الاصطناعي', 'الأمن السيبراني', 'الشبكات', 'قواعد البيانات', 'تطوير الويب والتطبيقات'] },
  { id: 'medicine_health', name: 'الطب والصحة', subcategories: ['الطب البشري', 'التمريض', 'الصيدلة', 'التغذية', 'الصحة العامة', 'اللياقة البدنية'] },
  { id: 'psychology_sociology', name: 'علم النفس والاجتماع', subcategories: ['علم النفس', 'علم الاجتماع', 'التربية', 'العلاقات الأسرية', 'التنمية البشرية', 'السلوك الإنساني'] },
  { id: 'economy_business', name: 'الاقتصاد والأعمال', subcategories: ['إدارة الأعمال', 'التسويق', 'المحاسبة', 'الاستثمار', 'ريادة الأعمال', 'الإدارة والقيادة'] },
  { id: 'politics_law', name: 'السياسة والقانون', subcategories: ['العلوم السياسية', 'العلاقات الدولية', 'القانون', 'الأنظمة الحكومية', 'الجغرافيا السياسية', 'الفكر السياسي'] },
  { id: 'philosophy_thought', name: 'الفلسفة والفكر', subcategories: ['الفلسفة', 'المنطق', 'الفكر الإسلامي', 'الفكر الغربي', 'الأخلاق', 'نقد الأفكار'] },
  { id: 'arts', name: 'الفنون', subcategories: ['الرسم', 'التصوير', 'التصميم', 'الموسيقى', 'المسرح', 'السينما'] },
  { id: 'languages', name: 'اللغات', subcategories: ['اللغة العربية', 'اللغة الإنجليزية', 'اللغات الأجنبية', 'النحو والصرف', 'الترجمة', 'تعليم اللغات'] },
  { id: 'education_references', name: 'التعليم والمراجع', subcategories: ['المناهج الدراسية', 'الكتب الجامعية', 'الموسوعات', 'المعاجم', 'القواميس', 'المراجع العلمية'] },
  { id: 'children_youth', name: 'الأطفال والناشئة', subcategories: ['قصص الأطفال', 'قصص تعليمية', 'تنمية المهارات', 'اليافعون', 'القصص المصورة للأطفال', 'الأنشطة التعليمية'] },
  { id: 'hobbies_lifestyle', name: 'الهوايات ونمط الحياة', subcategories: ['الطبخ', 'الزراعة', 'الحرف اليدوية', 'السفر', 'السيارات', 'الألعاب'] },
  { id: 'modern_dynamics', name: 'الديناميكيات الحديثة', subcategories: ['تطوير الذات', 'الإنتاجية', 'القيادة الشخصية', 'النجاح المالي', 'الذكاء العاطفي', 'العادات', 'التحفيز'] },
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

export default function BookForm({ book = null, onCancel = null, onSuccess = null }) {
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

  const currentSteps = [
    { id: 'basic', label: 'المعلومات الأساسية' },
    { id: 'status', label: 'حالة القراءة' },
    { id: 'review', label: 'التقييم والملاحظات' },
  ];

  const progress = formData ? Math.round(((step + 1) / currentSteps.length) * 100) : 0;
  const selectedCategory = CATEGORIES.find((c) => c.name === formData.category);

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

    const stepErr = validateStep();
    if (stepErr) {
      setError(stepErr);
      return;
    }

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

    setSaving(true);

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

    if (onSuccess) {
      onSuccess();
    } else {
      // الانتقال مباشرة بعد التأكد من الحفظ
      router.push('/library');
    }
  };

  const formElement = (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl relative z-10">
        
        {/* Main Card Container with Glassmorphism */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-white/60 overflow-hidden ring-1 ring-white/50">
          
          {/* Header Area */}
          <div className="relative bg-gradient-to-r from-amber-700 to-amber-900 p-5 sm:p-8 md:p-10 text-white overflow-hidden">
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
            <div className="flex justify-between px-4 sm:px-8 py-4 text-[10px] sm:text-xs font-bold text-amber-800/60 uppercase tracking-wider">
               {currentSteps.map((s, idx) => (
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
          <div className="p-4 sm:p-8 md:p-12 min-h-[500px] flex flex-col">
            
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
                    <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                      <Input ref={firstInputRef} icon={faBook} label="عنوان الكتاب" hint="العنوان الرئيسي" value={formData.title} onChange={(v) => setFormData({ ...formData, title: v })} error={inlineErrors.title} />
                      <Input icon={faUser} label="المؤلف" hint="الاسم الكامل" value={formData.author} onChange={(v) => setFormData({ ...formData, author: v })} error={inlineErrors.author} />
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                       <Input icon={faFileLines} label="عدد الصفحات" type="number" hint="رقمي" value={formData.pages} onChange={(v) => setFormData({ ...formData, pages: v })} />
                       <Input icon={faImage} label="رابط الغلاف" hint="URL للصورة" value={formData.coverImage} onChange={(v) => setFormData({ ...formData, coverImage: v })} />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 sm:gap-6 pt-2">
                      {/* General Category */}
                      <CustomSelect
                        label="التصنيف العام"
                        value={formData.category}
                        onChange={(val) => setFormData({ ...formData, category: val, subcategory: '' })}
                        options={CATEGORIES}
                        placeholder="اختر التصنيف العام..."
                        icon={faLayerGroup}
                        error={inlineErrors.category}
                      />

                      {/* Sub Category */}
                      <CustomSelect
                        label="التصنيف الفرعي"
                        value={formData.subcategory}
                        onChange={(val) => setFormData({ ...formData, subcategory: val })}
                        options={selectedCategory?.subcategories || []}
                        placeholder="اختر التصنيف الدقيق..."
                        icon={faBook}
                        error={inlineErrors.subcategory}
                        disabled={!formData.category}
                        emptyMessage="يرجى اختيار التصنيف العام أولاً"
                      />
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

              {step === 2 && (
                <div className="space-y-8 animate-slide-in-up">
                   <Section 
                     title={formData.status === 'completed' ? "رأيك يهمنا" : "ملاحظات وانطباعات"} 
                     description={formData.status === 'completed' ? "شارك تقييمك وملاحظاتك حول الكتاب" : "اكتب ملخصًا أو مقتطفات أو ملاحظات حول الكتاب"}
                   >
                    {formData.status === 'completed' && (
                      <div className="flex flex-col items-center justify-center p-6 bg-amber-50/30 rounded-2xl border border-amber-100/50 mb-6">
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
                    )}

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

                    {formData.status === 'completed' && (
                      <div className="space-y-2 mt-6">
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
                    )}
                   </Section>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-gray-50/80 backdrop-blur-md p-4 sm:p-6 md:px-12 border-t border-gray-200 flex justify-between items-center">
             {step > 0 ? (
                <button 
                  type="button" 
                  onClick={() => setStep(step - 1)} 
                  className="group flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-white hover:text-amber-700 hover:shadow-md transition-all duration-300"
                >
                  <FontAwesomeIcon icon={faArrowRight} className="group-hover:-translate-x-1 transition-transform" />
                  <span>السابق</span>
                </button>
             ) : onCancel ? (
                <button 
                  type="button" 
                  onClick={onCancel} 
                  className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all duration-300"
                >
                  <span>إلغاء</span>
                </button>
             ) : (
               <div></div> // Spacer
             )}

            {step < currentSteps.length - 1 ? (
              <button 
                type="button" 
                onClick={() => { const err = validateStep(); if (err) { setError(err); return; } setStep(step + 1); }} 
                className="group flex items-center gap-3 px-8 py-3 bg-gray-900 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-black transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
              >
                <span>التالي</span>
                <FontAwesomeIcon icon={faArrowLeft} className="group-hover:-translate-x-1 transition-transform" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={saving}
                className="group flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-amber-600 to-orange-500 text-white rounded-xl font-bold shadow-lg shadow-amber-500/30 hover:shadow-amber-600/40 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 cursor-pointer"
              >
                {saving ? (
                  <>
                    <FontAwesomeIcon icon={faCircleNotch} spin className="text-white" />
                    <span>جاري الحفظ...</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSave} className="text-white" />
                    <span>حفظ الكتاب</span>
                  </>
                )}
              </button>
            )}
          </div>

        </div>
      </form>
  );

  if (onCancel) {
    return formElement;
  }

  return (
    <div className="min-h-screen pt-24 pb-10 sm:py-10 px-4 flex items-center justify-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-50 via-orange-50/50 to-stone-50">
      {formElement}
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

const CustomSelect = ({ 
  label, 
  value, 
  onChange, 
  options, 
  placeholder, 
  icon, 
  error, 
  disabled = false,
  emptyMessage = "لا توجد خيارات"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Click outside to close
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('click', handleOutsideClick);
    }
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isOpen]);

  return (
    <div className="group space-y-2 relative" ref={dropdownRef}>
      <label className="text-sm font-bold text-gray-755 dark:text-gray-300 group-focus-within:text-amber-600 transition-colors">
        {label}
      </label>
      
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          relative flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-300 cursor-pointer select-none text-sm font-bold
          ${disabled 
            ? 'bg-gray-100/50 dark:bg-gray-800/20 border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-60' 
            : error 
              ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/40 text-red-900 dark:text-red-400 ring-1 ring-red-200 dark:ring-red-800/20' 
              : 'bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-705 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 focus-within:bg-white dark:focus-within:bg-gray-900 focus-within:border-amber-400 focus-within:ring-4 focus-within:ring-amber-500/10'
          }
        `}
      >
        <div className="flex items-center gap-3">
          <FontAwesomeIcon icon={icon} className={`${error ? 'text-red-400' : 'text-gray-400 dark:text-gray-500'} text-base`} />
          <span className={value ? 'text-gray-800 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500 font-medium'}>
            {value || placeholder}
          </span>
        </div>
        <FontAwesomeIcon icon={faChevronDown} className={`text-gray-400 dark:text-gray-500 text-xs transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute right-0 left-0 mt-1.5 max-h-60 overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl z-50 py-1.5 animate-fade-in-down border-t-0 scrollbar-thin dark:scrollbar-track-gray-950 dark:scrollbar-thumb-gray-800">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-xs text-gray-400 dark:text-gray-500 text-center font-bold">
              {emptyMessage}
            </div>
          ) : (
            options.map((opt) => {
              const optName = typeof opt === 'string' ? opt : opt.name;
              const isSelected = value === optName;
              return (
                <div
                  key={optName}
                  onClick={() => {
                    onChange(optName);
                    setIsOpen(false);
                  }}
                  className={`
                    px-4 py-2.5 text-sm font-bold cursor-pointer transition-colors flex items-center justify-between
                    ${isSelected 
                      ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-400' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-amber-50/50 dark:hover:bg-amber-950/10'
                    }
                  `}
                >
                  <span>{optName}</span>
                  {isSelected && (
                    <FontAwesomeIcon icon={faCheckCircle} className="text-amber-600 dark:text-amber-400 text-xs" />
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
      
      {error && (
        <div className="animate-fade-in text-xs font-bold text-red-500 mt-1 flex items-center gap-1">
          <FontAwesomeIcon icon={faTriangleExclamation} /> {error}
        </div>
      )}
    </div>
  );
};

Section.displayName = 'Section';
Input.displayName = 'Input';
CustomSelect.displayName = 'CustomSelect';