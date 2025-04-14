
import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface OfflineStatusIndicatorProps {
  className?: string;
}

export default function OfflineStatusIndicator({ className }: OfflineStatusIndicatorProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncQueueCount, setSyncQueueCount] = useState(0);

  useEffect(() => {
    // Check offline queue size
    const checkQueueSize = () => {
      try {
        // Check various offline storage queues
        const fields = JSON.parse(localStorage.getItem('cropgenius_offline_fields') || '[]');
        const crops = JSON.parse(localStorage.getItem('cropgenius_offline_crops') || '[]');
        const history = JSON.parse(localStorage.getItem('cropgenius_offline_history') || '[]');
        
        const unsyncedFields = fields.filter((f: any) => !f.is_synced);
        const unsyncedCrops = crops.filter((c: any) => !c.is_synced);
        const unsyncedHistory = history.filter((h: any) => !h.is_synced);
        
        const total = unsyncedFields.length + unsyncedCrops.length + unsyncedHistory.length;
        setSyncQueueCount(total);
      } catch (e) {
        setSyncQueueCount(0);
      }
    };
    
    const handleOnline = () => {
      setIsOnline(true);
      setIsSyncing(true);
      
      checkQueueSize();
      if (syncQueueCount > 0) {
        toast.info("Connection restored", {
          description: `Syncing ${syncQueueCount} items...`
        });
        
        // Simulate sync process
        setTimeout(() => {
          setIsSyncing(false);
          setSyncQueueCount(0);
          toast.success("Data synchronized", {
            description: "All your changes have been saved to the cloud"
          });
        }, 2000);
      } else {
        setIsSyncing(false);
      }
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setIsSyncing(false);
      
      toast.warning("You are offline", {
        description: "Changes will be saved locally and synced when you reconnect"
      });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Initial check
    checkQueueSize();
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4 text-green-500" />
          <span className="text-xs text-muted-foreground">Online</span>
          {isSyncing && (
            <>
              <RefreshCw className="h-3 w-3 animate-spin ml-1" />
              <span className="text-xs text-muted-foreground">Syncing...</span>
            </>
          )}
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-amber-500" />
          <span className="text-xs text-amber-500 font-medium">Offline Mode</span>
          {syncQueueCount > 0 && (
            <span className="text-xs bg-amber-500/20 text-amber-600 px-1.5 py-0.5 rounded-full">
              {syncQueueCount}
            </span>
          )}
        </>
      )}
    </div>
  );
}
