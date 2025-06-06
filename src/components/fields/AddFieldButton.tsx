import { useState, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import AddFieldForm from './AddFieldForm';
import { Field } from '@/types/field';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import ErrorBoundary from '@/components/error/ErrorBoundary';
import { useErrorLogging } from '@/hooks/use-error-logging';
import { ButtonProps } from '@/components/ui/button';

interface AddFieldButtonProps extends ButtonProps {
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  onFieldAdded?: (field: Field) => void;
  dialogTitle?: string;
  dialogDescription?: string;
  children?: ReactNode;
}

export default function AddFieldButton({
  variant = 'default',
  size = 'default',
  onFieldAdded,
  dialogTitle = 'Add New Field',
  dialogDescription = 'Search for your location and map your field boundaries for better insights',
  children,
  ...props
}: AddFieldButtonProps) {
  const { logError } = useErrorLogging('AddFieldButton');
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  const handleFieldAdded = (field: Field) => {
    try {
      setDialogOpen(false);

      // Show toast notification
      toast.success('Field added successfully', {
        description: `${field.name} has been added to your farm.`,
      });

      // Call custom callback if provided
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
        variant={variant}
        size={size}
        onClick={() => setDialogOpen(true)}
        {...props}
      >
        {children || (
          <>
            <MapPin className="mr-2 h-4 w-4" />
            Add Field
          </>
        )}
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogDescription}</DialogDescription>
          </DialogHeader>
          <ErrorBoundary>
            <AddFieldForm
              onSuccess={handleFieldAdded}
              onCancel={() => setDialogOpen(false)}
            />
          </ErrorBoundary>
        </DialogContent>
      </Dialog>
    </>
  );
}
