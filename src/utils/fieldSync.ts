
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { Field } from '@/types/field';
import { isOnline } from './isOnline';
import { toast } from 'sonner';

/**
 * Syncs offline-saved fields to Supabase
 * @returns {Promise<{success: boolean, synced: number, failed: number, remaining: number}>}
 */
export const syncOfflineFields = async (): Promise<{
  success: boolean;
  synced: number;
  failed: number;
  remaining: number;
}> => {
  // If offline, don't attempt to sync
  if (!isOnline()) {
    return { success: false, synced: 0, failed: 0, remaining: 0 };
  }
  
  // Check for auth session
  const { data: { session }} = await supabase.auth.getSession();
  
  if (!session?.user) {
    console.warn('Cannot sync offline fields: User not authenticated');
    return { success: false, synced: 0, failed: 0, remaining: 0 };
  }
  
  // Get offline fields
  const offlineFields = JSON.parse(localStorage.getItem('cropgenius_offline_fields') || '[]') as Field[];
  
  if (offlineFields.length === 0) {
    return { success: true, synced: 0, failed: 0, remaining: 0 };
  }
  
  console.log(`🔄 [syncOfflineFields] Attempting to sync ${offlineFields.length} offline fields`);
  
  // Track results
  let syncedCount = 0;
  let failedCount = 0;
  const remainingFields: Field[] = [];
  
  // Process each field
  for (const field of offlineFields) {
    try {
      // Skip already synced fields
      if (field.is_synced) {
        continue;
      }
      
      // Ensure field has user_id set to current user
      const fieldToSync = {
        ...field,
        user_id: session.user.id,
        // Use existing ID if it's not an offline ID (UUID format check)
        id: field.id?.length === 36 ? undefined : field.id
      };
      
      // Remove metadata fields that aren't in the Supabase schema
      const { is_synced, offline_id, deleted, ...cleanField } = fieldToSync;
      
      // Check if field has a valid farm ID
      if (!cleanField.farm_id || cleanField.farm_id === 'local-farm') {
        // Get the user's first farm or create one
        const { data: farms } = await supabase
          .from('farms')
          .select('id')
          .eq('user_id', session.user.id)
          .limit(1);
          
        if (farms && farms.length > 0) {
          cleanField.farm_id = farms[0].id;
        } else {
          // Create a new farm
          const { data: newFarm } = await supabase
            .from('farms')
            .insert({
              user_id: session.user.id,
              name: 'My Farm'
            })
            .select()
            .single();
            
          if (newFarm) {
            cleanField.farm_id = newFarm.id;
          }
        }
      }
      
      // Insert the field
      const { data, error } = await supabase
        .from('fields')
        .insert(cleanField)
        .select()
        .single();
        
      if (error) {
        console.error('❌ [syncOfflineFields] Failed to sync field:', error);
        failedCount++;
        remainingFields.push(field);
        continue;
      }
      
      console.log('✅ [syncOfflineFields] Field synced successfully:', data);
      syncedCount++;
      
      // If there are associated crops, sync them too
      const offlineCrops = JSON.parse(localStorage.getItem('cropgenius_offline_crops') || '[]');
      const fieldCrops = offlineCrops.filter((crop: any) => crop.field_id === field.id);
      
      for (const crop of fieldCrops) {
        try {
          // Update to use the new field ID
          const cropToSync = {
            ...crop,
            field_id: data.id
          };
          
          // Remove metadata fields
          const { id, is_synced, offline_id, ...cleanCrop } = cropToSync;
          
          // Insert the crop
          await supabase.from('field_crops').insert(cleanCrop);
          
          // Remove from offline crops
          const updatedOfflineCrops = offlineCrops.filter((c: any) => c.id !== crop.id);
          localStorage.setItem('cropgenius_offline_crops', JSON.stringify(updatedOfflineCrops));
        } catch (cropError) {
          console.error('❌ [syncOfflineFields] Failed to sync crop:', cropError);
          // Non-critical, continue
        }
      }
    } catch (error) {
      console.error('❌ [syncOfflineFields] Error syncing field:', error);
      failedCount++;
      remainingFields.push(field);
    }
  }
  
  // Update local storage with remaining fields
  localStorage.setItem('cropgenius_offline_fields', JSON.stringify(remainingFields));
  
  // Log results
  console.log(`🔄 [syncOfflineFields] Sync complete: ${syncedCount} synced, ${failedCount} failed, ${remainingFields.length} remaining`);
  
  return {
    success: failedCount === 0,
    synced: syncedCount,
    failed: failedCount,
    remaining: remainingFields.length
  };
};

/**
 * Saves a field to offline storage
 * @param field Field to save
 * @returns {string} ID of the saved field
 */
export const saveFieldOffline = (field: Partial<Field>): string => {
  try {
    const offlineFields = JSON.parse(localStorage.getItem('cropgenius_offline_fields') || '[]');
    
    // Generate ID if not provided
    const fieldId = field.id || uuidv4();
    
    // Create field with required properties
    const offlineField: Field = {
      id: fieldId,
      user_id: field.user_id || 'guest',
      farm_id: field.farm_id || 'local-farm',
      name: field.name || 'Untitled Field',
      size: field.size || 0,
      size_unit: field.size_unit || 'hectares',
      boundary: field.boundary || null,
      location_description: field.location_description || null,
      soil_type: field.soil_type || null,
      irrigation_type: field.irrigation_type || null,
      created_at: field.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_shared: field.is_shared || false,
      shared_with: field.shared_with || [],
      offline_id: uuidv4(),
      is_synced: false
    };
    
    // Add to offline fields
    offlineFields.push(offlineField);
    localStorage.setItem('cropgenius_offline_fields', JSON.stringify(offlineFields));
    
    console.log('✅ [saveFieldOffline] Field saved offline:', offlineField);
    
    return fieldId;
  } catch (error) {
    console.error('❌ [saveFieldOffline] Error saving field offline:', error);
    toast.error("Couldn't save field", {
      description: "There was a problem saving your field locally"
    });
    return '';
  }
};

/**
 * Checks if there are fields that need to be synced
 * @returns {number} Number of unsynced fields
 */
export const getUnsyncedFieldsCount = (): number => {
  try {
    const offlineFields = JSON.parse(localStorage.getItem('cropgenius_offline_fields') || '[]');
    return offlineFields.filter((field: Field) => !field.is_synced).length;
  } catch (error) {
    console.error('❌ [getUnsyncedFieldsCount] Error:', error);
    return 0;
  }
};
