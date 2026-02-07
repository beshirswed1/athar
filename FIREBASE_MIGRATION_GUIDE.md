# 📚 دليل تحويل مكتبة الكتب إلى Firebase

## 🎯 نظرة عامة

سنقوم بتحويل المشروع من:
- ❌ ملف JSON ثابت → ✅ Firestore Database
- ❌ localStorage → ✅ Firestore + Authentication

---

## 📋 الخطوات

### 1️⃣ تثبيت المكتبات

```bash
npm install firebase
# المكتبات الأخرى موجودة بالفعل (Redux Toolkit)
```

### 2️⃣ إعداد Firebase

#### أ. إنشاء ملف `.env.local`

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

#### ب. إنشاء ملف `lib/firebase.js`

```javascript
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// تهيئة Firebase مرة واحدة فقط
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// الحصول على خدمات Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
```

---

### 3️⃣ إنشاء خدمات Firestore للكتب

إنشاء ملف `lib/booksService.js`:

```javascript
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

// ═══════════════════════════════════════════════════════════════════
// Books CRUD Operations
// ═══════════════════════════════════════════════════════════════════

/**
 * إضافة كتاب جديد
 */
export const addBook = async (userId, bookData) => {
  try {
    const docRef = await addDoc(collection(db, 'books'), {
      ...bookData,
      userId, // ربط الكتاب بالمستخدم
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return {
      success: true,
      id: docRef.id,
      message: 'تم إضافة الكتاب بنجاح',
    };
  } catch (error) {
    console.error('Error adding book:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * الحصول على جميع كتب المستخدم
 */
export const getUserBooks = async (userId) => {
  try {
    const q = query(
      collection(db, 'books'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const books = [];
    
    querySnapshot.forEach((doc) => {
      books.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    
    return {
      success: true,
      data: books,
    };
  } catch (error) {
    console.error('Error getting books:', error);
    return {
      success: false,
      error: error.message,
      data: [],
    };
  }
};

/**
 * الحصول على كتاب واحد
 */
export const getBook = async (bookId) => {
  try {
    const docRef = doc(db, 'books', bookId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        success: true,
        data: { id: docSnap.id, ...docSnap.data() },
      };
    } else {
      return {
        success: false,
        error: 'الكتاب غير موجود',
      };
    }
  } catch (error) {
    console.error('Error getting book:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * تحديث كتاب
 */
export const updateBook = async (bookId, bookData) => {
  try {
    const docRef = doc(db, 'books', bookId);
    
    // إزالة الحقول التي لا نريد تحديثها
    const { id, userId, createdAt, ...dataToUpdate } = bookData;
    
    await updateDoc(docRef, {
      ...dataToUpdate,
      updatedAt: serverTimestamp(),
    });
    
    return {
      success: true,
      message: 'تم تحديث الكتاب بنجاح',
    };
  } catch (error) {
    console.error('Error updating book:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * حذف كتاب
 */
export const deleteBook = async (bookId) => {
  try {
    await deleteDoc(doc(db, 'books', bookId));
    
    return {
      success: true,
      message: 'تم حذف الكتاب بنجاح',
    };
  } catch (error) {
    console.error('Error deleting book:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * البحث عن كتب
 */
export const searchBooks = async (userId, searchTerm) => {
  try {
    const q = query(
      collection(db, 'books'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const books = [];
    
    querySnapshot.forEach((doc) => {
      const book = { id: doc.id, ...doc.data() };
      
      // البحث في العنوان والمؤلف
      const titleMatch = book.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const authorMatch = book.author?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (titleMatch || authorMatch) {
        books.push(book);
      }
    });
    
    return {
      success: true,
      data: books,
    };
  } catch (error) {
    console.error('Error searching books:', error);
    return {
      success: false,
      error: error.message,
      data: [],
    };
  }
};

/**
 * تصفية الكتب حسب الحالة
 */
export const getBooksByStatus = async (userId, status) => {
  try {
    const q = query(
      collection(db, 'books'),
      where('userId', '==', userId),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const books = [];
    
    querySnapshot.forEach((doc) => {
      books.push({ id: doc.id, ...doc.data() });
    });
    
    return {
      success: true,
      data: books,
    };
  } catch (error) {
    console.error('Error getting books by status:', error);
    return {
      success: false,
      error: error.message,
      data: [],
    };
  }
};

/**
 * تصفية الكتب حسب التصنيف
 */
export const getBooksByCategory = async (userId, category) => {
  try {
    const q = query(
      collection(db, 'books'),
      where('userId', '==', userId),
      where('category', '==', category),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const books = [];
    
    querySnapshot.forEach((doc) => {
      books.push({ id: doc.id, ...doc.data() });
    });
    
    return {
      success: true,
      data: books,
    };
  } catch (error) {
    console.error('Error getting books by category:', error);
    return {
      success: false,
      error: error.message,
      data: [],
    };
  }
};

/**
 * الاستماع للتحديثات المباشرة (Real-time)
 */
export const listenToUserBooks = (userId, callback) => {
  const q = query(
    collection(db, 'books'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  const unsubscribe = onSnapshot(
    q,
    (querySnapshot) => {
      const books = [];
      querySnapshot.forEach((doc) => {
        books.push({ id: doc.id, ...doc.data() });
      });
      callback(books);
    },
    (error) => {
      console.error('Error listening to books:', error);
      callback([]);
    }
  );
  
  return unsubscribe;
};

/**
 * إحصائيات المكتبة
 */
export const getLibraryStats = async (userId) => {
  try {
    const q = query(
      collection(db, 'books'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    
    let total = 0;
    let completed = 0;
    let reading = 0;
    let planned = 0;
    let totalPages = 0;
    let totalRating = 0;
    let ratedBooks = 0;
    
    querySnapshot.forEach((doc) => {
      const book = doc.data();
      total++;
      
      if (book.status === 'completed') completed++;
      if (book.status === 'reading') reading++;
      if (book.status === 'planned') planned++;
      
      if (book.pages) totalPages += Number(book.pages);
      
      if (book.rating && book.status === 'completed') {
        totalRating += Number(book.rating);
        ratedBooks++;
      }
    });
    
    return {
      success: true,
      data: {
        total,
        completed,
        reading,
        planned,
        totalPages,
        averageRating: ratedBooks > 0 ? (totalRating / ratedBooks).toFixed(1) : 0,
      },
    };
  } catch (error) {
    console.error('Error getting stats:', error);
    return {
      success: false,
      error: error.message,
      data: null,
    };
  }
};
```

---

### 4️⃣ تحديث Redux Store

إنشاء/تحديث ملف `store/booksSlice.js`:

```javascript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getUserBooks,
  addBook as addBookToFirestore,
  updateBook as updateBookInFirestore,
  deleteBook as deleteBookFromFirestore,
  searchBooks as searchBooksInFirestore,
  getBooksByStatus,
  getBooksByCategory,
  getLibraryStats,
} from '../lib/booksService';

// ═══════════════════════════════════════════════════════════════════
// Async Thunks
// ═══════════════════════════════════════════════════════════════════

// جلب جميع الكتب
export const fetchBooks = createAsyncThunk(
  'books/fetchBooks',
  async (userId, { rejectWithValue }) => {
    try {
      const result = await getUserBooks(userId);
      if (result.success) {
        return result.data;
      } else {
        return rejectWithValue(result.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// إضافة كتاب
export const addBook = createAsyncThunk(
  'books/addBook',
  async ({ userId, bookData }, { rejectWithValue }) => {
    try {
      const result = await addBookToFirestore(userId, bookData);
      if (result.success) {
        return { id: result.id, ...bookData };
      } else {
        return rejectWithValue(result.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// تحديث كتاب
export const updateBook = createAsyncThunk(
  'books/updateBook',
  async ({ bookId, bookData }, { rejectWithValue }) => {
    try {
      const result = await updateBookInFirestore(bookId, bookData);
      if (result.success) {
        return { id: bookId, ...bookData };
      } else {
        return rejectWithValue(result.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// حذف كتاب
export const deleteBook = createAsyncThunk(
  'books/deleteBook',
  async (bookId, { rejectWithValue }) => {
    try {
      const result = await deleteBookFromFirestore(bookId);
      if (result.success) {
        return bookId;
      } else {
        return rejectWithValue(result.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// البحث
export const searchBooks = createAsyncThunk(
  'books/searchBooks',
  async ({ userId, searchTerm }, { rejectWithValue }) => {
    try {
      const result = await searchBooksInFirestore(userId, searchTerm);
      if (result.success) {
        return result.data;
      } else {
        return rejectWithValue(result.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// تصفية حسب الحالة
export const filterByStatus = createAsyncThunk(
  'books/filterByStatus',
  async ({ userId, status }, { rejectWithValue }) => {
    try {
      const result = await getBooksByStatus(userId, status);
      if (result.success) {
        return result.data;
      } else {
        return rejectWithValue(result.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// تصفية حسب التصنيف
export const filterByCategory = createAsyncThunk(
  'books/filterByCategory',
  async ({ userId, category }, { rejectWithValue }) => {
    try {
      const result = await getBooksByCategory(userId, category);
      if (result.success) {
        return result.data;
      } else {
        return rejectWithValue(result.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// جلب الإحصائيات
export const fetchStats = createAsyncThunk(
  'books/fetchStats',
  async (userId, { rejectWithValue }) => {
    try {
      const result = await getLibraryStats(userId);
      if (result.success) {
        return result.data;
      } else {
        return rejectWithValue(result.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ═══════════════════════════════════════════════════════════════════
// Slice
// ═══════════════════════════════════════════════════════════════════

const initialState = {
  books: [],
  filteredBooks: [],
  stats: null,
  loading: false,
  error: null,
  activeFilter: null, // { type: 'status|category|search', value: '...' }
};

const booksSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearFilter: (state) => {
      state.filteredBooks = [];
      state.activeFilter = null;
    },
    setFilter: (state, action) => {
      state.activeFilter = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Books
      .addCase(fetchBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.books = action.payload;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add Book
      .addCase(addBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addBook.fulfilled, (state, action) => {
        state.loading = false;
        state.books.unshift(action.payload);
      })
      .addCase(addBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Book
      .addCase(updateBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBook.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.books.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.books[index] = action.payload;
        }
      })
      .addCase(updateBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete Book
      .addCase(deleteBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBook.fulfilled, (state, action) => {
        state.loading = false;
        state.books = state.books.filter(b => b.id !== action.payload);
      })
      .addCase(deleteBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Search
      .addCase(searchBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.filteredBooks = action.payload;
        state.activeFilter = { type: 'search' };
      })
      .addCase(searchBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Filter by Status
      .addCase(filterByStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(filterByStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.filteredBooks = action.payload;
        state.activeFilter = { type: 'status' };
      })
      .addCase(filterByStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Filter by Category
      .addCase(filterByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(filterByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.filteredBooks = action.payload;
        state.activeFilter = { type: 'category' };
      })
      .addCase(filterByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Stats
      .addCase(fetchStats.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(fetchStats.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearError, clearFilter, setFilter } = booksSlice.actions;
export default booksSlice.reducer;
```

---

### 5️⃣ إنشاء Auth Slice

إنشاء ملف `store/authSlice.js`:

```javascript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../lib/firebase';

// ═══════════════════════════════════════════════════════════════════
// Async Thunks
// ═══════════════════════════════════════════════════════════════════

export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ email, password, displayName }, { rejectWithValue }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }
      
      return {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: displayName || userCredential.user.displayName,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      return {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await signOut(auth);
      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ═══════════════════════════════════════════════════════════════════
// Slice
// ═══════════════════════════════════════════════════════════════════

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true, // بدء true لانتظار فحص المصادقة
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setUser, clearError } = authSlice.actions;
export default authSlice.reducer;

// ═══════════════════════════════════════════════════════════════════
// Auth State Listener (استخدم في _app.js)
// ═══════════════════════════════════════════════════════════════════

export const initAuthListener = (dispatch) => {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      dispatch(setUser({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      }));
    } else {
      dispatch(setUser(null));
    }
  });
};
```

---

### 6️⃣ تحديث Store الرئيسي

تحديث ملف `store/index.js` أو `store/store.js`:

```javascript
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import booksReducer from './booksSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    books: booksReducer,
  },
});
```

---

### 7️⃣ تحديث _app.js

```javascript
import { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { store } from '../store';
import { initAuthListener } from '../store/authSlice';
import '../styles/globals.css';

function AuthProvider({ children }) {
  const dispatch = useDispatch();
  
  useEffect(() => {
    // الاستماع لحالة المصادقة
    const unsubscribe = initAuthListener(dispatch);
    return () => unsubscribe();
  }, [dispatch]);
  
  return children;
}

function MyApp({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </Provider>
  );
}

export default MyApp;
```

---

### 8️⃣ إنشاء صفحة تسجيل الدخول

إنشاء ملف `pages/login.js`:

```javascript
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, registerUser, clearError } from '../store/authSlice';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
  });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    dispatch(clearError());
    
    if (isRegister) {
      const result = await dispatch(registerUser(formData));
      if (!result.error) {
        router.push('/library');
      }
    } else {
      const result = await dispatch(loginUser(formData));
      if (!result.error) {
        router.push('/library');
      }
    }
  };
  
  return (
    <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded shadow-sm border border-[#e8dfd0] p-10">
          <h1 className="text-3xl font-serif text-[#3d2f1f] mb-8 text-center">
            {isRegister ? 'إنشاء حساب' : 'تسجيل الدخول'}
          </h1>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {isRegister && (
              <div>
                <label className="block text-sm text-[#3d2f1f] tracking-wider mb-2">
                  الاسم
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-[#e8dfd0] focus:border-[#8b7355] outline-none transition-colors duration-300 rounded"
                  required
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm text-[#3d2f1f] tracking-wider mb-2">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border-2 border-[#e8dfd0] focus:border-[#8b7355] outline-none transition-colors duration-300 rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm text-[#3d2f1f] tracking-wider mb-2">
                كلمة المرور
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border-2 border-[#e8dfd0] focus:border-[#8b7355] outline-none transition-colors duration-300 rounded"
                required
                minLength="6"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#3d2f1f] text-white hover:bg-[#2d1f0f] transition-all duration-300 tracking-wider rounded disabled:opacity-50"
            >
              {loading ? 'جاري التحميل...' : (isRegister ? 'إنشاء الحساب' : 'تسجيل الدخول')}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                dispatch(clearError());
              }}
              className="text-[#8b7355] hover:text-[#3d2f1f] text-sm tracking-wide"
            >
              {isRegister ? 'لديك حساب؟ سجل الدخول' : 'ليس لديك حساب؟ أنشئ واحداً'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

### 9️⃣ تحديث صفحة المكتبة

مثال على تحديث `pages/library.js`:

```javascript
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBooks, fetchStats } from '../store/booksSlice';
import { logoutUser } from '../store/authSlice';

export default function LibraryPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const { user, isAuthenticated, loading: authLoading } = useSelector((state) => state.auth);
  const { books, stats, loading: booksLoading } = useSelector((state) => state.books);
  
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);
  
  useEffect(() => {
    if (user?.uid) {
      dispatch(fetchBooks(user.uid));
      dispatch(fetchStats(user.uid));
    }
  }, [user, dispatch]);
  
  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push('/login');
  };
  
  if (authLoading || booksLoading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <p className="text-[#8b7355] tracking-wider">جاري التحميل...</p>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-[#faf8f5] p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-serif text-[#3d2f1f]">مكتبتي</h1>
            <p className="text-[#8b7355] text-sm mt-1">مرحباً، {user?.displayName || user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            تسجيل الخروج
          </button>
        </header>
        
        {stats && (
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded border border-[#e8dfd0]">
              <p className="text-[#8b7355] text-sm">إجمالي الكتب</p>
              <p className="text-3xl font-bold text-[#3d2f1f] mt-2">{stats.total}</p>
            </div>
            <div className="bg-white p-6 rounded border border-[#e8dfd0]">
              <p className="text-[#8b7355] text-sm">مكتملة</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.completed}</p>
            </div>
            <div className="bg-white p-6 rounded border border-[#e8dfd0]">
              <p className="text-[#8b7355] text-sm">قيد القراءة</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.reading}</p>
            </div>
            <div className="bg-white p-6 rounded border border-[#e8dfd0]">
              <p className="text-[#8b7355] text-sm">متوسط التقييم</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.averageRating}</p>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-3 gap-6">
          {books.map((book) => (
            <div key={book.id} className="bg-white p-6 rounded border border-[#e8dfd0]">
              <h3 className="text-xl font-serif text-[#3d2f1f] mb-2">{book.title}</h3>
              <p className="text-[#8b7355] text-sm mb-4">{book.author}</p>
              <p className="text-xs text-[#8b7355]">{book.category}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

### 🔟 تحديث BookForm

تحديث ملف `BookForm.jsx` ليستخدم Firebase:

```javascript
// في handleSubmit
const handleSubmit = useCallback(async (e) => {
  e.preventDefault();
  
  // ... التحقق من البيانات
  
  setIsSaving(true);
  
  try {
    const bookData = {
      ...formData,
      pages: safeNumber(formData.pages),
      currentPage: safeNumber(formData.currentPage),
      rating: safeNumber(formData.rating, 0),
      title: formData.title.trim(),
      author: formData.author.trim(),
      notes: formData.notes?.trim() || '',
    };
    
    if (isEdit) {
      await dispatch(updateBook({ 
        bookId: book.id, 
        bookData 
      }));
    } else {
      await dispatch(addBook({ 
        userId: user.uid, 
        bookData 
      }));
    }
    
    // Clear draft
    try {
      localStorage.removeItem('book-draft');
    } catch {}
    
    setSaveSuccess({
      message: isEdit ? 'تم تحديث السجل' : 'تم توثيق الكتاب',
    });
    
    setTimeout(() => router.push('/library'), 1500);
    
  } catch (error) {
    console.error('Save error:', error);
    setErrors({ submit: 'حدث خطأ في الحفظ' });
  } finally {
    setIsSaving(false);
  }
}, [formData, book, isEdit, user, dispatch, router]);
```

---

## 🔐 قواعد Firestore الأمنية

في Firebase Console > Firestore Database > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // قواعد الكتب
    match /books/{bookId} {
      // السماح بالقراءة فقط للكتب التي يملكها المستخدم
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      
      // السماح بالكتابة (تحديث/حذف) فقط للكتب التي يملكها المستخدم
      allow update, delete: if request.auth != null && 
                               resource.data.userId == request.auth.uid;
      
      // السماح بالإنشاء فقط إذا كان userId يطابق المستخدم الحالي
      allow create: if request.auth != null && 
                       request.resource.data.userId == request.auth.uid;
    }
  }
}
```

---

## 📊 هيكل البيانات في Firestore

```
books/
  ├─ {bookId}/
      ├─ title: string
      ├─ author: string
      ├─ category: string
      ├─ status: string (planned|reading|completed)
      ├─ pages: number
      ├─ currentPage: number
      ├─ rating: number (0-5)
      ├─ notes: string
      ├─ finishedAt: string (ISO date)
      ├─ userId: string (Firebase UID)
      ├─ createdAt: timestamp
      └─ updatedAt: timestamp
```

---

## ✅ ملخص التغييرات

### تم إزالة:
- ❌ `/public/books.json`
- ❌ جميع استخدامات `localStorage` للكتب
- ❌ الحاجة لتحميل JSON في بداية التطبيق

### تمت إضافة:
- ✅ Firebase Configuration
- ✅ Firestore Database
- ✅ Firebase Authentication
- ✅ Real-time Updates (اختياري)
- ✅ Multi-user Support
- ✅ Secure Data (قواعد الأمان)

---

## 🚀 الخطوات التالية

1. **تثبيت Firebase**: `npm install firebase`
2. **إنشاء مشروع Firebase** في Firebase Console
3. **إنشاء ملفات التكوين** (`.env.local`, `lib/firebase.js`)
4. **إنشاء خدمات Firestore** (`lib/booksService.js`)
5. **تحديث Redux Slices** (`store/authSlice.js`, `store/booksSlice.js`)
6. **إنشاء صفحة Login** (`pages/login.js`)
7. **تحديث الصفحات الموجودة** لاستخدام Firebase
8. **إعداد قواعد الأمان** في Firestore
9. **اختبار كل شيء!**

---

## 💡 نصائح إضافية

### 1. ترحيل البيانات الموجودة
إذا كان لديك بيانات في `books.json`، يمكنك ترحيلها:

```javascript
// script لمرة واحدة فقط
import booksData from './public/books.json';
import { addBook } from './lib/booksService';

async function migrateData(userId) {
  for (const book of booksData) {
    await addBook(userId, book);
  }
  console.log('Migration complete!');
}
```

### 2. التخزين المؤقت
لتحسين الأداء، يمكنك استخدام localStorage كطبقة تخزين مؤقت:

```javascript
// في fetchBooks
const cachedBooks = localStorage.getItem(`books_${userId}`);
if (cachedBooks) {
  dispatch(setBooksFromCache(JSON.parse(cachedBooks)));
}

const result = await getUserBooks(userId);
if (result.success) {
  localStorage.setItem(`books_${userId}`, JSON.stringify(result.data));
  return result.data;
}
```

### 3. Offline Support
Firebase يدعم العمل بدون إنترنت تلقائياً:

```javascript
import { enableIndexedDbPersistence } from 'firebase/firestore';

// في lib/firebase.js
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code == 'failed-precondition') {
      // Multiple tabs open
    } else if (err.code == 'unimplemented') {
      // Browser doesn't support
    }
  });
```

---

هذا الدليل الشامل يحول مشروعك بالكامل إلى Firebase! 🎉
