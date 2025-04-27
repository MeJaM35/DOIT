using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.Data;
using TaskManager.DTOs;
using TaskManager.Models;
using TaskManager.Services;
using System.Security.Claims;

namespace TaskManager.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class BoardsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly GitHubService _githubService;

    public BoardsController(ApplicationDbContext context, GitHubService githubService)
    {
        _context = context;
        _githubService = githubService;
    }

    // Get all boards for the current user
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Board>>> GetBoards()
    {
        int userId = GetCurrentUserId();
        
        var boards = await _context.Boards
            .Where(b => b.UserId == userId)
            .ToListAsync();
            
        return Ok(boards);
    }

    // Get a specific board by ID
    [HttpGet("{id}")]
    public async Task<ActionResult<BoardDetailsDto>> GetBoard(int id)
    {
        int userId = GetCurrentUserId();
        
        var board = await _context.Boards
            .Include(b => b.Lists.OrderBy(l => l.Position))
            .ThenInclude(l => l.Tasks.OrderBy(t => t.Position))
            .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);

        if (board == null)
            return NotFound();

        // Map to DTO to avoid circular references
        var boardDto = new BoardDetailsDto
        {
            Id = board.Id,
            Title = board.Title,
            Description = board.Description,
            GithubRepositoryUrl = board.GithubRepositoryUrl,
            Lists = board.Lists.Select(l => new BoardListDetailsDto
            {
                Id = l.Id,
                Title = l.Title,
                Position = l.Position,
                Tasks = l.Tasks.Select(t => new TaskItemDetailsDto
                {
                    Id = t.Id,
                    Title = t.Title,
                    Description = t.Description,
                    DueDate = t.DueDate,
                    Priority = t.Priority.ToString(),
                    Status = t.Status.ToString(),
                    Position = t.Position
                }).ToList()
            }).ToList()
        };

        return Ok(boardDto);
    }

    // Create a new board
    [HttpPost]
    public async Task<ActionResult<Board>> CreateBoard(BoardDto boardDto)
    {
        int userId = GetCurrentUserId();
        
        var board = new Board
        {
            Title = boardDto.Title,
            Description = boardDto.Description,
            GithubRepositoryUrl = boardDto.GithubRepositoryUrl,
            UserId = userId
        };

        _context.Boards.Add(board);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetBoard), new { id = board.Id }, board);
    }

    // Update a board
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBoard(int id, BoardDto boardDto)
    {
        int userId = GetCurrentUserId();
        
        var board = await _context.Boards
            .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);

        if (board == null)
            return NotFound();

        board.Title = boardDto.Title;
        board.Description = boardDto.Description;
        
        // Only update GitHub repository if it has changed
        if (!string.IsNullOrEmpty(boardDto.GithubRepositoryUrl) && 
            board.GithubRepositoryUrl != boardDto.GithubRepositoryUrl)
        {
            board.GithubRepositoryUrl = boardDto.GithubRepositoryUrl;
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // Delete a board
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBoard(int id)
    {
        int userId = GetCurrentUserId();
        
        var board = await _context.Boards
            .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);

        if (board == null)
            return NotFound();

        _context.Boards.Remove(board);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // Connect GitHub repository to a board
    [HttpPost("{id}/connect-github")]
    public async Task<IActionResult> ConnectGitHub(int id, [FromBody] GitHubConnectDto connectDto)
    {
        int userId = GetCurrentUserId();
        
        var board = await _context.Boards
            .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);

        if (board == null)
            return NotFound();

        var result = await _githubService.SetupRepositoryWebhookAsync(id, connectDto.RepositoryUrl);
        
        if (!result)
            return BadRequest("Failed to connect to GitHub repository");

        return Ok(new { message = "GitHub repository connected successfully" });
    }
    
    // Get latest commits from connected GitHub repository
    [HttpGet("{id}/github-commits")]
    public async Task<ActionResult<IEnumerable<GitHubCommit>>> GetGitHubCommits(int id)
    {
        int userId = GetCurrentUserId();
        
        var board = await _context.Boards
            .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);

        if (board == null)
            return NotFound();
            
        if (string.IsNullOrEmpty(board.GithubRepositoryUrl))
            return BadRequest("No GitHub repository connected to this board");
            
        var commits = await _githubService.GetLatestCommitsAsync(board.GithubRepositoryUrl);
        return Ok(commits);
    }

    private int GetCurrentUserId()
    {
        return int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    }
}

public class GitHubConnectDto
{
    public string RepositoryUrl { get; set; } = string.Empty;
}