import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tractor, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { Field } from '@/types/field';
import { Loader2 } from 'lucide-react';
import AddFieldForm from '@/components/fields/AddFieldForm';

interface YourFarmButtonProps {
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "secondary" | "outline" | "ghost";
  buttonText?: string;
  onSelect: (field: Field) => void;
}

export default function YourFarmButton({ 
  className, 
  size = "default",
  variant = "default",
  buttonText = "Your Farm",
  onSelect
}: YourFarmButtonProps) {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [hasFields, setHasFields] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'noFields' | 'fields' | 'addField'>('noFields');
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const isAuthed = !!data.session;
        setIsAuthenticated(isAuthed);
        setUserId(data.session?.user.id || null);
        
        if (isAuthed) {
          checkFields(data.session?.user.id || null);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        setIsAuthenticated(false);
        setLoading(false);
      }
    };
    
    checkAuth();
    
    // Get user's current location for field mapping
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        console.log('Location error:', error);
      },
      { enableHighAccuracy: true }
    );
  }, []);

  const checkFields = async (uid: string | null) => {
    if (!uid) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('fields')
        .select('*')
        .eq('user_id', uid);
      
      if (error) throw error;
      
      setFields(data || []);
      setHasFields(data && data.length > 0);
    } catch (err) {
      console.error('Field check failed:', err);
      setHasFields(false);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    
    if (hasFields === null) {
      // Still loading
      return;
    }
    
    if (!hasFields) {
      setDialogType('noFields');
      setShowDialog(true);
    } else {
      setDialogType('fields');
      setShowDialog(true);
    }
  };

  const handleAddField = () => {
    setDialogType('addField');
  };

  const handleFieldAdded = (field: Field) => {
    setFields(prev => [field, ...prev]);
    setHasFields(true);
    setShowDialog(false);
    
    toast.success("Field added", {
      description: "Your field has been added successfully. Weather insights are now customized to your farm."
    });
    
    // Navigate to the field detail page
    navigate(`/fields/${field.id}`);
  };

  const handleSelectField = (fieldId: string) => {
    setSelectedFieldId(fieldId);
    navigate(`/fields/${fieldId}`);
    setShowDialog(false);
  };

  return (
    <>
      <Button
        className={cn("relative", className)}
        size={size}
        variant={variant}
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Tractor className="h-4 w-4 mr-2" />
        )}
        {buttonText}
      </Button>
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[500px]">
          {dialogType === 'noFields' && (
            <>
              <DialogHeader>
                <DialogTitle>Add Your First Field</DialogTitle>
                <DialogDescription>
                  To deliver precise weather insights tailored to your farm, we need your field location data.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="mb-4 text-sm">
                  Adding your field will enable CROPGenius to:
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-2 text-sm">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                      <span className="text-xs text-primary font-medium">1</span>
                    </div>
                    <span>Provide hyperlocal weather forecasts specific to your field</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                      <span className="text-xs text-primary font-medium">2</span>
                    </div>
                    <span>Generate AI-powered farming recommendations</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                      <span className="text-xs text-primary font-medium">3</span>
                    </div>
                    <span>Alert you about weather risks that could affect your crops</span>
                  </li>
                </ul>
                <Button onClick={handleAddField} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Field Now
                </Button>
              </div>
            </>
          )}
          
          {dialogType === 'fields' && (
            <>
              <DialogHeader>
                <DialogTitle>Your Fields</DialogTitle>
                <DialogDescription>
                  Select a field to view detailed weather insights or add a new field.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="grid gap-2 mb-4">
                  {fields.map(field => (
                    <div 
                      className="cursor-pointer px-3 py-2 hover:bg-muted rounded-md"
                      onClick={() => onSelect(field)}
                      key={field.id}
                    >
                      <Tractor className="h-4 w-4 mr-2" />
                      <div className="text-left">
                        <div className="font-medium">{field.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {field.size} {field.size_unit}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button onClick={handleAddField} className="w-full" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Field
                </Button>
              </div>
            </>
          )}
          
          {dialogType === 'addField' && (
            <>
              <DialogHeader>
                <DialogTitle>Map Your Field</DialogTitle>
                <DialogDescription>
                  Use the map to locate and outline your field boundaries.
                </DialogDescription>
              </DialogHeader>
              <div className="py-2">
                <AddFieldForm 
                  onSuccess={handleFieldAdded}
                  onCancel={() => setShowDialog(false)}
                  defaultLocation={userLocation || undefined}
                />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
