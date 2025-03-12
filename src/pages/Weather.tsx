
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import WeatherHeader from "@/components/weather/WeatherHeader";
import ForecastPanel from "@/components/weather/ForecastPanel";
import DisasterAlerts from "@/components/weather/DisasterAlerts";
import WeatherMarketInsights from "@/components/weather/WeatherMarketInsights";
import CrowdSourcedReports from "@/components/weather/CrowdSourcedReports";

export default function Weather() {
  const [farmLocation, setFarmLocation] = useState<string>("");
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  // Redirect to login if not authenticated
  if (!loading && !user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Advanced Weather Intelligence</h1>
          <p className="mb-8">Please sign in to access personalized weather insights for your farm.</p>
          <Button onClick={() => navigate("/auth")}>Sign In or Create Account</Button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">AI Weather Intelligence</h1>
        
        {/* Weather Header */}
        <WeatherHeader 
          farmLocation={farmLocation} 
          setFarmLocation={setFarmLocation}
        />
        
        {/* Weather Forecast */}
        <div className="mb-6">
          <ForecastPanel />
        </div>
        
        {/* Disaster Alerts */}
        <div className="mb-6">
          <DisasterAlerts />
        </div>
        
        {/* Two-column layout for remaining components */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Weather-Market Insights */}
          <WeatherMarketInsights />
          
          {/* Crowd-Sourced Reports */}
          <CrowdSourcedReports />
        </div>
      </div>
    </Layout>
  );
}
