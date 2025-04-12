import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Field, Farm, FieldCrop, FieldHistory, Boundary } from "@/types/field";
import { v4 as uuidv4 } from "uuid";

// Local storage keys
const OFFLINE_FIELDS_KEY = "cropgenius_offline_fields";
const OFFLINE_CROPS_KEY = "cropgenius_offline_crops";
const OFFLINE_HISTORY_KEY = "cropgenius_offline_history";
const OFFLINE_FARMS_KEY = "cropgenius_offline_farms";

// Function to check online status
const isOnline = () => navigator.onLine;

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

// Field CRUD operations with offline support
export const createField = async (field: Omit<Field, "id" | "created_at" | "updated_at">): Promise<{data: Field | null, error: string | null}> => {
  // Generate a temporary ID for offline use
  const offlineId = uuidv4();
  const newField: Field = {
    ...field,
    id: offlineId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    offline_id: offlineId,
    is_synced: false
  };

  // If online, try to save directly to Supabase
  if (isOnline()) {
    try {
      const { data, error } = await supabase
        .from('fields')
        .insert({
          name: field.name,
          user_id: field.user_id,
          farm_id: field.farm_id,
          size: field.size,
          size_unit: field.size_unit,
          boundary: field.boundary,
          location_description: field.location_description,
          soil_type: field.soil_type,
          irrigation_type: field.irrigation_type,
          is_shared: field.is_shared,
          shared_with: field.shared_with
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success("Field added", {
        description: `${field.name} has been added to your farm.`
      });
      
      return { data, error: null };
    } catch (error: any) {
      console.error("Error creating field:", error);
      
      // If we get an error (like network failure during transmission),
      // fall back to offline storage
      const offlineFields = getOfflineData<Field>(OFFLINE_FIELDS_KEY);
      offlineFields.push(newField);
      saveOfflineData(OFFLINE_FIELDS_KEY, offlineFields);
      
      toast.warning("Saved offline", {
        description: "Your field has been saved offline and will sync when you reconnect."
      });
      
      return { data: newField, error: error.message };
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

// Update field with offline support
export const updateField = async (field: Field): Promise<{data: Field | null, error: string | null}> => {
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
    const offlineFields = getOfflineData<Field>(OFFLINE_FIELDS_KEY)
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
          const allOfflineFields = getOfflineData<Field>(OFFLINE_FIELDS_KEY);
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
    const allOfflineFields = getOfflineData<Field>(OFFLINE_FIELDS_KEY);
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
