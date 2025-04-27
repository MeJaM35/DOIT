using System.Collections.Generic;

namespace TaskManager.DTOs;

public class BoardDetailsDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? GithubRepositoryUrl { get; set; }
    public List<BoardListDetailsDto> Lists { get; set; } = new();
}

public class BoardListDetailsDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public int Position { get; set; }
    public List<TaskItemDetailsDto> Tasks { get; set; } = new();
}

public class TaskItemDetailsDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime? DueDate { get; set; }
    public string Priority { get; set; } = "Medium";
    public string Status { get; set; } = "ToDo";
    public int Position { get; set; }
}