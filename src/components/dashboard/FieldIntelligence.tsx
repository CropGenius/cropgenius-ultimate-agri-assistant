import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Droplets, AlertTriangle, CheckCircle, Plus, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface Field {
  id: string;
  name: string;
  size: number;
  size_unit: string;
  crop: string;
  health: 'good' | 'warning' | 'danger';
  lastRain: string;
  moistureLevel: number;
}

interface FieldIntelligenceProps {
  fields: Field[];
  loading: boolean;
}

export default function FieldIntelligence({ fields, loading }: FieldIntelligenceProps) {
  const navigate = useNavigate();

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'good':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'danger':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'good':
        return <CheckCircle className="h-4 w-4" />;
      case 'warning':
      case 'danger':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getMoistureColor = (level: number) => {
    if (level < 20) return 'text-red-600';
    if (level < 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Field Intelligence</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>🌾 Field Intelligence</span>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">{fields.length} fields</Badge>
            <Button 
              size="sm" 
              onClick={() => navigate('/fields')}
              className="text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Field
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {fields.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 mb-4">No fields added yet</p>
            <Button onClick={() => navigate('/fields')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Field
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fields.map((field, index) => (
              <motion.div
                key={field.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                onClick={() => navigate(`/fields/${field.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{field.name}</h3>
                    <p className="text-sm text-gray-600">
                      {field.size} {field.size_unit} • {field.crop}
                    </p>
                  </div>
                  <Badge className={`${getHealthColor(field.health)} text-xs`}>
                    {getHealthIcon(field.health)}
                    <span className="ml-1 capitalize">{field.health}</span>
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Last Rain:</span>
                    <span className="font-medium">{field.lastRain}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Moisture:</span>
                    <div className="flex items-center space-x-1">
                      <Droplets className={`h-3 w-3 ${getMoistureColor(field.moistureLevel)}`} />
                      <span className={`font-medium ${getMoistureColor(field.moistureLevel)}`}>
                        {field.moistureLevel}%
                      </span>
                    </div>
                  </div>
                </div>

                {field.health === 'warning' || field.health === 'danger' ? (
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                    <div className="flex items-center space-x-1">
                      <AlertTriangle className="h-3 w-3 text-yellow-600" />
                      <span className="text-yellow-800">
                        {field.moistureLevel < 20 ? 'Low moisture detected' : 'Attention needed'}
                      </span>
                    </div>
                  </div>
                ) : null}
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
