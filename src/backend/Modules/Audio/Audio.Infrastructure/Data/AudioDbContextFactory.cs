using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Audio.Infrastructure.Data;

public sealed class AudioDbContextFactory : IDesignTimeDbContextFactory<AudioDbContext>
{
    public AudioDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<AudioDbContext>();
        var migrationsAssembly = typeof(AudioDbContext).Assembly.GetName().Name
            ?? throw new InvalidOperationException("Audio migrations assembly name could not be determined.");

        optionsBuilder.UseNpgsql(GetConnectionString(), npgsql =>
        {
            npgsql.MigrationsAssembly(migrationsAssembly);
            npgsql.MigrationsHistoryTable(HistoryRepository.DefaultTableName, AudioDbContext.Schema);
        });

        return new AudioDbContext(optionsBuilder.Options);
    }

    private static string GetConnectionString()
    {
        return Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
            ?? "Host=localhost;Port=5432;Database=ReadAloudDb;Username=postgres;Password=postgres;";
    }
}
