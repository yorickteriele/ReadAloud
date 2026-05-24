using Books.Api;
using Books.Contracts.Schema;
using Books.Infrastructure.Data;
using NUnit.Framework;

namespace Books.Tests;

public sealed class BooksModuleScaffoldTests
{
    [Test]
    public void Module_name_and_schema_follow_conventions()
    {
        var module = new BooksModule();

        Assert.Multiple(() =>
        {
            Assert.That(module.Name, Is.EqualTo("Books"));
            Assert.That(BooksSchema.Name, Is.EqualTo("books"));
            Assert.That(BooksDbContext.Schema, Is.EqualTo(BooksSchema.Name));
        });
    }
}
