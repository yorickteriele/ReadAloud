using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage;

namespace Module.Abstractions;

public static class DbContextMigrationOrchestrator
{
    public static IReadOnlyList<DbContext> OrderDbContextsForMigration(IReadOnlyCollection<DbContext> dbContexts)
    {
        var contextsByType = dbContexts.ToDictionary(dbContext => dbContext.GetType());
        var managedTables = dbContexts.ToDictionary(
            dbContext => dbContext.GetType(),
            dbContext => GetManagedTables(dbContext).ToHashSet());

        var tableOwners = managedTables
            .SelectMany(pair => pair.Value.Select(table => new { Owner = pair.Key, Table = table }))
            .GroupBy(entry => entry.Table)
            .ToDictionary(group => group.Key, group => group.First().Owner);

        var dependencyMap = dbContexts.ToDictionary(
            dbContext => dbContext.GetType(),
            dbContext => GetMigrationDependencies(dbContext, tableOwners));

        var dependentsMap = dependencyMap.ToDictionary(pair => pair.Key, _ => new HashSet<Type>());
        var remainingDependencyCounts = dependencyMap.ToDictionary(pair => pair.Key, pair => pair.Value.Count);

        foreach (var (dbContextType, dependencies) in dependencyMap)
        {
            foreach (var dependency in dependencies)
            {
                dependentsMap[dependency].Add(dbContextType);
            }
        }

        var ready = new SortedSet<Type>(Comparer<Type>.Create((left, right) =>
            StringComparer.Ordinal.Compare(left!.FullName ?? left.Name, right!.FullName ?? right.Name)));

        foreach (var (dbContextType, remainingDependencyCount) in remainingDependencyCounts)
        {
            if (remainingDependencyCount == 0)
            {
                ready.Add(dbContextType);
            }
        }

        var orderedDbContexts = new List<DbContext>(dbContexts.Count);

        while (ready.Count > 0)
        {
            var nextDbContextType = ready.Min!;
            ready.Remove(nextDbContextType);
            orderedDbContexts.Add(contextsByType[nextDbContextType]);

            foreach (var dependent in dependentsMap[nextDbContextType])
            {
                remainingDependencyCounts[dependent]--;
                if (remainingDependencyCounts[dependent] == 0)
                {
                    ready.Add(dependent);
                }
            }
        }

        if (orderedDbContexts.Count == dbContexts.Count)
        {
            return orderedDbContexts;
        }

        foreach (var remainingType in contextsByType.Keys
            .Except(orderedDbContexts.Select(dbContext => dbContext.GetType()))
            .OrderBy(type => type.FullName ?? type.Name, StringComparer.Ordinal))
        {
            orderedDbContexts.Add(contextsByType[remainingType]);
        }

        return orderedDbContexts;
    }

    public static async Task RollbackToMigrationAsync(
        IReadOnlyCollection<DbContext> dbContexts,
        string targetMigration,
        CancellationToken cancellationToken)
    {
        // Reverse the apply order: roll back dependents before their dependencies
        var ordered = OrderDbContextsForMigration(dbContexts).Reverse();

        foreach (var dbContext in ordered)
        {
            if (!dbContext.Database.GetMigrations().Contains(targetMigration, StringComparer.OrdinalIgnoreCase))
                continue;

            var applied = (await dbContext.Database.GetAppliedMigrationsAsync(cancellationToken)).ToList();
            if (!applied.Any(m => StringComparer.OrdinalIgnoreCase.Compare(m, targetMigration) > 0))
            {
                Console.WriteLine($"[{dbContext.GetType().Name}] Already at or before {targetMigration}, skipping.");
                continue;
            }

            Console.WriteLine($"[{dbContext.GetType().Name}] Rolling back to: {targetMigration}");
            var migrator = dbContext.GetService<IMigrator>();
            await migrator.MigrateAsync(targetMigration, cancellationToken);
            Console.WriteLine($"[{dbContext.GetType().Name}] Rollback complete.");
        }
    }

    public static async Task ApplyMigrationsAsync(IReadOnlyCollection<DbContext> dbContexts, CancellationToken cancellationToken)
    {
        foreach (var dbContext in OrderDbContextsForMigration(dbContexts))
        {
            if (!dbContext.Database.GetMigrations().Any())
            {
                var databaseCreator = dbContext.Database.GetService<IRelationalDatabaseCreator>();

                if (!await databaseCreator.ExistsAsync(cancellationToken))
                {
                    await databaseCreator.CreateAsync(cancellationToken);
                }

                if (!await AreAllManagedTablesPresentAsync(dbContext, cancellationToken))
                {
                    await databaseCreator.CreateTablesAsync(cancellationToken);
                }

                continue;
            }

            await dbContext.Database.MigrateAsync(cancellationToken);
        }
    }

    private static HashSet<Type> GetMigrationDependencies(
        DbContext dbContext,
        IReadOnlyDictionary<(string Schema, string Table), Type> tableOwners)
    {
        var dbContextType = dbContext.GetType();
        var dependencies = new HashSet<Type>();
        var model = GetMigrationModel(dbContext);

        foreach (var entityType in model.GetEntityTypes())
        {
            if (entityType.IsTableExcludedFromMigrations())
            {
                continue;
            }

            foreach (var foreignKey in entityType.GetForeignKeys())
            {
                var principalTableName = foreignKey.PrincipalEntityType.GetTableName();
                if (string.IsNullOrWhiteSpace(principalTableName))
                {
                    continue;
                }

                var principalSchema = foreignKey.PrincipalEntityType.GetSchema() ?? "public";
                if (!tableOwners.TryGetValue((principalSchema, principalTableName), out var ownerType))
                {
                    continue;
                }

                if (ownerType != dbContextType)
                {
                    dependencies.Add(ownerType);
                }
            }
        }

        return dependencies;
    }

    private static IEnumerable<(string Schema, string Table)> GetManagedTables(DbContext dbContext)
    {
        return GetMigrationModel(dbContext).GetEntityTypes()
            .Where(entityType => !entityType.IsTableExcludedFromMigrations())
            .Select(entityType => new
            {
                Schema = entityType.GetSchema() ?? "public",
                Table = entityType.GetTableName()
            })
            .Where(table => !string.IsNullOrWhiteSpace(table.Table))
            .Select(table => (table.Schema, table.Table!))
            .Distinct();
    }

    private static IModel GetMigrationModel(DbContext dbContext)
    {
        return dbContext.GetService<IDesignTimeModel>().Model;
    }

    private static async Task<bool> AreAllManagedTablesPresentAsync(DbContext dbContext, CancellationToken cancellationToken)
    {
        var mappedTables = GetManagedTables(dbContext).ToList();

        if (mappedTables.Count == 0)
        {
            return true;
        }

        var connection = dbContext.Database.GetDbConnection();
        var shouldCloseConnection = connection.State == System.Data.ConnectionState.Closed;

        if (shouldCloseConnection)
        {
            await connection.OpenAsync(cancellationToken);
        }

        try
        {
            foreach (var mappedTable in mappedTables)
            {
                await using var command = connection.CreateCommand();
                command.CommandText = """
                    select exists (
                        select 1
                        from information_schema.tables
                        where table_schema = @schema
                          and table_name = @tableName
                    )
                    """;

                var schemaParameter = command.CreateParameter();
                schemaParameter.ParameterName = "schema";
                schemaParameter.Value = mappedTable.Schema;
                command.Parameters.Add(schemaParameter);

                var tableParameter = command.CreateParameter();
                tableParameter.ParameterName = "tableName";
                tableParameter.Value = mappedTable.Table;
                command.Parameters.Add(tableParameter);

                var result = await command.ExecuteScalarAsync(cancellationToken);
                if (result is not bool exists || !exists)
                {
                    return false;
                }
            }

            return true;
        }
        finally
        {
            if (shouldCloseConnection)
            {
                await connection.CloseAsync();
            }
        }
    }
}
