using Microsoft.Extensions.Logging;
using Books.Application.Parsing;
using Books.Domain;

namespace Books.Application.Services;

public class BookService {

    private readonly IBookRepository _bookRepository;
    private readonly IParser _parser;
    private readonly ILogger<BookService> _logger;

    public BookService(IBookRepository bookRepository, IParser parser, ILogger<BookService> logger) {
        _bookRepository = bookRepository;
        _parser = parser;
        _logger = logger;
    }

    public async Task<Book> UploadBook(Stream fileStream, string? title, string? author, string launguageId) {
        try {
            _logger.LogInformation("Starting book upload for file: {title}", title);

            var (book, coverImage) = await _parser.ParseAsync(fileStream);
            
            if (string.IsNullOrWhiteSpace(book.Title)) {
                book.Title = title ?? "Untitled";
            }
            if (string.IsNullOrWhiteSpace(book.Author)) {
                book.Author = author ?? "Unknown Author";
            }
            if (!string.IsNullOrWhiteSpace(launguageId)) {
                book.LaungaugeId = launguageId;
            }

            if (book.Chapters != null && book.Chapters.Count > 0) {
                for (int i = 0; i < book.Chapters.Count; i++) {
                    var chapter = book.Chapters[i];
                    chapter.ChapterNumber = i + 1;

                    if (chapter.Paragraphs != null && chapter.Paragraphs.Count > 0) {
                        for (int j = 0; j < chapter.Paragraphs.Count; j++) {
                            var paragraph = chapter.Paragraphs[j];
                            paragraph.ParagraphNumber = j + 1;
                        }
                    }
                }
            }

            var savedBook = await _bookRepository.AddAsync(book);

            // Save cover image if available
            if (coverImage != null && coverImage.Length > 0) {
                await _bookRepository.AddCoverImage(savedBook.Id, coverImage);
                _logger.LogInformation("Successfully saved cover image for book ID: {BookId}", savedBook.Id);
            }

            _logger.LogInformation("Successfully uploaded book with ID: {BookId}, Title: {Title}, Chapters: {ChapterCount}", 
                savedBook.Id, savedBook.Title, savedBook.Chapters?.Count ?? 0);

            return savedBook;
        }
        catch (Exception ex) {
            _logger.LogError(ex, "Error uploading book: {title}", title);
            throw;
        }
    }

    /// <summary>
    /// Get all books
    /// </summary>
    public async Task<List<Book>> GetAllBooksAsync() {
        try {
            var books = await _bookRepository.GetAllMetadataAsync();
            _logger.LogInformation("Retrieved {BookCount} books metadata", books.Count);
            return books;
        }
        catch (Exception ex) {
            _logger.LogError(ex, "Error retrieving all books");
            throw;
        }
    }

    /// <summary>
    /// Get a specific book metadata by ID (includes chapter titles but no paragraphs)
    /// </summary>
    public async Task<Book?> GetBookMetadataByIdAsync(int id) {
        try {
            var book = await _bookRepository.GetMetadataByIdAsync(id);
            if (book != null) {
                _logger.LogInformation("Retrieved book metadata with ID: {BookId}, Title: {Title}", id, book.Title);
            } else {
                _logger.LogWarning("Book not found with ID: {BookId}", id);
            }
            return book;
        }
        catch (Exception ex) {
            _logger.LogError(ex, "Error retrieving book metadata with ID: {BookId}", id);
            throw;
        }
    }

    /// <summary>
    /// Get a specific chapter by book ID and chapter number
    /// </summary>
    public async Task<Chapter?> GetChapterAsync(int bookId, int chapterNumber) {
        try {
            var chapter = await _bookRepository.GetChapterAsync(bookId, chapterNumber);
            if (chapter != null) {
                _logger.LogInformation("Retrieved chapter {ChapterNumber} for book {BookId}", chapterNumber, bookId);
            }
            return chapter;
        }
        catch (Exception ex) {
            _logger.LogError(ex, "Error retrieving chapter {ChapterNumber} for book {BookId}", chapterNumber, bookId);
            throw;
        }
    }

    /// <summary>
    /// Get a specific book by ID
    /// </summary>
    public async Task<Book?> GetBookByIdAsync(int id) {
        try {
            var book = await _bookRepository.GetByIdAsync(id);
            if (book != null) {
                _logger.LogInformation("Retrieved book with ID: {BookId}, Title: {Title}", id, book.Title);
            } else {
                _logger.LogWarning("Book not found with ID: {BookId}", id);
            }
            return book;
        }
        catch (Exception ex) {
            _logger.LogError(ex, "Error retrieving book with ID: {BookId}", id);
            throw;
        }
    }

    /// <summary>
    /// Delete a book by ID
    /// </summary>
    public async Task DeleteBookAsync(int id) {
        try {
            await _bookRepository.DeleteAsync(id);
            _logger.LogInformation("Successfully deleted book with ID: {BookId}", id);
        }
        catch (Exception ex) {
            _logger.LogError(ex, "Error deleting book with ID: {BookId}", id);
            throw;
        }
    }

    private async Task<byte[]?> GetCoverImageAsync(Stream fileStream) {
        var epubBook = await VersOne.Epub.EpubReader.ReadBookAsync(fileStream);
        return epubBook.CoverImage;
    }
}