using Identity.Api;
using Identity.Contracts.Schema;
using Identity.Infrastructure.Data;
using NUnit.Framework;

namespace Identity.Tests;

public sealed class IdentityModuleScaffoldTests
{
    [Test]
    public void Module_name_and_schema_follow_conventions()
    {
        var module = new IdentityModule();

        Assert.Multiple(() =>
        {
            Assert.That(module.Name, Is.EqualTo("Identity"));
            Assert.That(IdentitySchema.Name, Is.EqualTo("identity"));
            Assert.That(IdentityDbContext.Schema, Is.EqualTo(IdentitySchema.Name));
        });
    }
}
