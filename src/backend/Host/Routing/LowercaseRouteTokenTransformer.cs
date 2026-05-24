using Microsoft.AspNetCore.Routing;

namespace Host.Routing;

public sealed class LowercaseRouteTokenTransformer : IOutboundParameterTransformer
{
    public string? TransformOutbound(object? value)
    {
        return value?.ToString()?.ToLowerInvariant();
    }
}
