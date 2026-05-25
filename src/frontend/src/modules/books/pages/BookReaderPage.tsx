import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { Spinner } from '../../../components/ui';
import { bookService } from '../services/book.service';
import { useBookStore } from '../store/book.store';
import { useLayoutStore } from '../../../hooks/useLayoutStore';
import { classNames } from '../../../lib/utils/layout';

export const BookReaderPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentBook, setCurrentBook } = useBookStore();
  const { setContextualSidebar, sidebarExpanded, setBreadcrumbLabel } = useLayoutStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isChapterLoading, setIsChapterLoading] = useState(false);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [loadedChapter, setLoadedChapter] = useState<any>(null);

  useEffect(() => {
    loadBook();
  }, [id]);

  useEffect(() => {
    if (currentBook?.chapters?.[currentChapterIndex]) {
      loadChapter();
    }
  }, [id, currentChapterIndex, currentBook?.chapters]);

  const currentChapter = loadedChapter;

  useEffect(() => {
    if (currentBook?.title && currentChapter?.title) {
      setBreadcrumbLabel(`${currentBook.title} / ${currentChapter.title}`);
    } else if (currentBook?.title) {
      setBreadcrumbLabel(currentBook.title);
    }
    return () => setBreadcrumbLabel(null);
  }, [currentBook?.title, currentChapter?.title, setBreadcrumbLabel]);

  const loadBook = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const book = await bookService.getBook(parseInt(id));
      setCurrentBook(book);
    } catch (error) {
      console.error('Failed to load book metadata:', error);
      navigate('/library');
    } finally {
      setIsLoading(false);
    }
  };

  const loadChapter = async () => {
    if (!id || !currentBook?.chapters?.[currentChapterIndex]) return;

    setIsChapterLoading(true);
    try {
      const chapterNumber = currentBook.chapters[currentChapterIndex].chapterNumber;
      if (chapterNumber === undefined) return;
      
      const chapter = await bookService.getChapter(parseInt(id), chapterNumber);
      setLoadedChapter(chapter);
    } catch (error) {
      console.error('Failed to load chapter:', error);
    } finally {
      setIsChapterLoading(false);
    }
  };

  const canGoPrevious = currentChapterIndex > 0;
  const canGoNext = currentBook?.chapters?.length ? currentChapterIndex < currentBook.chapters.length - 1 : false;

  const sidebarContent = useMemo(() => {
    if (!currentBook) return null;

    return (
      <div className="flex flex-col gap-4">
        <button
          onClick={() => navigate('/library')}
          title={sidebarExpanded ? undefined : "Back to Library"}
          className={classNames(
            "flex items-center gap-2.5 px-2.5 py-2 text-sm font-medium text-text-muted hover:text-text transition-colors group",
            !sidebarExpanded && "justify-center size-11 px-0"
          )}
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          {sidebarExpanded && <span>Back to Library</span>}
        </button>

        {sidebarExpanded && (
          <div className="px-2.5 py-2">
            <h2 className="text-sm font-black text-text uppercase tracking-wider line-clamp-2">
              {currentBook.title}
            </h2>
            <p className="text-xs text-text-muted mt-1">{currentBook.author}</p>
          </div>
        )}

        <div className="grid gap-1">
          {sidebarExpanded && (
            <div className="px-2.5 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-text-muted/50">
              Chapters
            </div>
          )}
          {currentBook.chapters?.map((chapter, index) => (
            <button
              key={chapter.id}
              onClick={() => setCurrentChapterIndex(index)}
              title={sidebarExpanded ? undefined : `Chapter ${chapter.chapterNumber}: ${chapter.title}`}
              className={classNames(
                'flex min-h-10 items-center gap-2.5 rounded-md border-0 bg-transparent px-2.5 text-sm font-medium transition-all duration-200 text-left',
                index === currentChapterIndex
                  ? 'bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] text-primary font-bold shadow-sm'
                  : 'text-text-muted hover:bg-[color-mix(in_srgb,var(--color-surface-muted)_50%,transparent)] hover:text-text',
                !sidebarExpanded && 'justify-center size-11 px-0'
              )}
            >
              {sidebarExpanded ? (
                <div className="grid gap-0.5 overflow-hidden">
                  <span className="text-[10px] uppercase opacity-60 tracking-tight">Chapter {chapter.chapterNumber}</span>
                  <span className="truncate text-[13px]">{chapter.title}</span>
                </div>
              ) : (
                <span className="text-xs font-bold">{chapter.chapterNumber}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }, [currentBook, currentChapterIndex, navigate, sidebarExpanded]);

  useEffect(() => {
    setContextualSidebar(sidebarContent);
    return () => setContextualSidebar(null);
  }, [sidebarContent, setContextualSidebar]);

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

  return (
    <div className="max-w-3xl mx-auto">
      {currentChapter ? (
        <>
          <article className="bg-surface/80 rounded-3xl border border-border/50 p-8 md:p-12 shadow-sm min-h-[calc(100vh-12rem)]">
            <header className="mb-12 pb-8 border-b border-border/40">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.15em] text-primary mb-6">
                Chapter {currentChapter.chapterNumber}
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-text leading-tight tracking-tight">
                {currentChapter.title}
              </h1>
            </header>

            <div className="prose prose-readaloud max-w-none">
              {isChapterLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                  <Spinner size="md" />
                  <p className="text-sm text-text-muted font-medium animate-pulse">Loading chapter content...</p>
                </div>
              ) : (
                currentChapter.paragraphs?.map((paragraph: any) => (
                  <p
                    key={paragraph.id}
                    className="text-text/90 leading-[1.8] mb-8 text-xl font-medium tracking-tight"
                  >
                    {paragraph.text}
                  </p>
                ))
              )}
            </div>
          </article>

          <div className="flex items-center justify-between mt-12 mb-20 px-4">
            <button
              onClick={() => {
                setCurrentChapterIndex((prev) => prev - 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={!canGoPrevious}
              className="group flex flex-col items-start gap-1 text-left disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-text-muted group-hover:text-primary transition-colors">Previous</span>
              <div className="flex items-center gap-2 text-text font-bold">
                <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                <span className="hidden sm:inline">Chapter {currentBook.chapters?.[currentChapterIndex - 1]?.chapterNumber}</span>
              </div>
            </button>

            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Progress</span>
              <div className="text-text font-black text-sm">
                {currentChapterIndex + 1} <span className="text-text-muted font-medium">/</span> {currentBook.chapters?.length || 0}
              </div>
            </div>

            <button
              onClick={() => {
                setCurrentChapterIndex((prev) => prev + 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={!canGoNext}
              className="group flex flex-col items-end gap-1 text-right disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-text-muted group-hover:text-primary transition-colors">Next</span>
              <div className="flex items-center gap-2 text-text font-bold">
                <span className="hidden sm:inline">Chapter {currentBook.chapters?.[currentChapterIndex + 1]?.chapterNumber}</span>
                <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-24">
          <BookOpen className="w-20 h-20 text-muted-foreground/30 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-text mb-2">No chapters available</h2>
          <p className="text-text-muted">This book doesn't seem to have any content yet.</p>
        </div>
      )}
    </div>
  );
};
