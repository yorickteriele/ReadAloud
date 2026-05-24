using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Identity.Infrastructure.Data;

public sealed class IdentityDbContextFactory : IDesignTimeDbContextFactory<IdentityDbContext>
{
    public IdentityDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<IdentityDbContext>();
        var migrationsAssembly = typeof(IdentityDbContext).Assembly.GetName().Name
            ?? throw new InvalidOperationException("Identity migrations assembly name could not be determined.");

        optionsBuilder.UseNpgsql(GetConnectionString(), npgsql =>
        {
            npgsql.MigrationsAssembly(migrationsAssembly);
            npgsql.MigrationsHistoryTable(HistoryRepository.DefaultTableName, IdentityDbContext.Schema);
        });

        return new IdentityDbContext(optionsBuilder.Options);
    }

    private static string GetConnectionString()
    {
        return Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
            ?? "Host=localhost;Port=5432;Database=ReadAloudDb;Username=postgres;Password=postgres;";
    }
}
