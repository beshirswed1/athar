'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) {
      router.replace('/login');
    }
  }, [user, router]);

  if (!user) {
    return null; // أو Loader
  }

  return children;
}
