using Microsoft.EntityFrameworkCore;
using ReadAloud.Application.Books;
using ReadAloud.Domain;
using ReadAloud.Infrastructure.Data;

namespace ReadAloud.Infrastructure.Repositories;

public class BookRepository : IBookRepository {
    
    private readonly ApplicationDbContext _context;

    public BookRepository(ApplicationDbContext context) {
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
