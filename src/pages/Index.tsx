
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMemoryStore } from '@/hooks/useMemoryStore';
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { isOnline } from "@/utils/isOnline";

// Import components
import PowerHeader from "@/components/dashboard/PowerHeader";
import MissionControl from "@/components/dashboard/MissionControl";
import FieldIntelligence from "@/components/dashboard/FieldIntelligence";
import MoneyZone from "@/components/dashboard/MoneyZone";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    weatherInfo, 
    farmScore,
    allSynced,
    fields,
    actions,
    loading
  } = useDashboardData();
  
  // Show Pro upgrade modal
  const handleShowProUpgrade = () => {
    toast.info("CropGenius Pro Features", {
      description: "Get AI predictions, market insights and weather alerts",
      action: {
        label: "Learn More",
        onClick: () => navigate("/referrals")
      },
      duration: 5000
    });
    
    navigate("/referrals");
  };

  return (
    <Layout>
      {/* POWER HEADER */}
      <PowerHeader 
        location={weatherInfo.location}
        temperature={weatherInfo.temperature}
        weatherCondition={weatherInfo.condition}
        farmScore={farmScore}
        synced={allSynced}
      />
      
      {/* MISSION CONTROL */}
      <MissionControl 
        actions={actions}
        loading={loading.actions}
      />
      
      {/* FIELD INTELLIGENCE */}
      <FieldIntelligence 
        fields={fields}
        loading={loading.fields}
      />
      
      {/* MONEY ZONE */}
      <MoneyZone 
        onUpgrade={handleShowProUpgrade}
      />
    </Layout>
  );
}
