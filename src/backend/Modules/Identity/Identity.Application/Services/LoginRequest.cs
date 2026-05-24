namespace Identity.Application.Services;

public class LoginRequest {
    public required string EmailOrUsername { get; set; }
    public required string Password { get; set; }
}