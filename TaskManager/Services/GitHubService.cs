using Microsoft.EntityFrameworkCore;
using Octokit;
using TaskManager.Data;
using TaskManager.Models;

namespace TaskManager.Services;

public class GitHubService
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;

    public GitHubService(ApplicationDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<bool> SetupRepositoryWebhookAsync(int boardId, string repositoryUrl)
    {
        try
        {
            var board = await _context.Boards.FindAsync(boardId);
            if (board == null)
                return false;

            board.GithubRepositoryUrl = repositoryUrl;
            await _context.SaveChangesAsync();
            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task<bool> ProcessCommitAsync(string repositoryUrl, string commitMessage)
    {
        try
        {
            var board = await _context.Boards
                .FirstOrDefaultAsync(b => b.GithubRepositoryUrl == repositoryUrl);
            
            if (board == null)
                return false;

            // Extract task identifiers from commit message
            // Format example: "Fixed bug #TM-123"
            var taskIds = ExtractTaskIdentifiers(commitMessage);
            
            if (!taskIds.Any())
                return false;

            // Find tasks and update their status
            var hasUpdated = false;
            foreach (var taskId in taskIds)
            {
                var tasks = await _context.Tasks
                    .Where(t => t.TaskIdentifier == taskId)
                    .ToListAsync();

                foreach (var task in tasks)
                {
                    // Update task status to Done - specifying the namespace to avoid ambiguity
                    task.Status = TaskManager.Models.Status.Done;
                    hasUpdated = true;
                }
            }

            if (hasUpdated)
                await _context.SaveChangesAsync();

            return hasUpdated;
        }
        catch
        {
            return false;
        }
    }

    private List<string> ExtractTaskIdentifiers(string commitMessage)
    {
        // This is a simple implementation to extract task IDs
        // Format: #TM-123 or TM-123
        var taskIdentifiers = new List<string>();
        var words = commitMessage.Split(' ');

        foreach (var word in words)
        {
            string taskId = word;
            
            // Remove # if present
            if (taskId.StartsWith("#"))
                taskId = taskId.Substring(1);
                
            // Check if it's in our expected format (e.g., TM-123)
            if (taskId.Contains("-") && taskId.Split('-').Length == 2)
            {
                if (int.TryParse(taskId.Split('-')[1], out _))
                {
                    taskIdentifiers.Add(taskId);
                }
            }
        }

        return taskIdentifiers;
    }

    public async Task<List<GitHubCommit>> GetLatestCommitsAsync(string repositoryUrl)
    {
        try
        {
            var client = new GitHubClient(new ProductHeaderValue("TaskManager"));
            
            // If there's a GitHub token configured, use it for authentication
            var token = _configuration.GetSection("GitHub:Token").Value;
            if (!string.IsNullOrEmpty(token))
            {
                client.Credentials = new Credentials(token);
            }

            // Extract owner and repo from URL
            var (owner, repo) = ParseGitHubUrl(repositoryUrl);
            
            if (string.IsNullOrEmpty(owner) || string.IsNullOrEmpty(repo))
                return new List<GitHubCommit>();

            var commits = await client.Repository.Commit.GetAll(owner, repo);
            
            return commits.Select(c => new GitHubCommit
            {
                Sha = c.Sha,
                Message = c.Commit.Message,
                Author = c.Commit.Author.Name,
                Date = c.Commit.Author.Date.DateTime
            }).ToList();
        }
        catch
        {
            return new List<GitHubCommit>();
        }
    }

    private (string owner, string repo) ParseGitHubUrl(string url)
    {
        try
        {
            url = url.Trim().TrimEnd('/');
            
            // Handle https://github.com/owner/repo.git or https://github.com/owner/repo
            if (url.EndsWith(".git"))
                url = url.Substring(0, url.Length - 4);
                
            var uri = new Uri(url);
            var segments = uri.AbsolutePath.Split('/', StringSplitOptions.RemoveEmptyEntries);
            
            if (segments.Length >= 2)
                return (segments[0], segments[1]);
            
            return (string.Empty, string.Empty);
        }
        catch
        {
            return (string.Empty, string.Empty);
        }
    }
}

public class GitHubCommit
{
    public string Sha { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public DateTime Date { get; set; }
}