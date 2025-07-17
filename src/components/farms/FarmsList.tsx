import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Leaf,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import ErrorBoundary from '@/components/error/ErrorBoundary';
import { Farm } from '@/types/farm';

interface FarmsListProps {
  onFarmSelect?: (farm: Farm) => void;
  selectedFarmId?: string;
}

export const FarmsList: React.FC<FarmsListProps> = ({ onFarmSelect, selectedFarmId }) => {
  const { user } = useAuthContext();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newFarm, setNewFarm] = useState({
    name: '',
    location: '',
    size: '',
    size_unit: 'acres',
    description: ''
  });

  useEffect(() => {
    if (user) {
      loadFarms();
    }
  }, [user]);

  const loadFarms = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('farms')
        .select(`
          *,
          fields:fields(count)
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setFarms(data || []);
    } catch (error: any) {
      console.error('Failed to load farms:', error);
      toast.error('Failed to load farms', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const createFarm = async () => {
    if (!newFarm.name.trim()) {
      toast.error('Farm name is required');
      return;
    }

    try {
      setCreating(true);

      const farmData = {
        user_id: user!.id,
        name: newFarm.name.trim(),
        location: newFarm.location.trim() || null,
        size: newFarm.size ? parseFloat(newFarm.size) : null,
        size_unit: newFarm.size_unit,
        description: newFarm.description.trim() || null
      };

      const { data, error } = await supabase
        .from('farms')
        .insert(farmData)
        .select()
        .single();

      if (error) throw error;

      setFarms(prev => [data, ...prev]);
      setShowCreateDialog(false);
      setNewFarm({
        name: '',
        location: '',
        size: '',
        size_unit: 'acres',
        description: ''
      });

      toast.success('Farm created successfully!', {
        description: `${data.name} has been added to your farms.`
      });

    } catch (error: any) {
      console.error('Failed to create farm:', error);
      toast.error('Failed to create farm', {
        description: error.message
      });
    } finally {
      setCreating(false);
    }
  };

  const deleteFarm = async (farmId: string) => {
    try {
      const { error } = await supabase
        .from('farms')
        .delete()
        .eq('id', farmId);

      if (error) throw error;

      setFarms(prev => prev.filter(f => f.id !== farmId));
      toast.success('Farm deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete farm:', error);
      toast.error('Failed to delete farm', {
        description: error.message
      });
    }
  };

  const getFarmStats = (farm: Farm) => {
    // Mock stats - in real app, these would come from actual data
    return {
      fieldsCount: Math.floor(Math.random() * 5) + 1,
      health: Math.floor(Math.random() * 30) + 70,
      lastActivity: '2 hours ago'
    };
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="container py-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="container py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Farms</h1>
            <p className="text-gray-600 mt-1">
              Manage and monitor all your farming operations
            </p>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Farm
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Farm</DialogTitle>
                <DialogDescription>
                  Add a new farm to your CropGenius account
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="farm-name">Farm Name *</Label>
                  <Input
                    id="farm-name"
                    value={newFarm.name}
                    onChange={(e) => setNewFarm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Green Valley Farm"
                  />
                </div>
                
                <div>
                  <Label htmlFor="farm-location">Location</Label>
                  <Input
                    id="farm-location"
                    value={newFarm.location}
                    onChange={(e) => setNewFarm(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., Nairobi, Kenya"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="farm-size">Size</Label>
                    <Input
                      id="farm-size"
                      type="number"
                      value={newFarm.size}
                      onChange={(e) => setNewFarm(prev => ({ ...prev, size: e.target.value }))}
                      placeholder="e.g., 5.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="farm-unit">Unit</Label>
                    <Select
                      value={newFarm.size_unit}
                      onValueChange={(value) => setNewFarm(prev => ({ ...prev, size_unit: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="acres">Acres</SelectItem>
                        <SelectItem value="hectares">Hectares</SelectItem>
                        <SelectItem value="square_meters">Square Meters</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="farm-description">Description</Label>
                  <Textarea
                    id="farm-description"
                    value={newFarm.description}
                    onChange={(e) => setNewFarm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of your farm..."
                    rows={3}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button onClick={createFarm} disabled={creating}>
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Farm'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Farms Grid */}
        {farms.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {farms.map((farm) => {
              const stats = getFarmStats(farm);
              const isSelected = selectedFarmId === farm.id;
              
              return (
                <motion.div key={farm.id} variants={item}>
                  <Card 
                    className={`hover:shadow-lg transition-all cursor-pointer ${
                      isSelected ? 'ring-2 ring-primary border-primary' : ''
                    }`}
                    onClick={() => onFarmSelect?.(farm)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Leaf className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{farm.name}</CardTitle>
                            {farm.location && (
                              <div className="flex items-center gap-1 mt-1">
                                <MapPin className="h-3 w-3 text-gray-500" />
                                <span className="text-sm text-gray-600">{farm.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {isSelected && (
                          <Badge className="bg-primary text-primary-foreground">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Selected
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Farm Details */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {farm.size && (
                          <div>
                            <span className="text-gray-500">Size:</span>
                            <p className="font-medium">{farm.size} {farm.size_unit}</p>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-500">Fields:</span>
                          <p className="font-medium">{stats.fieldsCount}</p>
                        </div>
                      </div>
                      
                      {/* Health Score */}
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">Health Score</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">{stats.health}%</span>
                          <Badge 
                            variant="outline"
                            className={
                              stats.health >= 80 ? 'text-green-600 border-green-200' :
                              stats.health >= 60 ? 'text-yellow-600 border-yellow-200' :
                              'text-red-600 border-red-200'
                            }
                          >
                            {stats.health >= 80 ? 'Excellent' : 
                             stats.health >= 60 ? 'Good' : 'Needs Attention'}
                          </Badge>
                        </div>
                      </div>
                      
                      {farm.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {farm.description}
                        </p>
                      )}
                      
                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-xs text-gray-500">
                          Last activity: {stats.lastActivity}
                        </span>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteFarm(farm.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mx-auto w-16 h-16 mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <Leaf className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No farms yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Get started by creating your first farm. You can add fields, track crops, and monitor your agricultural operations.
            </p>
            <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Farm
            </Button>
          </motion.div>
        )}
      </div>
    </ErrorBoundary>
  );
};