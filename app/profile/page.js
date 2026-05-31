"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, setUser } from '@/store/authSlice';
import { selectAllBooks, fetchBooks } from '@/store/booksSlice';
import { updateUserProfile } from '@/lib/auth';
import ProtectedRoute from '@/components/ProtectedRoute';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faSignOutAlt, 
  faCheckCircle, 
  faCalendarAlt,
  faChevronLeft
} from '@fortawesome/free-solid-svg-icons';

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const books = useSelector(selectAllBooks);
  const userId = user?.uid;
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Profile Form State
  const [profileData, setProfileData] = useState({
    displayName: '',
  });

  // Load books on mount/userId change to calculate statistics
  useEffect(() => {
    if (userId) {
      dispatch(fetchBooks(userId));
    }
  }, [dispatch, userId]);

  // Calculate user reading statistics
  const stats = useMemo(() => {
    const total = books.length;
    const reading = books.filter(b => b.status === 'reading').length;
    const completed = books.filter(b => b.status === 'completed').length;
    const planned = books.filter(b => b.status === 'planned').length;
    return { total, reading, completed, planned };
  }, [books]);

  // Load user name into form on user change
  useEffect(() => {
    if (user) {
      setProfileData({
        displayName: user.displayName || '',
      });
    }
  }, [user]);

  const handleLogout = async () => {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
      await dispatch(logoutUser());
      router.push('/login');
    }
  };

  // Update Profile Name
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
      const result = await updateUserProfile(profileData.displayName.trim());
      
      if (result.success) {
        setSuccess('تم تحديث الاسم بنجاح');
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

  // Get user initials for default avatar if no photoURL
  const getUserInitials = () => {
    if (user?.displayName) {
      return user.displayName.slice(0, 2);
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'أث';
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-amber-50/40 via-white to-stone-50/40 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pt-24 pb-12 transition-all duration-300">
        
        {/* Top Header Card */}
        <header className="max-w-4xl mx-auto px-4 mb-6">
          <div className="bg-gradient-to-r from-amber-700 to-amber-900 dark:from-amber-900 dark:to-stone-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-400 opacity-10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4"></div>
            
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black font-sans">الملف الشخصي</h1>
                <p className="text-amber-100/90 mt-1.5 text-sm sm:text-base font-medium">إدارة معلومات حسابك ومتابعة تقدمك القرائي</p>
              </div>
              <button
                onClick={() => router.push('/library')}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 dark:bg-white/5 dark:hover:bg-white/15 border border-white/10 rounded-xl transition-all duration-300 text-sm font-bold shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
                <span>العودة للمكتبة</span>
              </button>
            </div>
          </div>
        </header>
        
        <main className="max-w-4xl mx-auto px-4">
          
          {/* User Info Card with Glassmorphism */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-800/80 p-5 sm:p-7 mb-6 overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 to-orange-500"></div>
            
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-right">
              {/* Avatar structure - Read Only */}
              <div className="relative shrink-0">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user?.displayName || 'User'}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-xl"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-amber-600 to-orange-500 flex items-center justify-center text-3xl font-black text-white shadow-xl">
                    {getUserInitials()}
                  </div>
                )}
              </div>
              
              {/* Info Block */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-center sm:justify-start gap-2 sm:gap-3">
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-800 dark:text-white truncate">
                    {user?.displayName || 'مستخدم أثر'}
                  </h2>
                  {user?.emailVerified && (
                    <span className="inline-flex items-center justify-center gap-1 text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full w-fit mx-auto sm:mx-0">
                      <FontAwesomeIcon icon={faCheckCircle} />
                      <span>موثق</span>
                    </span>
                  )}
                </div>
                <p className="text-gray-500 dark:text-gray-400 mt-1.5 font-medium truncate">{user?.email}</p>
                <div className="flex items-center justify-center sm:justify-start gap-4 mt-3">
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-bold flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-amber-500/80" />
                    عضو منذ: {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' }) : 'يناير ٢٠٢٦'}
                  </span>
                </div>
              </div>
              
              {/* Logout Action */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-5 py-3 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/45 text-red-600 dark:text-red-400 rounded-xl transition-all duration-300 text-sm font-bold cursor-pointer hover:shadow-md active:scale-95 shrink-0"
              >
                <FontAwesomeIcon icon={faSignOutAlt} />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </div>

          {/* Stats Dashboard Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {/* Total Books */}
            <div className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-200/50 dark:border-gray-800/80 shadow-sm flex flex-col gap-1 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/5 to-orange-500/5 rounded-full blur-xl translate-x-1/3 -translate-y-1/3"></div>
              <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-500 group-hover:scale-105 transition-transform w-fit">{stats.total}</span>
              <span className="text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400">إجمالي الكتب</span>
            </div>
            
            {/* Reading now */}
            <div className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-200/50 dark:border-gray-800/80 shadow-sm flex flex-col gap-1 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-full blur-xl translate-x-1/3 -translate-y-1/3"></div>
              <span className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-500 group-hover:scale-105 transition-transform w-fit">{stats.reading}</span>
              <span className="text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400">أقرأه حالياً</span>
            </div>
            
            {/* Completed books */}
            <div className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-200/50 dark:border-gray-800/80 shadow-sm flex flex-col gap-1 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-full blur-xl translate-x-1/3 -translate-y-1/3"></div>
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-500 group-hover:scale-105 transition-transform w-fit">{stats.completed}</span>
              <span className="text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400">أتممت قراءته</span>
            </div>
            
            {/* Planned books */}
            <div className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-200/50 dark:border-gray-800/80 shadow-sm flex flex-col gap-1 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 rounded-full blur-xl translate-x-1/3 -translate-y-1/3"></div>
              <span className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-500 group-hover:scale-105 transition-transform w-fit">{stats.planned}</span>
              <span className="text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400">سأقرأه لاحقاً</span>
            </div>
          </div>
          
          {/* Edit Profile Form Container (No Tabs) */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-800/80 overflow-hidden">
            
            {/* Form Header */}
            <div className="border-b border-gray-200/60 dark:border-gray-800/80 bg-gray-50/50 dark:bg-gray-950/20 px-5 py-4 sm:px-8">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <FontAwesomeIcon icon={faUser} className="text-amber-500" />
                <span>تعديل المعلومات الشخصية</span>
              </h3>
            </div>
            
            {/* Form Body */}
            <div className="p-5 sm:p-8">
              
              {/* Success Banner */}
              {success && (
                <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/40 rounded-2xl flex items-center gap-3 animate-fade-in">
                  <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/35 rounded-full flex items-center justify-center shrink-0">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="text-emerald-700 dark:text-emerald-400 font-bold text-sm leading-relaxed">{success}</p>
                </div>
              )}
              
              {/* Error Banner */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-800/40 rounded-2xl flex items-center gap-3 animate-fade-in">
                  <div className="w-8 h-8 bg-red-100 dark:bg-red-900/35 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-red-600 dark:text-red-400 font-extrabold">!</span>
                  </div>
                  <p className="text-red-700 dark:text-red-400 font-bold text-sm leading-relaxed">{error}</p>
                </div>
              )}
              
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="group space-y-2">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 group-focus-within:text-amber-600 transition-colors">
                    الاسم الكامل
                  </label>
                  <div className="relative flex items-center rounded-xl border transition-all duration-300 bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus-within:bg-white dark:focus-within:bg-gray-900 focus-within:border-amber-400 focus-within:ring-4 focus-within:ring-amber-500/10 hover:border-gray-300 dark:hover:border-gray-600">
                    <FontAwesomeIcon icon={faUser} className="absolute right-4 text-gray-400 group-focus-within:text-amber-500 transition-colors pointer-events-none" />
                    <input
                      type="text"
                      value={profileData.displayName}
                      onChange={(e) => setProfileData({ displayName: e.target.value })}
                      className="w-full pr-11 pl-4 py-3 bg-transparent border-none outline-none text-gray-800 dark:text-white font-bold text-sm"
                      placeholder="أدخل اسمك الكامل"
                      required
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-orange-500 text-white rounded-xl hover:from-amber-700 hover:to-orange-600 disabled:opacity-50 transition-all duration-300 font-bold shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
                >
                  {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </button>
              </form>
            </div>
          </div>
          
        </main>
      </div>
    </ProtectedRoute>
  );
}
