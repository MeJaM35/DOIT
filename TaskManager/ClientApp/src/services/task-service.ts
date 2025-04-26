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

export interface TaskItemDto {
  id?: string;
  listId: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: TaskPriority;
  status: TaskStatus;
}

class TaskService {
  async getTasks(listId: string): Promise<TaskItemDto[]> {
    const response = await apiClient.get<TaskItemDto[]>(`/lists/${listId}/tasks`);
    return response.data;
  }

  async getTask(listId: string, id: string): Promise<TaskItemDto> {
    const response = await apiClient.get<TaskItemDto>(`/lists/${listId}/tasks/${id}`);
    return response.data;
  }

  async createTask(listId: string, task: TaskItemDto): Promise<TaskItemDto> {
    const response = await apiClient.post<TaskItemDto>(`/lists/${listId}/tasks`, task);
    return response.data;
  }

  async updateTask(listId: string, id: string, task: TaskItemDto): Promise<TaskItemDto> {
    const response = await apiClient.put<TaskItemDto>(`/lists/${listId}/tasks/${id}`, task);
    return response.data;
  }

  async deleteTask(listId: string, id: string): Promise<void> {
    await apiClient.delete(`/lists/${listId}/tasks/${id}`);
  }

  async moveTask(listId: string, id: string, targetListId: string): Promise<TaskItemDto> {
    const response = await apiClient.post<TaskItemDto>(
      `/lists/${listId}/tasks/${id}/move`, 
      { targetListId }
    );
    return response.data;
  }
}

export default new TaskService();