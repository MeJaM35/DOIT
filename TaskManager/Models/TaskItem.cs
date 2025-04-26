namespace TaskManager.Models;

public enum Priority
{
    Low,
    Medium,
    High,
    Urgent
}

public enum Status
{
    ToDo,
    InProgress,
    Blocked,
    Done
}

public class TaskItem
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime? DueDate { get; set; }
    public Priority Priority { get; set; } = Priority.Medium;
    public Status Status { get; set; } = Status.ToDo;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int Position { get; set; }
    public int BoardListId { get; set; }
    
    // Navigation property
    public BoardList BoardList { get; set; } = null!;
    
    // Task identifier for GitHub integration
    public string? TaskIdentifier { get; set; }
}