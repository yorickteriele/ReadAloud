using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Identity.Domain;

namespace Identity.Application.Services;

public interface IAuthenticationRepository {
    public Task<ApplicationUser?> FindUserByEmailOrUsernameAsync(string emailOrUsername);
    public Task<bool> CheckPasswordAsync(ApplicationUser user, string password);
    public Task<IdentityResult> CreateUserAsync(ApplicationUser user, string password);
    public Task<ApplicationUser?> GetUserAsync(ClaimsPrincipal userClaims);
}