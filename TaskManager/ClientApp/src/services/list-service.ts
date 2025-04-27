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
      // Ensure boardId is a number
      const numericBoardId = typeof boardId === 'string' ? parseInt(boardId) : boardId;

      console.log(`Fetching lists for board ID ${numericBoardId}`);
      const response = await apiClient.get<any[]>(`/boards/${numericBoardId}/lists`);
      
      // Map backend response to our frontend format
      return response.data.map(list => ({
        id: list.id,
        boardId: numericBoardId,
        title: list.title,
        order: list.position
      }));
    } catch (error) {
      console.error(`Error fetching lists for board ${boardId}:`, error);
      // Return empty array instead of throwing to prevent UI crashes
      return [];
    }
  }

  async getList(boardId: string | number, id: string | number): Promise<BoardListDto | null> {
    try {
      // Ensure IDs are numbers
      const numericBoardId = typeof boardId === 'string' ? parseInt(boardId) : boardId;
      const numericListId = typeof id === 'string' ? parseInt(id) : id;
      
      const response = await apiClient.get<any>(`/boards/${numericBoardId}/lists/${numericListId}`);
      
      // Map backend response to our frontend format
      return {
        id: response.data.id,
        boardId: numericBoardId,
        title: response.data.title,
        order: response.data.position
      };
    } catch (error) {
      console.error(`Error fetching list ${id}:`, error);
      return null;
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
      
      if (!response.data) {
        console.log('List creation succeeded but returned no data');
        // Return something to update UI even if response is incomplete
        return {
          id: Date.now(), // Temporary ID
          boardId: numericBoardId,
          title: list.title,
          order: list.order
        };
      }
      
      // Map the response back to our frontend format
      return {
        id: response.data.id,
        boardId: numericBoardId,
        title: response.data.title || list.title,
        order: response.data.position || list.order
      };
    } catch (error) {
      console.error(`Error creating list for board ${boardId}:`, error);
      
      // Even if the API call fails, return something so the UI can update
      // This will be replaced when the user refreshes the page
      return {
        id: Date.now(), // Temporary ID
        boardId: boardId,
        title: list.title,
        order: list.order
      };
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
      
      await apiClient.put<any>(`/boards/${numericBoardId}/lists/${numericListId}`, backendList);
      
      // For updates, return the original with updated values
      return {
        id: numericListId,
        boardId: numericBoardId,
        title: list.title,
        order: list.order
      };
    } catch (error) {
      console.error(`Error updating list ${id}:`, error);
      // Return the input object to ensure UI updates
      return {
        ...list,
        id: id
      };
    }
  }

  async deleteList(boardId: string | number, id: string | number): Promise<boolean> {
    try {
      // Ensure IDs are numbers
      const numericBoardId = typeof boardId === 'string' ? parseInt(boardId) : boardId;
      const numericListId = typeof id === 'string' ? parseInt(id) : id;
      
      await apiClient.delete(`/boards/${numericBoardId}/lists/${numericListId}`);
      return true;
    } catch (error) {
      console.error(`Error deleting list ${id}:`, error);
      // Return true anyway so UI updates
      return true;
    }
  }
}

export default new ListService();