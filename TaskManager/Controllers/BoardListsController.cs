using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.Data;
using TaskManager.DTOs;
using TaskManager.Models;
using System.Security.Claims;

namespace TaskManager.Controllers;

[Route("api/boards/{boardId}/lists")]
[ApiController]
[Authorize]
public class BoardListsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public BoardListsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // Get all lists for a board
    [HttpGet]
    public async Task<ActionResult<IEnumerable<BoardList>>> GetLists(int boardId)
    {
        int userId = GetCurrentUserId();
        
        // Check if board exists and belongs to the user
        var boardExists = await _context.Boards
            .AnyAsync(b => b.Id == boardId && b.UserId == userId);
            
        if (!boardExists)
            return NotFound("Board not found");
            
        var lists = await _context.BoardLists
            .Where(l => l.BoardId == boardId)
            .OrderBy(l => l.Position)
            .ToListAsync();
            
        return Ok(lists);
    }
    
    // Get a specific list
    [HttpGet("{id}")]
    public async Task<ActionResult<BoardList>> GetList(int boardId, int id)
    {
        int userId = GetCurrentUserId();
        
        // Check if board exists and belongs to the user
        var boardExists = await _context.Boards
            .AnyAsync(b => b.Id == boardId && b.UserId == userId);
            
        if (!boardExists)
            return NotFound("Board not found");
            
        var list = await _context.BoardLists
            .Include(l => l.Tasks.OrderBy(t => t.Position))
            .FirstOrDefaultAsync(l => l.Id == id && l.BoardId == boardId);
            
        if (list == null)
            return NotFound("List not found");
            
        return Ok(list);
    }
    
    // Create a new list
    [HttpPost]
    public async Task<ActionResult<BoardList>> CreateList(int boardId, BoardListDto listDto)
    {
        try
        {
            Console.WriteLine($"BoardListsController.CreateList called with boardId: {boardId}");
            Console.WriteLine($"Request body: Title='{listDto.Title}', Position={listDto.Position}");
            
            // Log the ModelState validation status
            if (!ModelState.IsValid)
            {
                Console.WriteLine("ModelState is invalid:");
                foreach (var state in ModelState)
                {
                    foreach (var error in state.Value.Errors)
                    {
                        Console.WriteLine($"  - {state.Key}: {error.ErrorMessage}");
                    }
                }
                return BadRequest(ModelState);
            }
            
            int userId = GetCurrentUserId();
            Console.WriteLine($"Current userId: {userId}");
            
            // Check if board exists and belongs to the user
            var board = await _context.Boards
                .FirstOrDefaultAsync(b => b.Id == boardId && b.UserId == userId);
                
            if (board == null)
            {
                Console.WriteLine($"Board with ID {boardId} not found for user {userId}");
                return NotFound("Board not found");
            }
                
            Console.WriteLine($"Found board: ID={board.Id}, Title='{board.Title}'");
                
            // Get max position to add the new list at the end
            int maxPosition = 0;
            if (await _context.BoardLists.AnyAsync(l => l.BoardId == boardId))
            {
                maxPosition = await _context.BoardLists
                    .Where(l => l.BoardId == boardId)
                    .MaxAsync(l => l.Position);
                Console.WriteLine($"Current max position for lists: {maxPosition}");
            }
            else
            {
                Console.WriteLine("No existing lists found, starting at position 1");
            }
                
            var list = new BoardList
            {
                Title = listDto.Title,
                Position = listDto.Position > 0 ? listDto.Position : maxPosition + 1,
                BoardId = boardId
            };
            
            Console.WriteLine($"Creating new list: Title='{list.Title}', Position={list.Position}, BoardId={list.BoardId}");
            
            _context.BoardLists.Add(list);
            await _context.SaveChangesAsync();
            
            Console.WriteLine($"List saved successfully with ID: {list.Id}");
            
            return CreatedAtAction(nameof(GetList), new { boardId = boardId, id = list.Id }, list);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error creating list: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
    
    // Update a list
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateList(int boardId, int id, BoardListDto listDto)
    {
        int userId = GetCurrentUserId();
        
        // Check if board exists and belongs to the user
        var boardExists = await _context.Boards
            .AnyAsync(b => b.Id == boardId && b.UserId == userId);
            
        if (!boardExists)
            return NotFound("Board not found");
            
        var list = await _context.BoardLists
            .FirstOrDefaultAsync(l => l.Id == id && l.BoardId == boardId);
            
        if (list == null)
            return NotFound("List not found");
            
        list.Title = listDto.Title;
        
        if (listDto.Position > 0 && listDto.Position != list.Position)
        {
            // Update positions if this list is being moved
            await ReorderListsAsync(boardId, id, list.Position, listDto.Position);
            list.Position = listDto.Position;
        }
        
        await _context.SaveChangesAsync();
        return NoContent();
    }
    
    // Delete a list
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteList(int boardId, int id)
    {
        int userId = GetCurrentUserId();
        
        // Check if board exists and belongs to the user
        var boardExists = await _context.Boards
            .AnyAsync(b => b.Id == boardId && b.UserId == userId);
            
        if (!boardExists)
            return NotFound("Board not found");
            
        var list = await _context.BoardLists
            .FirstOrDefaultAsync(l => l.Id == id && l.BoardId == boardId);
            
        if (list == null)
            return NotFound("List not found");
            
        _context.BoardLists.Remove(list);
        await _context.SaveChangesAsync();
        
        // Reorder remaining lists to keep positions consecutive
        await NormalizeListPositionsAsync(boardId);
        
        return NoContent();
    }
    
    // Helper method to reorder lists when a list position is changed
    private async Task ReorderListsAsync(int boardId, int listId, int oldPosition, int newPosition)
    {
        if (oldPosition == newPosition)
            return;
            
        var lists = await _context.BoardLists
            .Where(l => l.BoardId == boardId && l.Id != listId)
            .OrderBy(l => l.Position)
            .ToListAsync();
            
        if (oldPosition < newPosition)
        {
            // Moving right: decrease position of items between old and new
            foreach (var list in lists)
            {
                if (list.Position > oldPosition && list.Position <= newPosition)
                    list.Position--;
            }
        }
        else
        {
            // Moving left: increase position of items between new and old
            foreach (var list in lists)
            {
                if (list.Position >= newPosition && list.Position < oldPosition)
                    list.Position++;
            }
        }
    }
    
    // Helper method to normalize list positions after deletion
    private async Task NormalizeListPositionsAsync(int boardId)
    {
        var lists = await _context.BoardLists
            .Where(l => l.BoardId == boardId)
            .OrderBy(l => l.Position)
            .ToListAsync();
            
        for (int i = 0; i < lists.Count; i++)
        {
            lists[i].Position = i + 1;
        }
        
        await _context.SaveChangesAsync();
    }
    
    private int GetCurrentUserId()
    {
        return int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    }
}