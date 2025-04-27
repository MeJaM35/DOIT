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
    try {
      const response = await apiClient.get<any[]>(`/boards/${boardId}/lists`);
      // Map backend response to our frontend format
      return response.data.map(list => ({
        id: list.id,
        boardId: boardId,
        title: list.title,
        order: list.position
      }));
    } catch (error) {
      console.error(`Error fetching lists for board ${boardId}:`, error);
      throw error;
    }
  }

  async getList(boardId: string | number, id: string | number): Promise<BoardListDto> {
    try {
      const response = await apiClient.get<any>(`/boards/${boardId}/lists/${id}`);
      // Map backend response to our frontend format
      return {
        id: response.data.id,
        boardId: boardId,
        title: response.data.title,
        order: response.data.position
      };
    } catch (error) {
      console.error(`Error fetching list ${id}:`, error);
      throw error;
    }
  }

  async createList(boardId: string | number, list: BoardListDto): Promise<BoardListDto> {
    try {
      // Ensure boardId is a number (backend expects int)
      const numericBoardId = typeof boardId === 'string' ? parseInt(boardId) : boardId;
      
      // Convert from frontend format to backend format
      const backendList: BackendBoardListDto = {
        title: list.title,
        position: list.order
      };
      
      console.log(`Creating list for board ID ${numericBoardId} with data:`, backendList);
      
      const response = await apiClient.post<any>(`/boards/${numericBoardId}/lists`, backendList);
      
      console.log('List creation response:', response.data);
      
      // Map the response back to our frontend format
      return {
        id: response.data.id,
        boardId: numericBoardId,
        title: response.data.title,
        order: response.data.position
      };
    } catch (error) {
      console.error(`Error creating list for board ${boardId}:`, error);
      throw error;
    }
  }

  async updateList(boardId: string | number, id: string | number, list: BoardListDto): Promise<BoardListDto> {
    try {
      // Ensure IDs are numbers
      const numericBoardId = typeof boardId === 'string' ? parseInt(boardId) : boardId;
      const numericListId = typeof id === 'string' ? parseInt(id) : id;
      
      // Convert from frontend format to backend format
      const backendList: BackendBoardListDto = {
        title: list.title,
        position: list.order
      };
      
      const response = await apiClient.put<any>(`/boards/${numericBoardId}/lists/${numericListId}`, backendList);
      
      // For updates, usually just return the original with updated values
      return {
        id: numericListId,
        boardId: numericBoardId,
        title: list.title,
        order: list.order
      };
    } catch (error) {
      console.error(`Error updating list ${id}:`, error);
      throw error;
    }
  }

  async deleteList(boardId: string | number, id: string | number): Promise<void> {
    try {
      // Ensure IDs are numbers
      const numericBoardId = typeof boardId === 'string' ? parseInt(boardId) : boardId;
      const numericListId = typeof id === 'string' ? parseInt(id) : id;
      
      await apiClient.delete(`/boards/${numericBoardId}/lists/${numericListId}`);
    } catch (error) {
      console.error(`Error deleting list ${id}:`, error);
      throw error;
    }
  }
}

export default new ListService();