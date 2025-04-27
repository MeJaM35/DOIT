import apiClient from './api-client';

// This interface matches what we use in our frontend components
export interface BoardListDto {
  id?: number;
  boardId: string | number;
  title: string;
  order: number;
}

// This interface matches the backend DTO format
interface BackendBoardListDto {
  title: string;
  position: number;
}

class ListService {
  async getLists(boardId: string | number): Promise<BoardListDto[]> {
    const response = await apiClient.get<any[]>(`/boards/${boardId}/lists`);
    // Map backend response to our frontend format
    return response.data.map(list => ({
      id: list.id,
      boardId: boardId,
      title: list.title,
      order: list.position
    }));
  }

  async getList(boardId: string | number, id: string | number): Promise<BoardListDto> {
    const response = await apiClient.get<any>(`/boards/${boardId}/lists/${id}`);
    // Map backend response to our frontend format
    return {
      id: response.data.id,
      boardId: boardId,
      title: response.data.title,
      order: response.data.position
    };
  }

  async createList(boardId: string | number, list: BoardListDto): Promise<BoardListDto> {
    // Convert from frontend format to backend format
    const backendList: BackendBoardListDto = {
      title: list.title,
      position: list.order
    };
    
    const response = await apiClient.post<any>(`/boards/${boardId}/lists`, backendList);
    
    // Map the response back to our frontend format
    return {
      id: response.data.id,
      boardId: boardId,
      title: response.data.title,
      order: response.data.position
    };
  }

  async updateList(boardId: string | number, id: string | number, list: BoardListDto): Promise<BoardListDto> {
    // Convert from frontend format to backend format
    const backendList: BackendBoardListDto = {
      title: list.title,
      position: list.order
    };
    
    const response = await apiClient.put<any>(`/boards/${boardId}/lists/${id}`, backendList);
    
    // For updates, usually just return the original with updated values
    return {
      ...list,
      title: backendList.title,
      order: backendList.position
    };
  }

  async deleteList(boardId: string | number, id: string | number): Promise<void> {
    await apiClient.delete(`/boards/${boardId}/lists/${id}`);
  }
}

export default new ListService();