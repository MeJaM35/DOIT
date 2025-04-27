namespace TaskManager.Models;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string PasswordSalt { get; set; } = string.Empty;
    
    // New properties for settings
    public string? GitHubPAT { get; set; }
    public string Theme { get; set; } = "system"; // Options: system, light, dark
    public string? ProfilePictureUrl { get; set; }
    public string? FullName { get; set; }
    public string? Bio { get; set; }
    
    // Navigation properties
    public List<Board> Boards { get; set; } = new List<Board>();
}