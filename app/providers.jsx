'use client';

import { Provider } from 'react-redux';
import store from '@/store/store';
import { useEffect } from 'react';

import { onAuthChange } from '@/lib/auth';
import { setUser, setLoading } from '@/store/authSlice';
import { Toaster } from 'react-hot-toast';

export default function Providers({ children }) {
  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthChange((user) => {
      store.dispatch(setUser(user));
      store.dispatch(setLoading(false));
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <Provider store={store}>
      <Toaster 
        position="top-center"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: 'green',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: 'red',
              secondary: 'white',
            },
          },
        }}
      />
      {children}
    </Provider>
  );
}
