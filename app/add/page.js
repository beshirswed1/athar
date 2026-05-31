import BookForm from '@/components/BookForm';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function AddBook() {
  return (
    <ProtectedRoute>
      <BookForm />
    </ProtectedRoute>
  );
}