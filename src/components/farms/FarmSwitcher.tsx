import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import { useFarms } from '@/hooks/useFarms';

export const FarmSwitcher: React.FC = () => {
  const { farms, selectedFarm, selectFarm, loading } = useFarms();

  if (loading) {
    return (
      <div className="w-48 h-10 bg-gray-200 rounded animate-pulse" />
    );
  }

  if (farms.length === 0) {
    return (
      <Badge variant="outline" className="text-gray-500">
        No farms
      </Badge>
    );
  }

  if (farms.length === 1) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
        <MapPin className="w-4 h-4 text-green-600" />
        <span className="font-medium text-green-800">{farms[0].name}</span>
      </div>
    );
  }

  return (
    <Select
      value={selectedFarm?.id || ''}
      onValueChange={(farmId) => {
        const farm = farms.find(f => f.id === farmId);
        if (farm) selectFarm(farm);
      }}
    >
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Select farm">
          {selectedFarm && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-green-600" />
              <span>{selectedFarm.name}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {farms.map((farm) => (
          <SelectItem key={farm.id} value={farm.id}>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-green-600" />
              <span>{farm.name}</span>
              {farm.size && (
                <Badge variant="secondary" className="ml-2">
                  {farm.size} {farm.size_unit}
                </Badge>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};