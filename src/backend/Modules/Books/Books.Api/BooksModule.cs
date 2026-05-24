using Books.Application.Parsing;
using Books.Application.Services;
using Books.Infrastructure.Data;
using Books.Infrastructure.Repositories;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Module.Abstractions;

namespace Books.Api;

public sealed class BooksModule : DbContextModuleBase<BooksDbContext>
{
    protected override string Schema => BooksDbContext.Schema;

    protected override void RegisterModuleServices(IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<BookService>();
        services.AddScoped<IBookRepository, BookRepository>();
        services.AddScoped<IParser, Parser>();
    }
}
