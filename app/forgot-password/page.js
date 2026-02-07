"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { resetPassword } from '../../lib/auth';

export default function ForgotPasswordPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const validateEmail = () => {
    if (!email.trim()) {
      setError('البريد الإلكتروني مطلوب');
      return false;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('البريد الإلكتروني غير صالح');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateEmail()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await resetPassword(email.trim());
      
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || 'حدث خطأ. حاول مرة أخرى');
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };
  
  if (success) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-sm border border-[#e8dfd0] p-8 text-center">
            {/* Success Icon */}
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-serif text-[#3d2f1f] mb-3">تم إرسال الرابط!</h2>
            
            <p className="text-[#8b7355] mb-6 leading-relaxed">
              تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني
              <span className="block font-medium text-[#3d2f1f] mt-2">{email}</span>
            </p>
            
            <div className="bg-[#faf8f5] border border-[#e8dfd0] rounded-lg p-4 mb-6 text-sm text-[#8b7355]">
              <p className="mb-2">📧 تحقق من صندوق الوارد الخاص بك</p>
              <p className="text-xs">إذا لم تجد الرسالة، تحقق من مجلد البريد المزعج</p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => router.push('/login')}
                className="w-full py-3 bg-[#3d2f1f] text-white rounded-lg hover:bg-[#2d1f0f] transition-all duration-300 tracking-wider font-medium"
              >
                العودة لتسجيل الدخول
              </button>
              
              <button
                onClick={() => setSuccess(false)}
                className="w-full py-3 border border-[#e8dfd0] text-[#3d2f1f] rounded-lg hover:bg-[#faf8f5] transition-all duration-200"
              >
                إرسال رابط آخر
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif text-[#3d2f1f] mb-2">نسيت كلمة المرور؟</h1>
          <p className="text-[#8b7355] text-sm tracking-wide">
            لا تقلق، سنرسل لك رابطاً لإعادة تعيينها
          </p>
        </div>
        
        {/* Card */}
        <div className="bg-white rounded-lg shadow-sm border border-[#e8dfd0] p-8">
          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-blue-800 leading-relaxed">
                أدخل بريدك الإلكتروني المسجل وسنرسل لك رابطاً لإعادة تعيين كلمة المرور
              </p>
            </div>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm text-center">{error}</p>
            </div>
          )}
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#3d2f1f] mb-2 tracking-wide">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-3 border border-[#e8dfd0] rounded-lg focus:ring-2 focus:ring-[#8b7355] focus:border-transparent transition-all duration-200 text-[#3d2f1f]"
                placeholder="example@email.com"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#3d2f1f] text-white rounded-lg hover:bg-[#2d1f0f] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 tracking-wider font-medium"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  جاري الإرسال...
                </span>
              ) : (
                'إرسال رابط إعادة التعيين'
              )}
            </button>
          </form>
          
          {/* Links */}
          <div className="mt-6 text-center space-y-3">
            <Link 
              href="/login"
              className="block text-sm text-[#8b7355] hover:text-[#3d2f1f] transition-colors"
            >
              تذكرت كلمة المرور؟ سجل الدخول
            </Link>
            
            <div className="text-sm text-[#8b7355]">
              ليس لديك حساب؟{' '}
              <Link 
                href="/register"
                className="text-[#3d2f1f] hover:text-[#8b7355] font-medium transition-colors"
              >
                أنشئ حساباً جديداً
              </Link>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center">
          <Link 
            href="/"
            className="text-sm text-[#8b7355] hover:text-[#3d2f1f] transition-colors"
          >
            ← العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}