import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Edit, Trash2, Plus } from 'lucide-react';
import { supabase } from '@/services/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { Farm } from '@/types/farm';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface FarmsListProps {
  onFarmSelect?: (farm: Farm) => void;
  selectedFarmId?: string;
}

export const FarmsList: React.FC<FarmsListProps> = ({ onFarmSelect, selectedFarmId }) => {
  const { user } = useAuth();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadFarms();
    }
  }, [user]);

  const loadFarms = async () => {
    try {
      const { data, error } = await supabase
        .from('farms')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFarms(data || []);
    } catch (error: any) {
      toast.error('Failed to load farms', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFarm = async (farmId: string) => {
    if (!confirm('Are you sure you want to delete this farm?')) return;

    try {
      const { error } = await supabase
        .from('farms')
        .delete()
        .eq('id', farmId);

      if (error) throw error;
      
      setFarms(prev => prev.filter(f => f.id !== farmId));
      toast.success('Farm deleted successfully');
    } catch (error: any) {
      toast.error('Failed to delete farm', { description: error.message });
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="opacity-40">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Farms</h2>
        <Button onClick={() => window.location.href = '/onboarding'}>
          <Plus className="w-4 h-4 mr-2" />
          Add Farm
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {farms.map((farm, index) => (
          <motion.div
            key={farm.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedFarmId === farm.id ? 'ring-2 ring-green-500' : ''
              }`}
              onClick={() => onFarmSelect?.(farm)}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-green-600" />
                    {farm.name}
                  </span>
                  {selectedFarmId === farm.id && (
                    <Badge variant="secondary">Active</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {farm.size && (
                    <p className="text-sm text-gray-600">
                      Size: {farm.size} {farm.size_unit}
                    </p>
                  )}
                  {farm.location && (
                    <p className="text-sm text-gray-600">
                      Location: {farm.location}
                    </p>
                  )}
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFarm(farm.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {farms.length === 0 && (
        <div className="text-center py-10">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No farms yet</h3>
          <p className="text-gray-600 mb-4">Create your first farm to get started</p>
          <Button onClick={() => window.location.href = '/onboarding'}>
            <Plus className="w-4 h-4 mr-2" />
            Create Farm
          </Button>
        </div>
      )}
    </div>
  );
};