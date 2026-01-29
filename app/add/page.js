import BookForm from '@/components/BookForm';

export default function AddBook() {
  return (
    <div className="py-12">
      <h1 className="text-4xl font-bold text-center mb-12">إضافة كتاب جديد</h1>
      <BookForm />
    </div>
  );
}