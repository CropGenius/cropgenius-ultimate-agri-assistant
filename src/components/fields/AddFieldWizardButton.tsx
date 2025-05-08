import React, { useState } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Plus, MapPin } from 'lucide-react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Field } from '@/types/field';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useErrorLogging } from '@/hooks/use-error-logging';
import ErrorBoundary from '@/components/error/ErrorBoundary';
import AddFieldWizard from './wizard/AddFieldWizard';

interface AddFieldWizardButtonProps extends ButtonProps {
  onFieldAdded?: (field: Field) => void;
  buttonText?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export default function AddFieldWizardButton({
  onFieldAdded,
  buttonText = "Add New Field",
  icon = <MapPin className="h-4 w-4 mr-2" />,
  children,
  ...props
}: AddFieldWizardButtonProps) {
  const { logError } = useErrorLogging('AddFieldWizardButton');
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const handleFieldAdded = (field: Field) => {
    try {
      setDialogOpen(false);
      
      // If there's a custom callback, use it
      if (onFieldAdded) {
        onFieldAdded(field);
        return;
      }
      
      // Otherwise navigate to the field detail
      navigate(`/fields/${field.id}`);
    } catch (error) {
      logError(error as Error, { context: 'handleFieldAdded' });
    }
  };
  
  return (
    <>
      <Button 
        onClick={() => setDialogOpen(true)} 
        {...props}
      >
        {children || (
          <>
            {icon}
            {buttonText}
          </>
        )}
      </Button>
      
      <Dialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
          <div className="p-6">
            <ErrorBoundary>
              <AddFieldWizard
                onSuccess={handleFieldAdded}
                onCancel={() => setDialogOpen(false)}
              />
            </ErrorBoundary>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
