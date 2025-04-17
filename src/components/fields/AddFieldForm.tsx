
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Field } from '@/types/supabase';
import { Database } from '@/integrations/supabase/types';

// Define form inputs type
interface FormInputs {
  name: string;
  size: number;
  size_unit: string;
  location_description: string;
  soil_type: string;
  irrigation_type: string;
}

interface AddFieldFormProps {
  boundary?: any;
  onSuccess?: (field: Field) => void;
  onCancel?: () => void;
  className?: string;
}

const AddFieldForm = ({ boundary, onSuccess, onCancel, className = '' }: AddFieldFormProps) => {
  const { user, farmId } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormInputs>({
    defaultValues: {
      size_unit: 'hectares',
      soil_type: '',
      irrigation_type: '',
    }
  });

  if (!user || !farmId) {
    return <div>Please log in and set up your farm first.</div>;
  }

  const sizeUnit = watch('size_unit');

  const onSubmit = async (data: FormInputs) => {
    if (!user || !farmId) {
      toast.error("Authentication required", {
        description: "Please log in to add fields"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare field data for Supabase
      const fieldData = {
        name: data.name,
        size: data.size,
        size_unit: data.size_unit,
        location_description: data.location_description,
        soil_type: data.soil_type,
        irrigation_type: data.irrigation_type,
        boundary: boundary,
        user_id: user.id,
        farm_id: farmId
      };

      // Create the field in Supabase
      const { data: newField, error } = await supabase
        .from('fields')
        .insert(fieldData)
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      // Show success message
      toast.success("Field added successfully", {
        description: `${data.name} has been added to your farm`
      });

      // Create a properly typed field object for the callback
      const fieldWithTypedProperties: Field = {
        id: newField.id,
        user_id: newField.user_id,
        farm_id: newField.farm_id,
        name: newField.name,
        size: newField.size,
        size_unit: newField.size_unit,
        boundary: newField.boundary,
        location_description: newField.location_description,
        soil_type: newField.soil_type,
        irrigation_type: newField.irrigation_type,
        created_at: newField.created_at,
        updated_at: newField.updated_at,
        is_shared: newField.is_shared,
        shared_with: newField.shared_with
      };

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(fieldWithTypedProperties);
      } else {
        // Otherwise navigate to fields page
        navigate('/fields');
      }
    } catch (error: any) {
      console.error("Error creating field:", error);
      toast.error("Failed to add field", {
        description: error.message || "Please try again later"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to display area units
  const getAreaUnit = (unit: string) => {
    switch (unit) {
      case 'acres':
        return 'acres';
      case 'square_meters':
        return 'm²';
      case 'hectares':
      default:
        return 'hectares';
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <Label htmlFor="name">Field Name</Label>
        <Input
          id="name"
          placeholder="East Maize Plot"
          {...register("name", { required: "Field name is required" })}
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="size">Size</Label>
          <Input
            id="size"
            type="number"
            step="0.01"
            placeholder="1.5"
            {...register("size", {
              required: "Field size is required",
              min: { value: 0.01, message: "Size must be positive" }
            })}
            className={errors.size ? "border-red-500" : ""}
          />
          {errors.size && <p className="text-red-500 text-sm">{errors.size.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="size_unit">Unit</Label>
          <Select
            defaultValue="hectares"
            onValueChange={(value) => setValue("size_unit", value)}
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

      <div className="space-y-2">
        <Label htmlFor="location_description">Location Description (Optional)</Label>
        <Textarea
          id="location_description"
          placeholder="Near the main road, southwest of the village..."
          {...register("location_description")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="soil_type">Soil Type (Optional)</Label>
        <Select
          onValueChange={(value) => setValue("soil_type", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select soil type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="clay">Clay</SelectItem>
            <SelectItem value="sandy">Sandy</SelectItem>
            <SelectItem value="loamy">Loamy</SelectItem>
            <SelectItem value="silty">Silty</SelectItem>
            <SelectItem value="peaty">Peaty</SelectItem>
            <SelectItem value="chalky">Chalky</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="irrigation_type">Irrigation Type (Optional)</Label>
        <Select
          onValueChange={(value) => setValue("irrigation_type", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select irrigation type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rainfed">Rainfed (No Irrigation)</SelectItem>
            <SelectItem value="flood">Flood Irrigation</SelectItem>
            <SelectItem value="drip">Drip Irrigation</SelectItem>
            <SelectItem value="sprinkler">Sprinkler System</SelectItem>
            <SelectItem value="manual">Manual Watering</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {boundary && (
        <div className="rounded-lg bg-muted p-2 text-sm">
          <p>Field boundary coordinates saved</p>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Field"
          )}
        </Button>
      </div>
    </form>
  );
};

export default AddFieldForm;
