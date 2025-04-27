namespace TaskManager.DTOs;

public class UpdateSettingsDto
{
    public string? FullName { get; set; }
    public string? Bio { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public string? Theme { get; set; } // system, light, or dark
}