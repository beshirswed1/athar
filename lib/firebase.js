import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// تكوين Firebase من متغيرات البيئة
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// تهيئة Firebase مرة واحدة فقط (مهم لـ Next.js)
let app;
let db;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  // استخدام الإعدادات الجديدة لـ Firestore مع التخزين المؤقت (بديل لـ enableIndexedDbPersistence)
  db = initializeFirestore(app, {
    cache: {
      cacheSizeBytes: CACHE_SIZE_UNLIMITED
    }
  });
} else {
  app = getApps()[0];
  db = getFirestore(app);
}

// تصدير الخدمات
export const auth = getAuth(app);
export { db };
export const storage = getStorage(app);

export default app;
