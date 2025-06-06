import { useState, useCallback, ChangeEvent } from 'react';
import { toast } from 'sonner';

export const useFileUpload = (
  options: {
    accept?: string;
    maxSizeMB?: number;
    onFileSelected?: (file: File) => void;
  } = {}
) => {
  const { accept = 'image/*', maxSizeMB = 5, onFileSelected } = options;

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Handle file selection
  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const selectedFile = event.target.files?.[0];
      if (!selectedFile) return;

      // Check file type
      if (!selectedFile.type.match(new RegExp(accept.replace('*', '.*')))) {
        const error = new Error(
          `Invalid file type. Please select a file of type: ${accept}`
        );
        setError(error);
        toast.error('Invalid file type', {
          description: `Please select a file of type: ${accept}`,
        });
        return;
      }

      // Check file size (default 5MB)
      const maxSize = maxSizeMB * 1024 * 1024; // Convert MB to bytes
      if (selectedFile.size > maxSize) {
        const error = new Error(
          `File is too large. Maximum size is ${maxSizeMB}MB`
        );
        setError(error);
        toast.error('File too large', {
          description: `Maximum file size is ${maxSizeMB}MB`,
        });
        return;
      }

      // Create preview URL for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setPreviewUrl(null);
      }

      // Set the file and clear any previous errors
      setFile(selectedFile);
      setError(null);

      // Call the onFileSelected callback if provided
      if (onFileSelected) {
        onFileSelected(selectedFile);
      }
    },
    [accept, maxSizeMB, onFileSelected]
  );

  // Reset file state
  const resetFile = useCallback(() => {
    setFile(null);
    setPreviewUrl(null);
    setError(null);
  }, []);

  // Upload file to server (placeholder - implement actual upload logic)
  const uploadFile = useCallback(
    async (uploadUrl: string, additionalData: Record<string, any> = {}) => {
      if (!file) {
        const error = new Error('No file selected');
        setError(error);
        throw error;
      }

      setIsUploading(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append('file', file);

        // Append additional data if provided
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, value);
        });

        const response = await fetch(uploadUrl, {
          method: 'POST',
          body: formData,
          // Note: Don't set Content-Type header - let the browser set it with the correct boundary
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to upload file');
        }

        const result = await response.json();
        return result;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to upload file');
        setError(error);
        toast.error('Upload failed', {
          description: error.message,
        });
        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    [file]
  );

  return {
    file,
    previewUrl,
    isUploading,
    error,
    handleFileChange,
    resetFile,
    uploadFile,
    setFile,
    setPreviewUrl,
  };
};
