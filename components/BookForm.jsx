'use client';

/* =========================================================
   📚 BookForm.jsx
   نموذج إضافة / تعديل كتاب
   مشروع: أثر – مكتبة شخصية
   ========================================================= */

/* =========================
   📦 Imports
========================= */
import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
} from 'react';

import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';

import {
  addBook,
  updateBook,
} from '@/store/booksSlice';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBook,
  faUser,
  faFileLines,
  faImage,
  faStar,
  faCheckCircle,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';

/* =========================================================
   📚 التصنيفات الرئيسية + الفرعية
   (Business decision: ثابتة – لا Backend)
========================================================= */
const CATEGORIES = [
  {
    id: 'novel',
    name: 'الرواية',
    subcategories: [
      'رواية واقعية',
      'رواية تاريخية',
      'رواية خيال علمي',
      'رواية فانتازيا',
      'رواية بوليسية / جريمة',
      'رواية رعب',
      'رواية نفسية',
      'رواية سياسية',
    ],
  },
  {
    id: 'poetry',
    name: 'الشعر',
    subcategories: ['ديوان شعر'],
  },
  {
    id: 'religion',
    name: 'الكتب الدينية',
    subcategories: [
      'تفسير القرآن',
      'الحديث الشريف',
      'الفقه',
      'العقيدة',
      'السيرة النبوية',
      'مقارنة الأديان',
      'كتب التصوف',
      'الفكر الإسلامي',
    ],
  },
  {
    id: 'history',
    name: 'التاريخ',
    subcategories: [
      'التاريخ الإسلامي',
      'تاريخ الدول والحضارات',
      'تاريخ الحروب',
      'تاريخ حديث ومعاصر',
      'السير التاريخية',
      'الوثائق والمخطوطات',
    ],
  },
];

/* =========================================================
   🧭 خطوات الفورم
========================================================= */
const STEPS = [
  { id: 'basic', label: 'المعلومات الأساسية' },
  { id: 'status', label: 'حالة القراءة' },
  { id: 'review', label: 'التقييم والملاحظات' },
];

const genres = [
  "غير مصنف",
  "رواية",
  "تطوير ذاتي",
  "فلسفة",
  "سيرة ذاتية",
  "علم نفس",
  "تاريخ",
  "خيال علمي",
  "فانتازيا",
  "أدب كلاسيكي",
  "شعر",
  "أعمال",
];

/* =========================================================
   🧠 الحالة الافتراضية
========================================================= */
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
};

/* =========================================================
   📘 Component
========================================================= */
export default function BookForm({ book = null }) {
  /* =========================
     ⚙️ Hooks
  ========================= */
  const router = useRouter();
  const dispatch = useDispatch();
  const books = useSelector((state) => state.books?.items ?? []);

  const isEdit = Boolean(book);
  const firstInputRef = useRef(null);

  /* =========================
     🧠 State
  ========================= */
  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState(null);

  /* =========================================================
     🧩 Initialization
  ========================================================= */
  useEffect(() => {
    if (book) {
      // استخدم منطقًا مشروطًا لتحديث الحالة فقط عند الحاجة
      setFormData((prevFormData) => {
        if (prevFormData === null || prevFormData.id !== book.id) {
          return { ...DEFAULT_FORM_STATE, ...book };
        }
        return prevFormData; // لا تقم بالتحديث إذا لم تتغير البيانات
      });
    } else {
      const draft =
        typeof window !== 'undefined'
          ? localStorage.getItem('book-draft')
          : null;

      setFormData((prevFormData) => {
        if (prevFormData === null) {
          return draft ? JSON.parse(draft) : DEFAULT_FORM_STATE;
        }
        return prevFormData; // لا تقم بالتحديث إذا لم تتغير البيانات
      });
    }
  }, [book]);

  /* Focus أول حقل */
  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  /* Auto-save draft */
  useEffect(() => {
    if (!isEdit && formData) {
      localStorage.setItem(
        'book-draft',
        JSON.stringify(formData)
      );
    }
  }, [formData, isEdit]);

  /* Warn before leaving */
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () =>
      window.removeEventListener(
        'beforeunload',
        handler
      );
  }, []);

  if (!formData) return null;

  /* =========================================================
     📊 Helpers
  ========================================================= */
  const progress = Math.round(
    ((step + 1) / STEPS.length) * 100
  );

  const selectedCategory = CATEGORIES.find(
    (c) => c.id === formData.category
  );


  /* =========================================================
     ✅ Validation
  ========================================================= */
  const validateStep = () => {
    setError('');

    if (step === 0) {
      if (!formData.title.trim())
        return 'اسم الكتاب مطلوب';
      if (!formData.author.trim())
        return 'اسم المؤلف مطلوب';
      if (!formData.category)
        return 'اختر نوع الكتاب';
      if (!formData.subcategory)
        return 'اختر التصنيف التفصيلي';
    }

    if (step === 2 && formData.status === 'completed') {
      if (!formData.rating)
        return 'قيّم الكتاب';
      if (!formData.finishedAt)
        return 'حدد تاريخ الانتهاء';
    }

    return null;
  };

  /* =========================================================
     📤 Submit
  ========================================================= */
  const handleSubmit = (e) => {
    e.preventDefault();

    const exists = books.find(
      (b) =>
        b.title.trim().toLowerCase() ===
          formData.title.trim().toLowerCase() &&
        b.author.trim().toLowerCase() ===
          formData.author.trim().toLowerCase() &&
        b.id !== book?.id
    );

    if (exists) {
      setError('هذا الكتاب موجود مسبقًا');
      return;
    }

    const payload = {
      ...formData,
      id:
        book?.id ||
        Date.now().toString(),
      pages: Number(formData.pages) || 0,
      title: formData.title.trim(),
      author: formData.author.trim(),
      createdAt:
        book?.createdAt ||
        new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isEdit)
      dispatch(updateBook(payload));
    else dispatch(addBook(payload));

    localStorage.removeItem('book-draft');
    setSaved(true);

    setTimeout(
      () => router.push('/library'),
      1200
    );
  };

  /* =========================================================
    🧱 UI
  ========================================================= */
  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto bg-amber-50/70 p-8 rounded-2xl shadow space-y-8"
    >
      {/* Header */}
      <h1 className="text-2xl font-bold text-amber-900">
        {isEdit
          ? 'تعديل كتاب'
          : 'خلّينا نضيف كتاب جديد 📚'}
      </h1>

      {/* Progress */}
      <div className="w-full h-2 bg-amber-200 rounded">
        <div
          className="h-2 bg-amber-600 rounded transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-700">
          <FontAwesomeIcon
            icon={faTriangleExclamation}
          />
          {error}
        </div>
      )}

      {/* ================= STEP 1 ================= */}
      {step === 0 && (
        <Section title="المعلومات الأساسية">
          <Input
            ref={firstInputRef}
            icon={faBook}
            label="اسم الكتاب"
            hint="كما هو مكتوب على الغلاف"
            value={formData.title}
            onChange={(v) =>
              setFormData({
                ...formData,
                title: v,
              })
            }
          />

          <Input
            icon={faUser}
            label="اسم المؤلف"
            hint="الاسم الكامل"
            value={formData.author}
            onChange={(v) =>
              setFormData({
                ...formData,
                author: v,
              })
            }
          />

          <Input
            icon={faFileLines}
            label="عدد الصفحات"
            type="number"
            hint="تقريبي"
            value={formData.pages}
            onChange={(v) =>
              setFormData({
                ...formData,
                pages: v,
              })
            }
          />

          <Input
            icon={faImage}
            label="رابط الغلاف"
            hint="اختياري"
            value={formData.coverImage}
            onChange={(v) =>
              setFormData({
                ...formData,
                coverImage: v,
              })
            }
          />

          {/* Categories */}
          <div>
            <label className="font-medium">
              نوع الكتاب
            </label>

            <div className="flex flex-wrap gap-2 mt-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      category: cat.id,
                      subcategory: '',
                    })
                  }
                  className={`px-3 py-1 rounded border ${
                    formData.category ===
                    cat.id
                      ? 'bg-amber-600 text-white'
                      : 'bg-white'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {selectedCategory && (
              <select
                className="mt-3 w-full p-2 border rounded"
                value={
                  formData.subcategory
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    subcategory:
                      e.target.value,
                  })
                }
              >
                <option value="">
                  اختر التصنيف
                  التفصيلي
                </option>
                {selectedCategory.subcategories.map(
                  (s) => (
                    <option key={s}>
                      {s}
                    </option>
                  )
                )}
              </select>
            )}
          </div>

          {/* Genre Filter */}
          <div className="mt-4">
            <label className="font-medium">التصنيف (النوع)</label>
            <select
              className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:outline-none focus:border-amber-500"
              value={formData.genre || 'غير مصنف'}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  genre: e.target.value,
                })
              }
            >
              {genres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </Section>
      )}

      {/* ================= STEP 2 ================= */}
      {step === 1 && (
        <Section title="حالة القراءة">
          <select
            className="w-full p-2 border rounded"
            value={formData.status}
            onChange={(e) =>
              setFormData({
                ...formData,
                status: e.target.value,
                rating: 0,
                finishedAt: '',
              })
            }
          >
            <option value="planned">
              سأقرأه لاحقًا
            </option>
            <option value="reading">
              أقرأه حاليًا
            </option>
            <option value="completed">
              أنهيت قراءته
            </option>
          </select>
        </Section>
      )}

      {/* ================= STEP 3 ================= */}
      {step === 2 &&
        formData.status ===
          'completed' && (
          <Section title="التقييم والملاحظات">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(
                (n) => (
                  <button
                    type="button"
                    key={n}
                    onClick={() =>
                      setFormData({
                        ...formData,
                        rating: n,
                      })
                    }
                  >
                    <FontAwesomeIcon
                      icon={faStar}
                      className={`text-2xl ${
                        n <=
                        formData.rating
                          ? 'text-yellow-500'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                )
              )}
            </div>

            <textarea
              className="w-full p-2 border rounded"
              rows="4"
              placeholder="ملاحظاتك"
              value={
                formData.summary
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  summary:
                    e.target.value,
                })
              }
            />

            <input
              type="date"
              max={
                new Date()
                  .toISOString()
                  .split('T')[0]
              }
              value={
                formData.finishedAt
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  finishedAt:
                    e.target.value,
                })
              }
              className="p-2 border rounded"
            />
          </Section>
        )}

      {/* Success */}
      {saved && (
        <div className="flex items-center gap-2 text-green-700">
          <FontAwesomeIcon
            icon={faCheckCircle}
          />
          تم الحفظ بنجاح
        </div>
      )}

      {/* Navigation */}
      <div className="sticky bottom-0 bg-amber-50 pt-4 flex justify-between">
        {step > 0 && (
          <button
            type="button"
            onClick={() =>
              setStep(step - 1)
            }
            className="px-4 py-2 border rounded"
          >
            رجوع
          </button>
        )}

        {step <
        STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => {
              const err =
                validateStep();
              if (err) {
                setError(err);
                return;
              }
              setStep(step + 1);
            }}
            className="px-6 py-2 bg-amber-600 text-white rounded"
          >
            التالي
          </button>
        ) : (
          <button
            type="submit"

            className="px-6 py-2 bg-amber-700 text-white rounded"
          >
            حفظ الكتاب
          </button>
        )}
      </div>
    </form>
  );
}

/* =========================================================
   🧩 Helpers
========================================================= */
const Section = ({ title, children }) => (
  <div className="space-y-4">
    <h2 className="text-lg font-semibold text-amber-800">
      {title}
    </h2>
    {children}
  </div>
);

const Input = forwardRef(
  (
    {
      label,
      hint,
      icon,
      value,
      onChange,
      ...props
    },
    ref
  ) => (
    <div className="space-y-1">
      <label className="font-medium">
        {label}
      </label>
      {hint && (
        <p className="text-sm text-amber-600">
          {hint}
        </p>
      )}
      <div className="flex items-center border rounded px-2">
        <FontAwesomeIcon
          icon={icon}
          className="text-amber-500"
        />
        <input
          ref={ref}
          {...props}
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          className="flex-1 p-2 outline-none bg-transparent"
        />
      </div>
    </div>
  )
);

/* Add display names to satisfy react/display-name rule */
Section.displayName = 'Section';
Input.displayName = 'Input';
