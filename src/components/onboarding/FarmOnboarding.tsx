
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Database } from '@/integrations/supabase/types';

interface FarmFormData {
  name: string;
  location: string;
  total_size: number;
  size_unit: string;
}

const FarmOnboarding = () => {
  const { user, farmId } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FarmFormData>({
    defaultValues: {
      size_unit: 'hectares'
    }
  });
  const navigate = useNavigate();

  // Check if farm already exists
  const checkFarm = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('farms')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        // Farm already exists, save to localStorage and redirect
        localStorage.setItem('farmId', data.id);
        navigate('/');
      }
    } catch (error: any) {
      console.error('Error checking farm:', error);
      toast.error('Error checking farm data');
    } finally {
      setIsLoading(false);
    }
  };
  
  // If we already have a farmId in context, redirect to home
  if (farmId) {
    navigate('/');
    return null;
  }
  
  const onSubmit = async (data: FarmFormData) => {
    if (!user) {
      toast.error('You must be logged in to create a farm');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Create farm
      const farmData = {
        name: data.name,
        location: data.location,
        total_size: data.total_size,
        size_unit: data.size_unit,
        user_id: user.id
      };
      
      const { data: newFarm, error } = await supabase
        .from('farms')
        .insert(farmData)
        .select('*')
        .single();
      
      if (error) throw error;
      
      // Save farm ID to localStorage
      if (newFarm) {
        localStorage.setItem('farmId', newFarm.id);
        
        // Create default profile if it doesn't exist
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        if (profileError) {
          console.error('Error checking profile:', profileError);
        }
        
        if (!profile) {
          // Create profile
          await supabase
            .from('profiles')
            .insert({
              id: user.id,
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
              farm_size: data.total_size,
              farm_units: data.size_unit,
              location: data.location
            });
        }
        
        toast.success('Farm created successfully!', {
          description: "Now you can add fields and start using CROPGenius."
        });
        
        // Redirect to fields page
        navigate('/fields');
      }
    } catch (error: any) {
      console.error('Error creating farm:', error);
      toast.error('Failed to create farm', {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Set Up Your Farm</CardTitle>
        <CardDescription>
          Tell us about your farm to get personalized recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="farm-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Farm Name</Label>
            <Input
              id="name"
              placeholder="My Family Farm"
              {...register('name', { required: 'Farm name is required' })}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Village, District, County"
              {...register('location', { required: 'Location is required' })}
            />
            {errors.location && <p className="text-sm text-red-500">{errors.location.message}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="total_size">Total Farm Size</Label>
              <Input
                id="total_size"
                type="number"
                step="0.1"
                placeholder="5"
                {...register('total_size', { 
                  required: 'Farm size is required',
                  valueAsNumber: true,
                  min: { value: 0.1, message: 'Size must be greater than 0.1' }
                })}
              />
              {errors.total_size && <p className="text-sm text-red-500">{errors.total_size.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="size_unit">Unit</Label>
              <Select 
                defaultValue="hectares" 
                onValueChange={(value) => setValue('size_unit', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hectares">Hectares</SelectItem>
                  <SelectItem value="acres">Acres</SelectItem>
                  <SelectItem value="square_meters">Square Meters</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button 
          form="farm-form" 
          type="submit" 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Continue to CROPGenius'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FarmOnboarding;
