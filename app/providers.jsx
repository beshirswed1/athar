'use client';

import { Provider } from 'react-redux';
import { store } from '@/store/store';
import { useEffect } from 'react';
import { loadFromLocalStorage } from '@/store/booksSlice';

export default function Providers({ children }) {
  useEffect(() => {
    store.dispatch(loadFromLocalStorage());
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
