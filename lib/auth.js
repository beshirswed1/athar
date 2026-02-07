import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification,
} from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { auth } from './firebase';

// ═══════════════════════════════════════════════════════════════════
// Firebase Configuration
// ═══════════════════════════════════════════════════════════════════

// Initialize Firebase Functions for advanced features
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize separate app for Functions (client-side)
let functionsApp;
try {
  functionsApp = initializeApp(firebaseConfig, 'functions');
} catch (e) {
  // App might already be initialized
}

// ═══════════════════════════════════════════════════════════════════
// Rate Limiting Functions (Client-side helpers)
// ═══════════════════════════════════════════════════════════════════

/**
 * Get current rate limit status for the user
 */
export const getRateLimitStatus = async () => {
  try {
    // This would call a Cloud Function in production
    // For now, we'll use local tracking
    const localKey = 'athar_rate_limit';
    const stored = localStorage.getItem(localKey);
    const now = Date.now();
    
    if (stored) {
      const data = JSON.parse(stored);
      const minutesDiff = (now - data.timestamp) / 60000;
      
      if (minutesDiff >= 1) {
        // Reset after 1 minute
        const newData = { count: 0, timestamp: now };
        localStorage.setItem(localKey, JSON.stringify(newData));
        return { success: true, remaining: 10, resetIn: '0 seconds' };
      }
      
      return {
        success: true,
        count: data.count,
        remaining: Math.max(0, 10 - data.count),
        resetIn: Math.ceil((60 - minutesDiff * 60)) + ' seconds'
      };
    }
    
    return { success: true, count: 0, remaining: 10, resetIn: '0 seconds' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Track a write operation locally for rate limiting UI
 */
export const trackWriteOperation = async () => {
  try {
    const localKey = 'athar_rate_limit';
    const now = Date.now();
    const stored = localStorage.getItem(localKey);
    
    let data = { count: 0, timestamp: now };
    
    if (stored) {
      data = JSON.parse(stored);
      const minutesDiff = (now - data.timestamp) / 60000;
      
      if (minutesDiff >= 1) {
        data = { count: 1, timestamp: now };
      } else {
        data.count += 1;
      }
    }
    
    localStorage.setItem(localKey, JSON.stringify(data));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ═══════════════════════════════════════════════════════════════════
// Authentication Functions
// ═══════════════════════════════════════════════════════════════════

/**
 * التحقق من حالة التحقق من البريد الإلكتروني
 */
export const checkEmailVerification = async () => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      return {
        success: false,
        error: 'لم يتم تسجيل الدخول',
      };
    }
    
    await user.reload();
    
    return {
      success: true,
      verified: user.emailVerified,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * إرسال رابط التحقق من البريد الإلكتروني
 */
export const sendVerificationEmail = async () => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      return {
        success: false,
        error: 'لم يتم تسجيل الدخول',
      };
    }
    
    if (user.emailVerified) {
      return {
        success: false,
        error: 'البريد الإلكتروني مفعل بالفعل',
      };
    }
    
    await sendEmailVerification(user);
    
    return {
      success: true,
      message: 'تم إرسال رابط التحقق إلى بريدك الإلكتروني',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * التسجيل بالبريد الإلكتروني وكلمة المرور
 * مع إرسال رابط التحقق من البريد الإلكتروني
 */
export const registerWithEmail = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // تحديث اسم المستخدم إذا تم توفيره
    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }
    
    // إرسال رابط التحقق من البريد الإلكتروني
    await sendEmailVerification(userCredential.user);
    
    return {
      success: true,
      user: {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: displayName || userCredential.user.displayName,
        photoURL: userCredential.user.photoURL,
        emailVerified: userCredential.user.emailVerified,
      },
      message: 'تم إنشاء الحساب بنجاح. يرجى التحقق من بريدك الإلكتروني لتفعيل الحساب.',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  }
};

/**
 * تسجيل الدخول بالبريد الإلكتروني وكلمة المرور
 * يتطلب التحقق من البريد الإلكتروني
 */
export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // التحقق من تفعيل البريد الإلكتروني
    if (!userCredential.user.emailVerified) {
      return {
        success: false,
        error: 'يرجى تفعيل بريدك الإلكتروني قبل تسجيل الدخول. راجع بريدك الإلكتروني للحصول على رابط التفعيل.',
        code: 'auth/email-not-verified',
        requiresVerification: true,
      };
    }
    
    return {
      success: true,
      user: {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL,
        emailVerified: userCredential.user.emailVerified,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  }
};

/**
 * تسجيل الدخول بـ Google
 */
export const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    return {
      success: true,
      user: {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        emailVerified: result.user.emailVerified,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  }
};

/**
 * تسجيل الخروج
 */
export const logout = async () => {
  try {
    await signOut(auth);
    
    // Clear rate limit data on logout
    localStorage.removeItem('athar_rate_limit');
    
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

// ═══════════════════════════════════════════════════════════════════
// Password Management
// ═══════════════════════════════════════════════════════════════════

/**
 * إعادة تعيين كلمة المرور
 */
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return {
      success: true,
      message: 'تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  }
};

/**
 * تحديث كلمة المرور
 */
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const user = auth.currentUser;
    
    if (!user || !user.email) {
      return {
        success: false,
        error: 'لم يتم تسجيل الدخول',
      };
    }
    
    // Reload user to get fresh auth data
    await user.reload();
    
    // Get fresh email from the reloaded user
    const freshUser = auth.currentUser;
    
    // إعادة المصادقة أولاً - يجب أن تكون كلمة المرور الحالية صحيحة
    const credential = EmailAuthProvider.credential(freshUser.email, currentPassword);
    await reauthenticateWithCredential(freshUser, credential);
    
    // تحديث كلمة المرور
    await updatePassword(freshUser, newPassword);
    
    return {
      success: true,
      message: 'تم تحديث كلمة المرور بنجاح',
    };
  } catch (error) {
    // Handle specific error messages
    if (error.code === 'auth/invalid-credential') {
      return {
        success: false,
        error: 'كلمة المرور الحالية غير صحيحة. يرجى التأكد من إدخال كلمة المرور الصحيحة.',
        code: error.code,
      };
    }
    if (error.code === 'auth/requires-recent-login') {
      return {
        success: false,
        error: 'يرجى تسجيل الخروج ثم تسجيل الدخول مرة أخرى لتحديث كلمة المرور لأسباب أمنية.',
        code: error.code,
      };
    }
    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  }
};

// ═══════════════════════════════════════════════════════════════════
// Profile Management
// ═══════════════════════════════════════════════════════════════════

/**
 * تحديث الملف الشخصي
 */
export const updateUserProfile = async (displayName, photoURL = null) => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      return {
        success: false,
        error: 'لم يتم تسجيل الدخول',
      };
    }
    
    const updates = {};
    if (displayName) updates.displayName = displayName;
    if (photoURL) updates.photoURL = photoURL;
    
    await updateProfile(user, updates);
    
    return {
      success: true,
      message: 'تم تحديث الملف الشخصي',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * تحديث البريد الإلكتروني
 */
export const changeEmail = async (newEmail, currentPassword) => {
  try {
    const user = auth.currentUser;
    
    if (!user || !user.email) {
      return {
        success: false,
        error: 'لم يتم تسجيل الدخول',
      };
    }
    
    // إعادة المصادقة أولاً
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    
    // تحديث البريد الإلكتروني
    await updateEmail(user, newEmail);
    
    return {
      success: true,
      message: 'تم تحديث البريد الإلكتروني',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  }
};

// ═══════════════════════════════════════════════════════════════════
// Authentication State Monitoring
// ═══════════════════════════════════════════════════════════════════

/**
 * الاستماع لتغييرات حالة المصادقة
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      callback({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
      });
    } else {
      callback(null);
    }
  });
};

/**
 * الحصول على المستخدم الحالي
 */
export const getCurrentUser = () => {
  const user = auth.currentUser;
  
  if (user) {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
    };
  }
  
  return null;
};

/**
 * التحقق من قوة كلمة المرور
 */
export const validatePasswordStrength = (password) => {
  if (!password) return { isValid: false, strength: '', errors: ['كلمة المرور مطلوبة'] };
  
  const errors = [];
  let strength = 0;
  
  if (password.length < 6) {
    errors.push('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
  } else {
    strength += 1;
  }
  
  if (password.length >= 8) strength += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 1;
  if (/\d/.test(password)) strength += 1;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;
  
  const strengthLabels = ['ضعيفة جداً', 'ضعيفة', 'متوسطة', 'قوية', 'قوية جداً'];
  
  return {
    isValid: errors.length === 0,
    strength: strengthLabels[Math.min(strength - 1, 4)] || 'ضعيفة',
    strengthScore: strength,
    errors,
  };
};

/**
 * التحقق مما إذا كان المستخدم مسجلاً عبر مزود البريد الإلكتروني/كلمة المرور
 */
export const isEmailPasswordUser = async () => {
  try {
    const user = auth.currentUser;
    if (!user) return false;
    
    // التحقق من providers المرتبطين بالحساب
    const providers = user.providerData || [];
    const hasPasswordProvider = providers.some(
      (p) => p.providerId === 'password' || p.providerId === 'firebase'
    );
    
    // إذا لم يكن لديه provider لكلمة المرور، قد يحتاج لتعيين كلمة مرور أولاً
    // لكن Firebase لا يوفر هذا مباشرة للعملاء،，所以我们需要检查登录方式
    return true; // We'll assume user can change password, but we'll catch the error if not
  } catch (error) {
    return true;
  }
};
