
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useMemoryStore } from '@/hooks/useMemoryStore';

type FormValues = {
  farmName: string;
  location: string;
  size: string;
  unit: string;
};

const FarmOnboarding = () => {
  const { user, updateFarmId } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();
  const { updateMemory } = useMemoryStore();

  // Check if user already has a farm
  const checkExistingFarm = async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('farms')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error checking existing farm:', error);
      return null;
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (!user) {
      toast.error('You must be logged in to create a farm');
      return;
    }

    setLoading(true);

    try {
      // Check if user already has a farm
      const existingFarm = await checkExistingFarm();

      if (existingFarm) {
        // User already has a farm
        updateFarmId(existingFarm.id);
        toast.info('Using your existing farm');
        navigate('/fields?action=manage');
        return;
      }

      // Create a new farm
      const farmData = {
        name: data.farmName,
        location: data.location,
        total_size: parseFloat(data.size),
        size_unit: data.unit,
        user_id: user.id
      };

      const { data: newFarm, error } = await supabase
        .from('farms')
        .insert(farmData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update auth context with new farm ID
      updateFarmId(newFarm.id);

      // Update user memory
      await updateMemory({
        lastFieldCount: 0,
      });

      toast.success('Farm created successfully', {
        description: 'Now let\'s add your first field'
      });

      // Navigate to field creation
      navigate('/fields?action=new');

    } catch (error: any) {
      console.error('Error creating farm:', error);
      toast.error('Failed to create farm', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 border rounded-lg shadow-sm bg-white">
      <h2 className="text-xl font-bold mb-4">Welcome to CROPGenius</h2>
      <p className="text-gray-600 mb-6">
        Tell us about your farm to get personalized AI insights
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="farmName" className="block text-sm font-medium">
            Farm Name *
          </label>
          <input
            id="farmName"
            type="text"
            className="w-full p-2 border rounded-md"
            placeholder="My Farm"
            {...register('farmName', { required: 'Farm name is required' })}
          />
          {errors.farmName && (
            <p className="text-red-500 text-xs">{errors.farmName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="location" className="block text-sm font-medium">
            Location
          </label>
          <input
            id="location"
            type="text"
            className="w-full p-2 border rounded-md"
            placeholder="e.g. Nakuru, Kenya"
            {...register('location')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="size" className="block text-sm font-medium">
              Total Size *
            </label>
            <input
              id="size"
              type="number"
              step="0.01"
              className="w-full p-2 border rounded-md"
              placeholder="10"
              {...register('size', {
                required: 'Size is required',
                min: {
                  value: 0.01,
                  message: 'Size must be greater than 0',
                },
              })}
            />
            {errors.size && (
              <p className="text-red-500 text-xs">{errors.size.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="unit" className="block text-sm font-medium">
              Unit
            </label>
            <select
              id="unit"
              className="w-full p-2 border rounded-md"
              defaultValue="hectares"
              {...register('unit')}
            >
              <option value="hectares">Hectares</option>
              <option value="acres">Acres</option>
              <option value="square_meters">Square Meters</option>
            </select>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Farm...
            </>
          ) : (
            'Continue to Add Fields'
          )}
        </Button>
      </form>
    </div>
  );
};

export default FarmOnboarding;
