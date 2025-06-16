import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, Zap, Loader2, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { TaskCard } from '@/features/mission-control/components/TaskCard';
import { CreateTaskModal } from '@/features/mission-control/components/CreateTaskModal';
import { Task, TaskPriority } from '@/features/mission-control/taskTypes';
import { getTasks, updateTaskCompletion } from '@/core/data/tasks';

const priorityOrder: TaskPriority[] = ['urgent', 'important', 'routine'];

const MissionControl: React.FC = () => {
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: tasks, isLoading, isError } = useQuery({
    queryKey: ['tasks'],
    queryFn: getTasks,
    initialData: [],
  });

  const { mutate: updateTask } = useMutation({
    mutationFn: ({ taskId, completed }: { taskId: string; completed: boolean }) => 
      updateTaskCompletion(taskId, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const handleToggleComplete = (taskId: string, completed: boolean) => {
    updateTask({ taskId, completed });
  };

  const groupedTasks = useMemo(() => {
    return tasks.reduce((acc, task) => {
      const priority = task.priority || 'routine';
      if (!acc[priority]) {
        acc[priority] = [];
      }
      acc[priority].push(task);
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
        <p className="text-sm text-red-600">Could not fetch your mission control data. Please try again later.</p>
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

      {tasks.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center bg-blue-100 rounded-full p-4 mb-4">
            <Zap className="h-10 w-10 text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700">Your Yield Engine is Idle</h3>
          <p className="text-gray-500 mt-2">Generate a new mission plan to maximize your farm's profit.</p>
          <Button className="mt-6" onClick={() => setCreateModalOpen(true)}>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate AI Mission Plan
          </Button>
        </div>
      ) : (
        <>
          <CreateTaskModal isOpen={isCreateModalOpen} onOpenChange={setCreateModalOpen} />

          <Accordion type="multiple" defaultValue={['urgent', 'important']} className="w-full space-y-4">
        
          {priorityOrder.map((priority) => {
            const tasksForPriority = groupedTasks[priority] || [];
            if (tasksForPriority.length === 0) return null;

            return (
              <AccordionItem value={priority} key={priority} className="border-none">
                <AccordionTrigger className="text-lg font-semibold capitalize text-gray-700 bg-gray-100 px-4 py-3 rounded-md hover:no-underline">
                  <div className="flex items-center">
                     {priority}
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
                      onToggleComplete={handleToggleComplete}
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
