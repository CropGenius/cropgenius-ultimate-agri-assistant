import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { isOnline } from '@/features/field-management/utils/fieldSanitizer';

export function OfflineStatusIndicator() {
  const [offline, setOffline] = useState(!isOnline());
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    // Set initial state
    setOffline(!isOnline());

    // Show alert only if offline at initialization
    if (!isOnline()) {
      setShowAlert(true);
      // Auto-hide the alert after 5 seconds
      const timer = setTimeout(() => setShowAlert(false), 5000);
      return () => clearTimeout(timer);
    }

    // Add event listeners for connection changes
    const handleOnline = () => {
      setOffline(false);
      setShowAlert(true);
      // Auto-hide the alert after 5 seconds
      setTimeout(() => setShowAlert(false), 5000);
    };

    const handleOffline = () => {
      setOffline(true);
      setShowAlert(true);
      // Keep alert visible while offline
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // If online, either show nothing or a brief success message
  if (!offline && !showAlert) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 max-w-sm transition-all duration-300 ease-in-out"
      style={{
        transform: showAlert ? 'translateY(0)' : 'translateY(150%)',
        opacity: showAlert ? 1 : 0,
      }}
    >
      {offline ? (
        <Alert
          variant="destructive"
          className="border-amber-500 bg-amber-50 text-amber-900 dark:bg-amber-900/20 dark:text-amber-100"
        >
          <WifiOff className="h-4 w-4 mr-2" />
          <AlertTitle>You are offline</AlertTitle>
          <AlertDescription>
            Don't worry, your changes will be saved locally and synced when you
            reconnect.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert
          variant="default"
          className="border-green-500 bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-100"
        >
          <Wifi className="h-4 w-4 mr-2" />
          <AlertTitle>You are back online</AlertTitle>
          <AlertDescription>Syncing your offline changes...</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export default OfflineStatusIndicator;
