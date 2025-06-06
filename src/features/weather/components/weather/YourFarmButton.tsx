import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Tractor, Plus, Loader2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Field } from '@/types/field';
import { useErrorLogging } from '@/hooks/use-error-logging';
import { motion } from 'framer-motion';
import AddFieldWizard from '@/components/fields/wizard/AddFieldWizard';
import ErrorBoundary from '@/components/error/ErrorBoundary';

interface YourFarmButtonProps {
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'link';
  buttonText?: string;
  onSelect: (field: Field) => void;
}

export default function YourFarmButton({
  className,
  size = 'default',
  variant = 'default',
  buttonText = 'Your Farm',
  onSelect,
}: YourFarmButtonProps) {
  const { logError, logSuccess } = useErrorLogging('YourFarmButton', {
    showToasts: true,
    criticalComponent: true,
  });
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [hasFields, setHasFields] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState<
    'noFields' | 'fields' | 'addField'
  >('noFields');
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🧩 [YourFarmButton] Component mounting');
    // Check authentication status
    const checkAuth = async () => {
      try {
        setError(null);
        const { data } = await supabase.auth.getSession();
        const isAuthed = !!data.session;
        setIsAuthenticated(isAuthed);
        setUserId(data.session?.user.id || null);

        console.log(
          `✅ [YourFarmButton] Auth check: ${isAuthed ? 'Authenticated' : 'Not authenticated'}`
        );

        if (isAuthed) {
          checkFields(data.session?.user.id || null);
        } else {
          setLoading(false);
        }
      } catch (err: any) {
        const errorMsg = err.message || 'Authentication check failed';
        console.error('❌ [YourFarmButton] Auth check failed:', errorMsg);
        setError(errorMsg);
        setIsAuthenticated(false);
        setLoading(false);
      }
    };

    checkAuth();

    // Get user's current location for field mapping
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log(
          '📍 [YourFarmButton] Got user location:',
          position.coords.latitude,
          position.coords.longitude
        );
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error('❌ [YourFarmButton] Location error:', error.message);
        // Don't set error state - this is non-critical
      },
      { enableHighAccuracy: true }
    );
  }, []);

  const checkFields = async (uid: string | null) => {
    if (!uid) return;

    try {
      setLoading(true);
      console.log('🔍 [YourFarmButton] Checking fields for user:', uid);

      const { data, error } = await supabase
        .from('fields')
        .select('*')
        .eq('user_id', uid);

      if (error) throw error;

      setFields(data || []);
      setHasFields(data && data.length > 0);

      console.log(
        `✅ [YourFarmButton] Fields check: ${data?.length || 0} fields found`
      );
    } catch (err: any) {
      const errorMsg = err.message || 'Field check failed';
      console.error('❌ [YourFarmButton] Field check failed:', errorMsg);
      setError(errorMsg);
      setHasFields(false);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (!isAuthenticated) {
      console.log(
        '🔄 [YourFarmButton] User not authenticated, navigating to auth page'
      );
      toast.info('Please sign in to access your farm');
      navigate('/auth');
      return;
    }

    if (hasFields === null) {
      // Still loading
      console.log('⏳ [YourFarmButton] Still loading field data');
      return;
    }

    if (!hasFields) {
      console.log('📝 [YourFarmButton] No fields, showing noFields dialog');
      setDialogType('noFields');
      setShowDialog(true);
    } else {
      console.log('🗺️ [YourFarmButton] Has fields, showing fields dialog');
      setDialogType('fields');
      setShowDialog(true);
    }
  };

  const handleAddField = () => {
    console.log('➕ [YourFarmButton] Showing add field dialog');
    setDialogType('addField');
  };

  const handleFieldAdded = (field: Field) => {
    try {
      console.log('✅ [YourFarmButton] Field added:', field);
      setFields((prev) => [field, ...prev]);
      setHasFields(true);
      setShowDialog(false);

      toast.success('Field added', {
        description:
          'Your field has been added successfully. Weather insights are now customized to your farm.',
      });

      // Handle field selection
      if (onSelect) {
        console.log(
          '🔄 [YourFarmButton] Calling onSelect with field:',
          field.name
        );
        onSelect(field);
      }

      // Navigate to the field detail page
      navigate(`/fields/${field.id}`);
    } catch (error: any) {
      logError(error, { context: 'handleFieldAdded' });
    }
  };

  const handleSelectField = (field: Field) => {
    try {
      console.log('🎯 [YourFarmButton] Field selected:', field.name);
      setSelectedFieldId(field.id);
      setShowDialog(false);

      // Call the onSelect callback
      onSelect(field);

      navigate(`/fields/${field.id}`);
    } catch (error: any) {
      logError(error, { context: 'handleSelectField' });
    }
  };

  return (
    <>
      <Button
        className={cn('relative', className)}
        size={size}
        variant={variant}
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : error ? (
          <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
        ) : (
          <Tractor className="h-4 w-4 mr-2" />
        )}
        {buttonText}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
          {dialogType === 'noFields' && (
            <div className="p-6">
              <DialogHeader className="mb-4">
                <DialogTitle className="text-2xl">
                  Add Your First Field
                </DialogTitle>
                <DialogDescription>
                  To deliver precise weather insights tailored to your farm, we
                  need your field location data.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h3 className="font-medium">
                    Adding your field will enable CROPGenius to:
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                        <span className="text-xs text-primary font-medium">
                          1
                        </span>
                      </div>
                      <span>
                        Provide hyperlocal weather forecasts specific to your
                        field
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                        <span className="text-xs text-primary font-medium">
                          2
                        </span>
                      </div>
                      <span>Generate AI-powered farming recommendations</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                        <span className="text-xs text-primary font-medium">
                          3
                        </span>
                      </div>
                      <span>
                        Alert you about weather risks that could affect your
                        crops
                      </span>
                    </li>
                  </ul>
                </motion.div>

                <Button onClick={handleAddField} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Field Now
                </Button>
              </div>
            </div>
          )}

          {dialogType === 'fields' && (
            <div className="p-6">
              <DialogHeader className="mb-4">
                <DialogTitle className="text-2xl">Your Fields</DialogTitle>
                <DialogDescription>
                  Select a field to view detailed weather insights or add a new
                  field.
                </DialogDescription>
              </DialogHeader>

              <motion.div
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.1 }}
              >
                <div className="grid gap-2 mb-4">
                  {fields.map((field, index) => (
                    <motion.div
                      key={field.id}
                      className={cn(
                        'flex items-center cursor-pointer px-3 py-3 hover:bg-muted rounded-md border',
                        selectedFieldId === field.id &&
                          'bg-primary/5 border-primary'
                      )}
                      onClick={() => handleSelectField(field)}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0">
                        <Tractor className="h-4 w-4 text-primary" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{field.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {field.size} {field.size_unit}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <Button
                  onClick={handleAddField}
                  className="w-full"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Field
                </Button>
              </motion.div>
            </div>
          )}

          {dialogType === 'addField' && (
            <div className="p-6">
              <DialogHeader className="mb-4">
                <DialogTitle className="text-2xl">Add New Field</DialogTitle>
                <DialogDescription>
                  Let's set up a new field for your farm.
                </DialogDescription>
              </DialogHeader>

              <ErrorBoundary>
                <AddFieldWizard
                  onSuccess={handleFieldAdded}
                  onCancel={() => setShowDialog(false)}
                  defaultLocation={userLocation || undefined}
                />
              </ErrorBoundary>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
