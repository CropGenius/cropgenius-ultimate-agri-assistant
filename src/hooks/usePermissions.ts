import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface PermissionStatus {
  camera: boolean;
  location: boolean;
  notifications: boolean;
}

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<PermissionStatus>({
    camera: false,
    location: false,
    notifications: false
  });

  const [permissionRequests, setPermissionRequests] = useState({
    camera: false,
    location: false,
    notifications: false
  });

  const requestCameraPermission = useCallback(async () => {
    try {
      if (permissionRequests.camera) return;
      setPermissionRequests(prev => ({ ...prev, camera: true }));

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setPermissions(prev => ({ ...prev, camera: true }));
      stream.getTracks().forEach(track => track.stop());
      
      toast.success('Camera permission granted');
    } catch (error) {
      setPermissions(prev => ({ ...prev, camera: false }));
      toast.error('Camera permission denied');
    } finally {
      setPermissionRequests(prev => ({ ...prev, camera: false }));
    }
  }, []);

  const requestLocationPermission = useCallback(async () => {
    try {
      if (permissionRequests.location) return;
      setPermissionRequests(prev => ({ ...prev, location: true }));

      await navigator.geolocation.getCurrentPosition(() => {
        setPermissions(prev => ({ ...prev, location: true }));
        toast.success('Location permission granted');
      });
    } catch (error) {
      setPermissions(prev => ({ ...prev, location: false }));
      toast.error('Location permission denied');
    } finally {
      setPermissionRequests(prev => ({ ...prev, location: false }));
    }
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    try {
      if (permissionRequests.notifications) return;
      setPermissionRequests(prev => ({ ...prev, notifications: true }));

      const permission = await Notification.requestPermission();
      setPermissions(prev => ({ ...prev, notifications: permission === 'granted' }));
      
      if (permission === 'granted') {
        toast.success('Notification permission granted');
      } else {
        toast.error('Notification permission denied');
      }
    } catch (error) {
      setPermissions(prev => ({ ...prev, notifications: false }));
      toast.error('Failed to request notification permission');
    } finally {
      setPermissionRequests(prev => ({ ...prev, notifications: false }));
    }
  }, []);

  const getPermissionStatus = useCallback((permission: keyof PermissionStatus) => {
    return permissions[permission];
  }, [permissions]);

  const getPermissionRequestStatus = useCallback((permission: keyof PermissionStatus) => {
    return permissionRequests[permission];
  }, [permissionRequests]);

  useEffect(() => {
    // Check initial permissions
    const checkInitialPermissions = async () => {
      try {
        // Check camera permission
        if (navigator.mediaDevices?.getUserMedia) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop());
            setPermissions(prev => ({ ...prev, camera: true }));
          } catch (error) {
            setPermissions(prev => ({ ...prev, camera: false }));
          }
        }

        // Check location permission
        if (navigator.geolocation) {
          try {
            await navigator.geolocation.getCurrentPosition(() => {
              setPermissions(prev => ({ ...prev, location: true }));
            });
          } catch (error) {
            setPermissions(prev => ({ ...prev, location: false }));
          }
        }

        // Check notification permission
        const permission = await Notification.requestPermission();
        setPermissions(prev => ({ ...prev, notifications: permission === 'granted' }));
      } catch (error) {
        console.error('Error checking initial permissions:', error);
      }
    };

    checkInitialPermissions();
  }, []);

  return {
    permissions,
    permissionRequests,
    requestCameraPermission,
    requestLocationPermission,
    requestNotificationPermission,
    getPermissionStatus,
    getPermissionRequestStatus
  };
};
