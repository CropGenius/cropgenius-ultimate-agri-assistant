import React from 'react';
import { MapPin, Plus, Leaf, CloudRain, Sun, Cloud } from 'lucide-react';
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
    healthPercent?: number;
    value?: number;
    lastRain?: string;
    moistureLevel?: number;
    lastActivity?: string;
    weatherStatus?: string;
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
  
  const getWeatherIcon = (status?: string) => {
    if (!status) return null;
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes('rain')) {
      return <CloudRain className="h-4 w-4 text-blue-400" />;
    } else if (statusLower.includes('cloud')) {
      return <Cloud className="h-4 w-4 text-gray-400" />;
    } else if (statusLower.includes('sun') || statusLower.includes('clear')) {
      return <Sun className="h-4 w-4 text-amber-400" />;
    }
    
    return <Cloud className="h-4 w-4 text-gray-400" />;
  };
  
  return (
    <div className="px-4 mt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">My Fields {fields.length > 0 && <span className="text-sm font-normal text-muted-foreground">({fields.length})</span>}</h2>
      </div>
      
      {/* Mobile optimized card layout */}
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:flex-nowrap md:overflow-x-auto md:gap-3 md:snap-x md:hide-scrollbar">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="w-full md:min-w-[220px] md:max-w-[250px] md:flex-shrink-0 cursor-pointer md:snap-start"
            style={{
              opacity: 1,
              transform: 'translateY(0px)',
              transition: 'transform 0.2s ease-out'
            }}
          >
            <Card
              className="border border-gray-200 dark:border-gray-800 hover:border-primary/50 transition-all overflow-hidden shadow-sm"
              onClick={() => navigate(`/fields/${field.id}`)}
            >
              {/* Mobile optimized card layout */}
              <div className="flex flex-row md:flex-col">
                {/* Left side / Top on desktop */}
                <div className="w-1/3 md:w-full md:h-28 bg-muted relative">
                  <div className={cn("absolute top-2 right-2 h-2.5 w-2.5 rounded-full animate-pulse", getHealthColor(field.health))}></div>
                  
                  {field.weatherStatus && (
                    <Badge 
                      variant="outline" 
                      className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm text-xs font-normal"
                    >
                      {getWeatherIcon(field.weatherStatus)}
                      {field.weatherStatus}
                    </Badge>
                  )}
                  
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 pt-10">
                    <div className="flex items-center text-white">
                      <MapPin className="h-3.5 w-3.5 mr-1 text-white/90" />
                      <span className="text-sm font-medium truncate">{field.name}</span>
                    </div>
                  </div>
                </div>
                
                {/* Right side / Bottom on desktop */}
                <div className="w-2/3 md:w-full p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm">
                      {field.size} {field.size_unit}
                    </p>
                    {field.crop && (
                      <Badge variant="outline" className="text-xs font-normal">
                        <Leaf className="h-3 w-3 mr-1 text-green-500" />
                        {field.crop}
                      </Badge>
                    )}
                  </div>
                  
                  {field.value !== undefined ? (
                    <div className="bg-green-50 dark:bg-green-900/20 p-1.5 rounded-md mb-2 text-center">
                      <span className="text-green-700 dark:text-green-400 text-sm font-semibold">
                        ₦{field.value.toLocaleString()}
                      </span>
                      <span className="text-xs text-green-600/70 dark:text-green-500/70 block">
                        est. this week
                      </span>
                    </div>
                  ) : (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-1.5 rounded-md mb-2 text-center">
                      <span className="text-blue-700 dark:text-blue-400 text-sm font-semibold">
                        New field
                      </span>
                      <span className="text-xs text-blue-600/70 dark:text-blue-500/70 block">
                        Set up crop type
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="w-full">
                      <div className="flex items-center gap-1.5">
                        <span className="w-12">Health:</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full",
                              field.health === 'good' ? "bg-green-500" :
                              field.health === 'warning' ? "bg-amber-500" :
                              "bg-red-500"
                            )}
                            style={{ width: `${field.healthPercent || 75}%` }}
                          ></div>
                        </div>
                        <span>{field.healthPercent || 75}%</span>
                      </div>
                      {field.moistureLevel !== undefined && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="w-12">Water:</span>
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500"
                              style={{ width: `${field.moistureLevel}%` }}
                            ></div>
                          </div>
                          <span>{field.moistureLevel}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ))}
        
        <div className="w-full md:min-w-[220px] md:flex-shrink-0 md:snap-start">
          <Button 
            variant="outline" 
            className="w-full h-[120px] md:h-[175px] border-dashed flex-col gap-1"
            onClick={() => navigate('/manage-fields')}
          >
            <Plus className="h-5 w-5" />
            <span>Add New Field</span>
            <span className="text-xs text-muted-foreground mt-1">Tap to map your land</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
