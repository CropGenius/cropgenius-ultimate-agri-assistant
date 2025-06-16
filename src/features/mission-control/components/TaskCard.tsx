import React from 'react';
import { Task, TaskPriority } from '../taskTypes';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { GripVertical, AlertTriangle, Star, CheckCircle2, TrendingUp, Calendar } from 'lucide-react';

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
    <Card className={cn('mb-3 transition-all hover:shadow-lg border-l-4', color, task.completed_at ? 'bg-gray-50 opacity-70' : 'bg-white')}>
      <CardContent className="p-4 flex items-start">
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
              'font-semibold text-lg leading-none cursor-pointer',
              task.completed_at ? 'line-through text-gray-500' : 'text-gray-900'
            )}
          >
            {task.title}
          </label>
          
          <div className="mt-2 mb-3">
            <div className="inline-flex items-center font-bold text-sm py-1 px-3 bg-green-100 text-green-800 rounded-full">
              <TrendingUp className="h-4 w-4 mr-2" />
              PROFIT: +{new Intl.NumberFormat('en-US', { style: 'currency', currency: task.roi_currency || 'USD' }).format(task.estimated_roi)}
            </div>
          </div>

          {task.description && (
            <p className={cn('text-base text-gray-600', task.completed_at && 'line-through')}>
              {task.description}
            </p>
          )}
        </div>
        <div className="ml-4 flex flex-col items-end space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Icon className={cn('h-5 w-5 mr-2', task.completed_at ? 'text-gray-400' : 'text-gray-700')} />
            <span className="font-medium capitalize">{task.priority}</span>
          </div>
          {task.due_date && (
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-gray-500" />
              <span>{new Date(task.due_date).toLocaleDateString()}</span>
            </div>
          )}
        </div>
        <GripVertical className="h-6 w-6 ml-2 text-gray-400 cursor-grab self-center" />
      </CardContent>
    </Card>
  );
};
