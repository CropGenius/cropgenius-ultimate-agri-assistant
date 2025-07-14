import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Edit, Trash2, Plus } from 'lucide-react';
import { supabase } from '@/services/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { Farm } from '@/types/farm';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { SatelliteFarmCard } from './SatelliteFarmCard';

interface FarmsListProps {
  onFarmSelect?: (farm: Farm) => void;
  selectedFarmId?: string;
}

export const FarmsList: React.FC<FarmsListProps> = ({ onFarmSelect, selectedFarmId }) => {
  const { user } = useAuth();
  const [farms, setFarms] = useState<Database['public']['Tables']['farms']['Row'][]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadFarms();

    // 🎧 Real-time subscription – update list on insert/update/delete
    const channel = supabase.channel('farms-list')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'farms', filter: `user_id=eq.${user.id}` }, payload => {
        // Just reload; small list.
        loadFarms();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
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
            className="relative"
          >
            <div 
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedFarmId === farm.id ? 'ring-2 ring-green-500 ring-offset-2' : ''
              }`}
              onClick={() => onFarmSelect?.(farm as Farm)}
            >
              <SatelliteFarmCard farm={farm} />
            </div>
            
            {/* Action buttons overlay */}
            <div className="absolute top-2 right-2 flex gap-1">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-white/80 hover:bg-white">
                <Edit className="w-3 h-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteFarm(farm.id);
                }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
            
            {/* Active badge */}
            {selectedFarmId === farm.id && (
              <div className="absolute top-2 left-2">
                <Badge variant="secondary" className="bg-green-500 text-white">
                  Active
                </Badge>
              </div>
            )}
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