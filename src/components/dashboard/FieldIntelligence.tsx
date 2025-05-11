
import React from 'react';
import { MapPin, Plus, Leaf, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';
import { useNavigate } from 'react-router-dom';

interface FieldIntelligenceProps {
  fields: Array<{
    id: string;
    name: string;
    size: number;
    size_unit: string;
    crop?: string;
    health: 'good' | 'warning' | 'danger';
    lastRain?: string;
    moistureLevel?: number;
    lastActivity?: string;
  }>;
  loading?: boolean;
}

export default function FieldIntelligence({ fields = [], loading = false }: FieldIntelligenceProps) {
  const navigate = useNavigate();
  
  const getHealthColor = (health: string) => {
    switch(health) {
      case 'good':
        return "bg-green-500";
      case 'warning':
        return "bg-amber-500";
      case 'danger':
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="px-4 mt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">My Fields {fields.length > 0 && <span className="text-sm font-normal text-muted-foreground">({fields.length})</span>}</h2>
      </div>
      
      <div className="pb-1 overflow-x-auto -mx-1 px-1 flex gap-3 snap-x scrollbar-hide">
        {fields.map((field) => (
          <Card 
            key={field.id}
            className="min-w-[220px] max-w-[250px] border flex-shrink-0 cursor-pointer hover:border-primary/50 transition-all snap-start"
            onClick={() => navigate(`/fields/${field.id}`)}
          >
            <div className="h-24 bg-muted relative">
              <div className={cn("absolute top-2 right-2 h-2 w-2 rounded-full", getHealthColor(field.health))}></div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 pt-6">
                <div className="flex items-center text-white">
                  <MapPin className="h-3 w-3 mr-1 text-white/80" />
                  <span className="text-xs">{field.name}</span>
                </div>
              </div>
            </div>
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-sm">
                  {field.size} {field.size_unit}
                </p>
                {field.crop && (
                  <Badge variant="outline" className="text-xs font-normal">
                    <Leaf className="h-3 w-3 mr-1" />
                    {field.crop}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div>
                  {field.lastRain && (
                    <span>Last rain: {field.lastRain}</span>
                  )}
                </div>
                
                {field.moistureLevel && (
                  <div className="flex items-center gap-1">
                    <span>Moisture: {field.moistureLevel}%</span>
                    <Lock className="h-3 w-3 text-muted-foreground/70" />
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
        
        <Button 
          variant="outline" 
          className="min-w-[220px] h-[112px] border-dashed flex-col gap-1 flex-shrink-0 snap-start"
          onClick={() => navigate('/manage-fields')}
        >
          <Plus className="h-5 w-5" />
          <span>Add New Field</span>
        </Button>
      </div>
    </div>
  );
}
