using System.Reflection;
using Host.Modularity;
using Host.Routing;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Mvc.ApplicationModels;
using Microsoft.AspNetCore.Mvc.ApplicationParts;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi;
using Module.Abstractions;

var builder = WebApplication.CreateBuilder(args);
var modules = ModuleLoader.LoadModules();

builder.Services.AddHealthChecks();

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders =
        ForwardedHeaders.XForwardedFor |
        ForwardedHeaders.XForwardedProto |
        ForwardedHeaders.XForwardedHost;
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
});

const string CorsPolicy = "ReadAloudCors";
var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>()
    ?? (builder.Configuration["AllowedOrigins"] ?? string.Empty)
        .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

builder.Services.AddCors(options =>
{
    options.AddPolicy(CorsPolicy, policy =>
    {
        if (allowedOrigins.Length > 0)
        {
            policy.SetIsOriginAllowed(origin => IsAllowedOrigin(origin, allowedOrigins))
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        }
        else
        {
            policy.AllowAnyOrigin()
                .AllowAnyHeader()
                .AllowAnyMethod();
        }
    });
});

var mvcBuilder = builder.Services.AddControllers(options =>
{
    options.Conventions.Add(new RouteTokenTransformerConvention(new LowercaseRouteTokenTransformer()));
});

foreach (var moduleAssembly in modules.Select(module => module.GetType().Assembly).Distinct())
{
    mvcBuilder.PartManager.ApplicationParts.Add(new AssemblyPart(moduleAssembly));
}

foreach (var module in modules)
{
    module.RegisterServices(builder.Services, builder.Configuration);
}

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "ReadAloud API",
        Version = "v1"
    });

    foreach (var module in modules)
    {
        options.SwaggerDoc(module.ApiGroupName, new OpenApiInfo
        {
            Title = $"{module.Name} API",
            Version = "v1"
        });
    }

    options.DocInclusionPredicate((docName, apiDescription) =>
    {
        if (string.Equals(docName, "v1", StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        return string.Equals(apiDescription.GroupName, docName, StringComparison.OrdinalIgnoreCase);
    });

    options.CustomOperationIds(apiDescription =>
    {
        var routeValues = apiDescription.ActionDescriptor.RouteValues;
        if (routeValues.TryGetValue("action", out var actionName) && !string.IsNullOrWhiteSpace(actionName))
        {
            return ToCamelCase(actionName);
        }

        var method = apiDescription.HttpMethod?.ToLowerInvariant() ?? "request";
        var relativePath = apiDescription.RelativePath ?? "endpoint";
        return ToCamelCase($"{method}-{relativePath}");
    });
});

var app = builder.Build();

if (ShouldApplyModuleMigrationsOnStartup(app.Configuration))
{
    await ApplyModuleMigrationsAsync(app.Services, app.Lifetime.ApplicationStopping);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.DocumentTitle = "ReadAloud OpenAPI";
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "ReadAloud API v1");

        foreach (var module in modules)
        {
            options.SwaggerEndpoint($"/swagger/{module.ApiGroupName}/swagger.json", $"{module.Name} API v1");
        }
    });
}

app.UseForwardedHeaders();
app.UseCors(CorsPolicy);

foreach (var module in modules)
{
    module.UseMiddleware(app);
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health");

foreach (var module in modules)
{
    module.MapEndpoints(app);
}

app.Run();

static bool ShouldApplyModuleMigrationsOnStartup(IConfiguration configuration)
{
    return configuration.GetValue("Database:ApplyMigrationsOnStartup", true);
}

static async Task ApplyModuleMigrationsAsync(IServiceProvider services, CancellationToken cancellationToken)
{
    await using var scope = services.CreateAsyncScope();

    var dbContexts = AppDomain.CurrentDomain.GetAssemblies()
        .Where(assembly => !assembly.IsDynamic)
        .SelectMany(assembly =>
        {
            try
            {
                return assembly.GetTypes();
            }
            catch (ReflectionTypeLoadException exception)
            {
                return exception.Types.Where(type => type is not null)!;
            }
        })
        .Where(type => type is not null
            && !type.IsAbstract
            && typeof(DbContext).IsAssignableFrom(type))
        .OfType<Type>()
        .Distinct()
        .Select(type => scope.ServiceProvider.GetService(type) as DbContext)
        .Where(dbContext => dbContext is not null)
        .Cast<DbContext>()
        .GroupBy(dbContext => dbContext.GetType())
        .Select(group => group.Single())
        .ToList();

    await DbContextMigrationOrchestrator.ApplyMigrationsAsync(dbContexts, cancellationToken);
}

static bool IsAllowedOrigin(string origin, IReadOnlyCollection<string> allowedOrigins)
{
    if (!Uri.TryCreate(origin, UriKind.Absolute, out var originUri))
    {
        return false;
    }

    foreach (var allowedOrigin in allowedOrigins)
    {
        if (!Uri.TryCreate(allowedOrigin, UriKind.Absolute, out var allowedUri))
        {
            continue;
        }

        if (originUri.Scheme != allowedUri.Scheme || originUri.Port != allowedUri.Port)
        {
            continue;
        }

        if (string.Equals(originUri.Host, allowedUri.Host, StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        if (originUri.Host.EndsWith($".{allowedUri.Host}", StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }
    }

    return false;
}

static string ToCamelCase(string value)
{
    if (string.IsNullOrWhiteSpace(value))
    {
        return "request";
    }

    var sanitized = new string(value
        .Where(character => char.IsLetterOrDigit(character) || character == '_' || character == '-')
        .ToArray());

    if (string.IsNullOrWhiteSpace(sanitized))
    {
        return "request";
    }

    var segments = sanitized
        .Split(new[] { '-', '_' }, StringSplitOptions.RemoveEmptyEntries)
        .Where(segment => !string.IsNullOrWhiteSpace(segment))
        .ToArray();

    if (segments.Length == 0)
    {
        return "request";
    }

    var firstSegment = segments[0];
    var first = char.ToLowerInvariant(firstSegment[0]) + firstSegment[1..];

    if (segments.Length == 1)
    {
        return first;
    }

    return first + string.Concat(segments.Skip(1).Select(segment => char.ToUpperInvariant(segment[0]) + segment[1..]));
}

public partial class Program;
