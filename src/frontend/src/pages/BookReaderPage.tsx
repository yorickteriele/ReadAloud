import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Menu, X, BookOpen } from 'lucide-react';
import { Spinner } from '../components/ui';
import { bookService } from '../services/book.service';
import { useBookStore } from '../store/book.store';

export const BookReaderPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentBook, setCurrentBook } = useBookStore();
  const [isLoading, setIsLoading] = useState(true);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    loadBook();
  }, [id]);

  const loadBook = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const book = await bookService.getBookById(parseInt(id));
      setCurrentBook(book);
    } catch (error) {
      console.error('Failed to load book:', error);
      navigate('/library');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!currentBook) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground">Book not found</p>
        </div>
      </div>
    );
  }

  const currentChapter = currentBook.chapters?.[currentChapterIndex];
  const canGoPrevious = currentChapterIndex > 0;
  const canGoNext = currentChapterIndex < (currentBook.chapters?.length || 0) - 1;

  return (
    <div className="flex h-full bg-background">
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-card rounded-lg shadow-lg lg:hidden"
      >
        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-card border-r border-border overflow-y-auto transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-border">
          <button
            onClick={() => navigate('/library')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Library
          </button>
          
          <h2 className="text-xl font-bold text-foreground mb-1 line-clamp-2">
            {currentBook.title}
          </h2>
          <p className="text-sm text-muted-foreground">{currentBook.author}</p>
        </div>

        <div className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3 px-2">Chapters</h3>
          <nav className="space-y-1">
            {currentBook.chapters?.map((chapter, index) => (
              <button
                key={chapter.id}
                onClick={() => {
                  setCurrentChapterIndex(index);
                  setIsSidebarOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                  index === currentChapterIndex
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <div className="text-xs font-medium mb-0.5">
                  Chapter {chapter.chapterNumber}
                </div>
                <div className="text-sm line-clamp-1">{chapter.title}</div>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 lg:px-12 py-8 lg:py-12">
          {currentChapter ? (
            <>
              <header className="mb-8 pb-6 border-b border-border">
                <div className="text-sm text-muted-foreground mb-2">
                  Chapter {currentChapter.chapterNumber}
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
                  {currentChapter.title}
                </h1>
              </header>

              <article className="prose prose-lg max-w-none">
                {currentChapter.paragraphs?.map((paragraph) => (
                  <p
                    key={paragraph.id}
                    className="text-foreground leading-relaxed mb-4 text-lg"
                  >
                    {paragraph.text}
                  </p>
                ))}
              </article>

              <div className="flex items-center justify-between mt-12 pt-8 border-t border-border">
                <button
                  onClick={() => setCurrentChapterIndex((prev) => prev - 1)}
                  disabled={!canGoPrevious}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-foreground hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span className="hidden sm:inline">Previous Chapter</span>
                </button>

                <div className="text-sm text-muted-foreground">
                  {currentChapterIndex + 1} / {currentBook.chapters?.length || 0}
                </div>

                <button
                  onClick={() => setCurrentChapterIndex((prev) => prev + 1)}
                  disabled={!canGoNext}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-foreground hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <span className="hidden sm:inline">Next Chapter</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground">No chapters available</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
