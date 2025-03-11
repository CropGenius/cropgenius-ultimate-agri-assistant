
import { Card } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { Leaf, Cloud, ShoppingCart, AlertTriangle, TrendingUp, Users, Calendar, FlaskConical, BarChart2, Brain, MessageCircle, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <Layout>
      <div className="p-5 animate-fade-in">
        <div className="mb-6 pt-2">
          <h1 className="text-2xl-large font-bold text-crop-green-700 mb-2">CropGenius</h1>
          <p className="text-lg font-medium text-gray-700">Your AI farming revolution</p>
        </div>

        {/* AI Recommendation Banner */}
        <div className="bg-gradient-to-r from-crop-green-600 to-crop-green-700 rounded-xl shadow-md p-4 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Today's AI Farm Plan</h3>
              <p className="text-sm opacity-90 mt-1">Based on your soil, weather & market conditions</p>
              <div className="mt-3 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <p className="text-sm font-medium">Delay watering - rain expected in 36 hours</p>
                </div>
                <div className="flex items-center gap-2">
                  <FlaskConical className="w-4 h-4" />
                  <p className="text-sm font-medium">Apply organic pest control - aphids detected</p>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-4 h-4" />
                  <p className="text-sm font-medium">Harvest maize by Friday for optimal pricing</p>
                </div>
              </div>
            </div>
            <Brain className="w-14 h-14 text-white opacity-75" />
          </div>
        </div>

        {/* Weather Summary Card */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg text-gray-800">Farm Weather</h3>
              <p className="text-xl-large font-bold text-sky-blue-600">28°C</p>
              <p className="text-sm text-gray-600">Sunny, light breeze</p>
              <p className="text-xs text-crop-green-600 mt-1">Ideal for harvesting your maize</p>
            </div>
            <Cloud className="w-14 h-14 text-sky-blue-500" />
          </div>
          <div className="mt-2">
            <Link to="/weather" className="text-crop-green-600 text-sm font-medium flex items-center">
              View 7-day farm forecast
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Main Feature Grid */}
        <h2 className="text-xl font-semibold text-gray-800 mb-3">AI Farming Tools</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Link to="/scan">
            <Card className="p-5 hover:shadow-lg transition-shadow animate-slide-in bg-white h-full flex flex-col">
              <Leaf className="w-10 h-10 text-crop-green-500 mb-3" />
              <h3 className="font-semibold text-lg">AI Crop Scanner</h3>
              <p className="text-gray-600 mt-1">Diagnose pests & diseases with 98% accuracy</p>
            </Card>
          </Link>

          <Link to="/predictions">
            <Card className="p-5 hover:shadow-lg transition-shadow animate-slide-in bg-white h-full flex flex-col">
              <TrendingUp className="w-10 h-10 text-crop-green-500 mb-3" />
              <h3 className="font-semibold text-lg">Yield Predictor</h3>
              <p className="text-gray-600 mt-1">AI forecasts your exact harvest & profit</p>
            </Card>
          </Link>

          <Link to="/market">
            <Card className="p-5 hover:shadow-lg transition-shadow animate-slide-in bg-white h-full flex flex-col">
              <ShoppingCart className="w-10 h-10 text-soil-brown-500 mb-3" />
              <h3 className="font-semibold text-lg">Smart Market</h3>
              <p className="text-gray-600 mt-1">AI matches you with top buyers instantly</p>
            </Card>
          </Link>

          <Link to="/alerts">
            <Card className="p-5 hover:shadow-lg transition-shadow animate-slide-in bg-white h-full flex flex-col">
              <AlertTriangle className="w-10 h-10 text-amber-500 mb-3" />
              <h3 className="font-semibold text-lg">Farm Alerts</h3>
              <p className="text-gray-600 mt-1">Weather risks & pest outbreaks in your area</p>
            </Card>
          </Link>
        </div>

        {/* Community Section */}
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Farmer Community</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Link to="/community">
            <Card className="p-5 hover:shadow-lg transition-shadow animate-slide-in bg-white h-full flex flex-col">
              <Users className="w-10 h-10 text-crop-green-500 mb-3" />
              <h3 className="font-semibold text-lg">Expert QA</h3>
              <p className="text-gray-600 mt-1">Get advice from top farmers in your area</p>
            </Card>
          </Link>

          <Link to="/chat">
            <Card className="p-5 hover:shadow-lg transition-shadow animate-slide-in bg-white h-full flex flex-col">
              <MessageCircle className="w-10 h-10 text-soil-brown-500 mb-3" />
              <h3 className="font-semibold text-lg">AI Chat</h3>
              <p className="text-gray-600 mt-1">Ask any farming question, get expert answers</p>
            </Card>
          </Link>
        </div>

        {/* Viral Growth Section */}
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Earn & Grow</h2>
        <Link to="/referrals">
          <Card className="p-5 hover:shadow-lg transition-shadow animate-slide-in bg-white mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg text-crop-green-700">Farmer Network Rewards</h3>
                <p className="text-gray-600 mt-1">Earn up to $25 by growing your farming network</p>
                <div className="mt-3">
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-crop-green-500 rounded-full" style={{ width: '35%' }}></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">7/20 farmers invited - 35% to next reward tier</p>
                </div>
              </div>
              <Zap className="w-12 h-12 text-crop-green-500" />
            </div>
          </Card>
        </Link>

        {/* Daily Challenge */}
        <Link to="/challenges">
          <Card className="p-5 hover:shadow-lg transition-shadow animate-slide-in bg-white border-2 border-crop-green-500">
            <div className="flex items-center">
              <div className="bg-crop-green-100 p-2 rounded-full mr-4">
                <Calendar className="w-8 h-8 text-crop-green-700" />
              </div>
              <div>
                <span className="text-xs font-semibold text-crop-green-700 bg-crop-green-100 px-2 py-1 rounded-full">TODAY'S CHALLENGE</span>
                <h3 className="font-semibold text-lg mt-1">Take a soil test photo</h3>
                <p className="text-gray-600 text-sm">Earn 50 points & get a free fertilizer recommendation</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </Layout>
  );
};

export default Index;
