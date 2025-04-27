using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TaskManager.Data;
using TaskManager.DTOs;
using TaskManager.Models;

namespace TaskManager.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ProfileController(ApplicationDbContext context)
    {
        _context = context;
    }

    // Get current user profile
    [HttpGet]
    public async Task<ActionResult<UserProfileDto>> GetProfile()
    {
        int userId = GetCurrentUserId();
        
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return NotFound();
            
        return Ok(new UserProfileDto
        {
            Username = user.Username,
            Email = user.Email,
            FullName = user.FullName,
            Bio = user.Bio,
            ProfilePictureUrl = user.ProfilePictureUrl,
            Theme = user.Theme
        });
    }
    
    // Update user settings
    [HttpPut("settings")]
    public async Task<IActionResult> UpdateSettings(UpdateSettingsDto settingsDto)
    {
        int userId = GetCurrentUserId();
        
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return NotFound();
            
        // Update only provided fields
        if (settingsDto.FullName != null)
            user.FullName = settingsDto.FullName;
            
        if (settingsDto.Bio != null)
            user.Bio = settingsDto.Bio;
            
        if (settingsDto.ProfilePictureUrl != null)
            user.ProfilePictureUrl = settingsDto.ProfilePictureUrl;
            
        if (settingsDto.Theme != null)
            user.Theme = settingsDto.Theme;
            
        await _context.SaveChangesAsync();
        
        return NoContent();
    }
    
    // Update GitHub PAT
    [HttpPut("github-token")]
    public async Task<IActionResult> UpdateGitHubToken(GitHubPATDto tokenDto)
    {
        int userId = GetCurrentUserId();
        
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return NotFound();
            
        user.GitHubPAT = tokenDto.PersonalAccessToken;
        await _context.SaveChangesAsync();
        
        return NoContent();
    }
    
    // Get GitHub PAT status (exists or not)
    [HttpGet("github-token-status")]
    public async Task<ActionResult<object>> GetGitHubTokenStatus()
    {
        int userId = GetCurrentUserId();
        
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return NotFound();
            
        return Ok(new { hasToken = !string.IsNullOrEmpty(user.GitHubPAT) });
    }
    
    // Delete GitHub PAT
    [HttpDelete("github-token")]
    public async Task<IActionResult> DeleteGitHubToken()
    {
        int userId = GetCurrentUserId();
        
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return NotFound();
            
        user.GitHubPAT = null;
        await _context.SaveChangesAsync();
        
        return NoContent();
    }
    
    private int GetCurrentUserId()
    {
        return int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    }
}