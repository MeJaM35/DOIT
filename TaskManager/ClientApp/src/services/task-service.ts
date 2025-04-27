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
  priority: TaskPriority | number;
  status: TaskStatus | number;
  position?: number;
  taskIdentifier?: string;
}

// Interface to match what the backend expects
interface BackendTaskDto {
  title: string;
  description?: string;
  dueDate?: string;
  priority: number;
  status: number;
  position?: number;
  taskIdentifier?: string;
}

class TaskService {
  async getTasks(listId: string | number): Promise<TaskItemDto[]> {
    try {
      // Convert listId to number if it's a string
      const numericListId = typeof listId === 'string' ? parseInt(listId) : listId;
      
      const response = await apiClient.get<any[]>(`/lists/${numericListId}/tasks`);
      // Map backend response to our frontend format
      return response.data.map(task => ({
        id: task.id,
        listId: task.boardListId || numericListId,
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        priority: mapNumericPriorityToString(task.priority),
        status: mapNumericStatusToString(task.status),
        position: task.position,
        taskIdentifier: task.taskIdentifier
      }));
    } catch (error) {
      console.error(`Error fetching tasks for list ${listId}:`, error);
      // Return empty array instead of throwing to prevent UI crashes
      return [];
    }
  }

  async getTask(listId: string | number, id: string | number): Promise<TaskItemDto | null> {
    try {
      // Convert IDs to numbers if they're strings
      const numericListId = typeof listId === 'string' ? parseInt(listId) : listId;
      const numericTaskId = typeof id === 'string' ? parseInt(id) : id;
      
      const response = await apiClient.get<any>(`/lists/${numericListId}/tasks/${numericTaskId}`);
      
      return {
        id: response.data.id,
        listId: response.data.boardListId || numericListId,
        title: response.data.title,
        description: response.data.description,
        dueDate: response.data.dueDate,
        priority: mapNumericPriorityToString(response.data.priority),
        status: mapNumericStatusToString(response.data.status),
        position: response.data.position,
        taskIdentifier: response.data.taskIdentifier
      };
    } catch (error) {
      console.error(`Error fetching task ${id}:`, error);
      return null;
    }
  }

  async createTask(listId: string | number, task: TaskItemDto): Promise<TaskItemDto | null> {
    try {
      // Convert listId to number if it's a string
      const numericListId = typeof listId === 'string' ? parseInt(listId) : listId;
      
      // Map to backend format
      const backendTask: BackendTaskDto = {
        title: task.title,
        description: task.description || "",
        dueDate: task.dueDate,
        // Convert string enum values to numeric enum values
        priority: convertPriorityToNumber(task.priority),
        status: convertStatusToNumber(task.status),
        position: task.position || 0,
        taskIdentifier: task.taskIdentifier
      };

      console.log('Creating task with data:', backendTask);
      const response = await apiClient.post<any>(`/lists/${numericListId}/tasks`, backendTask);
      console.log('Task creation response:', response.data);
      
      if (!response.data) {
        console.error('Task creation succeeded but returned no data');
        // Still return something to update UI
        return {
          ...task,
          id: Date.now(), // Temporary ID
          listId: numericListId
        };
      }
      
      // Map response back to frontend format
      return {
        id: response.data.id,
        listId: response.data.boardListId || numericListId,
        title: response.data.title || task.title,
        description: response.data.description || task.description,
        dueDate: response.data.dueDate || task.dueDate,
        priority: mapNumericPriorityToString(response.data.priority),
        status: mapNumericStatusToString(response.data.status),
        position: response.data.position || task.position,
        taskIdentifier: response.data.taskIdentifier || task.taskIdentifier
      };
    } catch (error) {
      console.error('Error creating task:', error);
      // Return the original task object with a temporary ID so UI can still update
      return {
        ...task,
        id: Date.now(), // Temporary ID
        listId
      };
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
function convertPriorityToNumber(priority: TaskPriority | number): number {
  if (typeof priority === 'number') return priority;
  
  switch(priority) {
    case TaskPriority.Low: return 0;
    case TaskPriority.Medium: return 1;
    case TaskPriority.High: return 2;
    case TaskPriority.Urgent: return 3;
    default: return 1; // Medium as default
  }
}

function convertStatusToNumber(status: TaskStatus | number): number {
  if (typeof status === 'number') return status;
  
  switch(status) {
    case TaskStatus.ToDo: return 0;
    case TaskStatus.InProgress: return 1;
    case TaskStatus.Blocked: return 2;
    case TaskStatus.Done: return 3;
    default: return 0; // ToDo as default
  }
}

// Helper functions to convert numeric enum values to string enum values
function mapNumericPriorityToString(priority: number): TaskPriority {
  switch(priority) {
    case 0: return TaskPriority.Low;
    case 1: return TaskPriority.Medium;
    case 2: return TaskPriority.High;
    case 3: return TaskPriority.Urgent;
    default: return TaskPriority.Medium;
  }
}

function mapNumericStatusToString(status: number): TaskStatus {
  switch(status) {
    case 0: return TaskStatus.ToDo;
    case 1: return TaskStatus.InProgress;
    case 2: return TaskStatus.Blocked;
    case 3: return TaskStatus.Done;
    default: return TaskStatus.ToDo;
  }
}

export default new TaskService();