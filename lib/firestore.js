import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  writeBatch,
  runTransaction,
} from 'firebase/firestore';
import { db } from './firebase';

// ═══════════════════════════════════════════════════════════
// دوال مساعدة خاصة بالكتب
// ═══════════════════════════════════════════════════════════

/**
 * الحصول على كتب المستخدم
 */
export const getUserBooks = async (userId) => {
  try {
    // مع ترتيب بالتاريخ (يتطلب Composite Index في Firestore)
    const q = query(
      collection(db, 'books'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const documents = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // تحويل Firestore Timestamp إلى ISO string
      if (data.createdAt && typeof data.createdAt.toISOString === 'function') {
        data.createdAt = data.createdAt.toISOString();
      }
      if (data.updatedAt && typeof data.updatedAt.toISOString === 'function') {
        data.updatedAt = data.updatedAt.toISOString();
      }
      documents.push({ id: doc.id, ...data });
    });
    
    return {
      success: true,
      data: documents,
    };
  } catch (error) {
    console.error('Error getting user books:', error);
    return {
      success: false,
      error: error.message,
      data: [],
    };
  }
};

/**
 * حساب إحصائيات الكتب
 */
export const calculateBookStats = (books) => {
  const stats = {
    total: books.length,
    completed: 0,
    reading: 0,
    planned: 0,
    averageRating: 0,
  };
  
  let totalRating = 0;
  let ratedBooks = 0;
  
  books.forEach((book) => {
    if (book.status === 'completed') {
      stats.completed++;
      if (book.rating) {
        totalRating += book.rating;
        ratedBooks++;
      }
    } else if (book.status === 'reading') {
      stats.reading++;
    } else if (book.status === 'planned') {
      stats.planned++;
    }
  });
  
  stats.averageRating = ratedBooks > 0 ? totalRating / ratedBooks : 0;
  
  return stats;
};

// ═══════════════════════════════════════════════════════════
// إضافة البيانات (CREATE)
// ═══════════════════════════════════════════════════════════

/**
 * إضافة مستند جديد بـ ID تلقائي
 */
export const addDocument = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return {
      success: true,
      id: docRef.id,
      message: 'تم إضافة المستند بنجاح',
    };
  } catch (error) {
    console.error('Error adding document:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * إضافة/تحديث مستند بـ ID محدد
 */
export const setDocument = async (collectionName, docId, data, merge = false) => {
  try {
    await setDoc(
      doc(db, collectionName, docId),
      {
        ...data,
        updatedAt: serverTimestamp(),
      },
      { merge }
    );
    
    return {
      success: true,
      id: docId,
      message: 'تم حفظ المستند بنجاح',
    };
  } catch (error) {
    console.error('Error setting document:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// ═══════════════════════════════════════════════════════════
// قراءة البيانات (READ)
// ═══════════════════════════════════════════════════════════

/**
 * الحصول على مستند واحد
 */
export const getDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        success: true,
        data: { id: docSnap.id, ...docSnap.data() },
      };
    } else {
      return {
        success: false,
        error: 'المستند غير موجود',
      };
    }
  } catch (error) {
    console.error('Error getting document:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * الحصول على جميع المستندات من مجموعة
 */
export const getAllDocuments = async (collectionName, orderByField = 'createdAt', orderDirection = 'desc') => {
  try {
    const q = query(
      collection(db, collectionName),
      orderBy(orderByField, orderDirection)
    );
    
    const querySnapshot = await getDocs(q);
    const documents = [];
    
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    
    return {
      success: true,
      data: documents,
    };
  } catch (error) {
    console.error('Error getting documents:', error);
    return {
      success: false,
      error: error.message,
      data: [],
    };
  }
};

/**
 * الحصول على مستندات بشروط
 * @param {string} collectionName - اسم المجموعة
 * @param {Array} conditions - مصفوفة الشروط [{ field, operator, value }]
 * @param {string} orderByField - الحقل للترتيب
 * @param {string} orderDirection - اتجاه الترتيب (asc/desc)
 * @param {number} limitCount - عدد النتائج المحدود
 */
export const getDocumentsWhere = async (
  collectionName,
  conditions = [],
  orderByField = 'createdAt',
  orderDirection = 'desc',
  limitCount = null
) => {
  try {
    // بناء الاستعلام
    const constraints = [];
    
    // إضافة شروط WHERE
    conditions.forEach(condition => {
      constraints.push(where(condition.field, condition.operator, condition.value));
    });
    
    // إضافة الترتيب
    if (orderByField) {
      constraints.push(orderBy(orderByField, orderDirection));
    }
    
    // إضافة الحد الأقصى
    if (limitCount) {
      constraints.push(limit(limitCount));
    }
    
    const q = query(collection(db, collectionName), ...constraints);
    const querySnapshot = await getDocs(q);
    const documents = [];
    
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    
    return {
      success: true,
      data: documents,
    };
  } catch (error) {
    console.error('Error getting documents with conditions:', error);
    return {
      success: false,
      error: error.message,
      data: [],
    };
  }
};

/**
 * Pagination - الحصول على صفحة من البيانات
 */
export const getPagedDocuments = async (
  collectionName,
  pageSize = 10,
  lastDocument = null,
  conditions = [],
  orderByField = 'createdAt',
  orderDirection = 'desc'
) => {
  try {
    const constraints = [];
    
    // إضافة الشروط
    conditions.forEach(condition => {
      constraints.push(where(condition.field, condition.operator, condition.value));
    });
    
    // إضافة الترتيب
    constraints.push(orderBy(orderByField, orderDirection));
    
    // إضافة pagination
    if (lastDocument) {
      constraints.push(startAfter(lastDocument));
    }
    
    constraints.push(limit(pageSize));
    
    const q = query(collection(db, collectionName), ...constraints);
    const querySnapshot = await getDocs(q);
    const documents = [];
    
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    
    return {
      success: true,
      data: documents,
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
      hasMore: documents.length === pageSize,
    };
  } catch (error) {
    console.error('Error getting paged documents:', error);
    return {
      success: false,
      error: error.message,
      data: [],
      hasMore: false,
    };
  }
};

// ═══════════════════════════════════════════════════════════
// تحديث البيانات (UPDATE)
// ═══════════════════════════════════════════════════════════

/**
 * تحديث مستند (إنشأ إذا لم يكن موجوداً)
 */
export const updateDocument = async (collectionName, docId, data) => {
  try {
    const docRef = doc(db, collectionName, docId);
    
    await setDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    
    return {
      success: true,
      message: 'تم حفظ المستند بنجاح',
    };
  } catch (error) {
    console.error('Error updating document:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * زيادة قيمة رقمية
 */
export const incrementField = async (collectionName, docId, fieldName, incrementValue = 1) => {
  try {
    const docRef = doc(db, collectionName, docId);
    
    await updateDoc(docRef, {
      [fieldName]: increment(incrementValue),
      updatedAt: serverTimestamp(),
    });
    
    return {
      success: true,
      message: 'تم تحديث الحقل بنجاح',
    };
  } catch (error) {
    console.error('Error incrementing field:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * إضافة عنصر لمصفوفة
 */
export const addToArray = async (collectionName, docId, fieldName, value) => {
  try {
    const docRef = doc(db, collectionName, docId);
    
    await updateDoc(docRef, {
      [fieldName]: arrayUnion(value),
      updatedAt: serverTimestamp(),
    });
    
    return {
      success: true,
      message: 'تم إضافة العنصر للمصفوفة',
    };
  } catch (error) {
    console.error('Error adding to array:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * حذف عنصر من مصفوفة
 */
export const removeFromArray = async (collectionName, docId, fieldName, value) => {
  try {
    const docRef = doc(db, collectionName, docId);
    
    await updateDoc(docRef, {
      [fieldName]: arrayRemove(value),
      updatedAt: serverTimestamp(),
    });
    
    return {
      success: true,
      message: 'تم حذف العنصر من المصفوفة',
    };
  } catch (error) {
    console.error('Error removing from array:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// ═══════════════════════════════════════════════════════════
// حذف البيانات (DELETE)
// ═══════════════════════════════════════════════════════════

/**
 * حذف مستند
 */
export const deleteDocument = async (collectionName, docId) => {
  try {
    await deleteDoc(doc(db, collectionName, docId));
    
    return {
      success: true,
      message: 'تم حذف المستند بنجاح',
    };
  } catch (error) {
    console.error('Error deleting document:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * حذف عدة مستندات دفعة واحدة
 */
export const batchDeleteDocuments = async (collectionName, docIds) => {
  try {
    const batch = writeBatch(db);
    
    docIds.forEach((docId) => {
      const docRef = doc(db, collectionName, docId);
      batch.delete(docRef);
    });
    
    await batch.commit();
    
    return {
      success: true,
      message: `تم حذف ${docIds.length} مستند بنجاح`,
    };
  } catch (error) {
    console.error('Error batch deleting documents:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// ═══════════════════════════════════════════════════════════
// التحديثات المباشرة (Real-time)
// ═══════════════════════════════════════════════════════════

/**
 * الاستماع لمستند واحد
 */
export const listenToDocument = (collectionName, docId, callback) => {
  const docRef = doc(db, collectionName, docId);
  
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        callback({ id: docSnap.id, ...docSnap.data() });
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error('Error listening to document:', error);
      callback(null);
    }
  );
};

/**
 * الاستماع لمجموعة كاملة
 */
export const listenToCollection = (
  collectionName,
  callback,
  orderByField = 'createdAt',
  orderDirection = 'desc'
) => {
  const q = query(
    collection(db, collectionName),
    orderBy(orderByField, orderDirection)
  );
  
  return onSnapshot(
    q,
    (querySnapshot) => {
      const documents = [];
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      callback(documents);
    },
    (error) => {
      console.error('Error listening to collection:', error);
      callback([]);
    }
  );
};

/**
 * الاستماع لمستندات بشروط
 */
export const listenToCollectionWhere = (
  collectionName,
  conditions,
  callback,
  orderByField = 'createdAt',
  orderDirection = 'desc'
) => {
  const constraints = [];
  
  conditions.forEach(condition => {
    constraints.push(where(condition.field, condition.operator, condition.value));
  });
  
  if (orderByField) {
    constraints.push(orderBy(orderByField, orderDirection));
  }
  
  const q = query(collection(db, collectionName), ...constraints);
  
  return onSnapshot(
    q,
    (querySnapshot) => {
      const documents = [];
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      callback(documents);
    },
    (error) => {
      console.error('Error listening to collection with conditions:', error);
      callback([]);
    }
  );
};

// ═══════════════════════════════════════════════════════════
// العمليات المتقدمة
// ═══════════════════════════════════════════════════════════

/**
 * Batch Write - كتابة عدة مستندات دفعة واحدة
 */
export const batchWrite = async (operations) => {
  try {
    const batch = writeBatch(db);
    
    operations.forEach(({ type, collectionName, docId, data }) => {
      const docRef = docId 
        ? doc(db, collectionName, docId)
        : doc(collection(db, collectionName));
      
      if (type === 'set') {
        batch.set(docRef, { ...data, updatedAt: serverTimestamp() });
      } else if (type === 'update') {
        batch.update(docRef, { ...data, updatedAt: serverTimestamp() });
      } else if (type === 'delete') {
        batch.delete(docRef);
      }
    });
    
    await batch.commit();
    
    return {
      success: true,
      message: 'تم تنفيذ العمليات بنجاح',
    };
  } catch (error) {
    console.error('Error in batch write:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Transaction - معاملة آمنة
 */
export const runFirestoreTransaction = async (transactionFunction) => {
  try {
    const result = await runTransaction(db, async (transaction) => {
      return await transactionFunction(transaction);
    });
    
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('Error in transaction:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// ═══════════════════════════════════════════════════════════
// دوال مساعدة
// ═══════════════════════════════════════════════════════════

/**
 * البحث في مجموعة (Client-side)
 */
export const searchDocuments = async (collectionName, searchField, searchTerm, userId = null) => {
  try {
    const conditions = userId ? [{ field: 'userId', operator: '==', value: userId }] : [];
    
    const result = await getDocumentsWhere(collectionName, conditions);
    
    if (!result.success) {
      return result;
    }
    
    const searchTermLower = searchTerm.toLowerCase();
    const filteredDocs = result.data.filter(doc => {
      const fieldValue = doc[searchField];
      return fieldValue && fieldValue.toString().toLowerCase().includes(searchTermLower);
    });
    
    return {
      success: true,
      data: filteredDocs,
    };
  } catch (error) {
    console.error('Error searching documents:', error);
    return {
      success: false,
      error: error.message,
      data: [],
    };
  }
};

/**
 * حساب عدد المستندات
 */
export const countDocuments = async (collectionName, conditions = []) => {
  try {
    const result = await getDocumentsWhere(collectionName, conditions);
    
    return {
      success: true,
      count: result.data ? result.data.length : 0,
    };
  } catch (error) {
    console.error('Error counting documents:', error);
    return {
      success: false,
      error: error.message,
      count: 0,
    };
  }
};