"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import {
  registerUser,
  loginWithGoogleAccount,
  clearError,
} from '../../store/authSlice';

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');
  
  // إعادة التوجيه إذا كان المستخدم مسجل دخول
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/profile');
    }
  }, [isAuthenticated, router]);
  
  // مسح الأخطاء عند تغيير الحقول
  useEffect(() => {
    if (error || localError) {
      dispatch(clearError());
      setLocalError('');
    }
  }, [formData]);
  
  // حساب قوة كلمة المرور
  useEffect(() => {
    const password = formData.password;
    if (!password) {
      setPasswordStrength('');
      return;
    }
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    
    if (strength <= 2) setPasswordStrength('ضعيفة');
    else if (strength <= 3) setPasswordStrength('متوسطة');
    else setPasswordStrength('قوية');
  }, [formData.password]);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  
  const validateForm = () => {
    if (!formData.displayName.trim()) {
      setLocalError('الاسم مطلوب');
      return false;
    }
    
    if (formData.displayName.trim().length < 2) {
      setLocalError('الاسم يجب أن يكون حرفين على الأقل');
      return false;
    }
    
    if (!formData.email.trim()) {
      setLocalError('البريد الإلكتروني مطلوب');
      return false;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setLocalError('البريد الإلكتروني غير صالح');
      return false;
    }
    
    if (!formData.password) {
      setLocalError('كلمة المرور مطلوبة');
      return false;
    }
    
    if (formData.password.length < 6) {
      setLocalError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setLocalError('كلمة المرور غير متطابقة');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    
    if (!validateForm()) {
      return;
    }
    
    const result = await dispatch(registerUser({
      email: formData.email,
      password: formData.password,
      displayName: formData.displayName.trim(),
    }));
    
    if (registerUser.fulfilled.match(result)) {
      router.push('/dashboard');
    }
  };
  
  const handleGoogleSignup = async () => {
    const result = await dispatch(loginWithGoogleAccount());
    
    if (loginWithGoogleAccount.fulfilled.match(result)) {
      router.push('/dashboard');
    }
  };
  
  if (loading && isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f5]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3d2f1f] mx-auto mb-4"></div>
          <p className="text-[#8b7355]">جاري التحميل...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif text-[#3d2f1f] mb-2">إنشاء حساب جديد</h1>
          <p className="text-[#8b7355] text-sm tracking-wide">انضم إلينا وابدأ رحلتك في القراءة</p>
        </div>
        
        {/* Card */}
        <div className="bg-white rounded-lg shadow-sm border border-[#e8dfd0] p-8">
          {/* Error Message */}
          {(error || localError) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm text-center">
                {localError || error}
              </p>
            </div>
          )}
          
          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-[#3d2f1f] mb-2 tracking-wide">
                الاسم الكامل
              </label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[#e8dfd0] rounded-lg focus:ring-2 focus:ring-[#8b7355] focus:border-transparent transition-all duration-200 text-[#3d2f1f]"
                placeholder="أدخل اسمك الكامل"
                required
              />
            </div>
            
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#3d2f1f] mb-2 tracking-wide">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[#e8dfd0] rounded-lg focus:ring-2 focus:ring-[#8b7355] focus:border-transparent transition-all duration-200 text-[#3d2f1f]"
                placeholder="example@email.com"
                required
              />
            </div>
            
            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[#3d2f1f] mb-2 tracking-wide">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-[#e8dfd0] rounded-lg focus:ring-2 focus:ring-[#8b7355] focus:border-transparent transition-all duration-200 text-[#3d2f1f] pr-12"
                  placeholder="••••••••"
                  required
                  minLength="6"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b7355] hover:text-[#3d2f1f] transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          passwordStrength === 'ضعيفة' ? 'bg-red-500 w-1/3' :
                          passwordStrength === 'متوسطة' ? 'bg-yellow-500 w-2/3' :
                          'bg-green-500 w-full'
                        }`}
                      />
                    </div>
                    <span className={`text-xs font-medium ${
                      passwordStrength === 'ضعيفة' ? 'text-red-600' :
                      passwordStrength === 'متوسطة' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {passwordStrength}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-[#3d2f1f] mb-2 tracking-wide">
                تأكيد كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-[#e8dfd0] rounded-lg focus:ring-2 focus:ring-[#8b7355] focus:border-transparent transition-all duration-200 text-[#3d2f1f] pr-12"
                  placeholder="••••••••"
                  required
                  minLength="6"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b7355] hover:text-[#3d2f1f] transition-colors"
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              
              {/* Match Indicator */}
              {formData.confirmPassword && (
                <div className="mt-2">
                  {formData.password === formData.confirmPassword ? (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      كلمة المرور متطابقة
                    </p>
                  ) : (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      كلمة المرور غير متطابقة
                    </p>
                  )}
                </div>
              )}
            </div>
            
            {/* Terms */}
            <div className="text-xs text-[#8b7355] text-center">
              بإنشاء حساب، أنت توافق على{' '}
              <Link href="/terms" className="text-[#3d2f1f] hover:underline">
                الشروط والأحكام
              </Link>
              {' '}و{' '}
              <Link href="/privacy" className="text-[#3d2f1f] hover:underline">
                سياسة الخصوصية
              </Link>
            </div>
            
            {/* Submit Button */}
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
                  جاري إنشاء الحساب...
                </span>
              ) : (
                'إنشاء حساب'
              )}
            </button>
          </form>
          
          {/* Divider */}
          <div className="my-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#e8dfd0]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-[#8b7355] tracking-wide">أو</span>
              </div>
            </div>
          </div>
          
          {/* Google Signup */}
          <button
            onClick={handleGoogleSignup}
            disabled={loading}
            className="w-full py-3 border border-[#e8dfd0] rounded-lg hover:bg-[#faf8f5] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-[#3d2f1f] tracking-wide">التسجيل بواسطة Google</span>
          </button>
          
          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-[#8b7355]">
              لديك حساب بالفعل؟{' '}
              <Link 
                href="/login"
                className="text-[#3d2f1f] hover:text-[#8b7355] font-medium transition-colors"
              >
                سجل الدخول
              </Link>
            </p>
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