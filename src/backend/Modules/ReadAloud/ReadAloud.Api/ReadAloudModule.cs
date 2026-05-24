using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Module.Abstractions;
using ReadAloud.Application.Audio;
using ReadAloud.Application.Authentication;
using ReadAloud.Application.Books;
using ReadAloud.Application.Books.Parsing;
using ReadAloud.Domain;
using ReadAloud.Infrastructure.Data;
using ReadAloud.Infrastructure.Repositories;

namespace ReadAloud.Api;

public sealed class ReadAloudModule : DbContextModuleBase<ApplicationDbContext>
{
    protected override string Schema => ApplicationDbContext.Schema;

    protected override void RegisterModuleServices(IServiceCollection services, IConfiguration configuration)
    {
        services.AddIdentity<ApplicationUser, IdentityRole>()
            .AddEntityFrameworkStores<ApplicationDbContext>()
            .AddDefaultTokenProviders();

        var jwtSettings = configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["Key"];
        if (string.IsNullOrWhiteSpace(secretKey))
        {
            throw new InvalidOperationException("JwtSettings:Key must be configured.");
        }

        services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = "Bearer";
                options.DefaultChallengeScheme = "Bearer";
            })
            .AddJwtBearer("Bearer", options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtSettings["Issuer"],
                    ValidAudience = jwtSettings["Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
                    ClockSkew = TimeSpan.Zero
                };
            });

        services.AddScoped<AudioService>();
        services.AddScoped<AuthenticationService>();
        services.AddScoped<BookService>();
        services.AddScoped<IJwtService, JwtService>();
        services.AddScoped<IAuthenticationRepository, AuthenticationRepository>();
        services.AddScoped<IBookRepository, BookRepository>();
        services.AddScoped<IParser, Parser>();
        services.AddHttpClient<IAudioRepository, ChatterBoxAudioRepository>();
    }
}
