// ─── Task Types ──────────────────────────────────────────────────────────────

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  category?: string | null;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TaskCatalogueItem {
  id: string;
  title: string;
  category: string;
  shortDescription: string;
  createdAt: string;
  updatedAt: string;
}

export interface GroupedCatalogueItems {
  category: string;
  items: TaskCatalogueItem[];
}

export interface TaskCatalogueResponse {
  success: boolean;
  message: string;
  data: TaskCatalogueItem[];
}

export interface TasksResponse {
  success: boolean;
  message: string;
  data: Task[];
}

export interface SelectTasksInput {
  catalogueItemIds: string[];
}

export interface SelectTasksResponse {
  success: boolean;
  message: string;
  data: Task[];
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  category?: string;
  status?: TaskStatus;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  category?: string;
  status?: TaskStatus;
}

export interface SingleTaskResponse {
  success: boolean;
  message: string;
  data: Task;
}

export interface DeleteTaskResponse {
  success: boolean;
  message: string;
}
