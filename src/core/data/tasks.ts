import { supabase } from '@/lib/supabaseClient';
import { Task } from '@/features/mission-control/taskTypes';

const TABLE = 'tasks';

export async function fetchTasks(userId: string) {
  const { data, error } = await supabase
    .from<Task>(TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('due_date', { ascending: true });
  if (error) throw error;
  return data;
}

export async function insertTask(task: Omit<Task, 'id'>) {
  const { data, error } = await supabase.from<Task>(TABLE).insert(task).select().single();
  if (error) throw error;
  return data;
}

export async function updateTask(id: string, partial: Partial<Task>) {
  const { data, error } = await supabase.from<Task>(TABLE).update(partial).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteTask(id: string) {
  const { error } = await supabase.from<Task>(TABLE).delete().eq('id', id);
  if (error) throw error;
}
