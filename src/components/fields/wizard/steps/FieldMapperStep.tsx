
import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MapSearchInput } from "@/components/fields/MapSearchInput";
import { MapboxFieldMap } from "@/components/fields/MapboxFieldMap";
import { Field } from "@/types/field";

interface FieldMapperStepProps {
  onNext: (data: Partial<Field>) => void;
  onBack: () => void;
  initialData?: Partial<Field>;
}

export function FieldMapperStep({ onNext, onBack, initialData }: FieldMapperStepProps) {
  const [fieldName, setFieldName] = useState(initialData?.name || '');
  const [boundary, setBoundary] = useState(initialData?.boundary || null);
  const [center, setCenter] = useState(initialData?.center || null);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLocationSelect = useCallback((location: { lat: number; lng: number; name: string }) => {
    setCenter({ lat: location.lat, lng: location.lng });
  }, []);

  const handleBoundaryChange = useCallback((newBoundary: any) => {
    setBoundary(newBoundary);
    setErrorMessage('');
  }, []);

  const handleSearch = useCallback((query: string) => {
    setIsSearching(true);
    
    // Simulate search delay
    setTimeout(() => {
      setIsSearching(false);
      // In a real implementation, you'd handle the search results here
    }, 1000);
  }, []);

  const handleSubmit = async () => {
    // Validate inputs
    if (!fieldName.trim()) {
      setErrorMessage('Please enter a field name');
      return;
    }
    
    if (!boundary || (boundary.type === 'polygon' && (!boundary.coordinates || boundary.coordinates.length < 3))) {
      setErrorMessage('Please draw a valid field boundary');
      return;
    }

    // This fixed the TS error by converting the void function to return a Promise
    const handleNextAsync = async () => {
      // Prepare field data
      const fieldData: Partial<Field> = {
        name: fieldName.trim(),
        boundary,
        center
      };
      
      // Call onNext with data
      onNext(fieldData);
      return Promise.resolve();
    };

    // Call the async function
    await handleNextAsync();
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold mb-1">Map Your Field</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Search for your location and draw your field boundary
        </p>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="fieldName">Field Name</Label>
          <Input 
            id="fieldName" 
            value={fieldName} 
            onChange={(e) => setFieldName(e.target.value)} 
            placeholder="Enter a name for this field"
          />
        </div>
        
        <div>
          <Label>Location Search</Label>
          <MapSearchInput
            onSearch={handleSearch}
            onLocationSelect={handleLocationSelect}
            isSearching={isSearching}
            placeholder="Search for your village or landmark"
          />
        </div>
        
        <div className="border rounded-md overflow-hidden h-[300px]">
          <MapboxFieldMap 
            center={center}
            boundary={boundary}
            onBoundaryChange={handleBoundaryChange}
            editMode={true}
          />
        </div>
        
        {errorMessage && (
          <div className="text-sm text-red-500">{errorMessage}</div>
        )}
        
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={handleSubmit}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
