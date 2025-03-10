
import { Card } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { Leaf, Cloud, ShoppingCart, AlertTriangle, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <Layout>
      <div className="p-5 animate-fade-in">
        <div className="mb-6 pt-2">
          <h1 className="text-2xl-large font-bold text-crop-green-700 mb-2">CropGenius</h1>
          <p className="text-lg font-medium text-gray-700">Your AI farming assistant</p>
        </div>

        {/* Weather Summary Card */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg text-gray-800">Today's Forecast</h3>
              <p className="text-xl-large font-bold text-sky-blue-600">28°C</p>
              <p className="text-sm text-gray-600">Sunny, light breeze</p>
            </div>
            <Cloud className="w-14 h-14 text-sky-blue-500" />
          </div>
          <div className="mt-2">
            <Link to="/weather" className="text-crop-green-600 text-sm font-medium flex items-center">
              View 7-day forecast
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Main Feature Grid */}
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Farming Tools</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Link to="/scan">
            <Card className="p-5 hover:shadow-lg transition-shadow animate-slide-in bg-white h-full flex flex-col">
              <Leaf className="w-10 h-10 text-crop-green-500 mb-3" />
              <h3 className="font-semibold text-lg">Crop Scanner</h3>
              <p className="text-gray-600 mt-1">Diagnose plant health instantly</p>
            </Card>
          </Link>

          <Link to="/weather">
            <Card className="p-5 hover:shadow-lg transition-shadow animate-slide-in bg-white h-full flex flex-col">
              <Cloud className="w-10 h-10 text-sky-blue-500 mb-3" />
              <h3 className="font-semibold text-lg">Weather</h3>
              <p className="text-gray-600 mt-1">Farm-specific forecasts</p>
            </Card>
          </Link>

          <Link to="/market">
            <Card className="p-5 hover:shadow-lg transition-shadow animate-slide-in bg-white h-full flex flex-col">
              <ShoppingCart className="w-10 h-10 text-soil-brown-500 mb-3" />
              <h3 className="font-semibold text-lg">Marketplace</h3>
              <p className="text-gray-600 mt-1">Buy & sell crops securely</p>
            </Card>
          </Link>

          <Link to="/alerts">
            <Card className="p-5 hover:shadow-lg transition-shadow animate-slide-in bg-white h-full flex flex-col">
              <AlertTriangle className="w-10 h-10 text-amber-500 mb-3" />
              <h3 className="font-semibold text-lg">Alerts</h3>
              <p className="text-gray-600 mt-1">Important farming updates</p>
            </Card>
          </Link>
        </div>

        {/* Secondary Features */}
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Grow Your Farm</h2>
        <div className="grid grid-cols-2 gap-4">
          <Link to="/predictions">
            <Card className="p-5 hover:shadow-lg transition-shadow animate-slide-in bg-white h-full flex flex-col">
              <TrendingUp className="w-10 h-10 text-crop-green-500 mb-3" />
              <h3 className="font-semibold text-lg">Predictions</h3>
              <p className="text-gray-600 mt-1">AI market price forecasts</p>
            </Card>
          </Link>

          <Link to="/referrals">
            <Card className="p-5 hover:shadow-lg transition-shadow animate-slide-in bg-white h-full flex flex-col">
              <Users className="w-10 h-10 text-soil-brown-500 mb-3" />
              <h3 className="font-semibold text-lg">Refer & Earn</h3>
              <p className="text-gray-600 mt-1">Invite farmers, get rewards</p>
            </Card>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
