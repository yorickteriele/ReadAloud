using Audio.Application.Services;
using Audio.Infrastructure.Data;
using Audio.Infrastructure.Repositories;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Module.Abstractions;

namespace Audio.Api;

public sealed class AudioModule : DbContextModuleBase<AudioDbContext>
{
    protected override string Schema => AudioDbContext.Schema;

    protected override void RegisterModuleServices(IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<AudioService>();
        services.AddHttpClient<IAudioRepository, ChatterBoxAudioRepository>();
    }
}
