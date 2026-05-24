using Books.Domain;

namespace Books.Application.Parsing;

public interface IParser {
    Task<(Book, byte[]?)> ParseAsync(Stream fileStream);
}