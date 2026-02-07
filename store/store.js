import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';  
import booksReducer from './booksSlice';  

const store = configureStore({
  reducer: {
    auth: authReducer,
    books: booksReducer,
    // أضف slices أخرى هنا
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // تجاهل Firebase timestamps في الـ state
        ignoredActions: [
          'auth/setUser', 
          'books/setBooks',
          'books/fetchBooks/fulfilled',
          'books/addBookAsync/fulfilled',
          'books/updateBookAsync/fulfilled',
          'books/deleteBookAsync/fulfilled',
        ],
        ignoredPaths: ['auth.user', 'books.items'],
      },
    }),
});

export default store;