import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getAllFields, syncOfflineData } from '@/services/fieldService';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button'; // Assuming Button component is available
import { Loader2, RefreshCw } from 'lucide-react'; // Icons for loading and sync

interface Field {
  id: string;
  name: string;
  area?: number;
  cropType?: string;
  lastUpdated?: string;
}

// Field interface might be slightly different from what fieldService returns, adjust as needed
// For now, assuming the existing Field interface is compatible or will be adjusted.

interface FieldDashboardProps {
  onFieldSelect?: (fieldId: string) => void; // To navigate or show details
  className?: string;
}

const FieldDashboard: React.FC<FieldDashboardProps> = ({
  onFieldSelect,
  className = '',
}) => {
  const { user, farmId, isLoading: authLoading } = useAuth();
  const [fields, setFields] = useState<Field[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const fetchFields = useCallback(async () => {
    if (!user || !farmId) {
      if (!authLoading) { // Only show toast if auth is not actively loading
        toast.error('Authentication Error', { description: 'User or farm context is missing. Cannot fetch fields.' });
      }
      setFields([]); // Clear fields if auth context is missing
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await getAllFields(user.id, farmId);
      if (fetchError) {
        throw new Error(fetchError);
      }
      setFields(data || []);
    } catch (err: any) {
      console.error('Failed to fetch fields:', err);
      setError(err.message || 'An unknown error occurred while fetching fields.');
      toast.error('Failed to load fields', { description: err.message });
      setFields([]); // Clear fields on error
    } finally {
      setIsLoading(false);
    }
  }, [user, farmId, authLoading]);

  useEffect(() => {
    fetchFields();
  }, [fetchFields]);

  const handleSyncData = useCallback(async () => {
    if (!user) {
      toast.error('Authentication Error', { description: 'User context is missing. Cannot sync data.' });
      return;
    }
    setIsSyncing(true);
    try {
      const { success, error: syncError, details } = await syncOfflineData(user.id);
      if (success) {
        toast.success('Data Synchronized', { description: 'Your offline data has been synced with the server.' });
        fetchFields(); // Refresh fields after sync
      } else {
        console.error('Sync failed:', syncError, details);
        toast.error('Sync Failed', { description: syncError || 'Could not sync data. Some items may have failed.', action: details ? { label: 'View Details', onClick: () => console.log('Sync Errors:', details) } : undefined });
      }
    } catch (err: any) {
      console.error('Critical sync error:', err);
      toast.error('Sync Error', { description: 'A critical error occurred during data synchronization.' });
    } finally {
      setIsSyncing(false);
    }
  }, [user, fetchFields]);

  const handleFieldClick = (fieldId: string) => {
    if (onFieldSelect) {
      onFieldSelect(fieldId);
    }
  };

  return (
    <div className={`bg-white shadow rounded-lg p-6 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Fields</h2>
        <Button onClick={handleSyncData} disabled={isSyncing || authLoading || !user} variant="outline" size="sm">
          {isSyncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Sync Data
        </Button>
      </div>
      
      {isLoading && (
        <div className="text-center py-8">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-green-600" />
          <p className="text-gray-500 mt-2">Loading fields...</p>
        </div>
      )}

      {!isLoading && error && (
        <div className="text-center py-8 bg-red-50 p-4 rounded-md">
          <p className="text-red-600 font-semibold">Error loading fields:</p>
          <p className="text-red-500 mt-1">{error}</p>
          <Button onClick={fetchFields} className="mt-4" variant="outline">Try Again</Button>
        </div>
      )}

      {!isLoading && !error && fields.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No fields found. Add your first field to get started.</p>
          <button
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            onClick={() => handleFieldClick('new')}
          >
            Add Field
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fields.map((field) => (
            <div
              key={field.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleFieldClick(field.id)}
              data-testid={`field-${field.id}`}
            >
              <h3 className="text-lg font-semibold text-gray-800">{field.name}</h3>
              {field.cropType && (
                <p className="text-sm text-gray-600 mt-1">Crop: {field.cropType}</p>
              )}
              {field.area && (
                <p className="text-sm text-gray-600">Area: {field.area} ha</p>
              )}
              {field.lastUpdated && (
                <p className="text-xs text-gray-400 mt-2">
                  Updated: {new Date(field.lastUpdated).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
          
          <div 
            className="border-2 border-dashed rounded-lg p-4 flex items-center justify-center cursor-pointer hover:bg-gray-50"
            onClick={() => handleFieldClick('new')}
          >
            <span className="text-gray-400">+ Add New Field</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldDashboard;
