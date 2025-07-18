import React, { useState, useEffect } from 'react'; // Added useEffect
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'; // Added useQuery
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
import { createTask, CreateTaskData } from '@/core/data/tasks';
import { Task, TaskPriority, mapDisplayPriorityToInteger } from '../taskTypes';
import { supabase } from '@/integrations/supabase/client'; // For fetching fields

// Schema for the form, aligning with CreateTaskData and new Task structure
const taskFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long.'),
  description: z.string().optional().nullable(),
  priority: z.string(), // Will be 'High', 'Medium', 'Low' from UI select
  due_date: z.string().optional().nullable(),
  field_id: z.string().uuid("Please select a valid field."), // New required field
  // Removed: type (enum), estimated_roi, roi_currency
  // 'status' and 'assigned_to' could be added if needed in the form
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface CreateTaskModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

// Simplified AI Task Response, as many fields are gone
interface AiTaskResponse {
  title: string;
  description?: string;
  priority: 'High' | 'Medium' | 'Low'; // Match display priority
  // type?: string; // 'type' is no longer a direct task property
}

// Function to fetch user's fields
const fetchUserFields = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  // According to schema: fields -> farms -> user_id
  // RLS on fields: EXISTS (SELECT 1 FROM public.farms WHERE farms.id = fields.farm_id AND (farms.user_id = auth.uid()))
  // So, a direct select on fields should be fine.
  const { data, error } = await supabase
    .from('fields')
    .select('id, name')
    // .eq('farm_id.user_id', user.id) // This join syntax not standard for select, RLS handles it
    .order('name');

  if (error) throw error;
  return data || [];
};


export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onOpenChange }) => {
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

  const { data: userFields, isLoading: isLoadingFields } = useQuery({
    queryKey: ['userFields'],
    queryFn: fetchUserFields,
    enabled: isOpen, // Only fetch when modal is open
  });

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'Medium', // Default display priority
      field_id: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({ // Reset form when modal opens to ensure fresh default values
        title: '',
        description: '',
        priority: 'Medium',
        field_id: userFields && userFields.length > 0 ? userFields[0].id : '', // Pre-select first field if available
        due_date: null,
      });
    }
  }, [isOpen, form, userFields]);


  const { mutate, isPending } = useMutation<Task, Error, CreateTaskData>({
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
    const taskDataToSubmit: CreateTaskData = {
      ...values,
      priority: mapDisplayPriorityToInteger(values.priority), // Map UI string to integer
      due_date: values.due_date || null, // Ensure null if empty
      description: values.description || null,
    };
    mutate(taskDataToSubmit);
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt) {
      toast.info('Please enter a goal to generate tasks.');
      return;
    }
    setIsGenerating(true);
    try {
      // Assuming '/api/generate-tasks' is updated or can handle new structure
      const response = await fetch('/api/generate-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput: aiPrompt, fieldId: form.getValues('field_id') }), // Optionally send fieldId
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate tasks from AI.');
      }

      const { tasks: aiGeneratedTasks } = await response.json(); // Expecting tasks array
      
      if (aiGeneratedTasks && aiGeneratedTasks.length > 0) {
        const firstTask: AiTaskResponse = aiGeneratedTasks[0]; // Assuming schema of AiTaskResponse
        form.setValue('title', firstTask.title);
        form.setValue('description', firstTask.description || '');
        form.setValue('priority', firstTask.priority || 'Medium'); // AI should return 'High', 'Medium', 'Low'
        // field_id should already be selected by user or defaulted.
        // due_date could be set by AI if provided.
        toast.success('Task details populated by AI! Review and save.');
      } else {
        toast.error('The AI did not return any tasks. Please try a different prompt.');
      }
    } catch (error: any) {
      toast.error(`AI Task Generation Error: ${error.message}`);
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
              name="field_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Field</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingFields}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingFields ? "Loading fields..." : "Select a field"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {userFields?.map((f: { id: string; name: string }) => (
                        <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
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
             <FormField
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date (Optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value || ''} />
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
                    <Button type="button" onClick={handleAiGenerate} disabled={isGenerating || !aiPrompt || !form.getValues('field_id')}>
                        {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    </Button>
                </div>
                 {!form.getValues('field_id') && <p className="text-xs text-muted-foreground">Please select a field to enable AI generation.</p>}
            </div>

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="High">High (Urgent)</SelectItem>
                      <SelectItem value="Medium">Medium (Important)</SelectItem>
                      <SelectItem value="Low">Low (Routine)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* 'Type' field removed as it's not in the new schema */}
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
