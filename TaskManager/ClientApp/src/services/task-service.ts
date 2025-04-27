import apiClient from './api-client';

export enum TaskPriority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Urgent = 'Urgent',
}

export enum TaskStatus {
  ToDo = 'ToDo',
  InProgress = 'InProgress',
  Blocked = 'Blocked',
  Done = 'Done',
}

// Frontend task interface - what our components use
export interface TaskItemDto {
  id?: number;
  listId: string | number;
  title: string;
  description?: string;
  dueDate?: string;
  priority: TaskPriority;
  status: TaskStatus;
  position?: number;
  taskIdentifier?: string;
}

// Interface to match what the backend expects
interface BackendTaskDto {
  title: string;
  description?: string;
  dueDate?: string;
  priority: TaskPriority;
  status: TaskStatus;
  position?: number;
  taskIdentifier?: string;
}

class TaskService {
  async getTasks(listId: string | number): Promise<TaskItemDto[]> {
    try {
      const response = await apiClient.get<any[]>(`/lists/${listId}/tasks`);
      return response.data.map(task => ({
        id: task.id,
        listId: task.boardListId,
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        priority: task.priority,
        status: task.status,
        position: task.position,
        taskIdentifier: task.taskIdentifier
      }));
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }

  async getTask(listId: string | number, id: string | number): Promise<TaskItemDto> {
    try {
      const response = await apiClient.get<any>(`/lists/${listId}/tasks/${id}`);
      return {
        id: response.data.id,
        listId: response.data.boardListId,
        title: response.data.title,
        description: response.data.description,
        dueDate: response.data.dueDate,
        priority: response.data.priority,
        status: response.data.status,
        position: response.data.position,
        taskIdentifier: response.data.taskIdentifier
      };
    } catch (error) {
      console.error(`Error fetching task ${id}:`, error);
      throw error;
    }
  }

  async createTask(listId: string | number, task: TaskItemDto): Promise<TaskItemDto> {
    try {
      // Map to backend format
      const backendTask: BackendTaskDto = {
        title: task.title,
        description: task.description || "",
        dueDate: task.dueDate,
        // Convert string enum values to numeric enum values that the backend expects
        priority: convertPriorityToNumber(task.priority),
        status: convertStatusToNumber(task.status),
        position: task.position || 0,
        taskIdentifier: task.taskIdentifier
      };

      console.log('Creating task with data:', backendTask);
      const response = await apiClient.post<any>(`/lists/${listId}/tasks`, backendTask);
      
      // Map response back to frontend format
      return {
        id: response.data.id,
        listId: response.data.boardListId,
        title: response.data.title,
        description: response.data.description,
        dueDate: response.data.dueDate,
        priority: response.data.priority,
        status: response.data.status,
        position: response.data.position,
        taskIdentifier: response.data.taskIdentifier
      };
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  async updateTask(listId: string | number, id: string | number, task: TaskItemDto): Promise<TaskItemDto> {
    try {
      // Map to backend format
      const backendTask: BackendTaskDto = {
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        priority: task.priority,
        status: task.status,
        position: task.position,
        taskIdentifier: task.taskIdentifier
      };

      const response = await apiClient.put<any>(`/lists/${listId}/tasks/${id}`, backendTask);
      
      // Return updated task with frontend format
      return {
        ...task,
        id: id
      };
    } catch (error) {
      console.error(`Error updating task ${id}:`, error);
      throw error;
    }
  }

  async deleteTask(listId: string | number, id: string | number): Promise<void> {
    try {
      await apiClient.delete(`/lists/${listId}/tasks/${id}`);
    } catch (error) {
      console.error(`Error deleting task ${id}:`, error);
      throw error;
    }
  }

  async moveTask(listId: string | number, id: string | number, targetListId: string | number): Promise<TaskItemDto> {
    try {
      const response = await apiClient.post<any>(
        `/lists/${listId}/tasks/${id}/move`, 
        { targetListId }
      );
      
      // Map response back to frontend format
      return {
        id: response.data.id,
        listId: response.data.boardListId,
        title: response.data.title,
        description: response.data.description,
        dueDate: response.data.dueDate,
        priority: response.data.priority,
        status: response.data.status,
        position: response.data.position,
        taskIdentifier: response.data.taskIdentifier
      };
    } catch (error) {
      console.error(`Error moving task ${id}:`, error);
      throw error;
    }
  }
}

// Helper functions to convert string enum values to numeric enum values
function convertPriorityToNumber(priority: TaskPriority): number {
  switch(priority) {
    case TaskPriority.Low: return 0;
    case TaskPriority.Medium: return 1;
    case TaskPriority.High: return 2;
    case TaskPriority.Urgent: return 3;
    default: return 1; // Medium as default
  }
}

function convertStatusToNumber(status: TaskStatus): number {
  switch(status) {
    case TaskStatus.ToDo: return 0;
    case TaskStatus.InProgress: return 1;
    case TaskStatus.Blocked: return 2;
    case TaskStatus.Done: return 3;
    default: return 0; // ToDo as default
  }
}

export default new TaskService();