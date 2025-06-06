import { supabase } from '@/integrations/supabase/client';
import { SupabaseClient } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { Field, Farm, FieldCrop, FieldHistory, Boundary } from '@/types/field';
import {
  sanitizeFieldData,
  logFieldError,
  isOnline,
  verifyOrCreateFarm,
} from '@/utils/fieldSanitizer';

// Local storage keys
const OFFLINE_FIELDS_KEY = 'cropgenius_offline_fields';
const OFFLINE_CROPS_KEY = 'cropgenius_offline_crops';
const OFFLINE_HISTORY_KEY = 'cropgenius_offline_history';
const OFFLINE_FARMS_KEY = 'cropgenius_offline_farms';

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
    toast.error('Storage error', {
      description:
        'Failed to save data offline. Your device may be out of storage.',
    });
  }
};

// Farm ownership verification: Checks if the user owns the specified farm.
const verifyFarmOwnership = async (
  farmId: string,
  userId: string
): Promise<{ isOwner: boolean; error?: string }> => {
  if (!userId) {
    console.warn('[verifyFarmOwnership] Missing user ID.');
    return {
      isOwner: false,
      error: 'User ID is required for farm ownership verification.',
    };
  }
  if (!farmId) {
    console.warn('[verifyFarmOwnership] Missing farm ID.');
    return {
      isOwner: false,
      error: 'Farm ID is required for farm ownership verification.',
    };
  }

  try {
    const { data, error } = await supabase
      .from('farms')
      .select('id, user_id')
      .eq('id', farmId)
      .single(); // Use .single() to expect one row or throw error if not found

    if (error) {
      if (error.code === 'PGRST116') {
        // PostgREST error code for 'Not a single row'
        console.warn(
          `[verifyFarmOwnership] Farm not found: ${farmId}. Error: ${error.message}`
        );
        return { isOwner: false, error: 'Farm not found.' };
      }
      console.error(
        `[verifyFarmOwnership] Error fetching farm ${farmId}:`,
        error
      );
      return { isOwner: false, error: `Database error: ${error.message}` };
    }

    if (data.user_id !== userId) {
      console.warn(
        `[verifyFarmOwnership] User ${userId} does not own farm ${farmId}. Owner: ${data.user_id}`
      );
      // Log ownership mismatch for analytics/security audit if needed
      // await supabase.from("ownership_mismatches").insert(...);
      return {
        isOwner: false,
        error: 'Farm access denied. User does not own this farm.',
      };
    }

    return { isOwner: true };
  } catch (e: any) {
    console.error(
      `[verifyFarmOwnership] Critical error verifying farm ${farmId} for user ${userId}:`,
      e
    );
    return { isOwner: false, error: `Critical system error: ${e.message}` };
  }
};

// Verify field can be accessed by the current user, given their active farmId
export const verifyFieldAccess = async (
  fieldId: string,
  userId: string,
  userFarmId: string
): Promise<{ canAccess: boolean; error?: string }> => {
  if (!userId || !userFarmId || !fieldId) {
    return {
      canAccess: false,
      error:
        'User ID, Farm ID, and Field ID are required for field access verification.',
    };
  }

  // 1. Verify the user actually owns the farm they claim to be active on.
  const farmAuth = await verifyFarmOwnership(userFarmId, userId);
  if (!farmAuth.isOwner) {
    console.warn(
      `[verifyFieldAccess] User ${userId} does not own the provided farm ${userFarmId}.`
    );
    return { canAccess: false, error: farmAuth.error || 'Farm access denied.' };
  }

  // 2. If online, check if the field exists and belongs to that farm.
  if (isOnline()) {
    try {
      const { data: fieldData, error: fieldError } = await supabase
        .from('fields')
        .select('id, farm_id')
        .eq('id', fieldId)
        .single(); // Expect one row or error

      if (fieldError) {
        if (fieldError.code === 'PGRST116') {
          console.warn(
            `[verifyFieldAccess] Field not found: ${fieldId}. Error: ${fieldError.message}`
          );
          return { canAccess: false, error: 'Field not found.' };
        }
        console.error(
          `[verifyFieldAccess] Error fetching field ${fieldId}:`,
          fieldError
        );
        return {
          canAccess: false,
          error: `Database error: ${fieldError.message}`,
        };
      }

      if (fieldData.farm_id !== userFarmId) {
        console.warn(
          `[verifyFieldAccess] Field ${fieldId} (farm: ${fieldData.farm_id}) does not belong to user's active farm ${userFarmId}.`
        );
        return {
          canAccess: false,
          error: 'Field does not belong to your active farm.',
        };
      }

      return { canAccess: true };
    } catch (e: any) {
      console.error(
        `[verifyFieldAccess] Critical error verifying field ${fieldId} access:`,
        e
      );
      return { canAccess: false, error: `Critical system error: ${e.message}` };
    }
  } else {
    // Offline: Assume access is allowed if basic IDs are present. Data integrity handled by sync.
    // More sophisticated offline logic could check local cache if available.
    console.log(
      `[verifyFieldAccess] Offline mode: Assuming access to field ${fieldId} for user ${userId} on farm ${userFarmId}.`
    );
    return { canAccess: true };
  }
};

// Field CRUD operations with ownership fallbacks and auto-correction
export const createField = async (
  field: Omit<Field, 'id' | 'created_at' | 'updated_at'> & {
    user_id: string;
    farm_id: string;
  }
): Promise<{ data: Field | null; error: string | null }> => {
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
    is_synced: false,
  };

  // If online, try to save directly to Supabase
  if (isOnline()) {
    try {
      // 1. Verify farm ownership
      const ownership = await verifyFarmOwnership(field.farm_id, field.user_id);
      if (!ownership.isOwner) {
        console.warn(
          `[createField] User ${field.user_id} does not own farm ${field.farm_id}. Error: ${ownership.error}`
        );
        return {
          data: null,
          error: ownership.error || 'Farm access denied or farm not found.',
        };
      }

      // 2. Insert field with sanitized data and validated farm_id
      const { data, error } = await supabase
        .from('fields')
        .insert({
          name: sanitizedField.name,
          user_id: field.user_id,
          farm_id: field.farm_id, // Use validated farm_id
          size: sanitizedField.size,
          size_unit: sanitizedField.size_unit,
          boundary: sanitizedField.boundary,
          location_description: sanitizedField.location_description,
          soil_type: sanitizedField.soil_type,
          irrigation_type: sanitizedField.irrigation_type,
          is_shared: field.is_shared,
          shared_with: field.shared_with,
        })
        .select()
        .single(); // Use single to ensure it was created or throw error

      if (error) {
        console.error('Error inserting field into Supabase:', error);
        // Log the error with more details
        await logFieldError(
          supabase,
          field.user_id,
          'insert_error',
          field,
          error
        );

        // Attempt minimal insert as a fallback (optional, could be removed for stricter error handling)
        console.warn(
          '⚠️ Initial field creation failed, trying minimal data:',
          error.message
        );
        const { data: minimalData, error: minimalError } = await supabase
          .from('fields')
          .insert({
            name: sanitizedField.name,
            user_id: field.user_id,
            farm_id: field.farm_id,
          })
          .select()
          .single();

        if (minimalError) {
          console.error(
            'Error inserting minimal field data into Supabase:',
            minimalError
          );
          await logFieldError(
            supabase,
            field.user_id,
            'minimal_insert_error',
            {
              name: sanitizedField.name,
              user_id: field.user_id,
              farm_id: field.farm_id,
            },
            minimalError
          );
          return {
            data: null,
            error: `Failed to create field: ${minimalError.message}`,
          };
        }
        console.log(
          '✅ Successfully created field with minimal data after initial failure.'
        );
        return { data: minimalData, error: null };
      }

      console.log('✅ Field created successfully in Supabase.');
      return { data, error: null };
    } catch (error: any) {
      console.error('Critical error during online field creation:', error);
      await logFieldError(
        supabase,
        field.user_id,
        'critical_create_error',
        field,
        error
      );
      return {
        data: null,
        error: `Critical error creating field: ${error.message}`,
      };
    }
  } else {
    // Store offline if not connected
    const offlineFields = getOfflineData<Field>(OFFLINE_FIELDS_KEY);
    offlineFields.push(newField);
    saveOfflineData(OFFLINE_FIELDS_KEY, offlineFields);
    console.log(
      `[createField] Field ${newField.id} saved offline for user ${field.user_id}.`
    );
    // It's a successful local save, so no error is returned to the caller for offline mode.
    return { data: newField, error: null };
  }
};

// Get all fields (combines online + offline data)
export const getAllFields = async (
  userId: string,
  farmId: string
): Promise<{ data: Field[]; error: string | null }> => {
  try {
    let fields: Field[] = [];

    // If online, get fields from Supabase
    if (isOnline()) {
      const { data, error } = await supabase
        .from('fields')
        .select('*')
        .eq('user_id', userId)
        .eq('farm_id', farmId);

      if (error) throw error;
      fields = data || [];
    }

    // Get any offline fields
    const offlineFields = getOfflineData<Field>(OFFLINE_FIELDS_KEY).filter(
      (field) =>
        field.user_id === userId && field.farm_id === farmId && !field.is_synced
    );

    // Combine results, giving preference to online data
    const combinedFields = [...fields];

    // Add only offline fields that don't exist online
    offlineFields.forEach((offlineField) => {
      if (
        !combinedFields.some(
          (field) => field.offline_id === offlineField.offline_id
        )
      ) {
        combinedFields.push(offlineField);
      }
    });

    return { data: combinedFields, error: null };
  } catch (error: any) {
    console.error('Error fetching fields:', error);

    // If fetch fails, return offline data only
    const offlineFields = getOfflineData<Field>(OFFLINE_FIELDS_KEY).filter(
      (field) => field.user_id === userId && field.farm_id === farmId
    );

    return { data: offlineFields, error: error.message };
  }
};

// ... rest of the code remains the same ...

// Update field with offline support
export const updateField = async (
  field: Field,
  userId: string,
  farmId: string
): Promise<{ data: Field | null; error: string | null }> => {
  // Update local timestamp
  const updatedField = {
    ...field,
    updated_at: new Date().toISOString(),
    is_synced: isOnline(),
  };

  // If online, update in Supabase
  if (isOnline()) {
    try {
      // 1. Verify field access
      const access = await verifyFieldAccess(field.id, userId, farmId);
      if (!access.canAccess) {
        console.warn(
          `[updateField] User ${userId} cannot access field ${field.id} on farm ${farmId}. Error: ${access.error}`
        );
        return {
          data: null,
          error: access.error || 'Field access denied or field not found.',
        };
      }

      // Skip the offline-specific fields when updating Supabase
      const { offline_id, is_synced, ...supabaseFieldData } = updatedField;

      const { data, error } = await supabase
        .from('fields')
        .update(supabaseFieldData)
        .eq('id', field.id)
        .eq('user_id', userId) // Ensure user owns the record they are updating
        .select()
        .single();

      if (error) {
        console.error(
          `[updateField] Error updating field ${field.id} in Supabase:`,
          error
        );
        await logFieldError(supabase, userId, 'update_error', field, error);
        return {
          data: null,
          error: `Failed to update field: ${error.message}`,
        };
      }

      console.log(
        `[updateField] Field ${data?.id} updated successfully in Supabase.`
      );
      return { data, error: null };
    } catch (error: any) {
      console.error(
        `[updateField] Critical error updating field ${field.id}:`,
        error
      );
      await logFieldError(
        supabase,
        userId,
        'critical_update_error',
        field,
        error
      );
      return {
        data: null,
        error: `Critical error updating field: ${error.message}`,
      };
    }
  } else {
    // Store offline if not connected
    const offlineFields = getOfflineData<Field>(OFFLINE_FIELDS_KEY);
    const index = offlineFields.findIndex(
      (f) =>
        f.id === field.id || (f.offline_id && f.offline_id === field.offline_id)
    );

    if (index >= 0) {
      offlineFields[index] = { ...updatedField, is_synced: false }; // Mark as not synced
    } else {
      // This case should ideally not happen if field was fetched correctly
      offlineFields.push({ ...updatedField, is_synced: false });
    }

    saveOfflineData(OFFLINE_FIELDS_KEY, offlineFields);
    console.log(
      `[updateField] Field ${updatedField.id || updatedField.offline_id} updated offline for user ${userId}.`
    );
    return { data: updatedField, error: null };
  }
};

// Delete field with offline support
export const deleteField = async (
  fieldId: string,
  userId: string,
  farmId: string
): Promise<{ error: string | null }> => {
  if (isOnline()) {
    try {
      // 1. Verify field access
      const access = await verifyFieldAccess(fieldId, userId, farmId);
      if (!access.canAccess) {
        console.warn(
          `[deleteField] User ${userId} cannot access field ${fieldId} on farm ${farmId}. Error: ${access.error}`
        );
        return {
          error: access.error || 'Field access denied or field not found.',
        };
      }

      const { error } = await supabase
        .from('fields')
        .delete()
        .eq('id', fieldId)
        .eq('user_id', userId); // Ensure user owns the record they are deleting

      if (error) {
        console.error(
          `[deleteField] Error deleting field ${fieldId} from Supabase:`,
          error
        );
        await logFieldError(
          supabase,
          userId,
          'delete_error',
          { field_id: fieldId },
          error
        );
        return { error: `Failed to delete field: ${error.message}` };
      }

      // Also remove from offline storage if it exists there
      const offlineFields = getOfflineData<Field>(OFFLINE_FIELDS_KEY).filter(
        (field) => field.id !== fieldId && field.offline_id !== fieldId
      );
      saveOfflineData(OFFLINE_FIELDS_KEY, offlineFields);
      console.log(
        `[deleteField] Field ${fieldId} deleted successfully from Supabase and offline cache for user ${userId}.`
      );
      return { error: null };
    } catch (error: any) {
      console.error(
        `[deleteField] Critical error deleting field ${fieldId}:`,
        error
      );
      await logFieldError(
        supabase,
        userId,
        'critical_delete_error',
        { field_id: fieldId },
        error
      );
      return { error: `Critical error deleting field: ${error.message}` };
    }
  } else {
    // Mark for deletion when back online
    const offlineFields = getOfflineData<Field>(OFFLINE_FIELDS_KEY);
    const fieldIndex = offlineFields.findIndex(
      (f) => f.id === fieldId || (f.offline_id && f.offline_id === fieldId)
    );

    if (fieldIndex >= 0) {
      // If it's an offline-only field (never synced), just remove it locally
      if (
        offlineFields[fieldIndex].offline_id &&
        !offlineFields[fieldIndex].id.startsWith('temp-')
      ) {
        // Check if it has a server ID
        offlineFields.splice(fieldIndex, 1);
        console.log(
          `[deleteField] Offline-only field ${offlineFields[fieldIndex].offline_id} removed locally for user ${userId}.`
        );
      } else {
        // Otherwise mark for server deletion when online
        offlineFields[fieldIndex].deleted = true;
        offlineFields[fieldIndex].is_synced = false; // Needs to be synced for deletion
        console.log(
          `[deleteField] Field ${fieldId} marked for server deletion (offline) for user ${userId}.`
        );
      }
      saveOfflineData(OFFLINE_FIELDS_KEY, offlineFields);
    } else {
      console.warn(
        `[deleteField] Field ${fieldId} not found in offline storage for user ${userId} to mark for deletion.`
      );
      // Optionally return an error if the field to be deleted offline is not found
      // return { error: "Field not found for offline deletion." };
    }
    return { error: null }; // Successful offline operation
  }
};

// Get field by ID (combines online + offline data)
export const getFieldById = async (
  fieldId: string,
  userId: string,
  farmId: string
): Promise<{ data: Field | null; error: string | null }> => {
  // If online, try to get from Supabase with access checks
  if (isOnline()) {
    try {
      const access = await verifyFieldAccess(fieldId, userId, farmId);
      if (!access.canAccess) {
        console.warn(
          `[getFieldById] User ${userId} cannot access field ${fieldId} on farm ${farmId}. Error: ${access.error}`
        );
        return {
          data: null,
          error: access.error || 'Field access denied or field not found.',
        };
      }

      const { data, error } = await supabase
        .from('fields')
        .select('*')
        .eq('id', fieldId)
        .eq('user_id', userId) // Ensure user ownership
        .eq('farm_id', farmId) // Ensure farm context
        .single();

      if (error) {
        console.error(
          `[getFieldById] Error fetching field ${fieldId} from Supabase after access check:`,
          error
        );
        // Fall through to check offline
      } else if (data) {
        console.log(
          `[getFieldById] Field ${fieldId} fetched successfully from Supabase for user ${userId}.`
        );
        return { data, error: null };
      }
    } catch (e: any) {
      console.error(
        `[getFieldById] Critical error fetching field ${fieldId} online:`,
        e
      );
      // Fall through to check offline
    }
  }

  // Check offline storage if offline or if online fetch failed/returned no data
  const offlineFields = getOfflineData<Field>(OFFLINE_FIELDS_KEY);
  const foundOfflineField = offlineFields.find(
    (f) =>
      (f.id === fieldId || (f.offline_id && f.offline_id === fieldId)) &&
      f.user_id === userId &&
      f.farm_id === farmId
  );

  if (foundOfflineField) {
    console.log(
      `[getFieldById] Field ${fieldId} found in offline storage for user ${userId} and farm ${farmId}.`
    );
    return { data: foundOfflineField, error: null };
  }

  console.warn(
    `[getFieldById] Field ${fieldId} not found for user ${userId} on farm ${farmId} in online or offline storage.`
  );
  return { data: null, error: 'Field not found or access denied.' };
};

// Sync all offline data to the server
export const syncOfflineData = async (
  userId: string
): Promise<{
  success: boolean;
  error: string | null;
  details?: Array<{ id: string | undefined; operation: string; error: string }>;
}> => {
  if (!isOnline()) {
    return { success: false, error: 'You are currently offline' };
  }

  const syncErrors: Array<{
    id: string | undefined;
    operation: string;
    error: string;
  }> = [];
  try {
    const offlineFields = getOfflineData<Field>(OFFLINE_FIELDS_KEY).filter(
      (field) => !field.is_synced && field.user_id === userId
    );

    for (const field of offlineFields) {
      try {
        if (field.deleted) {
          if (
            field.id &&
            !field.id.startsWith('temp-') &&
            !field.id.includes('-')
          ) {
            // Ensure it's a server ID
            console.log(
              `[syncOfflineData] Deleting field ${field.id} from server for user ${userId}.`
            );
            const { error: deleteError } = await supabase
              .from('fields')
              .delete()
              .eq('id', field.id)
              .eq('user_id', userId);
            if (deleteError) {
              console.error(
                `[syncOfflineData] Error deleting field ${field.id}:`,
                deleteError
              );
              syncErrors.push({
                id: field.id,
                operation: 'delete',
                error: deleteError.message,
              });
              continue;
            }
          }
        } else if (
          !field.id ||
          field.id.startsWith('temp-') ||
          field.id.includes('-')
        ) {
          console.log(
            `[syncOfflineData] Creating new field (offlineId: ${field.offline_id}) for user ${userId}.`
          );
          const {
            offline_id,
            is_synced,
            id,
            user_id: fieldUserId,
            farm_id: fieldFarmId,
            ...newFieldData
          } = field;

          if (fieldUserId !== userId) {
            syncErrors.push({
              id: offline_id,
              operation: 'create',
              error: 'User ID mismatch during sync',
            });
            continue;
          }
          const farmOwnership = await verifyFarmOwnership(fieldFarmId, userId);
          if (!farmOwnership.isOwner) {
            syncErrors.push({
              id: offline_id,
              operation: 'create',
              error:
                farmOwnership.error ||
                'Farm ownership verification failed during sync',
            });
            continue;
          }
          const { data: createdData, error: createError } = await supabase
            .from('fields')
            .insert({ ...newFieldData, user_id: userId, farm_id: fieldFarmId })
            .select()
            .single();
          if (createError) {
            console.error(
              `[syncOfflineData] Error creating field ${offline_id}:`,
              createError
            );
            syncErrors.push({
              id: offline_id,
              operation: 'create',
              error: createError.message,
            });
            continue;
          }
          if (createdData) {
            const allOffline = getOfflineData<Field>(OFFLINE_FIELDS_KEY);
            const idx = allOffline.findIndex(
              (f) => f.offline_id === offline_id
            );
            if (idx >= 0) {
              allOffline[idx] = {
                ...createdData,
                offline_id: offline_id,
                is_synced: true,
              };
              saveOfflineData(OFFLINE_FIELDS_KEY, allOffline);
            }
          }
        } else {
          // Existing field that was updated offline
          console.log(
            `[syncOfflineData] Updating field ${field.id} for user ${userId}.`
          );
          const {
            offline_id,
            is_synced,
            user_id: fieldUserId,
            created_at,
            ...updateFieldData
          } = field; // Exclude created_at from update
          if (fieldUserId !== userId) {
            syncErrors.push({
              id: field.id,
              operation: 'update',
              error: 'User ID mismatch during sync',
            });
            continue;
          }
          const { error: updateError } = await supabase
            .from('fields')
            .update(updateFieldData)
            .eq('id', field.id)
            .eq('user_id', userId);
          if (updateError) {
            console.error(
              `[syncOfflineData] Error updating field ${field.id}:`,
              updateError
            );
            syncErrors.push({
              id: field.id,
              operation: 'update',
              error: updateError.message,
            });
            continue;
          }
        }
      } catch (operationError: any) {
        console.error(
          `[syncOfflineData] Error processing field ${field.offline_id || field.id}:`,
          operationError
        );
        syncErrors.push({
          id: field.offline_id || field.id,
          operation: field.deleted
            ? 'delete'
            : field.id && !field.id.startsWith('temp-')
              ? 'update'
              : 'create',
          error: operationError.message,
        });
      }
    }

    const finalOfflineFields = getOfflineData<Field>(OFFLINE_FIELDS_KEY);
    saveOfflineData(
      OFFLINE_FIELDS_KEY,
      finalOfflineFields
        .filter(
          (f) =>
            !f.deleted ||
            (f.deleted &&
              syncErrors.some((e) => e.id === f.id && e.operation === 'delete'))
        ) // Keep failed deletes
        .map((f) => ({
          ...f,
          is_synced: !syncErrors.some((e) => e.id === (f.offline_id || f.id)),
        }))
    );

    if (syncErrors.length > 0) {
      console.warn('[syncOfflineData] Some items failed to sync:', syncErrors);
      return {
        success: false,
        error: 'Some items failed to sync. Check console for details.',
        details: syncErrors,
      };
    }

    console.log('[syncOfflineData] All data synchronized successfully.');
    return { success: true, error: null };
  } catch (error: any) {
    // Catch errors from initial offlineFields fetch or other unexpected issues
    console.error('[syncOfflineData] Critical error during sync setup:', error);
    return {
      success: false,
      error: `Critical sync error: ${error.message}`,
      details: syncErrors.length > 0 ? syncErrors : undefined,
    };
  }
};

// Share field with other users
export const shareField = async (
  fieldId: string,
  userIdToShareWith: string,
  currentUserId: string, // User performing the share action
  currentFarmId: string // Active farm context of the current user
): Promise<{ success: boolean; error: string | null }> => {
  if (!isOnline()) {
    return { success: false, error: 'Cannot share fields while offline.' };
  }

  try {
    // 1. Verify current user has access to the field they are trying to share
    const { data: fieldToShare, error: accessError } = await getFieldById(
      fieldId,
      currentUserId,
      currentFarmId
    );

    if (accessError || !fieldToShare) {
      console.warn(
        `[shareField] User ${currentUserId} cannot access field ${fieldId} to share it. Error: ${accessError}`
      );
      return {
        success: false,
        error:
          accessError ||
          'Field not found or you do not have permission to share this field.',
      };
    }

    // 2. Update shared status
    const currentSharedWith = fieldToShare.shared_with || [];
    if (currentSharedWith.includes(userIdToShareWith)) {
      console.log(
        `[shareField] Field ${fieldId} already shared with user ${userIdToShareWith}.`
      );
      return { success: true, error: null }; // Already shared, count as success
    }

    const newSharedWith = [...currentSharedWith, userIdToShareWith];

    const { error: updateError } = await supabase
      .from('fields')
      .update({
        is_shared: true,
        shared_with: newSharedWith,
      })
      .eq('id', fieldId)
      .eq('user_id', currentUserId); // Ensure only owner can modify share status (or adjust if others can too)

    if (updateError) {
      console.error(
        `[shareField] Error updating share status for field ${fieldId}:`,
        updateError
      );
      await logFieldError(
        supabase,
        currentUserId,
        'share_error',
        { field_id: fieldId, share_with: userIdToShareWith },
        updateError
      );
      return {
        success: false,
        error: `Failed to share field: ${updateError.message}`,
      };
    }

    console.log(
      `[shareField] Field ${fieldId} successfully shared with user ${userIdToShareWith} by user ${currentUserId}.`
    );
    return { success: true, error: null };
  } catch (error: any) {
    console.error(
      `[shareField] Critical error sharing field ${fieldId}:`,
      error
    );
    await logFieldError(
      supabase,
      currentUserId,
      'critical_share_error',
      { field_id: fieldId, share_with: userIdToShareWith },
      error
    );
    return {
      success: false,
      error: `Critical error sharing field: ${error.message}`,
    };
  }
};

// Listen for online/offline status changes
export const setupConnectivityListeners = (
  onOnline: () => void,
  onOffline: () => void
) => {
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
      toast.info('Connection restored', {
        description: 'Syncing your offline changes...',
      });
      await syncOfflineData(userId);
    },
    // When going offline
    () => {
      toast.warning('You are offline', {
        description:
          'Changes will be saved locally and synced when you reconnect.',
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
      errorTypes.forEach((error) => {
        const type = error.error_type;
        if (type) {
          errorCounts[type] = (errorCounts[type] || 0) + 1;
        }
      });

      console.log('Field error statistics:', errorCounts);
      // Here you could implement auto-fix routines based on common errors
    }
  } catch (error) {
    console.error('Error tracking field errors:', error);
  }
};
