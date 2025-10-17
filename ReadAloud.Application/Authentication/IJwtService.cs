using System.Security.Claims;
using ReadAloud.Domain;

namespace ReadAloud.Application.Authentication;

public interface IJwtService
{
    Task<string> GenerateTokenAsync(ApplicationUser user);
    ClaimsPrincipal GetPrincipalFromToken(string token);
}
