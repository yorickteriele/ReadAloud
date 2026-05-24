using Microsoft.Extensions.Logging;
using Books.Contracts.Services;

namespace Books.Application.Services;

public sealed class BooksService(ILogger<BooksService> logger) : IBooksService
{
}
