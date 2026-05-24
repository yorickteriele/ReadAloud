using Audio.Api;
using Audio.Contracts.Schema;
using Audio.Infrastructure.Data;
using NUnit.Framework;

namespace Audio.Tests;

public sealed class AudioModuleScaffoldTests
{
    [Test]
    public void Module_name_and_schema_follow_conventions()
    {
        var module = new AudioModule();

        Assert.Multiple(() =>
        {
            Assert.That(module.Name, Is.EqualTo("Audio"));
            Assert.That(AudioSchema.Name, Is.EqualTo("audio"));
            Assert.That(AudioDbContext.Schema, Is.EqualTo(AudioSchema.Name));
        });
    }
}
