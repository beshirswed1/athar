"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, setUser } from '../../store/authSlice';
import {
  updateUserProfile,
  changeEmail,
  changePassword,
} from '../../lib/auth';
import ProtectedRoute from '../../components/ProtectedRoute';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCamera, faEnvelope, faLock, faSignOutAlt, faCheck, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Profile Form
  const [profileData, setProfileData] = useState({
    displayName: '',
  });
  
  // Email Form
  const [emailData, setEmailData] = useState({
    newEmail: '',
    currentPassword: '',
  });
  
  // Password Form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Load saved photo from localStorage on mount
  useEffect(() => {
    if (user) {
      const savedPhoto = localStorage.getItem(`userPhoto_${user.uid}`);
      if (savedPhoto) {
        dispatch(setUser({
          ...user,
          photoURL: savedPhoto,
        }));
      }
    }
  }, [user?.uid]); // Only run when user.uid changes

  // Save photo to localStorage when it changes
  useEffect(() => {
    if (user?.uid && user?.photoURL) {
      localStorage.setItem(`userPhoto_${user.uid}`, user.photoURL);
    }
  }, [user?.uid, user?.photoURL]);

  // Load user data
  useEffect(() => {
    if (user) {
      setProfileData({
        displayName: user.displayName || '',
      });
    }
  }, [user]);

  // Clear messages when changing tabs
  useEffect(() => {
    setSuccess('');
    setError('');
  }, [activeTab]);

  const handleLogout = async () => {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
      await dispatch(logoutUser());
      router.push('/login');
    }
  };

  // Handle profile photo upload - store locally in Redux only (Firebase Auth has 2048 char limit)
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('يرجى اختيار ملف صورة');
      return;
    }

    // Validate file size (max 100KB for local storage)
    if (file.size > 100 * 1024) {
      setError('حجم الصورة يجب أن يكون أقل من 100KB');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Convert file to base64 for local storage only
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          // Store photo locally in Redux only (not in Firebase Auth to avoid length limit)
          setSuccess('تم تحديث صورة الملف الشخصي بنجاح');
          // Update Redux state
          dispatch(setUser({
            ...user,
            photoURL: reader.result,
          }));
        } catch (err) {
          setError('حدث خطأ غير متوقع');
        } finally {
          setLoading(false);
        }
      };
      reader.onerror = () => {
        setError('حدث خطأ في قراءة الملف');
        setLoading(false);
      };
    } catch (err) {
      setError('حدث خطأ غير متوقع');
      setLoading(false);
    }
  };

  // Remove profile photo from local storage
  const handleRemovePhoto = async () => {
    try {
      setSuccess('تم إزالة صورة الملف الشخصي');
      // Remove from localStorage
      if (user?.uid) {
        localStorage.removeItem(`userPhoto_${user.uid}`);
      }
      dispatch(setUser({
        ...user,
        photoURL: null,
      }));
    } catch (err) {
      setError('حدث خطأ غير متوقع');
    }
  };

  // Update Profile (name only - Firebase has photoURL limit)
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!profileData.displayName.trim()) {
      setError('الاسم مطلوب');
      return;
    }
    
    if (profileData.displayName.trim().length < 2) {
      setError('الاسم يجب أن يكون حرفين على الأقل');
      return;
    }
    
    setLoading(true);
    
    try {
      // Update name in Firebase Auth (no photoURL to avoid length limit)
      const result = await updateUserProfile(profileData.displayName.trim());
      
      if (result.success) {
        setSuccess('تم تحديث الملف الشخصي بنجاح');
        // Update Redux state
        dispatch(setUser({
          ...user,
          displayName: profileData.displayName.trim(),
        }));
      } else {
        setError(result.error || 'حدث خطأ في التحديث');
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };
  
  // Update Email
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!emailData.newEmail.trim()) {
      setError('البريد الإلكتروني الجديد مطلوب');
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailData.newEmail)) {
      setError('البريد الإلكتروني غير صالح');
      return;
    }
    
    if (emailData.newEmail === user?.email) {
      setError('البريد الإلكتروني الجديد مطابق للحالي');
      return;
    }
    
    if (!emailData.currentPassword) {
      setError('كلمة المرور الحالية مطلوبة');
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await changeEmail(emailData.newEmail.trim(), emailData.currentPassword);
      
      if (result.success) {
        setSuccess('تم تحديث البريد الإلكتروني بنجاح. يرجى تسجيل الدخول مرة أخرى');
        setEmailData({ newEmail: '', currentPassword: '' });
        
        // Auto logout after 2 seconds
        setTimeout(async () => {
          await dispatch(logoutUser());
          router.push('/login');
        }, 2000);
      } else {
        setError(result.error || 'حدث خطأ في التحديث');
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };
  
  // Update Password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!passwordData.currentPassword) {
      setError('كلمة المرور الحالية مطلوبة');
      return;
    }
    
    if (!passwordData.newPassword) {
      setError('كلمة المرور الجديدة مطلوبة');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setError('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('كلمة المرور الجديدة غير متطابقة');
      return;
    }
    
    if (passwordData.currentPassword === passwordData.newPassword) {
      setError('كلمة المرور الجديدة مطابقة للحالية');
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      
      if (result.success) {
        setSuccess('تم تحديث كلمة المرور بنجاح');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        // Show more helpful error message
        if (result.code === 'auth/invalid-credential') {
          setError('كلمة المرور الحالية غير صحيحة. يرجى التأكد من إدخال كلمة المرور الصحيحة.');
        } else if (result.code === 'auth/requires-recent-login') {
          setError('يرجى تسجيل الخروج ثم تسجيل الدخول مرة أخرى لتحديث كلمة المرور.');
        } else {
          setError(result.error || 'حدث خطأ في تحديث كلمة المرور');
        }
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.displayName) {
      return user.displayName.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return '؟';
  };

  // Get display photo from Firebase Auth
  const getDisplayPhoto = () => {
    return user?.photoURL;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#faf8f5]">
        {/* Header */}
        <header className="bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-lg">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold font-serif">الملف الشخصي</h1>
                <p className="text-white/90 mt-1">إدارة معلومات حسابك</p>
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium"
              >
                ← العودة للمكتبة
              </button>
            </div>
          </div>
        </header>
        
        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* User Info Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#e8dfd0] p-6 mb-6 overflow-hidden relative">
            {/* Decorative gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 to-orange-500"></div>
            
            <div className="flex items-center gap-6">
              {/* Avatar with photo */}
              <div className="relative group flex-shrink-0">
                {getDisplayPhoto() ? (
                  <img
                    src={getDisplayPhoto()}
                    alt={user?.displayName || 'User'}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-600 to-orange-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                    {getUserInitials()}
                  </div>
                )}
                
                {/* Camera icon overlay */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-amber-600 hover:bg-amber-700 rounded-full flex items-center justify-center text-white shadow-lg transition-transform transform hover:scale-110 opacity-0 group-hover:opacity-100"
                  title="تغيير الصورة"
                >
                  <FontAwesomeIcon icon={faCamera} className="text-xs" />
                </button>
                
                {/* Remove photo button (show when photo exists) */}
                {getDisplayPhoto() && (
                  <button
                    onClick={handleRemovePhoto}
                    className="absolute bottom-0 left-0 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg transition-transform transform hover:scale-110 opacity-0 group-hover:opacity-100"
                    title="إزالة الصورة"
                  >
                    <span className="text-xs font-bold">×</span>
                  </button>
                )}
                
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
              
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-[#3d2f1f] truncate">
                    {user?.displayName || 'مستخدم جديد'}
                  </h2>
                  {user?.emailVerified && (
                    <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      <FontAwesomeIcon icon={faCheck} className="text-xs" />
                      موثق
                    </span>
                  )}
                </div>
                <p className="text-[#8b7355] mt-1 truncate">{user?.email}</p>
                <div className="flex items-center gap-4 mt-3">
                  <span className="text-xs text-[#8b7355]">
                   _member since_
                  </span>
                </div>
              </div>
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors text-sm font-medium"
              >
                <FontAwesomeIcon icon={faSignOutAlt} />
                تسجيل الخروج
              </button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#e8dfd0] overflow-hidden">
            <div className="border-b border-[#e8dfd0]">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex-1 py-4 px-6 text-center transition-all duration-300 flex items-center justify-center gap-2 ${
                    activeTab === 'profile'
                      ? 'bg-gradient-to-r from-amber-600 to-orange-500 text-white'
                      : 'text-[#8b7355] hover:bg-[#faf8f5]'
                  }`}
                >
                  <FontAwesomeIcon icon={faUser} />
                  الملف الشخصي
                </button>
                <button
                  onClick={() => setActiveTab('email')}
                  className={`flex-1 py-4 px-6 text-center transition-all duration-300 flex items-center justify-center gap-2 ${
                    activeTab === 'email'
                      ? 'bg-gradient-to-r from-amber-600 to-orange-500 text-white'
                      : 'text-[#8b7355] hover:bg-[#faf8f5]'
                  }`}
                >
                  <FontAwesomeIcon icon={faEnvelope} />
                  البريد الإلكتروني
                </button>
                <button
                  onClick={() => setActiveTab('password')}
                  className={`flex-1 py-4 px-6 text-center transition-all duration-300 flex items-center justify-center gap-2 ${
                    activeTab === 'password'
                      ? 'bg-gradient-to-r from-amber-600 to-orange-500 text-white'
                      : 'text-[#8b7355] hover:bg-[#faf8f5]'
                  }`}
                >
                  <FontAwesomeIcon icon={faLock} />
                  كلمة المرور
                </button>
              </div>
            </div>
            
            <div className="p-8">
              {/* Success Message */}
              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 animate-fade-in">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faCheck} className="text-green-600" />
                  </div>
                  <p className="text-green-700 font-medium">{success}</p>
                </div>
              )}
              
              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 animate-fade-in">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 font-bold">!</span>
                  </div>
                  <p className="text-red-700">{error}</p>
                </div>
              )}
              
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="text-center pb-6 border-b border-[#e8dfd0]">
                    <p className="text-sm text-[#8b7355]">
                      يمكنك تغيير اسمك أو صورة ملفك الشخصي من خلال Firebase Auth
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#3d2f1f] mb-2">
                      الاسم الكامل
                    </label>
                    <input
                      type="text"
                      value={profileData.displayName}
                      onChange={(e) => setProfileData({ displayName: e.target.value })}
                      className="w-full px-4 py-3 border border-[#e8dfd0] rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 text-[#3d2f1f] bg-white"
                      placeholder="أدخل اسمك الكامل"
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-500 text-white rounded-xl hover:from-amber-700 hover:to-orange-600 disabled:opacity-50 transition-all duration-300 font-medium shadow-lg shadow-amber-200"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        جاري الحفظ...
                      </span>
                    ) : 'حفظ التغييرات'}
                  </button>
                </form>
              )}
              
              {/* Email Tab */}
              {activeTab === 'email' && (
                <form onSubmit={handleEmailSubmit} className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                    <p className="text-sm text-blue-800 flex items-center gap-2">
                      <FontAwesomeIcon icon={faEnvelope} />
                      البريد الإلكتروني الحالي: <strong className="truncate">{user?.email}</strong>
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#3d2f1f] mb-2">
                      البريد الإلكتروني الجديد
                    </label>
                    <input
                      type="email"
                      value={emailData.newEmail}
                      onChange={(e) => setEmailData({ ...emailData, newEmail: e.target.value })}
                      className="w-full px-4 py-3 border border-[#e8dfd0] rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 text-[#3d2f1f] bg-white"
                      placeholder="example@email.com"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#3d2f1f] mb-2">
                      كلمة المرور الحالية
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={emailData.currentPassword}
                        onChange={(e) => setEmailData({ ...emailData, currentPassword: e.target.value })}
                        className="w-full px-4 py-3 border border-[#e8dfd0] rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 text-[#3d2f1f] bg-white"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b7355] hover:text-[#3d2f1f] transition-colors"
                      >
                        <FontAwesomeIcon icon={showCurrentPassword ? faEyeSlash : faEye} />
                      </button>
                    </div>
                    <p className="text-xs text-[#8b7355] mt-2">
                      مطلوب لتأكيد هويتك
                    </p>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-500 text-white rounded-xl hover:from-amber-700 hover:to-orange-600 disabled:opacity-50 transition-all duration-300 font-medium shadow-lg shadow-amber-200"
                  >
                    {loading ? 'جاري التحديث...' : 'تحديث البريد الإلكتروني'}
                  </button>
                </form>
              )}
              
              {/* Password Tab */}
              {activeTab === 'password' && (
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-[#3d2f1f] mb-2">
                      كلمة المرور الحالية
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full px-4 py-3 border border-[#e8dfd0] rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 text-[#3d2f1f] bg-white pr-12"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b7355] hover:text-[#3d2f1f] transition-colors"
                      >
                        <FontAwesomeIcon icon={showCurrentPassword ? faEyeSlash : faEye} />
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#3d2f1f] mb-2">
                      كلمة المرور الجديدة
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full px-4 py-3 border border-[#e8dfd0] rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 text-[#3d2f1f] bg-white pr-12"
                        placeholder="••••••••"
                        required
                        minLength="6"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b7355] hover:text-[#3d2f1f] transition-colors"
                      >
                        <FontAwesomeIcon icon={showNewPassword ? faEyeSlash : faEye} />
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#3d2f1f] mb-2">
                      تأكيد كلمة المرور الجديدة
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-3 border border-[#e8dfd0] rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 text-[#3d2f1f] bg-white pr-12"
                        placeholder="••••••••"
                        required
                        minLength="6"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b7355] hover:text-[#3d2f1f] transition-colors"
                      >
                        <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                      </button>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-500 text-white rounded-xl hover:from-amber-700 hover:to-orange-600 disabled:opacity-50 transition-all duration-300 font-medium shadow-lg shadow-amber-200"
                  >
                    {loading ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
                  </button>
                </form>
              )}
            </div>
          </div>
          

        </main>
      </div>
    </ProtectedRoute>
  );
}
