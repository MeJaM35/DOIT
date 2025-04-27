using System.ComponentModel.DataAnnotations;

namespace TaskManager.DTOs;

public class GitHubPATDto
{
    [Required]
    public string PersonalAccessToken { get; set; } = string.Empty;
}