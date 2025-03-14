
import { Card } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Leaf, Cloud, ShoppingCart, AlertTriangle, TrendingUp, 
  Users, Calendar, FlaskConical, BarChart2, Brain, 
  MessageCircle, Zap, CheckCircle, ChevronRight, RotateCw
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";

const Index = () => {
  const [farmTasks, setFarmTasks] = useState([
    { id: 1, text: "Delay watering - rain expected in 36 hours", icon: Calendar, completed: false },
    { id: 2, text: "Apply organic pest control - aphids detected", icon: FlaskConical, completed: false },
    { id: 3, text: "Harvest maize by Friday for optimal pricing", icon: BarChart2, completed: false },
  ]);

  const [weather, setWeather] = useState({
    temp: 28,
    condition: "Sunny, light breeze",
    advice: "Ideal for harvesting your maize",
    precipitation: 10, // percent chance
    humidity: 65, // percent
    windSpeed: 8, // km/h
  });

  const [farmPerformance, setFarmPerformance] = useState({
    cropHealth: 87, // percent
    soilQuality: 72, // percent
    yieldForecast: 92, // percent of expected yield
    profitMargin: 78, // percent
  });

  const [referralProgress, setReferralProgress] = useState({
    invited: 7,
    goal: 20,
    timeLeft: "36 hours", // time until bonus expires
  });

  const completeTask = (taskId) => {
    setFarmTasks(farmTasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
    
    const task = farmTasks.find(t => t.id === taskId);
    if (!task.completed) {
      toast.success("Task marked as completed!", {
        description: "Your farm plan has been updated",
      });

      // In a real app, this would trigger real AI workflows
      if (taskId === 1) {
        toast("Watering schedule updated", {
          description: "Next watering scheduled for Friday after the rain",
        });
      } else if (taskId === 2) {
        toast("Pest control reminder", {
          description: "Added to your calendar for tomorrow morning",
        });
      } else if (taskId === 3) {
        toast("Market alert created", {
          description: "You'll be notified of the best price on Friday",
        });
      }
    }
  };

  const refreshWeather = () => {
    // Simulate a weather update
    toast.success("Weather forecast updated!", {
      description: "Latest satellite data and AI predictions loaded",
    });
    
    // In a real app, this would fetch fresh weather data
    setWeather({
      ...weather,
      temp: Math.floor(Math.random() * 5) + 26,
      precipitation: Math.floor(Math.random() * 20) + 5,
    });
  };

  return (
    <Layout>
      <div className="p-5 pb-24 animate-fade-in">
        {/* Personalized Greeting */}
        <div className="mb-5 pt-2">
          <h1 className="text-2xl-large font-bold text-crop-green-700 mb-2">Hello, Brian</h1>
          <div className="flex items-center">
            <p className="text-md font-medium text-gray-700">Your farm looks great today</p>
            <Badge variant="outline" className="ml-2 bg-crop-green-50 text-crop-green-700 border-crop-green-200">
              Premium Farmer
            </Badge>
          </div>
        </div>

        {/* Farm Performance Summary */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-5">
          <h3 className="font-semibold text-md text-gray-700 mb-3">Farm Performance</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">Crop Health</span>
                <span className="text-sm font-medium text-crop-green-700">{farmPerformance.cropHealth}%</span>
              </div>
              <Progress value={farmPerformance.cropHealth} className="h-2 bg-gray-100" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">Soil Quality</span>
                <span className="text-sm font-medium text-soil-brown-600">{farmPerformance.soilQuality}%</span>
              </div>
              <Progress value={farmPerformance.soilQuality} className="h-2 bg-gray-100" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">Yield Forecast</span>
                <span className="text-sm font-medium text-sky-blue-600">{farmPerformance.yieldForecast}%</span>
              </div>
              <Progress value={farmPerformance.yieldForecast} className="h-2 bg-gray-100" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">Profit Margin</span>
                <span className="text-sm font-medium text-amber-600">{farmPerformance.profitMargin}%</span>
              </div>
              <Progress value={farmPerformance.profitMargin} className="h-2 bg-gray-100" />
            </div>
          </div>
        </div>

        {/* AI Farm Plan - Interactive Tasks */}
        <div className="bg-gradient-to-r from-crop-green-600 to-crop-green-700 rounded-xl shadow-md p-4 mb-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-lg">Today's AI Farm Plan</h3>
              <p className="text-sm opacity-90">Based on your soil, weather & market conditions</p>
            </div>
            <Brain className="w-12 h-12 text-white opacity-75" />
          </div>

          <div className="mt-1 flex flex-col gap-3">
            {farmTasks.map((task) => (
              <div 
                key={task.id} 
                className={`flex items-center gap-2 bg-white/10 p-3 rounded-lg transition-all ${task.completed ? 'bg-white/20' : ''}`}
                onClick={() => completeTask(task.id)}
              >
                <task.icon className="w-5 h-5 flex-shrink-0" />
                <div className="flex-grow">
                  <p className={`text-sm font-medium ${task.completed ? 'line-through opacity-70' : ''}`}>{task.text}</p>
                </div>
                <div className="flex-shrink-0">
                  {task.completed ? (
                    <CheckCircle className="w-6 h-6 text-white" />
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-white/50" />
                  )}
                </div>
              </div>
            ))}
          </div>

          <Link to="/farm-plan" className="block mt-3 text-white/90 text-sm font-medium">
            <div className="flex items-center justify-center bg-white/10 py-2 rounded-lg hover:bg-white/20 transition-colors">
              View full AI farm plan
              <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          </Link>
        </div>

        {/* Interactive Weather Card */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="flex items-center">
                <h3 className="font-semibold text-lg text-gray-800">Farm Weather</h3>
                <button 
                  onClick={refreshWeather}
                  className="ml-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Refresh weather"
                >
                  <RotateCw className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <p className="text-xl-large font-bold text-sky-blue-600">{weather.temp}°C</p>
              <p className="text-sm text-gray-600">{weather.condition}</p>
              <p className="text-xs text-crop-green-600 mt-1">{weather.advice}</p>
            </div>
            <Cloud className="w-14 h-14 text-sky-blue-500" />
          </div>

          <div className="grid grid-cols-3 gap-2 my-3">
            <div className="bg-sky-blue-50 rounded-lg p-2 text-center">
              <p className="text-xs text-gray-600">Rain Chance</p>
              <p className="text-md font-semibold text-sky-blue-700">{weather.precipitation}%</p>
            </div>
            <div className="bg-sky-blue-50 rounded-lg p-2 text-center">
              <p className="text-xs text-gray-600">Humidity</p>
              <p className="text-md font-semibold text-sky-blue-700">{weather.humidity}%</p>
            </div>
            <div className="bg-sky-blue-50 rounded-lg p-2 text-center">
              <p className="text-xs text-gray-600">Wind</p>
              <p className="text-md font-semibold text-sky-blue-700">{weather.windSpeed} km/h</p>
            </div>
          </div>

          <Link to="/weather" className="text-crop-green-600 text-sm font-medium flex items-center">
            View 7-day farm forecast
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {/* Main Feature Grid - Now more interactive */}
        <h2 className="text-xl font-semibold text-gray-800 mb-3">AI Farming Tools</h2>
        <div className="grid grid-cols-2 gap-4 mb-5">
          <Link to="/scan">
            <Card className="p-4 hover:shadow-lg transition-shadow animate-slide-in bg-white h-full flex flex-col">
              <Leaf className="w-10 h-10 text-crop-green-500 mb-2" />
              <h3 className="font-semibold text-lg">AI Crop Scanner</h3>
              <p className="text-gray-600 mt-1 text-sm">Scan now for instant diagnosis</p>
              <Badge className="mt-2 w-fit bg-crop-green-100 text-crop-green-600 border-0">98% Accuracy</Badge>
            </Card>
          </Link>

          <Link to="/predictions">
            <Card className="p-4 hover:shadow-lg transition-shadow animate-slide-in bg-white h-full flex flex-col">
              <TrendingUp className="w-10 h-10 text-crop-green-500 mb-2" />
              <h3 className="font-semibold text-lg">Yield Predictor</h3>
              <p className="text-gray-600 mt-1 text-sm">Predict your profits now</p>
              <Badge className="mt-2 w-fit bg-amber-100 text-amber-600 border-0">New AI Model</Badge>
            </Card>
          </Link>

          <Link to="/market">
            <Card className="p-4 hover:shadow-lg transition-shadow animate-slide-in bg-white h-full flex flex-col">
              <ShoppingCart className="w-10 h-10 text-soil-brown-500 mb-2" />
              <h3 className="font-semibold text-lg">Smart Market</h3>
              <p className="text-gray-600 mt-1 text-sm">3 new buyers near you</p>
              <Badge className="mt-2 w-fit bg-sky-blue-100 text-sky-blue-600 border-0">Top Prices Today</Badge>
            </Card>
          </Link>

          <Link to="/alerts">
            <Card className="p-4 hover:shadow-lg transition-shadow animate-slide-in bg-white h-full flex flex-col">
              <AlertTriangle className="w-10 h-10 text-amber-500 mb-2" />
              <h3 className="font-semibold text-lg">Farm Alerts</h3>
              <p className="text-gray-600 mt-1 text-sm">1 new weather alert</p>
              <Badge className="mt-2 w-fit bg-red-100 text-red-600 border-0">Important</Badge>
            </Card>
          </Link>
        </div>

        {/* Community Section - More Engaging */}
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Farmer Community</h2>
        <div className="grid grid-cols-2 gap-4 mb-5">
          <Link to="/community">
            <Card className="p-4 hover:shadow-lg transition-shadow animate-slide-in bg-white h-full flex flex-col">
              <Users className="w-10 h-10 text-crop-green-500 mb-2" />
              <h3 className="font-semibold text-lg">Expert Q&A</h3>
              <p className="text-gray-600 mt-1 text-sm">12 new answers for you</p>
              <div className="mt-2 flex -space-x-2 overflow-hidden">
                <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-crop-green-500 text-white text-xs flex items-center justify-center">JM</div>
                <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-soil-brown-500 text-white text-xs flex items-center justify-center">KO</div>
                <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-sky-blue-500 text-white text-xs flex items-center justify-center">TN</div>
                <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-gray-400 text-white text-xs flex items-center justify-center">+5</div>
              </div>
            </Card>
          </Link>

          <Link to="/chat">
            <Card className="p-4 hover:shadow-lg transition-shadow animate-slide-in bg-white h-full flex flex-col">
              <MessageCircle className="w-10 h-10 text-soil-brown-500 mb-2" />
              <h3 className="font-semibold text-lg">AI Chat</h3>
              <p className="text-gray-600 mt-1 text-sm">Ask anything, get answers</p>
              <Badge className="mt-2 w-fit bg-indigo-100 text-indigo-600 border-0">Always Online</Badge>
            </Card>
          </Link>
        </div>

        {/* Referral System - Now with Urgency */}
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Earn & Grow</h2>
        <Link to="/referrals">
          <Card className="p-4 hover:shadow-lg transition-shadow animate-slide-in bg-white mb-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center">
                  <h3 className="font-semibold text-lg text-crop-green-700">Farmer Network Rewards</h3>
                  <Badge className="ml-2 bg-amber-100 text-amber-700 border-0">
                    {referralProgress.timeLeft}
                  </Badge>
                </div>
                <p className="text-gray-600 mt-1 text-sm">
                  Your bonus of $25 expires in {referralProgress.timeLeft}! Invite more farmers quickly.
                </p>
                <div className="mt-3">
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-crop-green-500 rounded-full" 
                      style={{ width: `${(referralProgress.invited / referralProgress.goal) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {referralProgress.invited}/{referralProgress.goal} farmers invited - 
                    {Math.round((referralProgress.invited / referralProgress.goal) * 100)}% to next reward tier
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <Zap className="w-12 h-12 text-crop-green-500" />
                <span className="text-xs font-bold text-crop-green-700 mt-1">HURRY!</span>
              </div>
            </div>
            
            <div className="mt-3">
              <Button className="w-full bg-crop-green-600 hover:bg-crop-green-700 text-white">
                Invite Farmers Now
              </Button>
            </div>
          </Card>
        </Link>

        {/* "Farm Clans" Feature - New Viral Loop */}
        <Link to="/farm-clans">
          <Card className="p-4 hover:shadow-lg transition-shadow animate-slide-in bg-white mb-5 border-2 border-soil-brown-500">
            <div className="flex items-center">
              <div className="bg-soil-brown-100 p-2 rounded-full mr-4">
                <Users className="w-8 h-8 text-soil-brown-700" />
              </div>
              <div>
                <span className="text-xs font-semibold text-soil-brown-700 bg-soil-brown-100 px-2 py-1 rounded-full">
                  NEW FEATURE
                </span>
                <h3 className="font-semibold text-lg mt-1">Join a Farm Clan</h3>
                <p className="text-gray-600 text-sm">Team up with 5-10 local farmers for bigger profits & better AI predictions</p>
              </div>
            </div>
          </Card>
        </Link>

        {/* Daily Challenge - With Reward */}
        <Link to="/challenges">
          <Card className="p-4 hover:shadow-lg transition-shadow animate-slide-in bg-white border-2 border-crop-green-500">
            <div className="flex items-center">
              <div className="bg-crop-green-100 p-2 rounded-full mr-4">
                <Calendar className="w-8 h-8 text-crop-green-700" />
              </div>
              <div>
                <span className="text-xs font-semibold text-crop-green-700 bg-crop-green-100 px-2 py-1 rounded-full">
                  TODAY'S CHALLENGE
                </span>
                <h3 className="font-semibold text-lg mt-1">Take a soil test photo</h3>
                <p className="text-gray-600 text-sm">Earn 50 points & get a free fertilizer recommendation</p>
                <Badge className="mt-2 bg-amber-100 text-amber-700 border-0">2 hours left</Badge>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </Layout>
  );
};

export default Index;
