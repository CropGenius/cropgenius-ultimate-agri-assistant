import React from 'react';
import { useOpenWeather } from '@/hooks/useOpenWeather';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface WeatherWidgetProps {
  lat: number | null;
  lon: number | null;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ lat, lon }) => {
  const { data, loading, error } = useOpenWeather({ lat, lon });

  if (loading) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Weather</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error || 'Unable to load weather data'}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Current Weather</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">{Math.round(data.temperature)}°C</p>
              <p className="text-muted-foreground capitalize">
                {data.forecast[0]?.conditions}
              </p>
            </div>
            <div className="text-right">
              <p>Humidity: {data.humidity}%</p>
              <p>Wind: {Math.round(data.windSpeed * 3.6)} km/h</p>
            </div>
          </div>
          
          <div className="grid grid-cols-5 gap-2 pt-4 border-t">
            {data.forecast.slice(0, 5).map((day: any) => (
              <div key={day.date} className="text-center">
                <p className="text-sm font-medium">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </p>
                <p className="text-sm">
                  {Math.round(day.temperature.max)}°
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
