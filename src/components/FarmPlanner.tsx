import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  Calendar as CalendarIcon,
  Plus,
  Target,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Leaf,
  Droplets,
  Sun,
  TrendingUp,
  BarChart3,
  Zap,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import ErrorBoundary from '@/components/error/ErrorBoundary';

interface FarmPlan {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: 'draft' | 'active' | 'completed';
  tasks: PlanTask[];
  created_at: string;
}

interface PlanTask {
  id: string;
  title: string;
  description: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high';
  category: 'planting' | 'irrigation' | 'fertilizing' | 'harvesting' | 'pest_control' | 'other';
  status: 'pending' | 'in_progress' | 'completed';
  field_id?: string;
  estimated_duration: number; // in hours
}

const FarmPlanner: React.FC = () => {
  const { user } = useAuthContext();
  const [plans, setPlans] = useState<FarmPlan[]>([]);
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<FarmPlan | null>(null);
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: '',
    description: '',
    start_date: new Date(),
    end_date: new Date(),
  });
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    due_date: new Date(),
    priority: 'medium' as const,
    category: 'other' as const,
    field_id: '',
    estimated_duration: 2
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load fields
      const { data: fieldsData, error: fieldsError } = await supabase
        .from('fields')
        .select('id, name, crop_type')
        .eq('user_id', user!.id);

      if (fieldsError) throw fieldsError;
      setFields(fieldsData || []);

      // Mock farm plans data (in real app, this would come from a farm_plans table)
      const mockPlans: FarmPlan[] = [
        {
          id: '1',
          name: 'Spring Planting Season 2024',
          description: 'Comprehensive plan for spring planting activities',
          start_date: '2024-03-01',
          end_date: '2024-06-30',
          status: 'active',
          tasks: [
            {
              id: '1',
              title: 'Prepare soil for maize planting',
              description: 'Till and fertilize the north field',
              due_date: '2024-03-15',
              priority: 'high',
              category: 'planting',
              status: 'completed',
              field_id: fieldsData?.[0]?.id,
              estimated_duration: 8
            },
            {
              id: '2',
              title: 'Install drip irrigation system',
              description: 'Set up irrigation for tomato field',
              due_date: '2024-03-20',
              priority: 'high',
              category: 'irrigation',
              status: 'in_progress',
              field_id: fieldsData?.[1]?.id,
              estimated_duration: 12
            },
            {
              id: '3',
              title: 'Apply organic fertilizer',
              description: 'Fertilize all vegetable crops',
              due_date: '2024-04-01',
              priority: 'medium',
              category: 'fertilizing',
              status: 'pending',
              estimated_duration: 4
            }
          ],
          created_at: '2024-02-15'
        }
      ];

      setPlans(mockPlans);
      if (mockPlans.length > 0) {
        setSelectedPlan(mockPlans[0]);
      }

    } catch (error: any) {
      console.error('Failed to load farm planning data:', error);
      toast.error('Failed to load data', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const createPlan = async () => {
    if (!newPlan.name.trim()) {
      toast.error('Plan name is required');
      return;
    }

    try {
      setCreating(true);

      // In a real app, this would save to a farm_plans table
      const plan: FarmPlan = {
        id: Date.now().toString(),
        name: newPlan.name,
        description: newPlan.description,
        start_date: newPlan.start_date.toISOString(),
        end_date: newPlan.end_date.toISOString(),
        status: 'draft',
        tasks: [],
        created_at: new Date().toISOString()
      };

      setPlans(prev => [plan, ...prev]);
      setSelectedPlan(plan);
      setShowCreatePlan(false);
      setNewPlan({
        name: '',
        description: '',
        start_date: new Date(),
        end_date: new Date(),
      });

      toast.success('Farm plan created successfully!');

    } catch (error: any) {
      console.error('Failed to create plan:', error);
      toast.error('Failed to create plan', {
        description: error.message
      });
    } finally {
      setCreating(false);
    }
  };

  const addTaskToPlan = () => {
    if (!selectedPlan || !newTask.title.trim()) {
      toast.error('Task title is required');
      return;
    }

    const task: PlanTask = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      due_date: newTask.due_date.toISOString(),
      priority: newTask.priority,
      category: newTask.category,
      status: 'pending',
      field_id: newTask.field_id || undefined,
      estimated_duration: newTask.estimated_duration
    };

    const updatedPlan = {
      ...selectedPlan,
      tasks: [...selectedPlan.tasks, task]
    };

    setPlans(prev => prev.map(p => p.id === selectedPlan.id ? updatedPlan : p));
    setSelectedPlan(updatedPlan);
    
    setNewTask({
      title: '',
      description: '',
      due_date: new Date(),
      priority: 'medium',
      category: 'other',
      field_id: '',
      estimated_duration: 2
    });

    toast.success('Task added to plan!');
  };

  const updateTaskStatus = (taskId: string, status: PlanTask['status']) => {
    if (!selectedPlan) return;

    const updatedPlan = {
      ...selectedPlan,
      tasks: selectedPlan.tasks.map(task => 
        task.id === taskId ? { ...task, status } : task
      )
    };

    setPlans(prev => prev.map(p => p.id === selectedPlan.id ? updatedPlan : p));
    setSelectedPlan(updatedPlan);

    toast.success(`Task marked as ${status}`);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'planting': return <Leaf className="h-4 w-4" />;
      case 'irrigation': return <Droplets className="h-4 w-4" />;
      case 'fertilizing': return <Zap className="h-4 w-4" />;
      case 'harvesting': return <Target className="h-4 w-4" />;
      case 'pest_control': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Farm Planning</h2>
            <p className="text-gray-600">Create and manage your farming schedules and tasks</p>
          </div>
          <Button onClick={() => setShowCreatePlan(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Plan
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Plans List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Plans</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedPlan?.id === plan.id 
                        ? 'bg-primary/10 border-primary' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedPlan(plan)}
                  >
                    <h4 className="font-medium text-sm">{plan.name}</h4>
                    <div className="flex items-center justify-between mt-2">
                      <Badge className={getStatusColor(plan.status)}>
                        {plan.status}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {plan.tasks.length} tasks
                      </span>
                    </div>
                  </div>
                ))}
                
                {plans.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No plans yet</p>
                    <Button 
                      variant="link" 
                      size="sm"
                      onClick={() => setShowCreatePlan(true)}
                    >
                      Create your first plan
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Plan Details */}
          <div className="lg:col-span-3">
            {selectedPlan ? (
              <Tabs defaultValue="tasks" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="tasks">Tasks</TabsTrigger>
                  <TabsTrigger value="calendar">Calendar</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="tasks" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{selectedPlan.name}</CardTitle>
                          <CardDescription>{selectedPlan.description}</CardDescription>
                        </div>
                        <Badge className={getStatusColor(selectedPlan.status)}>
                          {selectedPlan.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Add Task Form */}
                      <div className="border rounded-lg p-4 mb-6 bg-gray-50">
                        <h4 className="font-medium mb-4">Add New Task</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="task-title">Task Title</Label>
                            <Input
                              id="task-title"
                              value={newTask.title}
                              onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                              placeholder="e.g., Plant tomato seeds"
                            />
                          </div>
                          <div>
                            <Label htmlFor="task-field">Field (Optional)</Label>
                            <Select
                              value={newTask.field_id}
                              onValueChange={(value) => setNewTask(prev => ({ ...prev, field_id: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select field" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">No specific field</SelectItem>
                                {fields.map((field) => (
                                  <SelectItem key={field.id} value={field.id}>
                                    {field.name} ({field.crop_type})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="task-priority">Priority</Label>
                            <Select
                              value={newTask.priority}
                              onValueChange={(value: any) => setNewTask(prev => ({ ...prev, priority: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="task-category">Category</Label>
                            <Select
                              value={newTask.category}
                              onValueChange={(value: any) => setNewTask(prev => ({ ...prev, category: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="planting">Planting</SelectItem>
                                <SelectItem value="irrigation">Irrigation</SelectItem>
                                <SelectItem value="fertilizing">Fertilizing</SelectItem>
                                <SelectItem value="harvesting">Harvesting</SelectItem>
                                <SelectItem value="pest_control">Pest Control</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="md:col-span-2">
                            <Label htmlFor="task-description">Description</Label>
                            <Textarea
                              id="task-description"
                              value={newTask.description}
                              onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="Task details..."
                              rows={2}
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-4">
                            <div>
                              <Label>Due Date</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {format(newTask.due_date, "PPP")}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={newTask.due_date}
                                    onSelect={(date) => date && setNewTask(prev => ({ ...prev, due_date: date }))}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                            <div>
                              <Label htmlFor="task-duration">Duration (hours)</Label>
                              <Input
                                id="task-duration"
                                type="number"
                                value={newTask.estimated_duration}
                                onChange={(e) => setNewTask(prev => ({ ...prev, estimated_duration: parseInt(e.target.value) || 1 }))}
                                className="w-20"
                                min="1"
                              />
                            </div>
                          </div>
                          <Button onClick={addTaskToPlan}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Task
                          </Button>
                        </div>
                      </div>

                      {/* Tasks List */}
                      <div className="space-y-3">
                        {selectedPlan.tasks.map((task) => (
                          <motion.div
                            key={task.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                  {getCategoryIcon(task.category)}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium">{task.title}</h4>
                                  {task.description && (
                                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                                  )}
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge className={getPriorityColor(task.priority)}>
                                      {task.priority}
                                    </Badge>
                                    <Badge className={getStatusColor(task.status)}>
                                      {task.status.replace('_', ' ')}
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                      Due: {format(new Date(task.due_date), "MMM dd")}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {task.estimated_duration}h
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {task.status === 'pending' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateTaskStatus(task.id, 'in_progress')}
                                  >
                                    Start
                                  </Button>
                                )}
                                {task.status === 'in_progress' && (
                                  <Button
                                    size="sm"
                                    onClick={() => updateTaskStatus(task.id, 'completed')}
                                  >
                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                    Complete
                                  </Button>
                                )}
                                {task.status === 'completed' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateTaskStatus(task.id, 'pending')}
                                  >
                                    Reopen
                                  </Button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}

                        {selectedPlan.tasks.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <Clock className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p>No tasks in this plan yet</p>
                            <p className="text-sm">Add your first task above</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="calendar">
                  <Card>
                    <CardHeader>
                      <CardTitle>Calendar View</CardTitle>
                      <CardDescription>Visual timeline of your farming activities</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12 text-gray-500">
                        <CalendarIcon className="h-16 w-16 mx-auto mb-4 opacity-30" />
                        <p>Calendar view coming soon</p>
                        <p className="text-sm">This will show your tasks in a calendar format</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="analytics">
                  <Card>
                    <CardHeader>
                      <CardTitle>Plan Analytics</CardTitle>
                      <CardDescription>Track your progress and productivity</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {selectedPlan.tasks.length}
                          </div>
                          <div className="text-sm text-blue-600">Total Tasks</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {selectedPlan.tasks.filter(t => t.status === 'completed').length}
                          </div>
                          <div className="text-sm text-green-600">Completed</div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">
                            {selectedPlan.tasks.reduce((sum, task) => sum + task.estimated_duration, 0)}h
                          </div>
                          <div className="text-sm text-orange-600">Total Hours</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center text-gray-500">
                    <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <p>Select a plan to view details</p>
                    <p className="text-sm">Or create a new plan to get started</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Create Plan Dialog */}
        {showCreatePlan && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Create New Farm Plan</CardTitle>
                <CardDescription>Plan your farming activities and tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="plan-name">Plan Name</Label>
                  <Input
                    id="plan-name"
                    value={newPlan.name}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Spring Planting 2024"
                  />
                </div>
                <div>
                  <Label htmlFor="plan-description">Description</Label>
                  <Textarea
                    id="plan-description"
                    value={newPlan.description}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of this plan..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(newPlan.start_date, "PPP")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newPlan.start_date}
                          onSelect={(date) => date && setNewPlan(prev => ({ ...prev, start_date: date }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(newPlan.end_date, "PPP")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newPlan.end_date}
                          onSelect={(date) => date && setNewPlan(prev => ({ ...prev, end_date: date }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </CardContent>
              <div className="flex items-center justify-end gap-2 p-6 pt-0">
                <Button
                  variant="outline"
                  onClick={() => setShowCreatePlan(false)}
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button onClick={createPlan} disabled={creating}>
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Plan'
                  )}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default FarmPlanner;