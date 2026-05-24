using Audio.Contracts.Schema;
using Microsoft.EntityFrameworkCore;

namespace Audio.Infrastructure.Data;

public sealed class AudioDbContext : DbContext
{
    public const string Schema = AudioSchema.Name;

    public AudioDbContext(DbContextOptions<AudioDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.HasDefaultSchema(Schema);
    }
}
