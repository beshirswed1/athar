import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

const statusConfig = {
  completed: { label: 'أتممت قراءته', color: 'bg-green-100 text-green-800' },
  reading: { label: 'أقرأه حاليًا', color: 'bg-blue-100 text-blue-800' },
  planned: { label: 'سأقرأه لاحقًا', color: 'bg-amber-100 text-amber-800' },
};

export default function BookCard({ book }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      {book.coverImage ? (
        <div className="relative w-full h-64">
          <img
            src={book.coverImage} 
            alt={book.title} 
            className="w-full h-full object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      ) : (
        <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500">لا توجد صورة</span>
        </div>
      )}
      <div className="p-4">
        <h3 className="font-bold text-lg">{book.title}</h3>
        <p className="text-gray-600">تأليف: {book.author}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className={`px-3 py-1 rounded-full text-sm ${statusConfig[book.status].color}`}>
            {statusConfig[book.status].label}
          </span>
          {book.rating && (
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <FontAwesomeIcon
                  key={i}
                  icon={faStar}
                  className={i < book.rating ? 'text-yellow-500' : 'text-gray-300'}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}