import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { reverseGeocode } from '@/utils/location';
import { fetchJSON } from '@/utils/network';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// New Home Components
import { HealthOrb } from '@/components/home/HealthOrb';
import { FeatureCard } from '@/components/home/FeatureCard';
import { ProSwipeBanner } from '@/components/home/ProSwipeBanner';
import { ChatbotAvatar } from '@/components/home/ChatbotAvatar';

// Icons
import { ScanLine, CloudSun, ListChecks, LineChart } from 'lucide-react';

// Background Image - NOTE: Please ensure this image exists at the specified path.
// import FarmBg from '@/assets/images/farm-background.jpg';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [weatherInfo, setWeatherInfo] = useState({
    location: 'Loading...',
    temperature: '--',
    condition: '...',
  });
  const [farmScore, setFarmScore] = useState(78);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      setLoading(true);

      // 1. Get Location and Weather
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const placeName = await reverseGeocode({ lat: latitude, lng: longitude });
            if (!import.meta.env.VITE_OPENWEATHER_API_KEY) {
                console.warn('[Weather] OPENWEATHERMAP key missing; using placeholder temp');
                setWeatherInfo({ location: placeName, temperature: '24', condition: 'Sunny' });
                return;
            }
            const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}`;
            const w = await fetchJSON<{ main: { temp: number }; weather: Array<{ description: string }> }>(weatherUrl);
            setWeatherInfo({
              location: placeName,
              temperature: String(Math.round(w.main.temp)),
              condition: w.weather?.[0]?.description ?? 'Clear',
            });
          } catch (error) {
            console.error("Failed to fetch weather/location", error);
            setWeatherInfo({ location: 'Nairobi, KE', temperature: '24', condition: 'Sunny' });
          }
        },
        () => {
          setWeatherInfo({ location: 'Nairobi, KE', temperature: '24', condition: 'Sunny' });
        }
      );

      // 2. Fetch Tasks
      try {
        const { data, error } = await supabase
          .from('farm_tasks')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'pending')
          .order('due_date', { ascending: true })
          .limit(5);

        if (error) throw error;
        setTasks(data || []);
      } catch (error) {
        console.error("Failed to fetch tasks", error);
        toast.error("Could not load your tasks.");
      }
      
      // 3. Fetch Farm Score (placeholder)
      setFarmScore(Math.floor(Math.random() * (95 - 65 + 1) + 65));

      setLoading(false);
    };

    loadData();
  }, [user]);

  if (loading) {
    return <div className="w-screen h-screen bg-gray-900 text-white flex items-center justify-center">Initializing Mission Control...</div>;
  }

  return (
    <div className="bg-gray-900 min-h-screen text-white font-sans overflow-x-hidden" style={{ maxWidth: '414px', margin: '0 auto' }}>
      <div
        className="h-80 bg-cover bg-center relative bg-gradient-to-br from-gray-800 to-gray-900"
        // style={{ backgroundImage: `url(${FarmBg})` }} // Uncomment when image is available
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col justify-between p-4">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h1 className="text-2xl font-bold">{getGreeting()}, {user?.user_metadata.name || 'Farmer'}!</h1>
            <p className="text-sm text-gray-300">{weatherInfo.location}</p>
          </motion.div>
          <motion.div className="text-right" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <p className="text-4xl font-bold">{weatherInfo.temperature}°C</p>
            <p className="text-sm text-gray-300 capitalize">{weatherInfo.condition}</p>
          </motion.div>
        </div>
      </div>

      <div className="relative -mt-24 z-10 p-4">
        <HealthOrb score={farmScore} tasks={tasks} />
      </div>

      <motion.div 
        className="p-4 space-y-4 pb-32"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, staggerChildren: 0.1 }}
      >
        <FeatureCard
          icon={<ScanLine size={24} />}
          title="Crop Scanner"
          description="Identify diseases and pests instantly."
          actionText="Scan Now"
          onAction={() => navigate('/scan')}
          bgColorClass="bg-green-500/80"
        />
        <FeatureCard
          icon={<CloudSun size={24} />}
          title="Hyperlocal Weather"
          description="5-day forecast with rain prediction."
          actionText="View Forecast"
          onAction={() => navigate('/weather')}
          bgColorClass="bg-blue-500/80"
        />
        <FeatureCard
          icon={<ListChecks size={24} />}
          title="Farm Plan"
          description={tasks.length > 0 ? `${tasks.length} urgent tasks` : "No urgent tasks."}
          actionText="Manage Tasks"
          onAction={() => navigate('/farm-plan')}
          bgColorClass="bg-yellow-500/80"
        />
        <FeatureCard
          icon={<LineChart size={24} />}
          title="Smart Market"
          description="Live price trends for your crops."
          actionText="Check Prices"
          onAction={() => navigate('/market')}
          bgColorClass="bg-red-500/80"
        />
      </motion.div>

      <ProSwipeBanner />
      <ChatbotAvatar />
    </div>
  );
}
