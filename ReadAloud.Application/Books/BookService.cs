using Microsoft.Extensions.Logging;
using ReadAloud.Application.Authentication;
using ReadAloud.Application.Books.Parsing;
using ReadAloud.Domain;

namespace ReadAloud.Application.Books;

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
                book.Title = title;
            }
            if (string.IsNullOrWhiteSpace(book.Author)) {
                book.Author = author;
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

    private async Task<byte[]> GetCoverImageAsync(Stream fileStream) {
        var epubBook = await VersOne.Epub.EpubReader.ReadBookAsync(fileStream);
        return epubBook.CoverImage;
    }
}