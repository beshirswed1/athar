import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  addDocument,
  updateDocument,
  deleteDocument,
  getUserBooks,
  calculateBookStats,
} from '../lib/firestore';

/* =========================================================
   Async Thunks (Firebase)
  ========================================================= */

// جلب كتب المستخدم من Firebase
export const fetchBooks = createAsyncThunk(
  'books/fetchBooks',
  async (userId, { rejectWithValue }) => {
    const result = await getUserBooks(userId);
    if (!result.success) return rejectWithValue(result.error);
    return result.data;
  }
);

// إضافة كتاب
export const addBookAsync = createAsyncThunk(
  'books/addBookAsync',
  async ({ userId, bookData }, { rejectWithValue }) => {
    // Remove local ID if present, let Firestore generate it
    const { id, ...dataWithoutId } = bookData;
    const result = await addDocument('books', {
      ...dataWithoutId,
      userId,
    });

    if (!result.success) return rejectWithValue(result.error);
    return { id: result.id, ...dataWithoutId, userId };
  }
);

// تحديث كتاب
export const updateBookAsync = createAsyncThunk(
  'books/updateBookAsync',
  async ({ bookId, bookData, userId }, { rejectWithValue }) => {
    const result = await updateDocument('books', bookId, { ...bookData, userId });

    if (!result.success) return rejectWithValue(result.error);
    return { id: bookId, ...bookData, userId };
  }
);

// حذف كتاب
export const deleteBookAsync = createAsyncThunk(
  'books/deleteBookAsync',
  async ({ bookId, userId }, { rejectWithValue }) => {
    const result = await deleteDocument('books', bookId);

    if (!result.success) return rejectWithValue(result.error);
    return { id: bookId, userId };
  }
);

/* =========================================================
   Initial State
  ========================================================= */

const initialState = {
  items: [],
  loading: false,
  error: null,
  stats: {
    total: 0,
    completed: 0,
    reading: 0,
    planned: 0,
    averageRating: 0,
  },
};

/* =========================================================
   Slice
  ========================================================= */

const booksSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    clearBooks: (state) => {
      state.items = [];
      state.stats = { total: 0, completed: 0, reading: 0, planned: 0, averageRating: 0 };
    },

    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    /* ======= Fetch ======= */
    builder
      .addCase(fetchBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.items = action.payload;
        state.stats = calculateBookStats(action.payload);
        state.loading = false;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    /* ======= Add ======= */
    builder.addCase(addBookAsync.fulfilled, (state, action) => {
      state.items.unshift(action.payload);
      state.stats = calculateBookStats(state.items);
    });

    /* ======= Update ======= */
    builder.addCase(updateBookAsync.fulfilled, (state, action) => {
      const i = state.items.findIndex(b => b.id === action.payload.id);
      if (i !== -1) state.items[i] = { ...state.items[i], ...action.payload };
      state.stats = calculateBookStats(state.items);
    });

    /* ======= Delete ======= */
    builder.addCase(deleteBookAsync.fulfilled, (state, action) => {
      state.items = state.items.filter(b => b.id !== action.payload.id);
      state.stats = calculateBookStats(state.items);
    });
  },
});

/* =========================================================
   Exports
  ========================================================= */

export const {
  clearBooks,
  clearError,
} = booksSlice.actions;

export default booksSlice.reducer;

/* =========================================================
   Selectors
  ========================================================= */

export const selectAllBooks = (state) => state.books.items;
export const selectBooksByStatus = (status) => (state) =>
  state.books.items.filter((b) => b.status === status);
export const selectBookById = (id) => (state) =>
  state.books.items.find((b) => b.id === id);
