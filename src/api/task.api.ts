import apiClient from './client';
import type {
  TaskCatalogueResponse,
  TasksResponse,
  SelectTasksResponse,
  CreateTaskInput,
  UpdateTaskInput,
  SingleTaskResponse,
  DeleteTaskResponse,
} from '@/types/task.types';

export const taskApi = {
  getCatalogue: async (): Promise<TaskCatalogueResponse> => {
    const { data } = await apiClient.get<TaskCatalogueResponse>('/tasks/catalogue');
    return data;
  },

  selectTasks: async (catalogueItemIds: string[]): Promise<SelectTasksResponse> => {
    const { data } = await apiClient.post<SelectTasksResponse>('/tasks/select', {
      catalogueItemIds,
    });
    return data;
  },

  getTasks: async (): Promise<TasksResponse> => {
    const { data } = await apiClient.get<TasksResponse>('/tasks');
    return data;
  },

  createTask: async (input: CreateTaskInput): Promise<SingleTaskResponse> => {
    const { data } = await apiClient.post<SingleTaskResponse>('/tasks', input);
    return data;
  },

  getTaskById: async (id: string): Promise<SingleTaskResponse> => {
    const { data } = await apiClient.get<SingleTaskResponse>(`/tasks/${id}`);
    return data;
  },

  updateTask: async (id: string, input: UpdateTaskInput): Promise<SingleTaskResponse> => {
    const { data } = await apiClient.patch<SingleTaskResponse>(`/tasks/${id}`, input);
    return data;
  },

  deleteTask: async (id: string): Promise<DeleteTaskResponse> => {
    const { data } = await apiClient.delete<DeleteTaskResponse>(`/tasks/${id}`);
    return data;
  },
};
