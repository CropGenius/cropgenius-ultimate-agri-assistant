import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createTask } from '@/core/data/tasks';
import { Task, TaskPriority } from '../taskTypes';

const taskFormSchema = z.object({
  estimated_roi: z.number().default(0),
  roi_currency: z.string().default('USD'),
  title: z.string().min(3, 'Title must be at least 3 characters long.'),
  description: z.string().optional(),
  priority: z.enum(['urgent', 'important', 'routine']),
  type: z.enum(['planting', 'irrigation', 'pest_control', 'harvesting', 'soil_testing', 'other']),
  due_date: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface CreateTaskModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

interface AiTaskResponse {
  title: string;
  description?: string;
  priority: 'urgent' | 'important' | 'routine';
  type: 'planting' | 'irrigation' | 'pest_control' | 'harvesting' | 'soil_testing' | 'other';
  estimated_roi: number;
  roi_currency: string;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onOpenChange }) => {
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'important',
      type: 'other',
      estimated_roi: 0,
      roi_currency: 'USD',
    },
  });

  const { mutate, isPending } = useMutation<Task, Error, TaskFormValues>({
    mutationFn: createTask,
    onSuccess: () => {
      toast.success('Task created successfully!');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast.error(`Failed to create task: ${error.message}`);
    },
  });

  const onSubmit = (values: TaskFormValues) => {
    mutate(values);
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt) {
      toast.info('Please enter a goal to generate tasks.');
      return;
    }
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput: aiPrompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate tasks.');
      }

      const { tasks } = await response.json();
      
      if (tasks && tasks.length > 0) {
        const firstTask: AiTaskResponse = tasks[0];
        form.setValue('title', firstTask.title);
        form.setValue('description', firstTask.description || '');
        form.setValue('priority', firstTask.priority);
        form.setValue('type', firstTask.type);
        form.setValue('estimated_roi', firstTask.estimated_roi);
        form.setValue('roi_currency', firstTask.roi_currency);
        toast.success('Task details populated by AI! Review and save.');
        // Here you could handle multiple tasks, e.g., store them in state and show a list
      } else {
        toast.error('The AI did not return any tasks. Please try a different prompt.');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Fill in the details below, or use our AI to generate tasks from a goal.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Prepare soil for planting" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add any extra details..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or Generate with AI
                </span>
              </div>
            </div>

            <div className="space-y-2">
                <FormLabel>Goal for AI</FormLabel>
                <div className="flex gap-2">
                    <Input 
                        placeholder="e.g., Prepare for next week's corn planting" 
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        disabled={isGenerating}
                    />
                    <Button type="button" onClick={handleAiGenerate} disabled={isGenerating || !aiPrompt}>
                        {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="important">Important</SelectItem>
                        <SelectItem value="routine">Routine</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="planting">Planting</SelectItem>
                        <SelectItem value="irrigation">Irrigation</SelectItem>
                        <SelectItem value="pest_control">Pest Control</SelectItem>
                        <SelectItem value="harvesting">Harvesting</SelectItem>
                        <SelectItem value="soil_testing">Soil Testing</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending || isGenerating}>
                {isPending ? 'Creating...' : 'Create Task'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
