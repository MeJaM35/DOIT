using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.Data;
using TaskManager.DTOs;
using TaskManager.Models;
using System.Security.Claims;

namespace TaskManager.Controllers;

[Route("api/lists/{listId}/tasks")]
[ApiController]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public TasksController(ApplicationDbContext context)
    {
        _context = context;
    }

    // Get all tasks for a list
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaskItem>>> GetTasks(int listId)
    {
        int userId = GetCurrentUserId();
        
        // Check if list exists and belongs to a board owned by the user
        var listBelongsToUser = await _context.BoardLists
            .AnyAsync(l => l.Id == listId && l.Board.UserId == userId);
            
        if (!listBelongsToUser)
            return NotFound("List not found");
            
        var tasks = await _context.Tasks
            .Where(t => t.BoardListId == listId)
            .OrderBy(t => t.Position)
            .ToListAsync();
            
        return Ok(tasks);
    }
    
    // Get a specific task
    [HttpGet("{id}")]
    public async Task<ActionResult<TaskItem>> GetTask(int listId, int id)
    {
        int userId = GetCurrentUserId();
        
        // Check if list exists and belongs to a board owned by the user
        var listBelongsToUser = await _context.BoardLists
            .AnyAsync(l => l.Id == listId && l.Board.UserId == userId);
            
        if (!listBelongsToUser)
            return NotFound("List not found");
            
        var task = await _context.Tasks
            .FirstOrDefaultAsync(t => t.Id == id && t.BoardListId == listId);
            
        if (task == null)
            return NotFound("Task not found");
            
        return Ok(task);
    }
    
    // Create a new task
    [HttpPost]
    public async Task<ActionResult<TaskItem>> CreateTask(int listId, TaskItemDto taskDto)
    {
        int userId = GetCurrentUserId();
        
        // Check if list exists and belongs to a board owned by the user
        var list = await _context.BoardLists
            .Include(l => l.Board)
            .FirstOrDefaultAsync(l => l.Id == listId && l.Board.UserId == userId);
            
        if (list == null)
            return NotFound("List not found");
            
        // Get max position to add the new task at the end
        var maxPosition = await _context.Tasks
            .Where(t => t.BoardListId == listId)
            .MaxAsync(t => (int?)t.Position) ?? 0;
        
        // Generate task identifier for GitHub integration if not provided
        string taskIdentifier = taskDto.TaskIdentifier ?? GenerateTaskIdentifier(list.Board.Title);
        
        var task = new TaskItem
        {
            Title = taskDto.Title,
            Description = taskDto.Description,
            DueDate = taskDto.DueDate,
            Priority = taskDto.Priority,
            Status = taskDto.Status,
            Position = taskDto.Position > 0 ? taskDto.Position : maxPosition + 1,
            BoardListId = listId,
            TaskIdentifier = taskIdentifier
        };
        
        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();
        
        return CreatedAtAction(nameof(GetTask), new { listId = listId, id = task.Id }, task);
    }
    
    // Update a task
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTask(int listId, int id, TaskItemDto taskDto)
    {
        int userId = GetCurrentUserId();
        
        // Check if list exists and belongs to a board owned by the user
        var listBelongsToUser = await _context.BoardLists
            .AnyAsync(l => l.Id == listId && l.Board.UserId == userId);
            
        if (!listBelongsToUser)
            return NotFound("List not found");
            
        var task = await _context.Tasks
            .FirstOrDefaultAsync(t => t.Id == id && t.BoardListId == listId);
            
        if (task == null)
            return NotFound("Task not found");
            
        task.Title = taskDto.Title;
        task.Description = taskDto.Description;
        task.DueDate = taskDto.DueDate;
        task.Priority = taskDto.Priority;
        task.Status = taskDto.Status;
        task.TaskIdentifier = taskDto.TaskIdentifier ?? task.TaskIdentifier;
        
        if (taskDto.Position > 0 && taskDto.Position != task.Position)
        {
            // Update positions if this task is being moved
            await ReorderTasksAsync(listId, id, task.Position, taskDto.Position);
            task.Position = taskDto.Position;
        }
        
        await _context.SaveChangesAsync();
        return NoContent();
    }
    
    // Delete a task
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTask(int listId, int id)
    {
        int userId = GetCurrentUserId();
        
        // Check if list exists and belongs to a board owned by the user
        var listBelongsToUser = await _context.BoardLists
            .AnyAsync(l => l.Id == listId && l.Board.UserId == userId);
            
        if (!listBelongsToUser)
            return NotFound("List not found");
            
        var task = await _context.Tasks
            .FirstOrDefaultAsync(t => t.Id == id && t.BoardListId == listId);
            
        if (task == null)
            return NotFound("Task not found");
            
        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync();
        
        // Reorder remaining tasks to keep positions consecutive
        await NormalizeTaskPositionsAsync(listId);
        
        return NoContent();
    }
    
    // Move a task to a different list
    [HttpPost("{id}/move")]
    public async Task<IActionResult> MoveTaskToList(int listId, int id, [FromBody] MoveTaskDto moveDto)
    {
        int userId = GetCurrentUserId();
        
        // Check if source list exists and belongs to a board owned by the user
        var sourceListBelongsToUser = await _context.BoardLists
            .AnyAsync(l => l.Id == listId && l.Board.UserId == userId);
            
        if (!sourceListBelongsToUser)
            return NotFound("Source list not found");
            
        // Check if target list exists and belongs to a board owned by the user
        var targetListBelongsToUser = await _context.BoardLists
            .AnyAsync(l => l.Id == moveDto.TargetListId && l.Board.UserId == userId);
            
        if (!targetListBelongsToUser)
            return NotFound("Target list not found");
            
        var task = await _context.Tasks
            .FirstOrDefaultAsync(t => t.Id == id && t.BoardListId == listId);
            
        if (task == null)
            return NotFound("Task not found");

        // Get max position to add the task at the end if no position specified
        int position = moveDto.Position;
        if (position <= 0)
        {
            position = await _context.Tasks
                .Where(t => t.BoardListId == moveDto.TargetListId)
                .MaxAsync(t => (int?)t.Position) ?? 0;
            position++;
        }
        
        // Make room at the target position in the target list
        await ShiftTaskPositionsAsync(moveDto.TargetListId, position);
        
        // Update the task with new list ID and position
        task.BoardListId = moveDto.TargetListId;
        task.Position = position;
        
        await _context.SaveChangesAsync();
        
        // Normalize positions in both lists
        await NormalizeTaskPositionsAsync(listId);
        if (listId != moveDto.TargetListId)
        {
            await NormalizeTaskPositionsAsync(moveDto.TargetListId);
        }
        
        return NoContent();
    }
    
    // Helper method to reorder tasks when a task position is changed
    private async Task ReorderTasksAsync(int listId, int taskId, int oldPosition, int newPosition)
    {
        if (oldPosition == newPosition)
            return;
            
        var tasks = await _context.Tasks
            .Where(t => t.BoardListId == listId && t.Id != taskId)
            .OrderBy(t => t.Position)
            .ToListAsync();
            
        if (oldPosition < newPosition)
        {
            // Moving down: decrease position of items between old and new
            foreach (var task in tasks)
            {
                if (task.Position > oldPosition && task.Position <= newPosition)
                    task.Position--;
            }
        }
        else
        {
            // Moving up: increase position of items between new and old
            foreach (var task in tasks)
            {
                if (task.Position >= newPosition && task.Position < oldPosition)
                    task.Position++;
            }
        }
    }
    
    // Helper method to shift task positions when inserting a task at a specific position
    private async Task ShiftTaskPositionsAsync(int listId, int position)
    {
        var tasks = await _context.Tasks
            .Where(t => t.BoardListId == listId && t.Position >= position)
            .ToListAsync();
            
        foreach (var task in tasks)
        {
            task.Position++;
        }
    }
    
    // Helper method to normalize task positions after deletion
    private async Task NormalizeTaskPositionsAsync(int listId)
    {
        var tasks = await _context.Tasks
            .Where(t => t.BoardListId == listId)
            .OrderBy(t => t.Position)
            .ToListAsync();
            
        for (int i = 0; i < tasks.Count; i++)
        {
            tasks[i].Position = i + 1;
        }
        
        await _context.SaveChangesAsync();
    }
    
    // Helper method to generate task identifiers
    private string GenerateTaskIdentifier(string boardName)
    {
        // Generate a board prefix (e.g., "DEV" from "Development Board")
        string prefix = string.Join("", boardName
            .Split(' ')
            .Where(s => !string.IsNullOrWhiteSpace(s))
            .Take(3)
            .Select(s => s.Length > 0 ? s[0].ToString().ToUpper() : ""));
            
        if (string.IsNullOrEmpty(prefix))
            prefix = "TM";
            
        // Get a random number for the task ID
        Random random = new Random();
        int taskNumber = random.Next(1, 10000);
        
        return $"{prefix}-{taskNumber}";
    }
    
    private int GetCurrentUserId()
    {
        return int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    }
}

public class MoveTaskDto
{
    public int TargetListId { get; set; }
    public int Position { get; set; }
}