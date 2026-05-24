FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY src/backend .
RUN dotnet restore "Host/Host.csproj"
RUN dotnet restore "MigrationRunner/MigrationRunner.csproj"
RUN dotnet build "Host/Host.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Host/Host.csproj" -c Release -o /app/publish/host
RUN dotnet publish "MigrationRunner/MigrationRunner.csproj" -c Release -o /app/publish/migration-runner

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:5001

RUN useradd -m -u 1001 appuser && chown -R appuser /app

COPY --from=publish /app/publish/host .
COPY --from=publish /app/publish/migration-runner ./migration-runner

EXPOSE 5001

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://127.0.0.1:5001/health || exit 1

USER appuser

CMD ["sh", "-c", "dotnet migration-runner/MigrationRunner.dll && dotnet Host.dll"]
