import { useState, useCallback } from 'react';
import { taskApi } from '@/api/task.api';
import { extractApiError } from '@/api/client';
import type {
  Task,
  TaskCatalogueItem,
  GroupedCatalogueItems,
  CreateTaskInput,
  UpdateTaskInput,
} from '@/types/task.types';

function groupByCategory(items: TaskCatalogueItem[]): GroupedCatalogueItems[] {
  const map = new Map<string, TaskCatalogueItem[]>();
  for (const item of items) {
    const existing = map.get(item.category) ?? [];
    existing.push(item);
    map.set(item.category, existing);
  }
  return Array.from(map.entries()).map(([category, items]) => ({
    category,
    items,
  }));
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [catalogue, setCatalogue] = useState<TaskCatalogueItem[]>([]);
  const [groupedCatalogue, setGroupedCatalogue] = useState<GroupedCatalogueItems[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCatalogue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await taskApi.getCatalogue();
      const items = response.data ?? [];
      setCatalogue(items);
      setGroupedCatalogue(groupByCategory(items));
    } catch (err) {
      setError(extractApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const selectTasks = useCallback(async (catalogueItemIds: string[]) => {
    const response = await taskApi.selectTasks(catalogueItemIds);
    return response;
  }, []);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await taskApi.getTasks();
      setTasks(response.data ?? []);
    } catch (err) {
      setError(extractApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback(async (input: CreateTaskInput) => {
    const response = await taskApi.createTask(input);
    return response.data;
  }, []);

  const getTaskById = useCallback(async (id: string) => {
    const response = await taskApi.getTaskById(id);
    return response.data;
  }, []);

  const updateTask = useCallback(async (id: string, input: UpdateTaskInput) => {
    const response = await taskApi.updateTask(id, input);
    return response.data;
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    const response = await taskApi.deleteTask(id);
    return response;
  }, []);

  return {
    tasks,
    catalogue,
    groupedCatalogue,
    loading,
    error,
    loadCatalogue,
    selectTasks,
    loadTasks,
    createTask,
    getTaskById,
    updateTask,
    deleteTask,
  };
}
