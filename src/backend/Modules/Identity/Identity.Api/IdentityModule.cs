using System.Text;
using Identity.Application.Services;
using Identity.Application.Services;
using Identity.Domain;
using Identity.Infrastructure.Data;
using Identity.Infrastructure.Repositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Module.Abstractions;

namespace Identity.Api;

public sealed class IdentityModule : DbContextModuleBase<IdentityDbContext>
{
    protected override string Schema => IdentityDbContext.Schema;

    protected override void RegisterModuleServices(IServiceCollection services, IConfiguration configuration)
    {
        services.AddIdentity<ApplicationUser, IdentityRole>()
            .AddEntityFrameworkStores<IdentityDbContext>()
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

        services.AddScoped<AuthenticationService>();
        services.AddScoped<IJwtService, JwtService>();
        services.AddScoped<IAuthenticationRepository, AuthenticationRepository>();
    }
}
