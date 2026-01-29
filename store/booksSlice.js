import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  books: [],
};

const booksSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    loadFromLocalStorage: (state) => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('athar_books');
        if (stored) {
          state.books = JSON.parse(stored);
        }
      }
    },
    addBook: (state, action) => {
      // ensure genre exists with a default value
      const bookToAdd = {
        ...action.payload,
        genre: action.payload?.genre ?? 'غير مصنف',
      };
      state.books.push(bookToAdd);
      localStorage.setItem('athar_books', JSON.stringify(state.books));
    },
    updateBook: (state, action) => {
      const index = state.books.findIndex((b) => b.id === action.payload.id);
      if (index !== -1) {
        const updated = {
          ...action.payload,
          genre: action.payload?.genre ?? 'غير مصنف',
        };
        state.books[index] = updated;
        localStorage.setItem('athar_books', JSON.stringify(state.books));
      }
    },
    deleteBook: (state, action) => {
      state.books = state.books.filter((b) => b.id !== action.payload);
      localStorage.setItem('athar_books', JSON.stringify(state.books));
    },
  },
});

export const { addBook, updateBook, deleteBook, loadFromLocalStorage } = booksSlice.actions;

export const selectAllBooks = (state) => state.books.books;
export const selectBooksByStatus = (status) => (state) =>
  state.books.books.filter((b) => b.status === status);
export const selectBookById = (id) => (state) =>
  state.books.books.find((b) => b.id === id);

export default booksSlice.reducer;