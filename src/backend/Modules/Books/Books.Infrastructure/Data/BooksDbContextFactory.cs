using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Books.Infrastructure.Data;

public sealed class BooksDbContextFactory : IDesignTimeDbContextFactory<BooksDbContext>
{
    public BooksDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<BooksDbContext>();
        var migrationsAssembly = typeof(BooksDbContext).Assembly.GetName().Name
            ?? throw new InvalidOperationException("Books migrations assembly name could not be determined.");

        optionsBuilder.UseNpgsql(GetConnectionString(), npgsql =>
        {
            npgsql.MigrationsAssembly(migrationsAssembly);
            npgsql.MigrationsHistoryTable(HistoryRepository.DefaultTableName, BooksDbContext.Schema);
        });

        return new BooksDbContext(optionsBuilder.Options);
    }

    private static string GetConnectionString()
    {
        return Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
            ?? "Host=localhost;Port=5432;Database=ReadAloudDb;Username=postgres;Password=postgres;";
    }
}
