using Microsoft.EntityFrameworkCore;
using Books.Application.Services;
using Books.Domain;
using Books.Infrastructure.Data;

namespace Books.Infrastructure.Repositories;

public class BookRepository : IBookRepository {
    
    private readonly BooksDbContext _context;

    public BookRepository(BooksDbContext context) {
        _context = context;
    }

    public async Task<Book> AddAsync(Book book) {
        if (book == null) {
            throw new ArgumentNullException(nameof(book));
        }

        // Add the book and all its related entities
        await _context.Books.AddAsync(book);
        await _context.SaveChangesAsync();

        return book;
    }

    public async Task<string> AddCoverImage(int bookId, byte[] image) {
        if (image == null || image.Length == 0) {
            throw new ArgumentNullException(nameof(image));
        }

        string baseDirectory = Path.Combine(Directory.GetCurrentDirectory(), "BookData", bookId.ToString(), "CoverImage");
        Directory.CreateDirectory(baseDirectory);

        string imagePath = Path.Combine(baseDirectory, "image.jpg");
        await File.WriteAllBytesAsync(imagePath, image);

        string relativePath = Path.Combine("BookData", bookId.ToString(), "CoverImage", "image.jpg").Replace("\\", "/");

        var book = await _context.Books.FindAsync(bookId);
        if (book != null) {
            book.CoverImagePath = relativePath;
            _context.Books.Update(book);
            await _context.SaveChangesAsync();
        }

        return relativePath;
    }

    public async Task<Book> GetByIdAsync(int id) {
        return await _context.Books
            .Include(b => b.Chapters)
            .ThenInclude(c => c.Paragraphs)
            .FirstOrDefaultAsync(b => b.Id == id) ?? throw new KeyNotFoundException($"Book with ID {id} not found");
    }

    public async Task<Book?> GetMetadataByIdAsync(int id) {
        return await _context.Books
            .Include(b => b.Chapters)
            .Select(b => new Book {
                Id = b.Id,
                Title = b.Title,
                Author = b.Author,
                LaungaugeId = b.LaungaugeId,
                CoverImagePath = b.CoverImagePath,
                Chapters = b.Chapters.Select(c => new Chapter {
                    Id = c.Id,
                    BookId = c.BookId,
                    ChapterNumber = c.ChapterNumber,
                    Title = c.Title,
                    Paragraphs = new List<Paragraph>() // No paragraphs
                }).OrderBy(c => c.ChapterNumber).ToList()
            })
            .FirstOrDefaultAsync(b => b.Id == id);
    }

    public async Task<List<Book>> GetAllMetadataAsync() {
        return await _context.Books
            .AsNoTracking()
            .Select(b => new Book {
                Id = b.Id,
                Title = b.Title,
                Author = b.Author,
                LaungaugeId = b.LaungaugeId,
                CoverImagePath = b.CoverImagePath,
                Chapters = new List<Chapter>() 
            })
            .OrderByDescending(b => b.Id)
            .ToListAsync();
    }

    public async Task<Chapter?> GetChapterAsync(int bookId, int chapterNumber) {
        return await _context.Chapters
            .Include(c => c.Paragraphs)
            .FirstOrDefaultAsync(c => c.BookId == bookId && c.ChapterNumber == chapterNumber);
    }

    public async Task<List<Book>> GetAllAsync() {
        return await _context.Books
            .Include(b => b.Chapters)
            .ThenInclude(c => c.Paragraphs)
            .OrderByDescending(b => b.Id)
            .ToListAsync();
    }

    public async Task UpdateAsync(Book book) {
        if (book == null) {
            throw new ArgumentNullException(nameof(book));
        }

        _context.Books.Update(book);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id) {
        var book = await GetByIdAsync(id);
        if (book != null) {
            _context.Books.Remove(book);
            await _context.SaveChangesAsync();
        }
    }
}
