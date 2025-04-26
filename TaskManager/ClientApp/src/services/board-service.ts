import apiClient from './api-client';

export interface BoardDto {
  id?: string;
  title: string;
  description: string;
  githubRepoUrl?: string;
}

class BoardService {
  async getBoards(): Promise<BoardDto[]> {
    const response = await apiClient.get<BoardDto[]>('/boards');
    return response.data;
  }

  async getBoard(id: string): Promise<BoardDto> {
    const response = await apiClient.get<BoardDto>(`/boards/${id}`);
    return response.data;
  }

  async createBoard(board: BoardDto): Promise<BoardDto> {
    const response = await apiClient.post<BoardDto>('/boards', board);
    return response.data;
  }

  async updateBoard(id: string, board: BoardDto): Promise<BoardDto> {
    const response = await apiClient.put<BoardDto>(`/boards/${id}`, board);
    return response.data;
  }

  async deleteBoard(id: string): Promise<void> {
    await apiClient.delete(`/boards/${id}`);
  }

  async connectGitHub(id: string, repoUrl: string): Promise<BoardDto> {
    const response = await apiClient.post<BoardDto>(`/boards/${id}/connect-github`, { repoUrl });
    return response.data;
  }

  async getGitHubCommits(id: string): Promise<any[]> {
    const response = await apiClient.get<any[]>(`/boards/${id}/github-commits`);
    return response.data;
  }
}

export default new BoardService();