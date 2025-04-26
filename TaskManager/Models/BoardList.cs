namespace TaskManager.Models;

public class BoardList
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public int Position { get; set; }
    public int BoardId { get; set; }
    
    // Navigation properties
    public Board Board { get; set; } = null!;
    public List<TaskItem> Tasks { get; set; } = new List<TaskItem>();
}