import { supabase } from '@/services/supabaseClient';
import { Task } from '@/features/mission-control/taskTypes';

const TABLE = 'tasks';

export async function getTasks(): Promise<Task[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('No user logged in');
    return [];
  }

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tasks:', error);
    throw new Error(error.message);
  }

  return data || [];
}

export async function createTask(taskData: Omit<Task, 'id' | 'user_id' | 'created_at' | 'completed_at' | 'source' | 'completed'>): Promise<Task> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const taskToInsert = {
    ...taskData,
    user_id: user.id,
  };

  const { data, error } = await supabase
    .from(TABLE)
    .insert(taskToInsert)
    .select()
    .single();

  if (error) {
    console.error('Error creating task:', error);
    throw new Error(error.message);
  }

  return data;
}

export async function updateTaskCompletion(taskId: string, completed: boolean): Promise<Task> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ completed_at: completed ? new Date().toISOString() : null })
    .eq('id', taskId)
    .select()
    .single();

  if (error) {
    console.error('Error updating task:', error);
    throw new Error(error.message);
  }

  return data;
}
