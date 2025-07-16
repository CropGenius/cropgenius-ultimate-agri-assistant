import React from 'react';
import { FarmsList } from '@/components/farms/FarmsList';
import { Farm } from '@/types/farm';

export default function Farms() {
  const handleFarmSelect = (farm: Farm) => {
    // Store selected farm in localStorage for context
    localStorage.setItem('selectedFarmId', farm.id);
    localStorage.setItem('selectedFarmName', farm.name);
    
    // Navigate to farm dashboard or fields
    window.location.href = '/fields';
  };

  return (
    <div className="container py-6">
      <FarmsList 
        onFarmSelect={handleFarmSelect}
        selectedFarmId={localStorage.getItem('selectedFarmId') || undefined}
      />
    </div>
  );
}