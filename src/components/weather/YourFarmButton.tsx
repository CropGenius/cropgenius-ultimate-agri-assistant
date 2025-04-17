
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { Map, ChevronDown, Plus, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Field } from '@/types/supabase';

interface YourFarmButtonProps {
  onSelectField?: (field: Field) => void;
  selectedFieldId?: string;
  showAllOption?: boolean;
  className?: string;
}

const YourFarmButton = ({ 
  onSelectField, 
  selectedFieldId, 
  showAllOption = false,
  className = ''
}: YourFarmButtonProps) => {
  const navigate = useNavigate();
  const { user, farmId } = useAuth();
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedField, setSelectedField] = useState<Field | null>(null);

  // Load fields from Supabase
  useEffect(() => {
    const loadFields = async () => {
      if (!user || !farmId) return;

      try {
        setLoading(true);
        
        // Get all fields for this user
        const { data, error } = await supabase
          .from('fields')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Convert data to the Field type
        const typedFields: Field[] = data ? data.map(field => ({
          id: field.id,
          user_id: field.user_id,
          farm_id: field.farm_id,
          name: field.name,
          size: field.size,
          size_unit: field.size_unit,
          boundary: field.boundary,
          location_description: field.location_description,
          soil_type: field.soil_type,
          irrigation_type: field.irrigation_type,
          is_shared: field.is_shared,
          shared_with: field.shared_with,
          created_at: field.created_at,
          updated_at: field.updated_at
        })) : [];

        setFields(typedFields);

        // If selected ID is provided, find that field
        if (selectedFieldId) {
          const field = typedFields.find(f => f.id === selectedFieldId);
          if (field) {
            setSelectedField(field);
          }
        }
        // Otherwise, select the first field if any exist
        else if (typedFields.length > 0 && !selectedField) {
          setSelectedField(typedFields[0]);
          if (onSelectField) onSelectField(typedFields[0]);
        }
        
      } catch (error) {
        console.error('Error loading fields:', error);
        toast.error('Could not load your fields', {
          description: 'Please try again later',
        });
      } finally {
        setLoading(false);
      }
    };

    loadFields();
  }, [user, farmId, selectedFieldId]);

  // Handle field selection
  const handleSelectField = (field: Field | null) => {
    setSelectedField(field);
    if (onSelectField && field) onSelectField(field);
  };

  // Navigate to add new field page
  const handleAddField = () => {
    navigate('/fields?action=new');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className={`flex items-center gap-2 ${className}`}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading fields...</span>
            </>
          ) : (
            <>
              <Map className="h-4 w-4" />
              <span className="truncate max-w-[120px]">
                {selectedField ? selectedField.name : fields.length === 0 ? 'No fields' : 'Select field'}
              </span>
              <ChevronDown className="h-3 w-3 opacity-50" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Your Fields</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {showAllOption && (
          <DropdownMenuItem 
            onSelect={() => handleSelectField(null)}
            className={!selectedField ? 'bg-accent text-accent-foreground' : ''}
          >
            <Map className="h-4 w-4 mr-2" />
            All Fields
          </DropdownMenuItem>  
        )}
        
        {fields.length > 0 ? (
          fields.map(field => (
            <DropdownMenuItem 
              key={field.id}
              onSelect={() => handleSelectField(field)}
              className={selectedField?.id === field.id ? 'bg-accent text-accent-foreground' : ''}
            >
              <Map className="h-4 w-4 mr-2" />
              {field.name}
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem className="text-muted-foreground gap-2" disabled>
            <AlertCircle className="h-4 w-4" />
            No fields added yet
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleAddField}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Field
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default YourFarmButton;
