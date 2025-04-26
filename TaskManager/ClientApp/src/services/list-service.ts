import apiClient from './api-client';

export interface BoardListDto {
  id?: string;
  boardId: string;
  title: string;
  order: number;
}

class ListService {
  async getLists(boardId: string): Promise<BoardListDto[]> {
    const response = await apiClient.get<BoardListDto[]>(`/boards/${boardId}/lists`);
    return response.data;
  }

  async getList(boardId: string, id: string): Promise<BoardListDto> {
    const response = await apiClient.get<BoardListDto>(`/boards/${boardId}/lists/${id}`);
    return response.data;
  }

  async createList(boardId: string, list: BoardListDto): Promise<BoardListDto> {
    const response = await apiClient.post<BoardListDto>(`/boards/${boardId}/lists`, list);
    return response.data;
  }

  async updateList(boardId: string, id: string, list: BoardListDto): Promise<BoardListDto> {
    const response = await apiClient.put<BoardListDto>(`/boards/${boardId}/lists/${id}`, list);
    return response.data;
  }

  async deleteList(boardId: string, id: string): Promise<void> {
    await apiClient.delete(`/boards/${boardId}/lists/${id}`);
  }
}

export default new ListService();