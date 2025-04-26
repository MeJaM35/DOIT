using System.ComponentModel.DataAnnotations;
using TaskManager.Models;

namespace TaskManager.DTOs;

public class TaskItemDto
{
    [Required]
    public string Title { get; set; } = string.Empty;
    
    public string Description { get; set; } = string.Empty;
    
    public DateTime? DueDate { get; set; }
    
    public Priority Priority { get; set; } = Priority.Medium;
    
    public Status Status { get; set; } = Status.ToDo;
    
    public int Position { get; set; }
    
    public string? TaskIdentifier { get; set; }
}