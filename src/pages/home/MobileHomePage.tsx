import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  ChevronRight, 
  Droplet, 
  Sun, 
  CloudRain, 
  Zap, 
  Bell, 
  ArrowUpRight,
  Droplets,
  Calendar as CalendarIcon,
  BarChart2 as BarChart2Icon,
  Plus as PlusIcon,
  X as XIcon,
  MessageCircle as MessageCircleIcon,
  Crown as CrownIcon,
  Sparkles as SparklesIcon,
  Star as StarIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Home as HomeIcon,
  Settings as SettingsIcon
} from 'lucide-react';

// Import our new components
import { HealthOrb } from '@/components/dashboard/mobile/HealthOrb';
import FeatureCard from '@/components/dashboard/mobile/FeatureCard';
import ProSwipeBanner from '@/components/dashboard/mobile/ProSwipeBanner';
import ChatbotAvatar from '@/components/dashboard/mobile/ChatbotAvatar';

// Sample data - in a real app, this would come from your data layer
const sampleFields = [
  { id: 1, name: 'North Field', crop: 'Maize', health: 85, size: '2.5', unit: 'acres' },
  { id: 2, name: 'South Field', crop: 'Beans', health: 72, size: '1.8', unit: 'acres' },
  { id: 3, name: 'East Field', crop: 'Tomatoes', health: 64, size: '0.8', unit: 'acres' },
];

const upcomingTasks = [
  { id: 1, title: 'Fertilize Maize', due: 'Today', priority: 'high' },
  { id: 2, title: 'Irrigation Check', due: 'Tomorrow', priority: 'medium' },
  { id: 3, title: 'Pest Control', due: 'In 2 days', priority: 'high' },
];

const weatherData = {
  temp: 26,
  condition: 'Partly Cloudy',
  precipitation: 15,
  humidity: 65,
  wind: 12,
};

const MobileHomePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showChatbot, setShowChatbot] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(true);
  const activeTab = location.pathname;
  
  // Calculate overall farm health (average of all fields)
  const farmHealth = Math.round(
    sampleFields.reduce((sum, field) => sum + field.health, 0) / sampleFields.length
  );

  // No need for tab state management here anymore - handled by router

  // Toggle chatbot visibility
  const toggleChatbot = () => {
    if (showChatbot && hasNewMessage) {
      setHasNewMessage(false);
    }
    setShowChatbot(!showChatbot);
  };

  // Simulate new message after 30 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasNewMessage(true);
    }, 30000);
    return () => clearTimeout(timer);
  }, [hasNewMessage]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-green-50">
      {/* Header */}
      <header className="glass-morph sticky top-0 z-10 p-4 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Welcome back! 👋</h1>
            <p className="text-sm text-gray-600">Tuesday, 24 Oct 2023</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="p-2 rounded-full bg-white/80 shadow-sm">
              <Bell className="h-5 w-5 text-gray-600" />
            </button>
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 flex items-center justify-center text-white font-bold">
              JD
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Farm Health Overview */}
        <section className="glass-morph rounded-2xl p-6 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-gray-600 mb-1">Farm Health</h2>
            <p className="text-3xl font-bold text-gray-900 mb-2">{farmHealth}%</p>
            <div className="flex items-center">
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    farmHealth > 70 ? 'bg-green-500' : 
                    farmHealth > 40 ? 'bg-yellow-500' : 'bg-red-500'
                  }`} 
                  style={{ width: `${farmHealth}%` }}
                />
              </div>
              <span className="ml-2 text-xs text-gray-500">
                {farmHealth > 70 ? 'Excellent' : farmHealth > 40 ? 'Needs Attention' : 'Critical'}
              </span>
            </div>
          </div>
          <HealthOrb score={farmHealth} size={100} />
        </section>

        {/* Quick Actions */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            <button className="text-sm text-blue-600 flex items-center">
              See all <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <button 
              onClick={() => navigate('/scan')}
              className="flex flex-col items-center justify-center p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all"
            >
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-1">
                <PlusIcon className="h-6 w-6" />
              </div>
              <span className="text-xs font-medium text-gray-700">New Scan</span>
            </button>
            <button className="flex flex-col items-center justify-center p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all">
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-1">
                <Droplet className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-gray-700">Irrigate</span>
            </button>
            <button className="flex flex-col items-center justify-center p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all">
              <div className="h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 mb-1">
                <Sun className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-gray-700">Weather</span>
            </button>
            <button className="flex flex-col items-center justify-center p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all">
              <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-1">
                <BarChart2Icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-gray-700">Insights</span>
            </button>
          </div>
        </section>

        {/* Fields Overview */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Your Fields</h2>
            <button 
              onClick={() => navigate('/fields')}
              className="text-sm text-blue-600 flex items-center"
            >
              View all <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-3">
            {sampleFields.map((field) => (
              <div 
                key={field.id}
                onClick={() => navigate(`/fields/${field.id}`)}
                className="glass-morph p-4 rounded-xl flex items-center justify-between cursor-pointer hover:shadow-md transition-all"
              >
                <div>
                  <h3 className="font-medium text-gray-900">{field.name}</h3>
                  <p className="text-sm text-gray-600">{field.crop} • {field.size} {field.unit}</p>
                </div>
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full mr-2" 
                    style={{
                      backgroundColor: 
                        field.health > 70 ? '#10B981' : 
                        field.health > 40 ? '#F59E0B' : '#EF4444'
                    }}
                  />
                  <span className="text-sm font-medium">{field.health}%</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Upcoming Tasks */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Tasks</h2>
            <button 
              onClick={() => navigate('/tasks')}
              className="text-sm text-blue-600 flex items-center"
            >
              View all <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-3">
            {upcomingTasks.map((task) => (
              <div 
                key={task.id}
                className="glass-morph p-4 rounded-xl flex items-start space-x-3"
              >
                <div className={`h-8 w-1 rounded-full ${
                  task.priority === 'high' ? 'bg-red-500' : 'bg-yellow-500'
                }`} />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{task.title}</h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-gray-500">{task.due}</span>
                    <button className="text-xs text-blue-600 hover:underline">
                      Mark as done
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Weather & Pro Upgrade */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-morph p-4 rounded-2xl">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Weather Now</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="text-4xl font-bold text-gray-900">{weatherData.temp}°</div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{weatherData.condition}</p>
                  <p className="text-xs text-gray-500">Feels like {weatherData.temp + 2}°</p>
                </div>
              </div>
              <div className="text-right">
                <CloudRain className="h-10 w-10 text-blue-500 mx-auto" />
                <p className="text-xs mt-1">{weatherData.precipitation}% rain</p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between text-center">
              <div>
                <p className="text-xs text-gray-500">Humidity</p>
                <p className="text-sm font-medium">{weatherData.humidity}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Wind</p>
                <p className="text-sm font-medium">{weatherData.wind} km/h</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">UV</p>
                <p className="text-sm font-medium">5.2</p>
              </div>
            </div>
          </div>
          
          <ProSwipeBanner 
            onUpgrade={() => navigate('/pro')}
            className="h-full"
          />
        </section>

        {/* AI Insights */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">AI Insights</h2>
            <button className="text-sm text-blue-600 flex items-center">
              See more <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FeatureCard
              icon={<Zap className="h-5 w-5" />}
              title="Pest Alert"
              description="Low risk of pests in your area"
              variant="success"
              onClick={() => navigate('/alerts/pests')}
            />
            <FeatureCard
              icon={<Droplet className="h-5 w-5" />}
              title="Irrigation"
              description="Watering recommended tomorrow"
              variant="primary"
              onClick={() => navigate('/irrigation')}
            />
          </div>
        </section>
      </main>

      {/* FAB is now handled by ResponsiveLayout */}

      {/* Chatbot Avatar - Positioned absolutely within the page */}
      <div className="fixed bottom-24 right-4 z-40">
        <ChatbotAvatar 
          isOpen={showChatbot}
          hasNewMessage={hasNewMessage}
          onClick={toggleChatbot}
          onClose={() => setShowChatbot(false)}
        />
      </div>



      {/* Chatbot Panel */}
      <AnimatePresence>
        {showChatbot && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed bottom-16 right-4 w-72 bg-white rounded-t-2xl shadow-xl z-50 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                    <MessageCircleIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">CropGenius AI</h3>
                    <p className="text-xs opacity-80">Online</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowChatbot(false)}
                  className="p-1 rounded-full hover:bg-white/10"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="p-4 h-64 overflow-y-auto">
              <div className="text-center py-8 text-sm text-gray-500">
                <p>Ask me anything about your farm, crops, or weather!</p>
              </div>
            </div>
            <div className="border-t p-3 bg-gray-50">
              <div className="flex items-center bg-white rounded-full px-3 py-2 shadow-sm border">
                <input 
                  type="text" 
                  placeholder="Type a message..." 
                  className="flex-1 border-0 focus:ring-0 text-sm"
                />
                <button className="text-green-600 hover:text-green-700">
                  <ArrowUpRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileHomePage;
