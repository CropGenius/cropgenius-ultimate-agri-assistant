// src/data/repositories/taskRepository.ts
/**
 * Repository for farm task-related data operations
 */

import { db } from '@/data/supabaseClient';
import { useApp } from '@/context/AppContext';

// Task entity type
export interface Task {
  id: string;
  farm_id: string;
  field_id?: string;
  user_id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  due_date?: string;
  assigned_to?: string;
  created_at?: string;
  updated_at?: string;
  completed_at?: string;
  source: 'ai_generated' | 'user_created' | 'system';
  ai_recommendation?: string;
  farm_plan_id?: string;
}

// Task creation payload
export interface CreateTaskPayload {
  farm_id: string;
  field_id?: string;
  user_id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  due_date?: string;
  assigned_to?: string;
  source?: 'ai_generated' | 'user_created' | 'system';
  ai_recommendation?: string;
  farm_plan_id?: string;
}

// Task update payload
export type UpdateTaskPayload = Partial<
  Omit<Task, 'id' | 'created_at' | 'updated_at' | 'farm_id' | 'user_id'>
>;

// TaskRepository singleton
export const TaskRepository = {
  /**
   * Get all tasks for a farm
   */
  async getTasksByFarmId(
    farmId: string,
    filters?: {
      status?: Task['status'] | Task['status'][];
      priority?: Task['priority'] | Task['priority'][];
      fieldId?: string;
      dueDate?: { from: string; to: string };
    }
  ): Promise<{ data: Task[] | null; error: Error | null }> {
    // Start with the basic filter for farm_id
    let queryFilters: Record<string, any> = { farm_id: farmId };

    // Apply additional filters if provided
    if (filters) {
      // Use custom query for more complex filtering
      const { data, error } = await db.raw
        .from('tasks')
        .select('*')
        .eq('farm_id', farmId)
        .conditional(!!filters.fieldId, (query) =>
          query.eq('field_id', filters.fieldId)
        )
        .conditional(!!filters.status, (query) =>
          Array.isArray(filters.status)
            ? query.in('status', filters.status)
            : query.eq('status', filters.status)
        )
        .conditional(!!filters.priority, (query) =>
          Array.isArray(filters.priority)
            ? query.in('priority', filters.priority)
            : query.eq('priority', filters.priority)
        )
        .conditional(!!filters.dueDate, (query) =>
          query
            .gte('due_date', filters.dueDate?.from)
            .lte('due_date', filters.dueDate?.to)
        )
        .order('due_date', { ascending: true })
        .order('priority', { ascending: false }); // Higher priority first

      return { data, error };
    }

    // Basic query with just farm_id filter
    return db.find<Task>({
      table: 'tasks',
      filters: queryFilters,
      order: { column: 'due_date', ascending: true },
    });
  },

  /**
   * Get tasks for a specific field
   */
  async getTasksByFieldId(
    fieldId: string
  ): Promise<{ data: Task[] | null; error: Error | null }> {
    return db.find<Task>({
      table: 'tasks',
      filters: { field_id: fieldId },
      order: { column: 'due_date', ascending: true },
    });
  },

  /**
   * Get a specific task by ID
   */
  async getTaskById(
    taskId: string
  ): Promise<{ data: Task | null; error: Error | null }> {
    const result = await db.find<Task>({
      table: 'tasks',
      filters: { id: taskId },
      singleRecord: true,
    });

    return {
      data: result.data?.[0] || null,
      error: result.error,
    };
  },

  /**
   * Create a new task
   */
  async createTask(
    task: CreateTaskPayload
  ): Promise<{ data: Task | null; error: Error | null }> {
    const taskWithDefaults = {
      ...task,
      status: task.status || 'pending',
    };

    const result = await db.insert<Task>('tasks', taskWithDefaults, {
      returnData: true,
    });

    return {
      data: Array.isArray(result.data) ? result.data[0] : result.data,
      error: result.error,
    };
  },

  /**
   * Create multiple tasks at once
   */
  async createTasks(
    tasks: CreateTaskPayload[]
  ): Promise<{ data: Task[] | null; error: Error | null }> {
    const tasksWithDefaults = tasks.map((task) => ({
      ...task,
      status: task.status || 'pending',
    }));

    return db.insert<Task>('tasks', tasksWithDefaults, { returnData: true });
  },

  /**
   * Update task details
   */
  async updateTask(
    taskId: string,
    updates: UpdateTaskPayload
  ): Promise<{ data: Task | null; error: Error | null }> {
    // If marking as completed, set completed_at
    const updatesWithTimestamp =
      updates.status === 'completed' && !updates.completed_at
        ? { ...updates, completed_at: new Date().toISOString() }
        : updates;

    return db.update<Task>('tasks', { id: taskId }, updatesWithTimestamp, {
      returnData: true,
    });
  },

  /**
   * Delete a task
   */
  async deleteTask(
    taskId: string
  ): Promise<{ success: boolean; error: Error | null }> {
    const result = await db.delete('tasks', { id: taskId });
    return {
      success: !result.error,
      error: result.error,
    };
  },

  /**
   * Get all tasks associated with a farm plan
   */
  async getTasksByFarmPlanId(
    farmPlanId: string
  ): Promise<{ data: Task[] | null; error: Error | null }> {
    return db.find<Task>({
      table: 'tasks',
      filters: { farm_plan_id: farmPlanId },
      order: { column: 'due_date', ascending: true },
    });
  },
};

/**
 * Hook for task operations that automatically includes the current user and farm context
 */
export const useTaskRepository = () => {
  const { user, state } = useApp();
  const userId = user?.id;
  const { currentFarmId } = state;

  return {
    ...TaskRepository,

    /**
     * Get tasks for the current farm
     */
    getCurrentFarmTasks: async (
      filters?: Parameters<typeof TaskRepository.getTasksByFarmId>[1]
    ): Promise<{ data: Task[] | null; error: Error | null }> => {
      if (!currentFarmId) {
        return { data: null, error: new Error('No farm selected') };
      }
      return TaskRepository.getTasksByFarmId(currentFarmId, filters);
    },

    /**
     * Create a task in the current farm
     */
    createTaskInCurrentFarm: async (
      task: Omit<CreateTaskPayload, 'farm_id' | 'user_id'>
    ): Promise<{ data: Task | null; error: Error | null }> => {
      if (!currentFarmId || !userId) {
        return { data: null, error: new Error('Farm or user context missing') };
      }
      return TaskRepository.createTask({
        ...task,
        farm_id: currentFarmId,
        user_id: userId,
      });
    },

    /**
     * Create multiple tasks in the current farm
     */
    createTasksInCurrentFarm: async (
      tasks: Omit<CreateTaskPayload, 'farm_id' | 'user_id'>[]
    ): Promise<{ data: Task[] | null; error: Error | null }> => {
      if (!currentFarmId || !userId) {
        return { data: null, error: new Error('Farm or user context missing') };
      }

      const tasksWithContext = tasks.map((task) => ({
        ...task,
        farm_id: currentFarmId,
        user_id: userId,
      }));

      return TaskRepository.createTasks(tasksWithContext);
    },
  };
};
