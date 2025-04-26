namespace TaskManager.Models;

public class Board
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int UserId { get; set; }
    
    // Navigation properties
    public User User { get; set; } = null!;
    public List<BoardList> Lists { get; set; } = new List<BoardList>();
    
    // GitHub integration
    public string? GithubRepositoryUrl { get; set; }
}