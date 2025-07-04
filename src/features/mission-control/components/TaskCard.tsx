
import { Task, TaskPriority, TaskStatus, mapPriorityToDisplay } from '../taskTypes';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { GripVertical, AlertTriangle, Star, CheckCircle2, Calendar, Hourglass, Info } from 'lucide-react'; // Added Hourglass, Info

interface TaskCardProps {
  task: Task;
  onToggleStatus: (id: string, currentStatus: TaskStatus) => void; // Changed prop name and signature
}

// Updated priorityStyles to use integer keys from TaskPriority
const priorityStyles: Record<TaskPriority, { icon: React.ElementType; color: string; label: string }> = {
  1: { icon: AlertTriangle, color: 'border-red-500', label: 'High' },    // High priority
  2: { icon: Star, color: 'border-yellow-500', label: 'Medium' }, // Medium priority
  3: { icon: Info, color: 'border-blue-500', label: 'Low' },      // Low priority
};

export const TaskCard: React.FC<TaskCardProps> = React.memo(({ task, onToggleStatus }) => {
  // Get style based on task.priority, default to medium if somehow undefined
  const styleInfo = priorityStyles[task.priority] || priorityStyles[2];
  const isCompleted = task.status === 'completed';

  return (
    <Card className={cn(
      'mb-3 transition-all hover:shadow-lg border-l-4',
      styleInfo.color,
      isCompleted ? 'bg-gray-50 opacity-70' : 'bg-white'
    )}>
      <CardContent className="p-4 flex items-start">
        <Checkbox
          id={`task-${task.id}`}
          checked={isCompleted}
          onCheckedChange={() => onToggleStatus(task.id, task.status)}
          className="mr-4 mt-1 flex-shrink-0"
        />
        <div className="flex-grow">
          <label
            htmlFor={`task-${task.id}`}
            className={cn(
              'font-semibold text-lg leading-none cursor-pointer',
              isCompleted ? 'line-through text-gray-500' : 'text-gray-900'
            )}
          >
            {task.title}
          </label>
          
          {task.description && (
            <p className={cn('text-sm text-gray-600 mt-1', isCompleted && 'line-through')}>
              {task.description}
            </p>
          )}
        </div>
        <div className="ml-4 flex flex-col items-end space-y-2 text-sm text-muted-foreground flex-shrink-0">
          <div className="flex items-center">
            <styleInfo.icon className={cn('h-5 w-5 mr-1', isCompleted ? 'text-gray-400' : 'text-gray-700')} />
            <span className="font-medium">{styleInfo.label}</span>
          </div>
          {task.due_date && (
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-1 text-gray-500" />
              <span>{new Date(task.due_date).toLocaleDateString()}</span>
            </div>
          )}
          <div className="flex items-center">
            {task.status === 'in_progress' && <Hourglass className="h-5 w-5 mr-1 text-blue-500" />}
            {task.status === 'completed' && <CheckCircle2 className="h-5 w-5 mr-1 text-green-500" />}
            <span className="font-medium capitalize">{task.status.replace('_', ' ')}</span>
          </div>
        </div>
        {/* Drag handle can be re-added if drag-and-drop functionality is implemented */}
        {/* <GripVertical className="h-6 w-6 ml-2 text-gray-400 cursor-grab self-center flex-shrink-0" /> */}
      </CardContent>
    </Card>
  );
});
