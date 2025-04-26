using System.ComponentModel.DataAnnotations;

namespace TaskManager.DTOs;

public class BoardListDto
{
    [Required]
    public string Title { get; set; } = string.Empty;
    
    public int Position { get; set; }
}