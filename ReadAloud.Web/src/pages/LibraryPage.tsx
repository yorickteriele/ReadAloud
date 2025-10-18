import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Search, Trash2 } from 'lucide-react';
import { Spinner } from '../components/ui';
import { bookService } from '../services/book.service';
import { useBookStore } from '../store/book.store';
import type { Book } from '../types';

export const LibraryPage = () => {
  const navigate = useNavigate();
  const { books, setBooks, removeBook } = useBookStore();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const data = await bookService.getAllBooks();
      setBooks(data);
    } catch (error) {
      console.error('Failed to load books:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (bookId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this book?')) return;

    setDeletingId(bookId);
    try {
      await bookService.deleteBook(bookId);
      removeBook(bookId);
    } catch (error) {
      console.error('Failed to delete book:', error);
      alert('Failed to delete book');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">My Library</h1>
        <p className="text-muted-foreground">Your personal collection of books</p>
      </div>

      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search books by title or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {filteredBooks.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {searchQuery ? 'No books found' : 'Your library is empty'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery
              ? 'Try adjusting your search terms'
              : 'Upload your first book to get started'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => navigate('/upload')}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary-light transition-colors shadow-md"
            >
              Upload a Book
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onDelete={handleDelete}
              isDeleting={deletingId === book.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface BookCardProps {
  book: Book;
  onDelete: (id: number, e: React.MouseEvent) => void;
  isDeleting: boolean;
}

const BookCard = ({ book, onDelete, isDeleting }: BookCardProps) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/book/${book.id}`)}
      className="group cursor-pointer bg-card rounded-xl overflow-hidden border border-border hover:border-primary transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
    >
      <div className="relative aspect-[2/3] bg-muted overflow-hidden">
        {book.coverImagePath ? (
          <img
            src={bookService.getCoverImageUrl(book.coverImagePath)}
            alt={book.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '';
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-16 h-16 text-muted-foreground" />
          </div>
        )}
        
        <button
          onClick={(e) => onDelete(book.id, e)}
          disabled={isDeleting}
          className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-card-foreground line-clamp-2 mb-1 group-hover:text-primary transition-colors">
          {book.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-1">{book.author}</p>
      </div>
    </div>
  );
};
