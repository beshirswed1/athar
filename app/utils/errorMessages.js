/**
 * تحويل أكواد أخطاء Firebase إلى رسائل عربية مفهومة
 */
export const getErrorMessage = (errorCode) => {
  const errors = {
    // أخطاء المصادقة
    'auth/email-already-in-use': 'البريد الإلكتروني مستخدم بالفعل',
    'auth/invalid-email': 'البريد الإلكتروني غير صالح',
    'auth/weak-password': 'كلمة المرور ضعيفة جداً (6 أحرف على الأقل)',
    'auth/user-not-found': 'المستخدم غير موجود',
    'auth/wrong-password': 'كلمة المرور خاطئة',
    'auth/too-many-requests': 'محاولات كثيرة، حاول لاحقاً',
    'auth/user-disabled': 'تم تعطيل هذا الحساب',
    'auth/operation-not-allowed': 'العملية غير مسموح بها',
    'auth/requires-recent-login': 'يجب تسجيل الدخول مجدداً',
    'auth/email-already-exists': 'البريد الإلكتروني موجود بالفعل',
    'auth/invalid-credential': 'بيانات الاعتماد غير صحيحة',
    'auth/popup-closed-by-user': 'تم إغلاق النافذة المنبثقة',
    
    // أخطاء Firestore
    'permission-denied': 'ليس لديك صلاحية الوصول',
    'not-found': 'المستند غير موجود',
    'already-exists': 'المستند موجود بالفعل',
    'resource-exhausted': 'تم تجاوز الحد المسموح',
    'failed-precondition': 'فشل شرط مسبق',
    'aborted': 'تم إلغاء العملية',
    'out-of-range': 'خارج النطاق المسموح',
    'unimplemented': 'العملية غير مدعومة',
    'internal': 'خطأ داخلي',
    'unavailable': 'الخدمة غير متاحة حالياً',
    'data-loss': 'فقدان البيانات',
    'unauthenticated': 'يجب تسجيل الدخول',
  };
  
  return errors[errorCode] || 'حدث خطأ ما';
};

/**
 * تحليل وإرجاع رسالة خطأ مناسبة
 */
export const parseFirebaseError = (error) => {
  if (typeof error === 'string') {
    return getErrorMessage(error);
  }
  
  if (error?.code) {
    return getErrorMessage(error.code);
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'حدث خطأ غير متوقع';
};