import React from 'react';
import { Task, TaskPriority } from '../taskTypes';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { GripVertical, AlertTriangle, Star, CheckCircle2 } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string, completed: boolean) => void;
}

const priorityStyles: Record<TaskPriority, { icon: React.ElementType; color: string }> = {
  urgent: { icon: AlertTriangle, color: 'border-red-500' },
  important: { icon: Star, color: 'border-yellow-500' },
  routine: { icon: CheckCircle2, color: 'border-gray-300' },
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onToggleComplete }) => {
  const { icon: Icon, color } = priorityStyles[task.priority] || priorityStyles.routine;

  return (
    <Card className={cn('mb-2 transition-all hover:shadow-md', task.completed_at ? 'bg-gray-50' : 'bg-white')}>
      <CardContent className="p-3 flex items-start">
        <div className={cn('w-1 h-full mr-3 rounded-full', color)}></div>
        <Checkbox
          id={`task-${task.id}`}
          checked={!!task.completed_at}
          onCheckedChange={(checked) => onToggleComplete(task.id, !!checked)}
          className="mr-4 mt-1"
        />
        <div className="flex-grow">
          <label
            htmlFor={`task-${task.id}`}
            className={cn(
              'font-medium leading-none',
              task.completed_at ? 'line-through text-gray-500' : 'text-gray-800'
            )}
          >
            {task.title}
          </label>
          {task.description && (
            <p className={cn('text-sm text-muted-foreground mt-1', task.completed_at && 'line-through')}>
              {task.description}
            </p>
          )}
        </div>
        <div className="ml-4 flex flex-col items-end text-xs text-muted-foreground">
            <Icon className={cn('h-4 w-4', task.completed_at ? 'text-gray-400' : 'text-gray-600')} />
            {task.due_date && <span>{new Date(task.due_date).toLocaleDateString()}</span>}
        </div>
        <GripVertical className="h-5 w-5 ml-2 text-gray-400 cursor-grab" />
      </CardContent>
    </Card>
  );
};
