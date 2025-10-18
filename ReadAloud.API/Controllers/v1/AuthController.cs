using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using ReadAloud.Application.Authentication;
using ReadAloud.API.DTOs;
using AuthenticationService = ReadAloud.Application.Authentication.AuthenticationService;
using LoginRequest = ReadAloud.Application.Authentication.LoginRequest;
using RegisterRequest = ReadAloud.Application.Authentication.RegisterRequest;

namespace ReadAloud.API.Controllers;

[ApiController]
[Route("/api/v1/[controller]")]
/// <summary>
/// Controller responsible for handling user authentication operations including registration, login, and logout.
/// </summary>
public class AuthController : ControllerBase
{
    private readonly AuthenticationService _authService;
    private readonly IJwtService _jwtService;
    private readonly ILogger<AuthController> _logger;

    /// <summary>
    /// Initializes a new instance of the AuthController.
    /// </summary>
    /// <param name="authService">Service for handling core authentication operations</param>
    /// <param name="jwtService">Service for JWT token generation and validation</param>
    /// <param name="logger">Logger for authentication events</param>
    public AuthController(
        AuthenticationService authService,
        IJwtService jwtService,
        ILogger<AuthController> logger)
    {
        _authService = authService;
        _jwtService = jwtService;
        _logger = logger;
    }

    /// <summary>
    /// Registers a new user in the system.
    /// </summary>
    /// <param name="registerDto">The registration details including username, email, and password</param>
    /// <returns>Authentication response containing JWT token if registration is successful</returns>
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto registerDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new AuthResponseDto 
            { 
                Success = false, 
                Message = "Invalid data provided" 
            });
        }

        var registerRequest = new RegisterRequest
        {
            Username = registerDto.Username,
            Email = registerDto.Email,
            PhoneNumber = registerDto.PhoneNumber,
            Password = registerDto.Password
        };

        var result = await _authService.RegisterAsync(registerRequest);

        if (result.Result.Succeeded && result.User != null)
        {
            var token = await _jwtService.GenerateTokenAsync(result.User);
            
            return Ok(new AuthResponseDto
            {
                Success = true,
                Message = "Registration successful",
                Token = token,
                User = new UserDto
                {
                    Id = result.User.Id,
                    Username = result.User.UserName!,
                    Email = result.User.Email!
                }
            });
        }

        var errors = string.Join(", ", result.Result.Errors.Select(e => e.Description));
        return BadRequest(new AuthResponseDto 
        { 
            Success = false, 
            Message = errors 
        });
    }

    /// <summary>
    /// Authenticates a user and provides a JWT token for subsequent requests.
    /// </summary>
    /// <param name="loginDto">The login credentials including email/username and password</param>
    /// <returns>Authentication response containing JWT token if login is successful</returns>
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginDto loginDto)
    {
        _logger.LogInformation("Login attempt for: {EmailOrUsername}", loginDto.EmailOrUsername);
        
        if (!ModelState.IsValid)
        {
            _logger.LogWarning("Login failed: Invalid model state");
            return BadRequest(new AuthResponseDto 
            { 
                Success = false, 
                Message = "Invalid data provided" 
            });
        }

        var loginRequest = new LoginRequest
        {
            EmailOrUsername = loginDto.EmailOrUsername,
            Password = loginDto.Password
        };

        try 
        {
            _logger.LogInformation("Attempting to authenticate user via AuthService");
            var user = await _authService.LoginAsync(loginRequest);

            if (user != null)
            {
                _logger.LogInformation("User found, generating JWT token for user: {UserId}", user.Id);
                var token = await _jwtService.GenerateTokenAsync(user);
                
                _logger.LogInformation("Login successful for user: {UserId}, {Username}", user.Id, user.UserName);
                return Ok(new AuthResponseDto
                {
                    Success = true,
                    Message = "Login successful",
                    Token = token,
                    User = new UserDto
                    {
                        Id = user.Id,
                        Username = user.UserName!,
                        Email = user.Email!
                    }
                });
            }

            _logger.LogWarning("Login failed: User not found or invalid password for: {EmailOrUsername}", loginDto.EmailOrUsername);
            return Unauthorized(new AuthResponseDto 
            { 
                Success = false, 
                Message = "Invalid credentials" 
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred during login for: {EmailOrUsername}", loginDto.EmailOrUsername);
            return StatusCode(500, new AuthResponseDto
            {
                Success = false,
                Message = "An unexpected error occurred. Please try again later."
            });
        }
    }

    /// <summary>
    /// Handles user logout. Since JWT is used, this is primarily a client-side operation.
    /// The client should discard the JWT token after receiving the response.
    /// </summary>
    /// <returns>A success response indicating the user can be logged out</returns>
    [HttpPost("logout")]
    public ActionResult<AuthResponseDto> Logout()
    {
        return Ok(new AuthResponseDto 
        { 
            Success = true, 
            Message = "Logout successful" 
        });
    }
}
