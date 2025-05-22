/**
 * Converts a File object to a base64 encoded string
 * @param file The file to convert
 * @returns A promise that resolves to the base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Gets the file extension from a filename
 * @param filename The filename
 * @returns The file extension (without the dot)
 */
export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

/**
 * Validates if a file is an image
 * @param file The file to validate
 * @returns True if the file is an image, false otherwise
 */
export const isImageFile = (file: File): boolean => {
  const acceptedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  return acceptedImageTypes.includes(file.type);
};

/**
 * Validates if a file is within size limits
 * @param file The file to validate
 * @param maxSizeInMB Maximum allowed size in MB
 * @returns True if the file is within size limits, false otherwise
 */
export const isFileSizeValid = (file: File, maxSizeInMB: number = 5): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};
