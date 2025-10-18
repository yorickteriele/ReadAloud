using System.Net.Mime;
using ReadAloud.Domain;

namespace ReadAloud.Application.Books;

public interface IBookRepository {
    Task<Book> AddAsync(Book book);
    Task<string> AddCoverImage(int bookId, byte[] image);
    Task<Book> GetByIdAsync(int id);
    Task UpdateAsync(Book book);
    Task DeleteAsync(int id);
}