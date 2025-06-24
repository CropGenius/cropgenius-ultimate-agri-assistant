import { useState, useMemo, useCallback } from 'react'; // Added useCallback
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, Zap, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { TaskCard } from '@/features/mission-control/components/TaskCard';
import { CreateTaskModal } from '@/features/mission-control/components/CreateTaskModal';
import { Task, TaskPriority, TaskStatus, mapPriorityToDisplay } from '@/features/mission-control/taskTypes';
import { getTasks, updateTaskStatus } from '@/core/data/tasks'; // updateTaskCompletion changed to updateTaskStatus

// Define the order and labels for priorities based on new integer system
const priorityOrderConfig: { key: TaskPriority; label: string; defaultValue?: boolean }[] = [
  { key: 1, label: 'High', defaultValue: true },    // High
  { key: 2, label: 'Medium', defaultValue: true }, // Medium
  { key: 3, label: 'Low' },      // Low
];

const MissionControl: React.FC = () => {
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading, isError, error } = useQuery<Task[], Error>({ // Ensure tasks defaults to []
    queryKey: ['tasks'],
    queryFn: getTasks,
    // initialData: [], // React Query v5 prefers default data via queryFn or selector
  });

  const { mutate: mutateTaskStatus } = useMutation({
    mutationFn: ({ taskId, newStatus }: { taskId: string; newStatus: TaskStatus }) =>
      updateTaskStatus(taskId, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success("Task status updated!");
    },
    onError: (err: Error) => {
      toast.error(`Failed to update task: ${err.message}`);
    }
  });

  const handleToggleStatus = useCallback((taskId: string, currentStatus: TaskStatus) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    mutateTaskStatus({ taskId, newStatus });
  }, [mutateTaskStatus]);

  const groupedTasks = useMemo(() => {
    if (!tasks) return {};
    return tasks.reduce((acc, task) => {
      // Ensure task.priority is a valid key for TaskPriority (1, 2, or 3)
      const priorityKey = task.priority as TaskPriority;
      if (!acc[priorityKey]) {
        acc[priorityKey] = [];
      }
      acc[priorityKey].push(task);
      return acc;
    }, {} as Record<TaskPriority, Task[]>);
  }, [tasks]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-10 px-4 bg-red-50 rounded-lg">
        <h3 className="text-lg font-semibold text-red-700">Error Loading Tasks</h3>
        <p className="text-sm text-red-600">{error?.message || "Could not fetch your mission control data. Please try again later."}</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Mission Control</h1>
        <Button onClick={() => setCreateModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Task
        </Button>
      </div>

      {/* Pass userFields data and loading state to CreateTaskModal if it needs them for field selection */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onOpenChange={setCreateModalOpen}
      />

      {tasks.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center bg-blue-100 rounded-full p-4 mb-4">
            <Zap className="h-10 w-10 text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700">No Tasks Yet!</h3>
          <p className="text-gray-500 mt-2">Add tasks to your mission plan or let AI generate them for you.</p>
          <Button className="mt-6" onClick={() => setCreateModalOpen(true)}>
            <Sparkles className="mr-2 h-4 w-4" />
            Add or Generate Tasks
          </Button>
        </div>
      ) : (
        <>
          <Accordion
            type="multiple"
            defaultValue={priorityOrderConfig.filter(p => p.defaultValue).map(p => p.label)}
            className="w-full space-y-4"
          >
            {priorityOrderConfig.map((priorityConf) => {
              const tasksForPriority = groupedTasks[priorityConf.key] || [];
              if (tasksForPriority.length === 0 && !isLoading) return null; // Don't render empty sections unless loading

              return (
                <AccordionItem value={priorityConf.label} key={priorityConf.key} className="border-none">
                  <AccordionTrigger className="text-lg font-semibold capitalize text-gray-700 bg-gray-100 px-4 py-3 rounded-md hover:no-underline">
                    <div className="flex items-center">
                      {priorityConf.label}
                      <span className="ml-2 bg-gray-200 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">
                        {tasksForPriority.length}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 space-y-3">
                    {tasksForPriority.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onToggleStatus={handleToggleStatus} // Changed from onToggleComplete
                      />
                    ))}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </>
      )}
    </div>
  );
};

export default MissionControl;
