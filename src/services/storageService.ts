// src/services/storageService.ts

/**
 * @file storageService.ts
 * @description Handles interactions with Supabase Storage, primarily for file uploads.
 */

import { supabase } from './supabaseClient';

const CROP_IMAGES_BUCKET = 'crop_images'; // Ensure this bucket exists in your Supabase project

export interface UploadedFileResponse {
  filePath: string; // Full path within the bucket
  publicUrl: string; // Publicly accessible URL for the file
}

/**
 * Uploads a crop image to Supabase Storage.
 *
 * @param file The image file to upload.
 * @param userId The ID of the user uploading the file, for path organization.
 * @param options Optional parameters like farmId or fieldId for further path organization.
 * @returns A promise that resolves with the file path and public URL of the uploaded image.
 * @throws If the upload fails.
 */
export const uploadCropImage = async (
  file: File,
  userId: string,
  options?: { farmId?: string; fieldId?: string }
): Promise<UploadedFileResponse> => {
  if (!file) {
    throw new Error('No file provided for upload.');
  }
  if (!userId) {
    throw new Error('User ID is required for organizing uploads.');
  }

  // Sanitize filename to prevent issues, remove special characters except for period and hyphen
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-'); // Make timestamp path-friendly

  // Construct a unique file path, e.g., user_id/farm_id/timestamp-filename.png
  let filePath = `${userId}/`;
  if (options?.farmId) {
    filePath += `${options.farmId}/`;
  }
  if (options?.fieldId) {
    filePath += `${options.fieldId}/`;
  }
  filePath += `${timestamp}-${sanitizedFileName}`;

  console.log(
    `Attempting to upload to Supabase Storage: ${CROP_IMAGES_BUCKET}/${filePath}`
  );

  try {
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(CROP_IMAGES_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600', // Cache for 1 hour
        upsert: false, // Do not overwrite if file with same path exists (timestamp should make it unique)
      });

    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError);
      throw uploadError;
    }

    if (!uploadData || !uploadData.path) {
      console.error(
        'Supabase storage upload error: No path returned after upload.',
        uploadData
      );
      throw new Error('Upload to Supabase Storage failed: No path returned.');
    }

    console.log('File uploaded successfully:', uploadData);

    // Get the public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from(CROP_IMAGES_BUCKET)
      .getPublicUrl(uploadData.path);

    if (!urlData || !urlData.publicUrl) {
      console.warn(
        'Could not get public URL for uploaded file, but upload was successful. Path:',
        uploadData.path
      );
      // Depending on bucket policies, public URL might not be available or might need to be constructed differently.
      // For now, we'll throw if we can't get it, as it's expected by CropScanAgent.
      throw new Error('Failed to retrieve public URL for uploaded file.');
    }

    return {
      filePath: uploadData.path,
      publicUrl: urlData.publicUrl,
    };
  } catch (error) {
    console.error('Error in uploadCropImage:', error);
    // Ensure the error is re-thrown so the caller can handle it
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unknown error occurred during file upload.');
  }
};

console.log('storageService.ts loaded.');
