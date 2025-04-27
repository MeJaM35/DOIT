import apiClient from './api-client';

export interface BoardDto {
  id?: number; // Changed from string to number to match backend
  title: string;
  description: string;
  githubRepositoryUrl?: string; // Changed to match backend property name
}

// Interface for connecting GitHub repository
export interface GitHubConnectDto {
  repositoryUrl: string;
}

class BoardService {
  async getBoards(): Promise<BoardDto[]> {
    const response = await apiClient.get<BoardDto[]>('/boards');
    return response.data;
  }

  async getBoard(id: string | number): Promise<BoardDto> {
    const response = await apiClient.get<BoardDto>(`/boards/${id}`);
    return response.data;
  }

  async createBoard(board: BoardDto): Promise<BoardDto> {
    const response = await apiClient.post<BoardDto>('/boards', board);
    return response.data;
  }

  async updateBoard(id: string | number, board: BoardDto): Promise<BoardDto> {
    const response = await apiClient.put<BoardDto>(`/boards/${id}`, board);
    return response.data;
  }

  async deleteBoard(id: string | number): Promise<void> {
    await apiClient.delete(`/boards/${id}`);
  }

  async connectGitHub(id: string | number, repoUrl: string): Promise<BoardDto> {
    // Updated to match backend's expected format
    const data: GitHubConnectDto = {
      repositoryUrl: repoUrl
    };
    const response = await apiClient.post<BoardDto>(`/boards/${id}/connect-github`, data);
    return response.data;
  }

  async getGitHubCommits(id: string | number): Promise<any[]> {
    const response = await apiClient.get<any[]>(`/boards/${id}/github-commits`);
    return response.data;
  }
}

export default new BoardService();