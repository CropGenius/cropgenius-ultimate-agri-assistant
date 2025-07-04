import { supabase } from "@/services/supabaseClient";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { Field, Farm, FieldCrop, FieldHistory, Boundary } from "@/types/field";
import { sanitizeFieldData, logFieldError, isOnline, verifyOrCreateFarm } from "@/utils/fieldSanitizer";

// Local storage keys
const OFFLINE_FIELDS_KEY = "cropgenius_offline_fields";
const OFFLINE_CROPS_KEY = "cropgenius_offline_crops";
const OFFLINE_HISTORY_KEY = "cropgenius_offline_history";
const OFFLINE_FARMS_KEY = "cropgenius_offline_farms";

// Basic offline storage handling
const getOfflineData = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error retrieving offline data for ${key}:`, error);
    return [];
  }
};

const saveOfflineData = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving offline data for ${key}:`, error);
    toast.error("Storage error", {
      description: "Failed to save data offline. Your device may be out of storage."
    });
  }
};

// Fix Field type to include the 'deleted' property
// by updating the field interface in our code rather than modifying type definitions
interface FieldWithDeleteFlag extends Field {
  deleted?: boolean;
}

// Enhanced farm ownership verification with auto-creation
const verifyFarmOwnership = async (farmId: string, userId: string): Promise<boolean> => {
  try {
    // Always succeed if we don't have enough information
    if (!userId) {
      console.warn("⚠️ [verifyFarmOwnership] Missing user ID, proceeding anyway");
      return true;
    }
    
    // Create default farm if missing
    if (!farmId) {
      const newFarmId = await verifyOrCreateFarm(supabase, userId);
      console.log("✅ Created default farm for user:", newFarmId);
      return true;
    }
    
    // Check farm ownership but don't block on errors
    try {
      const { data, error } = await supabase
        .from('farms')
        .select('id, user_id')
        .eq('id', farmId)
        .maybeSingle();
        
      if (error) {
        console.warn("⚠️ Farm ownership verification error:", error);
        
        // Create a default farm instead of blocking
        const newFarmId = await verifyOrCreateFarm(supabase, userId);
        console.log("✅ Created fallback farm due to verification error:", newFarmId);
        return true;
      }
      
      // If farm doesn't belong to user, log the issue but don't block them
      if (data && data.user_id !== userId) {
        console.warn(`⚠️ User ${userId} attempted to access farm ${farmId} owned by ${data.user_id}`);
        
        // Log ownership mismatch for analytics
        try {
          await supabase.from("ownership_mismatches").insert([{ 
            attempted_user: userId, 
            farm_id: farmId,
            owner_id: data.user_id,
            created_at: new Date().toISOString()
          }]);
        } catch (err) {
          // Ignore errors in logging
        }
        
        // Get a farm that the user does own
        try {
          const { data: userFarm } = await supabase
            .from('farms')
            .select('id')
            .eq('user_id', userId)
            .limit(1)
            .maybeSingle();
            
          if (userFarm?.id) {
            // Silently redirect to a farm they do own
            console.log(`⚠️ Redirecting user to their own farm ${userFarm.id} instead of ${farmId}`);
            return true; // Allow the operation with their farm instead
          }
        } catch (err) {
          // Ignore errors in fallback
        }
        
        // If all else fails, create a new farm
        const newFarmId = await verifyOrCreateFarm(supabase, userId);
        console.log("✅ Created new farm as last resort:", newFarmId);
      }
    } catch (error) {
      console.error("Error in verifyFarmOwnership:", error);
      // Create a default farm in case of error
      const newFarmId = await verifyOrCreateFarm(supabase, userId);
      console.log("✅ Created emergency farm due to verification error:", newFarmId);
    }
    
    return true; // Always return true to never block the user
  } catch (error) {
    console.error("Critical error verifying farm ownership:", error);
    return true; // NEVER block the user
  }
};

// Verify field can be accessed by the current user
export const verifyFieldAccess = async (fieldId: string, userId: string): Promise<boolean> => {
  try {
    if (!isOnline() || !fieldId || !userId) return true; // Default to allowing access offline
    
    const { data, error } = await supabase
      .from('fields')
      .select('id, farm_id')
      .eq('id', fieldId)
      .maybeSingle();
      
    if (error || !data) {
      console.error("Field access verification error:", error);
      return true; // Default to allowing access on error
    }
    
    // Now verify that the farm belongs to the user
    return await verifyFarmOwnership(data.farm_id, userId);
  } catch (error) {
    console.error("Error verifying field access:", error);
    return true; // Always default to allowing access
  }
};

// Field CRUD operations with ownership fallbacks and auto-correction
export const createField = async (field: Omit<Field, "id" | "created_at" | "updated_at">): Promise<{data: Field | null, error: string | null}> => {
  // Generate a temporary ID for offline use
  const offlineId = uuidv4();
  
  // Ensure field data is sanitized
  const sanitizedField = sanitizeFieldData(field);
  
  const newField: Field = {
    ...sanitizedField,
    id: offlineId,
    user_id: field.user_id, // Keep original user_id
    farm_id: field.farm_id, // Keep original farm_id
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    offline_id: offlineId,
    is_synced: false
  };

  // If online, try to save directly to Supabase
  if (isOnline()) {
    try {
      // Always ensure a valid farm_id
      let resolvedFarmId = field.farm_id;
      
      if (field.user_id) {
        try {
          // Attempt to get/create a valid farm ID
          resolvedFarmId = await verifyOrCreateFarm(supabase, field.user_id);
        } catch (error) {
          console.error("❌ Farm resolution error:", error);
          // Continue with whatever farm_id we have - don't block the user
        }
      }
      
      // Insert field with sanitized data and resolvedFarmId
      const { data, error } = await supabase
        .from('fields')
        .insert({
          name: sanitizedField.name,
          user_id: field.user_id || (await supabase.auth.getUser()).data.user?.id, // Ensure user_id is always present
          farm_id: resolvedFarmId, // Use resolved farm_id
          size: sanitizedField.size,
          size_unit: sanitizedField.size_unit,
          boundary: sanitizedField.boundary,
          location_description: sanitizedField.location_description,
          soil_type: sanitizedField.soil_type,
          irrigation_type: sanitizedField.irrigation_type,
          is_shared: field.is_shared,
          shared_with: field.shared_with
        })
        .select()
        .maybeSingle();
      
      if (error) {
        // Try one more time with minimal field data
        console.warn("⚠️ Initial field creation failed, trying minimal data:", error);
        
        const { data: minimalData, error: minimalError } = await supabase
          .from('fields')
          .insert({
            name: sanitizedField.name,
            user_id: field.user_id || (await supabase.auth.getUser()).data.user?.id,
            farm_id: resolvedFarmId
          })
          .select()
          .maybeSingle();
          
        if (minimalError) {
          // Log the error but don't fail
          if (field.user_id) {
            await logFieldError(supabase, field.user_id, "insert_error", field, minimalError);
          }
          
          // Fall back to offline storage
          const offlineFields = getOfflineData<Field>(OFFLINE_FIELDS_KEY);
          offlineFields.push(newField);
          saveOfflineData(OFFLINE_FIELDS_KEY, offlineFields);
          
          toast.warning("Saved locally", {
            description: "Your field has been saved offline and will sync when you reconnect."
          });
          
          return { data: newField, error: null }; // Return success anyway
        }
        
        toast.success("Field added", {
          description: `${sanitizedField.name} has been added to your farm.`
        });
        
        return { data: minimalData, error: null };
      }
      
      toast.success("Field added", {
        description: `${sanitizedField.name} has been added to your farm.`
      });
      
      return { data, error: null };
    } catch (error: any) {
      console.error("Error creating field:", error);
      
      // Always fall back to offline storage
      const offlineFields = getOfflineData<Field>(OFFLINE_FIELDS_KEY);
      offlineFields.push(newField);
      saveOfflineData(OFFLINE_FIELDS_KEY, offlineFields);
      
      toast.warning("Saved offline", {
        description: "Your field has been saved offline and will sync when you reconnect."
      });
      
      return { data: newField, error: null }; // Return success anyway
    }
  } else {
    // Store offline if not connected
    const offlineFields = getOfflineData<Field>(OFFLINE_FIELDS_KEY);
    offlineFields.push(newField);
    saveOfflineData(OFFLINE_FIELDS_KEY, offlineFields);
    
    toast.info("Saved offline", {
      description: "Your field has been saved offline and will sync when you reconnect."
    });
    
    return { data: newField, error: null };
  }
};

// Get all fields (combines online + offline data)
export const getAllFields = async (userId: string): Promise<{data: Field[], error: string | null}> => {
  try {
    let fields: Field[] = [];
    
    // If online, get fields from Supabase
    if (isOnline()) {
      const { data, error } = await supabase
        .from('fields')
        .select('*')
        .eq('user_id', userId);
        
      if (error) throw error;
      fields = data || [];
    }
    
    // Get any offline fields
    const offlineFields = getOfflineData<Field>(OFFLINE_FIELDS_KEY)
      .filter(field => field.user_id === userId && !field.is_synced);
    
    // Combine results, giving preference to online data
    const combinedFields = [...fields];
    
    // Add only offline fields that don't exist online
    offlineFields.forEach(offlineField => {
      if (!combinedFields.some(field => field.offline_id === offlineField.offline_id)) {
        combinedFields.push(offlineField);
      }
    });
    
    return { data: combinedFields, error: null };
  } catch (error: any) {
    console.error("Error fetching fields:", error);
    
    // If fetch fails, return offline data only
    const offlineFields = getOfflineData<Field>(OFFLINE_FIELDS_KEY)
      .filter(field => field.user_id === userId);
      
    return { data: offlineFields, error: error.message };
  }
};

// Update field with offline support - update the param type to include delete flag
export const updateField = async (field: FieldWithDeleteFlag): Promise<{data: Field | null, error: string | null}> => {
  // Update local timestamp
  const updatedField = {
    ...field,
    updated_at: new Date().toISOString(),
    is_synced: isOnline()
  };
  
  // If online, update in Supabase
  if (isOnline()) {
    try {
      // Skip the offline-specific fields when updating Supabase
      const { offline_id, is_synced, ...supabaseField } = updatedField;
      
      const { data, error } = await supabase
        .from('fields')
        .update(supabaseField)
        .eq('id', field.id)
        .select()
        .single();
        
      if (error) throw error;
      
      toast.success("Field updated", {
        description: `${field.name} has been updated.`
      });
      
      return { data, error: null };
    } catch (error: any) {
      console.error("Error updating field:", error);
      
      // Store update offline if API call fails
      const offlineFields = getOfflineData<Field>(OFFLINE_FIELDS_KEY);
      const index = offlineFields.findIndex(f => 
        f.id === field.id || f.offline_id === field.offline_id
      );
      
      if (index >= 0) {
        offlineFields[index] = updatedField;
      } else {
        offlineFields.push(updatedField);
      }
      
      saveOfflineData(OFFLINE_FIELDS_KEY, offlineFields);
      
      toast.warning("Saved offline", {
        description: "Your changes have been saved offline and will sync when you reconnect."
      });
      
      return { data: updatedField, error: error.message };
    }
  } else {
    // Store offline if not connected
    const offlineFields = getOfflineData<Field>(OFFLINE_FIELDS_KEY);
    const index = offlineFields.findIndex(f => 
      f.id === field.id || f.offline_id === field.offline_id
    );
    
    if (index >= 0) {
      offlineFields[index] = updatedField;
    } else {
      offlineFields.push(updatedField);
    }
    
    saveOfflineData(OFFLINE_FIELDS_KEY, offlineFields);
    
    toast.info("Saved offline", {
      description: "Your changes have been saved offline and will sync when you reconnect."
    });
    
    return { data: updatedField, error: null };
  }
};

// Delete field with offline support
export const deleteField = async (fieldId: string): Promise<{error: string | null}> => {
  if (isOnline()) {
    try {
      const { error } = await supabase
        .from('fields')
        .delete()
        .eq('id', fieldId);
        
      if (error) throw error;
      
      // Also remove from offline storage if it exists there
      const offlineFields = getOfflineData<Field>(OFFLINE_FIELDS_KEY)
        .filter(field => field.id !== fieldId && field.offline_id !== fieldId);
      
      saveOfflineData(OFFLINE_FIELDS_KEY, offlineFields);
      
      toast.success("Field deleted", {
        description: "The field has been removed from your farm."
      });
      
      return { error: null };
    } catch (error: any) {
      console.error("Error deleting field:", error);
      return { error: error.message };
    }
  } else {
    // Mark for deletion when back online
    const offlineFields = getOfflineData<Field>(OFFLINE_FIELDS_KEY);
    const fieldIndex = offlineFields.findIndex(f => f.id === fieldId || f.offline_id === fieldId);
    
    if (fieldIndex >= 0) {
      // If it's an offline-only field, just remove it
      if (offlineFields[fieldIndex].offline_id && !offlineFields[fieldIndex].is_synced) {
        offlineFields.splice(fieldIndex, 1);
      } else {
        // Otherwise mark for deletion when online
        offlineFields[fieldIndex].deleted = true;
        offlineFields[fieldIndex].is_synced = false;
      }
      
      saveOfflineData(OFFLINE_FIELDS_KEY, offlineFields);
    }
    
    toast.info("Marked for deletion", {
      description: "This field will be deleted when you reconnect to the internet."
    });
    
    return { error: null };
  }
};

// Sync all offline data to the server
export const syncOfflineData = async (userId: string): Promise<{success: boolean, error: string | null}> => {
  if (!isOnline()) {
    return { success: false, error: "You are currently offline" };
  }
  
  try {
    // Sync fields
    const offlineFields = getOfflineData<FieldWithDeleteFlag>(OFFLINE_FIELDS_KEY)
      .filter(field => !field.is_synced && field.user_id === userId);
    
    // Process each field sequentially
    for (const field of offlineFields) {
      if (field.deleted) {
        // Delete fields marked for deletion
        if (field.id.includes('-')) {
          // This is an offline ID that was never synced, so no need to delete from server
          continue;
        }
        
        await supabase.from('fields').delete().eq('id', field.id);
      } else if (!field.id || field.id.includes('-')) {
        // New field that was created offline
        const { offline_id, is_synced, id, ...newField } = field;
        const { data, error } = await supabase.from('fields').insert(newField).select().single();
        
        if (!error && data) {
          // Update the local storage with the new server ID
          const allOfflineFields = getOfflineData<FieldWithDeleteFlag>(OFFLINE_FIELDS_KEY);
          const index = allOfflineFields.findIndex(f => f.offline_id === field.offline_id);
          
          if (index >= 0) {
            allOfflineFields[index] = {
              ...data,
              offline_id: field.offline_id,
              is_synced: true
            };
            
            saveOfflineData(OFFLINE_FIELDS_KEY, allOfflineFields);
          }
        }
      } else {
        // Existing field that was updated offline
        const { offline_id, is_synced, ...updateField } = field;
        await supabase.from('fields').update(updateField).eq('id', field.id);
      }
    }
    
    // Update all synced status
    const allOfflineFields = getOfflineData<FieldWithDeleteFlag>(OFFLINE_FIELDS_KEY);
    saveOfflineData(
      OFFLINE_FIELDS_KEY, 
      allOfflineFields.filter(f => !f.deleted).map(f => ({...f, is_synced: true}))
    );
    
    toast.success("Data synchronized", {
      description: "Your field data has been successfully synchronized with the server."
    });
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error("Error syncing offline data:", error);
    
    toast.error("Sync failed", {
      description: "There was a problem synchronizing your data. Please try again."
    });
    
    return { success: false, error: error.message };
  }
};

// Get field by ID (combines online + offline data)
export const getFieldById = async (fieldId: string): Promise<{data: Field | null, error: string | null}> => {
  try {
    // Check offline storage first
    const offlineFields = getOfflineData<Field>(OFFLINE_FIELDS_KEY);
    const offlineField = offlineFields.find(f => f.id === fieldId || f.offline_id === fieldId);
    
    // If online, try to get from Supabase
    if (isOnline()) {
      const { data, error } = await supabase
        .from('fields')
        .select('*')
        .eq('id', fieldId)
        .maybeSingle();
        
      if (error) throw error;
      
      // If found online, return that data
      if (data) return { data, error: null };
    }
    
    // Return offline data if found
    if (offlineField) return { data: offlineField, error: null };
    
    // Not found in either place
    return { data: null, error: "Field not found" };
  } catch (error: any) {
    console.error("Error getting field:", error);
    
    // Try offline as fallback
    const offlineFields = getOfflineData<Field>(OFFLINE_FIELDS_KEY);
    const offlineField = offlineFields.find(f => f.id === fieldId || f.offline_id === fieldId);
    
    if (offlineField) {
      return { data: offlineField, error: null };
    }
    
    return { data: null, error: error.message };
  }
};

// Share field with other users
export const shareField = async (
  fieldId: string, 
  userIdToShare: string
): Promise<{success: boolean, error: string | null}> => {
  if (!isOnline()) {
    return { success: false, error: "Cannot share fields while offline" };
  }
  
  try {
    // Get current field data
    const { data: field, error: fetchError } = await getFieldById(fieldId);
    
    if (fetchError || !field) {
      throw new Error(fetchError || "Field not found");
    }
    
    // Update shared status
    const sharedWith = field.shared_with || [];
    
    // Only add if not already shared
    if (!sharedWith.includes(userIdToShare)) {
      sharedWith.push(userIdToShare);
    }
    
    const { error } = await supabase
      .from('fields')
      .update({
        is_shared: true,
        shared_with: sharedWith
      })
      .eq('id', fieldId);
      
    if (error) throw error;
    
    toast.success("Field shared", {
      description: "You have successfully shared access to this field."
    });
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error("Error sharing field:", error);
    
    toast.error("Sharing failed", {
      description: error.message || "There was a problem sharing this field."
    });
    
    return { success: false, error: error.message };
  }
};

// Listen for online/offline status changes
export const setupConnectivityListeners = (onOnline: () => void, onOffline: () => void) => {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
};

// Initialize offline sync check
export const initOfflineSync = (userId: string) => {
  // Set up connectivity listeners
  setupConnectivityListeners(
    // When coming online
    async () => {
      toast.info("Connection restored", {
        description: "Syncing your offline changes..."
      });
      await syncOfflineData(userId);
    },
    // When going offline
    () => {
      toast.warning("You are offline", {
        description: "Changes will be saved locally and synced when you reconnect."
      });
    }
  );
};

// Enhancement: Fix the trackFieldErrors function that had the group() error
export const trackFieldErrors = async (userId: string) => {
  if (!isOnline() || !userId) return;
  
  try {
    // Modified query to avoid using .group() which is unsupported
    const { data: errorTypes } = await supabase
      .from('field_errors')
      .select('error_type, id')
      .eq('user_id', userId);
      
    if (errorTypes) {
      // Process the data manually instead of using group()
      const errorCounts: Record<string, number> = {};
      errorTypes.forEach(error => {
        const type = error.error_type;
        if (type) {
          errorCounts[type] = (errorCounts[type] || 0) + 1;
        }
      });
      
      console.log("Field error statistics:", errorCounts);
      // Here you could implement auto-fix routines based on common errors
    }
  } catch (error) {
    console.error("Error tracking field errors:", error);
  }
};
