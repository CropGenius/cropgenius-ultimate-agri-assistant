import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Cloud,
  CloudRain,
  Sun,
  Wind,
  ArrowRight,
  Droplet,
  CloudLightning,
  Thermometer,
  CloudSun,
  Umbrella,
  AlertTriangle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useWeatherAgent } from '../../hooks/agents/useWeatherAgent';
import { diagnostics } from '../../utils/diagnosticService';
import { WeatherErrorBoundary } from '@/components/ErrorBoundary';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { WifiOff, CloudOff, RefreshCw } from 'lucide-react'; // AlertTriangle is already imported, ensure it's the one for UI
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface WeatherPreview {
  temp: number;
  condition: string;
  icon: 'sun' | 'cloud' | 'rain' | 'storm';
  rainChance: number;
  humidity: number;
  windSpeed: number;
  recommendation: string;
  farmAction: string;
  urgency: 'normal' | 'warning' | 'critical';
  forecast: Array<{
    day: string;
    temp: number;
    icon: 'sun' | 'cloud' | 'rain' | 'storm';
    rainChance: number;
  }>;
}

function WeatherPreviewInternal() {
  // Use the specialized Weather Agent hook
  // Internal component, wrapped by WeatherPreview for error boundary.
  const {
    fetchCurrentWeather,
    fetchWeatherForecast,
    currentWeather,
    weatherForecast,
    isLoading,
    error,
  } = useWeatherAgent();

  const [weather, setWeather] = useState<WeatherPreview | null>(null);
  const [activeDay, setActiveDay] = useState(0);
  const [animation, setAnimation] = useState(false);
  const [locationName, setLocationName] = useState('Your Farm');
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const isOffline = useOfflineStatus();

  useEffect(() => {
    // Get user's geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setLocationName('Detected Farm Location');
          setCoordinates({ lat, lon });
          fetchCurrentWeather(lat, lon);
          fetchWeatherForecast(lat, lon);
        },
        (error) => {
          // Default to Nairobi if location not available
          const defaultLat = -1.2921;
          const defaultLon = 36.8219;
          setCoordinates({ lat: defaultLat, lon: defaultLon });
          fetchCurrentWeather(defaultLat, defaultLon);
          fetchWeatherForecast(defaultLat, defaultLon);

          // Convert GeolocationPositionError to standard Error for diagnostics
          const posError = new Error(`Geolocation error: ${error.message}`);
          posError.name = 'GeolocationError';
          diagnostics.logError(posError, {
            source: 'WeatherPreview',
            operation: 'getGeolocation',
          });
        }
      );
    } else {
      // Default to Nairobi if geolocation not supported
      const defaultLat = -1.2921;
      const defaultLon = 36.8219;
      setCoordinates({ lat: defaultLat, lon: defaultLon });
      fetchCurrentWeather(defaultLat, defaultLon);
      fetchWeatherForecast(defaultLat, defaultLon);
    }
  }, []);

  // Map OpenWeatherMap icon code to our simplified UI icons
  const mapWeatherIcon = (
    iconCode: string
  ): 'sun' | 'cloud' | 'rain' | 'storm' => {
    if (iconCode.includes('01') || iconCode.includes('02')) return 'sun';
    if (iconCode.includes('03') || iconCode.includes('04')) return 'cloud';
    if (iconCode.includes('09') || iconCode.includes('10')) return 'rain';
    if (iconCode.includes('11')) return 'storm';
    return 'cloud';
  };

  // Process forecast data when it becomes available
  useEffect(() => {
    // Guard clause to prevent processing null data, especially in error states
    if (!currentWeather || !weatherForecast) {
      // If there's an error, we might want to clear any stale 'weather' state
      // or ensure it's not displayed alongside an error message.
      // For now, just returning is fine as the error UI will take precedence.
      return;
    }

    // Original condition, now nested after the null check
    if (currentWeather && weatherForecast) {
      // Check if there are any severe weather alerts
      const hasAlert =
        currentWeather.weatherMain === 'Thunderstorm' ||
        (currentWeather.weatherMain === 'Rain' &&
          currentWeather.rainLastHourMm &&
          currentWeather.rainLastHourMm > 10);

      // Process 3-hour forecast data into daily forecast
      const dailyForecast = [];
      const days = ['Today', 'Tomorrow', 'Wed', 'Thu', 'Fri'];
      const dayData: { [key: string]: any } = {};

      // Group forecast by day
      weatherForecast.list.forEach((item) => {
        const date = item.forecastTimestamp.toLocaleDateString();
        if (!dayData[date]) {
          dayData[date] = {
            temps: [],
            icons: [],
            rainChances: [],
          };
        }

        // Extract forecast data - this is a simplified view as the actual structure might differ
        // We'd need to adapt this based on the actual ProcessedForecastItem structure
        const temp = (item as any).temperatureCelsius || 25; // Fallback if property doesn't exist
        const icon = (item as any).weatherIconCode || '01d';
        const rainChance = (item as any).precipitationProbability || 0;

        dayData[date].temps.push(temp);
        dayData[date].icons.push(icon);
        dayData[date].rainChances.push(rainChance * 100);
      });

      // Create daily summaries (first 5 days)
      Object.keys(dayData)
        .slice(0, 5)
        .forEach((date, index) => {
          const data = dayData[date];

          // Calculate average temp
          const avgTemp = Math.round(
            data.temps.reduce((a: number, b: number) => a + b, 0) /
              data.temps.length
          );

          // Find most common icon
          const iconCounts: { [key: string]: number } = {};
          data.icons.forEach((icon: string) => {
            iconCounts[icon] = (iconCounts[icon] || 0) + 1;
          });
          const dominantIcon = Object.keys(iconCounts).reduce((a, b) =>
            iconCounts[a] > iconCounts[b] ? a : b
          );

          // Find max rain chance
          const maxRainChance = Math.max(...data.rainChances);

          dailyForecast.push({
            day: days[index],
            temp: avgTemp,
            icon: mapWeatherIcon(dominantIcon),
            rainChance: Math.round(maxRainChance),
          });
        });

      // Update component state with processed live data
      setWeather({
        temp: Math.round(currentWeather.temperatureCelsius),
        condition: currentWeather.weatherDescription,
        icon: mapWeatherIcon(currentWeather.weatherIconCode),
        rainChance: weatherForecast.list[0]
          ? Math.round(
              (weatherForecast.list[0] as any).precipitationProbability * 100 ||
                10
            )
          : 10,
        humidity: currentWeather.humidityPercent,
        windSpeed: Math.round(currentWeather.windSpeedMps * 3.6), // Convert m/s to km/h
        recommendation: hasAlert
          ? 'Consider delaying field work due to current weather conditions.'
          : 'Weather conditions appear suitable for field activities.',
        farmAction: hasAlert
          ? 'Monitor conditions closely and protect sensitive crops'
          : 'Good time for regular field maintenance',
        urgency: hasAlert ? 'warning' : 'normal',
        forecast: dailyForecast,
      });

      // Animate data refresh
      setAnimation(true);
      setTimeout(() => setAnimation(false), 1500);

      // Show alert if severe weather
      if (hasAlert) {
        toast.warning('Weather Alert', {
          description: `${currentWeather.weatherMain} detected in your area. Take appropriate precautions.`,
          action: {
            label: 'Details',
            onClick: () => {},
          },
        });
      }
    }
  }, [currentWeather, weatherForecast]);

  const getWeatherIcon = (icon: string, size: number = 10) => {
    const iconSize = `${size / 4}rem`;

    switch (icon) {
      case 'rain':
        return (
          <CloudRain
            style={{ height: iconSize, width: iconSize }}
            className="text-blue-500"
          />
        );
      case 'cloud':
        return (
          <CloudSun
            style={{ height: iconSize, width: iconSize }}
            className="text-slate-400"
          />
        );
      case 'storm':
        return (
          <CloudLightning
            style={{ height: iconSize, width: iconSize }}
            className="text-purple-500"
          />
        );
      default:
        return (
          <Sun
            style={{ height: iconSize, width: iconSize }}
            className="text-amber-500"
          />
        );
    }
  };

  const refreshWeather = () => {
    if (coordinates) {
      fetchCurrentWeather(coordinates.lat, coordinates.lon);
      fetchWeatherForecast(coordinates.lat, coordinates.lon);
      setAnimation(true);
      setTimeout(() => setAnimation(false), 1500);
    }
  };

  if (isOffline) {
    return (
      <Card className="w-full max-w-md shadow-lg border-yellow-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <WifiOff className="h-6 w-6 text-yellow-500" />
            Weather Unavailable
          </CardTitle>
          <CardDescription>
            You are currently offline. Live weather data cannot be fetched.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            Please check your internet connection to view the latest weather
            information.
          </p>
        </CardContent>
      </Card>
    );
  } else if (error && !isLoading) {
    return (
      <Card className="w-full max-w-md shadow-lg border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            Error Fetching Weather
          </CardTitle>
          <CardDescription>
            An error occurred while trying to fetch weather data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error Details</AlertTitle>
            <AlertDescription>
              {error.message || 'An unknown error occurred.'}
            </AlertDescription>
          </Alert>
          <Button onClick={refreshWeather} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" /> Retry
          </Button>
        </CardContent>
      </Card>
    );
  } else if (isLoading) {
    return (
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-6 w-6 animate-pulse text-sky-500" />
            Fetching Weather...
          </CardTitle>
          <CardDescription>
            Retrieving the latest weather intelligence for your location.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-48">
          <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 animate-pulse mb-2"></div>
          <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
        </CardContent>
      </Card>
    );
  } else if (!weather) {
    // Handles case where not loading, no error, but no weather data (e.g. initial state or after an error cleared it)
    return (
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CloudOff className="h-6 w-6 text-muted-foreground" />
            Weather Data Unavailable
          </CardTitle>
          <CardDescription>
            Could not load weather data at this time. Try refreshing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={refreshWeather} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </CardContent>
      </Card>
    );
  }
  // If none of the above conditions are met, execution will fall through to the main return statement below.

  // The main content rendering logic, only reached if not offline, not loading, no error, and weather data is present.
  return (
    <WeatherErrorBoundary>
      <Card
        className={`h-full border-2 hover:border-primary/50 transition-all ${animation ? 'animate-pulse' : ''}`}
      >
        <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-950/30 dark:to-sky-950/30">
          <CardTitle className="flex justify-between items-center">
            <span>AI Weather Intelligence</span>
            <Badge className="text-xs animate-pulse bg-green-600 hover:bg-green-700">
              LIVE
            </Badge>
          </CardTitle>
          <CardDescription className="flex items-center gap-2">
            <span>Hyperlocal forecast for {locationName}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={refreshWeather}
            >
              <Cloud className="h-3 w-3" />
            </Button>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-32">
              <div className="h-16 w-16 rounded-full bg-gray-100 animate-pulse mb-2"></div>
              <div className="h-4 w-24 bg-gray-100 animate-pulse"></div>
            </div>
          ) : weather ? (
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  {getWeatherIcon(weather.icon, 10)}
                  <div className="absolute inset-0 rounded-full bg-blue-200/20 dark:bg-blue-500/10 blur-xl -z-10"></div>
                </div>
                <div>
                  <div className="text-3xl font-bold tracking-tighter flex items-start">
                    {weather.temp}°C
                    <span className="text-sm text-muted-foreground ml-1 mt-1">
                      {weather.condition}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Wind: {weather.windSpeed} km/h
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Droplet className="h-4 w-4 text-blue-500" />
                      <span>Humidity</span>
                    </div>
                    <span className="text-sm">{weather.humidity}%</span>
                  </div>
                  <Progress value={weather.humidity} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2 text-sm">
                      <CloudRain className="h-4 w-4 text-blue-500" />
                      <span>Rain</span>
                    </div>
                    <span className="text-sm">{weather.rainChance}%</span>
                  </div>
                  <Progress value={weather.rainChance} className="h-2" />
                </div>
              </div>

              <div className="mb-4 overflow-x-auto">
                <div className="flex space-x-1 pb-1 min-w-max">
                  {weather.forecast.map((day, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded-lg flex-1 min-w-24 text-center cursor-pointer transition-all ${
                        activeDay === index
                          ? 'bg-primary text-primary-foreground shadow-md'
                          : 'bg-muted/50 hover:bg-muted'
                      }`}
                      onClick={() => setActiveDay(index)}
                    >
                      <div className="font-medium text-xs">{day.day}</div>
                      <div className="my-1">{getWeatherIcon(day.icon, 6)}</div>
                      <div className="text-sm font-semibold">{day.temp}°</div>
                      <div className="text-xs flex justify-center items-center gap-1">
                        <Umbrella className="h-3 w-3" />
                        {day.rainChance}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className={`p-3 rounded-lg mb-4 ${
                  weather.urgency === 'critical'
                    ? 'bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 animate-pulse'
                    : weather.urgency === 'warning'
                      ? 'bg-amber-50 dark:bg-amber-900/30 border-l-4 border-amber-500'
                      : 'bg-blue-50 dark:bg-blue-900/30'
                }`}
              >
                {weather.urgency === 'critical' && (
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span className="text-xs font-bold text-red-600 dark:text-red-400">
                      WEATHER ALERT
                    </span>
                  </div>
                )}

                <p
                  className={`text-sm ${
                    weather.urgency === 'critical'
                      ? 'text-red-800 dark:text-red-200 font-medium'
                      : 'text-blue-800 dark:text-blue-200'
                  }`}
                >
                  <span className="font-medium">AI Farm Action:</span>{' '}
                  {weather.farmAction}
                </p>
              </div>

              <Link to="/weather">
                <Button variant="outline" size="sm" className="w-full group">
                  <span className="flex items-center gap-2">
                    <Cloud className="h-4 w-4" />
                    Full Weather Intelligence
                    <ArrowRight className="h-3 w-3 ml-auto group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </Link>
            </div>
          ) : error ? (
            <Alert variant="destructive" className="my-4 mx-auto max-w-sm">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error Fetching Weather</AlertTitle>
              <AlertDescription>
                {error.message ||
                  'An unexpected error occurred. Please try again.'}
                <Button
                  variant="link"
                  size="sm"
                  onClick={refreshWeather}
                  className="ml-2 p-0 h-auto text-destructive-foreground underline"
                >
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <CloudOff className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Unable to load weather data at the moment.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={refreshWeather}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </WeatherErrorBoundary>
  );
}

const WeatherPreview = () => {
  return (
    <WeatherErrorBoundary>
      <WeatherPreviewInternal />
    </WeatherErrorBoundary>
  );
};

export default WeatherPreview;
