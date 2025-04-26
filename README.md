# TaskManager - Collaborative Task Management Application

A Trello-like task management application built with ASP.NET Core, featuring user authentication, board/list/task management, and GitHub integration.

## Features

- **User Authentication**
  - JWT-based secure user registration and login
  - Password hashing for security

- **Board Management**
  - Create multiple boards to organize different projects
  - Each board can connect to a GitHub repository

- **List & Task Organization**
  - Create multiple lists within each board
  - Create, update, and delete tasks within lists
  - Move tasks between lists

- **Task Details**
  - Title, description, due date
  - Priority levels (Low, Medium, High, Urgent)
  - Status tracking (ToDo, InProgress, Blocked, Done)

- **GitHub Integration**
  - Connect boards to GitHub repositories
  - Automatically close tasks based on commit messages
  - View recent commits from connected repositories

## Tech Stack

- **Backend**: ASP.NET Core 8.0 Web API
- **Database**: SQLite (easy to switch to SQL Server)
- **Authentication**: JWT (JSON Web Tokens)
- **GitHub Integration**: Octokit
- **API Documentation**: Swagger/OpenAPI

## Getting Started

### Prerequisites

- .NET 8.0 SDK or later

### Installation

1. Clone this repository
   ```
   git clone https://github.com/MeJaM35/DOIT.git
   cd taskmanager
   ```

2. Build the solution
   ```
   dotnet build
   ```

3. Run the application
   ```
   dotnet run --project TaskManager
   ```

4. Access the Swagger documentation
   ```
   http://localhost:5103/swagger
   ```

### Database Setup

The application is configured to use SQLite by default, and will automatically create the database on first run. If you need to recreate the database:

```
cd TaskManager
dotnet ef database update
```

### GitHub Integration

To use GitHub integration features, add a GitHub personal access token to your `appsettings.json`:

```json
"GitHub": {
  "Token": "your_github_personal_access_token" 
}
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive JWT token

### Boards
- `GET /api/boards` - Get all boards
- `GET /api/boards/{id}` - Get a specific board
- `POST /api/boards` - Create a new board
- `PUT /api/boards/{id}` - Update a board
- `DELETE /api/boards/{id}` - Delete a board
- `POST /api/boards/{id}/connect-github` - Connect a GitHub repository
- `GET /api/boards/{id}/github-commits` - Get commits from connected repository

### Lists
- `GET /api/boards/{boardId}/lists` - Get all lists for a board
- `GET /api/boards/{boardId}/lists/{id}` - Get a specific list
- `POST /api/boards/{boardId}/lists` - Create a new list
- `PUT /api/boards/{boardId}/lists/{id}` - Update a list
- `DELETE /api/boards/{boardId}/lists/{id}` - Delete a list

### Tasks
- `GET /api/lists/{listId}/tasks` - Get all tasks for a list
- `GET /api/lists/{listId}/tasks/{id}` - Get a specific task
- `POST /api/lists/{listId}/tasks` - Create a new task
- `PUT /api/lists/{listId}/tasks/{id}` - Update a task
- `DELETE /api/lists/{listId}/tasks/{id}` - Delete a task
- `POST /api/lists/{listId}/tasks/{id}/move` - Move a task to another list

## Security Considerations

- JWT secret key should be kept secure and not committed to source control
- GitHub personal access tokens should be managed securely

## License

[MIT License](LICENSE)