using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Migrations;
using Module.Abstractions;
using System.Reflection;
using System.Runtime.Loader;

LoadDotEnv();

var cancellationSource = new CancellationTokenSource();
Console.CancelKeyPress += (_, eventArgs) =>
{
    eventArgs.Cancel = true;
    cancellationSource.Cancel();
};

var targetMigration = args.Length >= 2 && args[0] == "--target" ? args[1] : null;

var connectionString = GetConnectionString();
var dbContexts = DiscoverDbContextTypes()
    .Select(dbContextType => CreateDbContext(dbContextType, connectionString))
    .ToArray();

var orderedDbContexts = DbContextMigrationOrchestrator.OrderDbContextsForMigration(dbContexts);
Console.WriteLine($"Migration order: {string.Join(" -> ", orderedDbContexts.Select(dbContext => dbContext.GetType().Name))}");

if (targetMigration is not null)
{
    Console.WriteLine($"Rollback target: {targetMigration}");
    await DbContextMigrationOrchestrator.RollbackToMigrationAsync(dbContexts, targetMigration, cancellationSource.Token);
    Console.WriteLine("Rollback completed.");
}
else
{
    foreach (var dbContext in orderedDbContexts)
    {
        var pendingMigrations = (await dbContext.Database.GetPendingMigrationsAsync(cancellationSource.Token)).ToArray();
        if (pendingMigrations.Length == 0)
        {
            Console.WriteLine($"[{dbContext.GetType().Name}] No pending migrations.");
            continue;
        }

        Console.WriteLine($"[{dbContext.GetType().Name}] Pending migrations: {string.Join(", ", pendingMigrations)}");
    }

    await DbContextMigrationOrchestrator.ApplyMigrationsAsync(orderedDbContexts, cancellationSource.Token);
    Console.WriteLine("Database migrations completed.");
}

static IReadOnlyList<Type> DiscoverDbContextTypes()
{
    var basePath = AppContext.BaseDirectory;
    var loadedAssemblies = AppDomain.CurrentDomain.GetAssemblies()
        .Where(assembly => !assembly.IsDynamic && !string.IsNullOrWhiteSpace(assembly.Location))
        .ToDictionary(assembly => Path.GetFullPath(assembly.Location), assembly => assembly, StringComparer.OrdinalIgnoreCase);

    var assemblies = Directory.GetFiles(basePath, "*.Infrastructure.dll", SearchOption.TopDirectoryOnly)
        .OrderBy(path => path, StringComparer.OrdinalIgnoreCase)
        .Select(path =>
        {
            var fullPath = Path.GetFullPath(path);
            if (loadedAssemblies.TryGetValue(fullPath, out var loadedAssembly))
            {
                return loadedAssembly;
            }

            return AssemblyLoadContext.Default.LoadFromAssemblyPath(fullPath);
        })
        .Distinct()
        .ToArray();

    return assemblies
        .SelectMany(GetLoadableTypes)
        .Where(type => !type.IsAbstract && typeof(DbContext).IsAssignableFrom(type))
        .OrderBy(type => type.FullName ?? type.Name, StringComparer.Ordinal)
        .ToArray();
}

static IEnumerable<Type> GetLoadableTypes(Assembly assembly)
{
    try
    {
        return assembly.GetTypes();
    }
    catch (ReflectionTypeLoadException exception)
    {
        return exception.Types.Where(type => type is not null)!;
    }
}

static DbContext CreateDbContext(Type dbContextType, string connectionString)
{
    var createMethod = typeof(MigrationRunnerDbContextFactory).GetMethod(
            "CreateDbContextCore",
            BindingFlags.Static | BindingFlags.NonPublic)
        ?? throw new InvalidOperationException("CreateDbContextCore method could not be found.");

    return (DbContext)(createMethod.MakeGenericMethod(dbContextType).Invoke(null, [connectionString])
        ?? throw new InvalidOperationException($"Could not create an instance of {dbContextType.Name}."));
}

static string GetConnectionString()
{
    return Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
        ?? "Host=localhost;Port=5432;Database=ReadAloudDb;Username=postgres;Password=postgres;";
}

static void LoadDotEnv()
{
    var dir = Directory.GetCurrentDirectory();
    while (!string.IsNullOrEmpty(dir))
    {
        var envPath = Path.Combine(dir, ".env");
        if (File.Exists(envPath))
        {
            foreach (var line in File.ReadAllLines(envPath))
            {
                var trimmed = line.Trim();
                if (string.IsNullOrEmpty(trimmed) || trimmed.StartsWith('#'))
                {
                    continue;
                }

                var separatorIndex = trimmed.IndexOf('=');
                if (separatorIndex <= 0)
                {
                    continue;
                }

                var key = trimmed[..separatorIndex].Trim();
                var value = trimmed[(separatorIndex + 1)..].Trim();
                if (!string.IsNullOrWhiteSpace(key) && Environment.GetEnvironmentVariable(key) is null)
                {
                    Environment.SetEnvironmentVariable(key, value);
                }
            }

            break;
        }

        dir = Directory.GetParent(dir)?.FullName ?? string.Empty;
    }
}

file static class MigrationRunnerDbContextFactory
{
    private static DbContext CreateDbContextCore<TDbContext>(string connectionString)
        where TDbContext : DbContext
    {
        var schema = GetSchema(typeof(TDbContext));
        var migrationsAssembly = typeof(TDbContext).Assembly.GetName().Name
            ?? throw new InvalidOperationException($"{typeof(TDbContext).Name} migrations assembly name could not be determined.");

        var optionsBuilder = new DbContextOptionsBuilder<TDbContext>();
        optionsBuilder.UseNpgsql(connectionString, npgsql =>
        {
            npgsql.MigrationsAssembly(migrationsAssembly);
            npgsql.MigrationsHistoryTable(HistoryRepository.DefaultTableName, schema);
        });

        return (DbContext)(Activator.CreateInstance(typeof(TDbContext), optionsBuilder.Options)
            ?? throw new InvalidOperationException($"Could not create an instance of {typeof(TDbContext).Name}."));
    }

    private static string GetSchema(Type dbContextType)
    {
        const BindingFlags Flags = BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Static | BindingFlags.FlattenHierarchy;

        var schemaField = dbContextType.GetField("Schema", Flags);
        if (schemaField?.FieldType == typeof(string))
        {
            return (string?)(schemaField.GetValue(null))
                ?? throw new InvalidOperationException($"{dbContextType.Name}.Schema is null.");
        }

        var schemaProperty = dbContextType.GetProperty("Schema", Flags);
        if (schemaProperty?.PropertyType == typeof(string))
        {
            return (string?)(schemaProperty.GetValue(null))
                ?? throw new InvalidOperationException($"{dbContextType.Name}.Schema is null.");
        }

        throw new InvalidOperationException(
            $"Could not determine the migration history schema for {dbContextType.Name}. Add a static Schema member to the DbContext.");
    }
}
