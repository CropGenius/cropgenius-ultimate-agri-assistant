
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Field } from '@/types/supabase';
import { useMemoryStore } from '@/hooks/useMemoryStore';
import ProEligibilityCheck from '@/components/pro/ProEligibilityCheck';

interface AddFieldFormProps {
  boundary: any;
  onFieldAdded?: (field: Field) => void;
}

type FormData = {
  name: string;
  size: string;
  sizeUnit: string;
  soilType: string;
  irrigationType: string;
  locationDescription: string;
};

const AddFieldForm = ({ boundary, onFieldAdded }: AddFieldFormProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, farmId } = useAuth();
  const { updateMemory, memory } = useMemoryStore();
  const [showProModal, setShowProModal] = useState(false);

  // Track if this will be the user's second field (Pro trigger)
  const isSecondField = memory.lastFieldCount === 1;

  const onSubmit = async (data: FormData) => {
    if (!user || !farmId) {
      toast.error("You must be logged in to add a field");
      return;
    }

    setLoading(true);

    try {
      // Create the field record
      const fieldData = {
        name: data.name,
        size: parseFloat(data.size),
        size_unit: data.sizeUnit,
        location_description: data.locationDescription,
        soil_type: data.soilType,
        irrigation_type: data.irrigationType,
        boundary: boundary,
        user_id: user.id,
        farm_id: farmId
      };

      const { data: newField, error } = await supabase
        .from('fields')
        .insert(fieldData)
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      if (!newField) {
        throw new Error("Failed to create field");
      }

      // Format as Field type
      const field: Field = {
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
        shared_with: newField.shared_with,
      };

      // Update memory with new field count
      await updateMemory({
        lastFieldCount: (memory.lastFieldCount || 0) + 1
      });

      // Notify success
      toast.success("Field added successfully", {
        description: `${data.name} has been added to your farm.`
      });

      // Call onFieldAdded callback if provided
      if (onFieldAdded) {
        onFieldAdded(field);
      }

      // Show Pro modal if this is their second field
      if (isSecondField) {
        setShowProModal(true);
      } else {
        // Navigate to the field detail page
        navigate(`/fields/${newField.id}`);
      }
    } catch (error: any) {
      console.error("Error adding field:", error);
      toast.error("Failed to add field", {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium">
            Field Name *
          </label>
          <input
            id="name"
            type="text"
            className="w-full p-2 border rounded-md"
            placeholder="East Maize Field"
            {...register("name", { required: "Field name is required" })}
          />
          {errors.name && (
            <p className="text-red-500 text-xs">{errors.name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="size" className="block text-sm font-medium">
              Size *
            </label>
            <input
              id="size"
              type="number"
              step="0.01"
              className="w-full p-2 border rounded-md"
              placeholder="1.5"
              {...register("size", {
                required: "Size is required",
                valueAsNumber: true,
              })}
            />
            {errors.size && (
              <p className="text-red-500 text-xs">{errors.size.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="sizeUnit" className="block text-sm font-medium">
              Unit
            </label>
            <select
              id="sizeUnit"
              className="w-full p-2 border rounded-md"
              defaultValue="hectares"
              {...register("sizeUnit")}
            >
              <option value="hectares">Hectares</option>
              <option value="acres">Acres</option>
              <option value="square_meters">Square Meters</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="locationDescription" className="block text-sm font-medium">
            Location Description
          </label>
          <input
            id="locationDescription"
            type="text"
            className="w-full p-2 border rounded-md"
            placeholder="Near the river, south of village"
            {...register("locationDescription")}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="soilType" className="block text-sm font-medium">
              Soil Type
            </label>
            <select
              id="soilType"
              className="w-full p-2 border rounded-md"
              {...register("soilType")}
            >
              <option value="">-- Select --</option>
              <option value="clay">Clay</option>
              <option value="sandy">Sandy</option>
              <option value="loamy">Loamy</option>
              <option value="silty">Silty</option>
              <option value="peaty">Peaty</option>
              <option value="chalky">Chalky</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="irrigationType" className="block text-sm font-medium">
              Irrigation Type
            </label>
            <select
              id="irrigationType"
              className="w-full p-2 border rounded-md"
              {...register("irrigationType")}
            >
              <option value="">-- Select --</option>
              <option value="rainfed">Rainfed (No irrigation)</option>
              <option value="drip">Drip Irrigation</option>
              <option value="sprinkler">Sprinkler</option>
              <option value="flood">Flood Irrigation</option>
              <option value="furrow">Furrow</option>
            </select>
          </div>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Add Field"
            )}
          </Button>
        </div>
      </form>
      
      <ProEligibilityCheck forceShow={showProModal} triggerType="weather">
        {/* Children */}
      </ProEligibilityCheck>
    </>
  );
};

export default AddFieldForm;
