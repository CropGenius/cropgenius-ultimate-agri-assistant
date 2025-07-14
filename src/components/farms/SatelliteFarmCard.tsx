import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Eye, AlertTriangle, TrendingUp } from 'lucide-react';
import { getSatelliteImageUrl, getNDVIScore } from '@/services/sentinelHubService';
import { Database } from '@/integrations/supabase/types';

interface SatelliteFarmCardProps {
  farm: Database['public']['Tables']['farms']['Row'];
}

export const SatelliteFarmCard: React.FC<SatelliteFarmCardProps> = ({ farm }) => {
  const [satelliteImage, setSatelliteImage] = useState<string | null>(null);
  const [ndviData, setNdviData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSatelliteData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Extract coordinates from farm data
        if (farm.location) {
          // Parse location as text coordinates "lng,lat"
          const coords = farm.location.split(',').map(c => parseFloat(c.trim()));
          if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
            const [lng, lat] = coords;
            
            // Get satellite image and NDVI data
            const [imageUrl, ndviScore] = await Promise.all([
              getSatelliteImageUrl([lng, lat], { width: 200, height: 120 }),
              getNDVIScore([lng, lat])
            ]);

            setSatelliteImage(imageUrl);
            setNdviData(ndviScore);
          }
        }
      } catch (err) {
        console.error('Error loading satellite data:', err);
        setError('Failed to load satellite data');
      } finally {
        setLoading(false);
      }
    };

    loadSatelliteData();
  }, [farm]);

  // Get health color based on NDVI score
  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthIcon = (score: number) => {
    if (score >= 80) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (score >= 60) return <Activity className="w-4 h-4 text-yellow-600" />;
    return <AlertTriangle className="w-4 h-4 text-red-600" />;
  };

  return (
    <motion.div
      className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-[0_8px_32px_rgba(31,38,135,0.37)] cursor-pointer"
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Satellite imagery thumbnail */}
      <div className="relative h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl mb-3 overflow-hidden">
        {loading ? (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="text-xs text-gray-500">Loading...</div>
          </div>
        ) : error ? (
          <div className="absolute inset-0 bg-red-100 flex items-center justify-center">
            <div className="text-xs text-red-600">Error loading image</div>
          </div>
        ) : satelliteImage ? (
          <img 
            src={satelliteImage} 
            alt={`Satellite view of ${farm.name}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-600" />
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Live indicator */}
        <div className="absolute top-2 right-2 flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs text-white font-medium">LIVE</span>
        </div>
      </div>

      {/* Farm info */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 text-sm truncate">{farm.name}</h3>
          <div className="flex items-center space-x-1">
            {ndviData && getHealthIcon(ndviData.score)}
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600">
            {farm.size} {farm.size_unit || 'ha'}
          </span>
          {ndviData && (
            <span className={`font-medium ${getHealthColor(ndviData.score)}`}>
              {ndviData.score}% Health
            </span>
          )}
        </div>
        
        {/* Health status */}
        {ndviData && (
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${
              ndviData.score >= 80 ? 'bg-green-500' : 
              ndviData.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            <span className="text-xs text-gray-600 capitalize">
              {ndviData.healthStatus}
            </span>
          </div>
        )}
      </div>

      {/* Live view button */}
      <motion.button
        className="w-full mt-3 py-2 bg-emerald-500/20 text-emerald-600 rounded-lg flex items-center justify-center space-x-2 text-xs font-medium"
        whileHover={{ bg: "rgb(16 185 129 / 0.3)" }}
        whileTap={{ scale: 0.98 }}
      >
        <Eye className="w-4 h-4" />
        <span>Live View</span>
      </motion.button>
    </motion.div>
  );
};