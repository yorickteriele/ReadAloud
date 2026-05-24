using Books.Contracts.Schema;
using Books.Domain;
using Microsoft.EntityFrameworkCore;

namespace Books.Infrastructure.Data;

public sealed class BooksDbContext : DbContext
{
    public const string Schema = BooksSchema.Name;

    public DbSet<Book> Books { get; set; }
    public DbSet<Chapter> Chapters { get; set; }
    public DbSet<Paragraph> Paragraphs { get; set; }

    public BooksDbContext(DbContextOptions<BooksDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.HasDefaultSchema(Schema);

        modelBuilder.Entity<Book>()
            .HasMany(b => b.Chapters)
            .WithOne()
            .HasForeignKey(c => c.BookId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Chapter>()
            .HasMany(c => c.Paragraphs)
            .WithOne()
            .HasForeignKey(p => p.ChapterId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
