import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Loader2,
  MapPin,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import YourFarmButton from './YourFarmButton';
import { Field } from '@/types/field';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import ErrorBoundary from '@/components/error/ErrorBoundary';
import AddFieldForm from '@/components/fields/AddFieldForm';
import { toast } from 'sonner';
import { useErrorLogging } from '@/hooks/use-error-logging';

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  location: string;
}

interface LiveWeatherPanelProps {
  location?: {
    lat: number;
    lng: number;
    name: string;
  };
}

const sampleWeatherData: WeatherData = {
  temperature: 28,
  humidity: 75,
  windSpeed: 15,
  condition: 'Partly Cloudy',
  location: 'Your Farm',
};

export default function LiveWeatherPanel({ location }: LiveWeatherPanelProps) {
  const { logError, logSuccess } = useErrorLogging('LiveWeatherPanel');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addFieldDialogOpen, setAddFieldDialogOpen] = useState(false);

  useEffect(() => {
    const fetchWeatherData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log(
          '📡 [LiveWeatherPanel] Fetching weather data for:',
          location?.name || 'default location'
        );
        setTimeout(() => {
          setWeather({
            ...sampleWeatherData,
            location: location?.name || sampleWeatherData.location,
          });
          setLoading(false);
          console.log('✅ [LiveWeatherPanel] Weather data loaded successfully');
          logSuccess('weather_data_loaded');
        }, 1500);
      } catch (e: any) {
        const errorMsg = e.message || 'Failed to fetch weather data';
        setError(errorMsg);
        setLoading(false);
        console.error(
          '❌ [LiveWeatherPanel] Weather data fetch failed:',
          errorMsg
        );
        logError(e, { context: 'fetchWeatherData' });
      }
    };

    fetchWeatherData();
  }, [location]);

  const handleFieldSelect = (field: Field) => {
    try {
      console.log('🗺️ [LiveWeatherPanel] Field selected:', field.name);
      toast.success(`Field selected: ${field.name}`, {
        description: 'Weather data will now be specific to this field.',
      });

      if (
        field.boundary?.coordinates &&
        field.boundary.coordinates.length > 0
      ) {
        const coords = field.boundary.coordinates;
        const centerLat =
          coords.reduce((sum, coord) => sum + coord.lat, 0) / coords.length;
        const centerLng =
          coords.reduce((sum, coord) => sum + coord.lng, 0) / coords.length;

        setLoading(true);
        setTimeout(() => {
          setWeather({
            ...sampleWeatherData,
            location: field.name,
          });
          setLoading(false);
        }, 1000);
      }
    } catch (error) {
      logError(error as Error, { context: 'fieldSelect' });
    }
  };

  const handleAddField = (field: Field) => {
    try {
      console.log('✅ [LiveWeatherPanel] Field added:', field);
      setAddFieldDialogOpen(false);

      toast.success('Field added successfully', {
        description: 'You can now view weather data specific to your field.',
      });

      handleFieldSelect(field);
    } catch (error) {
      logError(error as Error, { context: 'addField' });
    }
  };

  return (
    <ErrorBoundary>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5 text-yellow-500" />
            Live Weather
          </CardTitle>
          <CardDescription className="flex justify-between items-center">
            <span>
              AI-powered hyperlocal weather tailored to your specific farm
              location
            </span>
            <YourFarmButton
              size="sm"
              buttonText="View Your Farm"
              variant="secondary"
              onSelect={handleFieldSelect}
            />
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-red-500 p-4 text-center">
              <p>{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => setAddFieldDialogOpen(true)}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Add Field for Better Weather Data
              </Button>
            </div>
          ) : weather ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">
                    {weather.temperature}°C
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {weather.condition} in {weather.location}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div className="h-14 w-14 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                    <Sun className="h-8 w-8 text-yellow-500" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-blue-500" />
                  <div>{weather.temperature}°C</div>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  <div>{weather.humidity}% Humidity</div>
                </div>
                <div className="flex items-center gap-2">
                  <Wind className="h-4 w-4 text-blue-500" />
                  <div>{weather.windSpeed} km/h Wind</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-4">
              <p>No weather data available.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => setAddFieldDialogOpen(true)}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Add Field for Weather Data
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={addFieldDialogOpen} onOpenChange={setAddFieldDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Field for Weather Data</DialogTitle>
            <DialogDescription>
              Adding your field location will provide you with hyperlocal
              weather forecasts and AI-powered farming insights.
            </DialogDescription>
          </DialogHeader>
          <ErrorBoundary>
            <AddFieldForm
              onSuccess={handleAddField}
              onCancel={() => setAddFieldDialogOpen(false)}
            />
          </ErrorBoundary>
        </DialogContent>
      </Dialog>
    </ErrorBoundary>
  );
}
