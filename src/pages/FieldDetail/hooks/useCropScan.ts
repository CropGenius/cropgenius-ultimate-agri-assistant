import { useState, useCallback } from 'react';
import { useOfflineMutation } from '@/hooks';
import { useNetworkStatus } from '@/hooks/network/useNetworkStatus';
import { useToast } from '@/components/ui/use-toast';
import { useCropScanAgent } from '@/hooks/agents/useCropScanAgent';

export function useCropScan(fieldId: string) {
  const { toast } = useToast();
  const { isOnline } = useNetworkStatus();
  const [cropScanImage, setCropScanImage] = useState<File | null>(null);
  const [recentScans, setRecentScans] = useState<any[]>([]);

  // Use the crop scan agent
  const {
    performCropScan: agentPerformCropScan,
    recentScans: agentRecentScans = [],
    isLoading: isAgentLoading,
    error: agentError,
  } = useCropScanAgent();

  // Load recent scans on mount
  useEffect(() => {
    if (fieldId && isOnline) {
      setRecentScans(agentRecentScans);
    }
  }, [fieldId, isOnline, agentRecentScans]);

  // Handle crop scan
  const performScan = useCallback(async () => {
    if (!cropScanImage || !fieldId) {
      toast({
        title: 'Error',
        description: 'Please select an image and ensure field data is loaded.',
        variant: 'destructive',
      });
      return null;
    }

    if (!isOnline) {
      toast({
        title: 'Offline',
        description: 'Crop scan requires an internet connection.',
        variant: 'default',
      });
      return null;
    }

    try {
      const result = await agentPerformCropScan({
        imageFile: cropScanImage,
        fieldId,
      });

      if (result) {
        toast({
          title: 'Success',
          description: 'Crop scan completed successfully!',
          variant: 'default',
        });

        // Update recent scans
        setRecentScans((prev) => [result, ...prev].slice(0, 5));

        // Clear the selected image
        setCropScanImage(null);

        return result;
      }
    } catch (error) {
      console.error('Crop scan failed:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to perform crop scan',
        variant: 'destructive',
      });
      throw error;
    }
  }, [cropScanImage, fieldId, isOnline, toast, agentPerformCropScan]);

  return {
    cropScanImage,
    setCropScanImage,
    performScan,
    recentScans,
    isLoading: isAgentLoading,
    error: agentError,
  };
}
