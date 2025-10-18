using ReadAloud.Domain;

namespace ReadAloud.Application.Books.Parsing;

public interface IParser {
    Task<(Book, byte[]?)> ParseAsync(Stream fileStream);
}