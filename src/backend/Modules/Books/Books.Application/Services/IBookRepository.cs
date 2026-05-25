using System.Net.Mime;
using Books.Domain;

namespace Books.Application.Services;

public interface IBookRepository {
    Task<Book> AddAsync(Book book);
    Task<string> AddCoverImage(int bookId, byte[] image);
    Task<Book> GetByIdAsync(int id);
    Task<Book?> GetMetadataByIdAsync(int id);
    Task<List<Book>> GetAllMetadataAsync();
    Task<Chapter?> GetChapterAsync(int bookId, int chapterNumber);
    Task UpdateAsync(Book book);
    Task DeleteAsync(int id);
}