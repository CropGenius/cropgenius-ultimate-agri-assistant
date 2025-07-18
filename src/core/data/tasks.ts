import { supabase } from '@/integrations/supabase/client';
import { Task, TaskStatus, TaskPriority } from '@/features/mission-control/taskTypes';

const TABLE_NAME = 'tasks'; // Schema name is 'tasks'

export async function getTasks(): Promise<Task[]> {
  // RLS will ensure only authorized tasks are returned.
  // No need to filter by user_id here directly if RLS is comprehensive.
  // The RLS for tasks:
  // USING (EXISTS (
  //   SELECT 1 FROM public.fields
  //   JOIN public.farms ON fields.farm_id = farms.id
  //   WHERE fields.id = tasks.field_id
  //   AND (farms.user_id = auth.uid() OR tasks.assigned_to = auth.uid())
  // ));
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*') // Fetches all columns as per new Task interface
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tasks:', error);
    throw new Error(error.message);
  }
  // Ensure data matches Task[] structure, though Supabase types should handle this.
  return (data as Task[]) || [];
}

// Define the type for data needed to create a task, based on the new schema
// Omitting id, created_at, updated_at (auto-generated) and created_by (set from user session)
export type CreateTaskData = Omit<Task, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'status'> & {
  status?: TaskStatus; // Status is optional on create, defaults to 'pending' in DB
};


export async function createTask(taskData: CreateTaskData): Promise<Task> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const taskToInsert = {
    ...taskData,
    created_by: user.id,
    status: taskData.status || 'pending', // Default to 'pending' if not provided
  };

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(taskToInsert)
    .select()
    .single();

  if (error) {
    console.error('Error creating task:', error);
    throw new Error(error.message);
  }

  return data as Task;
}

export async function updateTaskStatus(taskId: string, status: TaskStatus): Promise<Task> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update({ status: status, updated_at: new Date().toISOString() }) // Also update updated_at
    .eq('id', taskId)
    .select()
    .single();

  if (error) {
    console.error('Error updating task status:', error);
    throw new Error(error.message);
  }

  return data as Task;
}

// If you need to update more than just status, a generic update function:
export type UpdateTaskData = Partial<Omit<Task, 'id' | 'created_at' | 'updated_at' | 'created_by'>>;

export async function updateTask(taskId: string, updates: UpdateTaskData): Promise<Task> {
    const dataToUpdate = {
        ...updates,
        updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
        .from(TABLE_NAME)
        .update(dataToUpdate)
        .eq('id', taskId)
        .select()
        .single();

    if (error) {
        console.error('Error updating task:', error);
        throw new Error(error.message);
    }
    return data as Task;
}
