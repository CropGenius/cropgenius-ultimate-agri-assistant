import React from 'react';
import { MapPin, Plus, Leaf, CloudRain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

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

export default function FieldIntelligence({
  fields = [],
  loading = false,
}: FieldIntelligenceProps) {
  const navigate = useNavigate();

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'good':
        return 'bg-green-500';
      case 'warning':
        return 'bg-amber-500';
      case 'danger':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getWeatherIcon = (status?: string) => {
    if (!status) return null;

    if (status.toLowerCase().includes('rain')) {
      return <CloudRain className="h-4 w-4 text-blue-400" />;
    }

    return null;
  };

  return (
    <div className="px-4 mt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">
          My Fields{' '}
          {fields.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              ({fields.length})
            </span>
          )}
        </h2>
      </div>

      <div className="pb-1 overflow-x-auto -mx-1 px-1 flex gap-3 snap-x scrollbar-hide">
        {fields.map((field, index) => (
          <motion.div
            key={field.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            whileHover={{ scale: 1.03, y: -2 }}
            className="min-w-[220px] max-w-[250px] flex-shrink-0 cursor-pointer snap-start"
          >
            <Card
              className="border hover:border-primary/50 transition-all overflow-hidden"
              onClick={() => navigate(`/fields/${field.id}`)}
            >
              <div className="h-28 bg-muted relative">
                <div
                  className={cn(
                    'absolute top-2 right-2 h-2.5 w-2.5 rounded-full animate-pulse',
                    getHealthColor(field.health)
                  )}
                ></div>

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
                    <span className="text-sm font-medium">{field.name}</span>
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
                      <Leaf className="h-3 w-3 mr-1 text-green-500" />
                      {field.crop}
                    </Badge>
                  )}
                </div>

                {field.value && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-1.5 rounded-md mb-2 text-center">
                    <span className="text-green-700 dark:text-green-400 text-sm font-semibold">
                      ₦{field.value.toLocaleString()}
                    </span>
                    <span className="text-xs text-green-600/70 dark:text-green-500/70 block">
                      est. this week
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div>
                    {field.healthPercent && (
                      <div className="flex items-center gap-1.5">
                        <span className="w-12">Health:</span>
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden w-20">
                          <div
                            className={cn(
                              'h-full',
                              field.health === 'good'
                                ? 'bg-green-500'
                                : field.health === 'warning'
                                  ? 'bg-amber-500'
                                  : 'bg-red-500'
                            )}
                            style={{ width: `${field.healthPercent}%` }}
                          ></div>
                        </div>
                        <span>{field.healthPercent}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}

        <Button
          variant="outline"
          className="min-w-[220px] h-[175px] border-dashed flex-col gap-1 flex-shrink-0 snap-start"
          onClick={() => navigate('/manage-fields')}
        >
          <Plus className="h-5 w-5" />
          <span>Add New Field</span>
          <span className="text-xs text-muted-foreground mt-1">
            Tap to map your land
          </span>
        </Button>
      </div>
    </div>
  );
}
