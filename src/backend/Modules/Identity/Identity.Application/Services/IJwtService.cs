using System.Security.Claims;
using Identity.Domain;

namespace Identity.Application.Services;

public interface IJwtService
{
    Task<string> GenerateTokenAsync(ApplicationUser user);
    ClaimsPrincipal GetPrincipalFromToken(string token);
}
