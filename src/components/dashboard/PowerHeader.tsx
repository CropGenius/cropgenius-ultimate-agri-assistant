import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Thermometer, Cloud, CheckCircle, AlertTriangle } from 'lucide-react';

interface PowerHeaderProps {
  location: string;
  temperature: number;
  weatherCondition: string;
  farmScore: number;
  synced: boolean;
}

export default function PowerHeader({ 
  location, 
  temperature, 
  weatherCondition, 
  farmScore, 
  synced 
}: PowerHeaderProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Card className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          {/* Location & Weather */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-green-600" />
              <span className="font-medium text-gray-900">{location}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Thermometer className="h-5 w-5 text-blue-600" />
              <span className="font-medium">{temperature}°C</span>
            </div>
            <div className="flex items-center space-x-2">
              <Cloud className="h-5 w-5 text-gray-600" />
              <span className="text-gray-700">{weatherCondition}</span>
            </div>
          </div>

          {/* Farm Score & Sync Status */}
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Farm Health</div>
              <Badge className={`${getScoreBadgeColor(farmScore)} font-bold text-lg px-3 py-1`}>
                {farmScore}%
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              {synced ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">All Synced</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm text-yellow-600 font-medium">Syncing...</span>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
