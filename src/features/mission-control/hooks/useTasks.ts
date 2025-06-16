import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTasks, insertTask, updateTask, deleteTask } from '@/core/data/tasks';
import { Task } from '../taskTypes';
import { useAuth } from '@/context/AuthContext';

export const useTasks = () => {
  const { user } = useAuth();
  return useQuery(['tasks', user?.id], () => fetchTasks(user!.id), {
    enabled: !!user,
  });
};

export const useAddTask = () => {
  const qc = useQueryClient();
  return useMutation(insertTask, {
    onSuccess: () => qc.invalidateQueries(['tasks']),
  });
};

export const useUpdateTask = () => {
  const qc = useQueryClient();
  return useMutation(({ id, partial }: { id: string; partial: Partial<Task> }) => updateTask(id, partial), {
    onSuccess: () => qc.invalidateQueries(['tasks']),
  });
};

export const useDeleteTask = () => {
  const qc = useQueryClient();
  return useMutation(deleteTask, {
    onSuccess: () => qc.invalidateQueries(['tasks']),
  });
};
