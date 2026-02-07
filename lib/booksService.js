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