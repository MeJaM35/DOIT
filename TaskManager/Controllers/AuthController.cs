using Microsoft.AspNetCore.Mvc;
using TaskManager.DTOs;
using TaskManager.Services;

namespace TaskManager.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto registerDto)
    {
        var result = await _authService.RegisterAsync(registerDto);

        if (!result.success)
            return BadRequest(result.message);

        return Ok(new { message = result.message });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto loginDto)
    {
        var result = await _authService.LoginAsync(loginDto);

        if (!result.success)
            return BadRequest(result.token);

        return Ok(new { token = result.token });
    }
}