
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMemoryStore } from '@/hooks/useMemoryStore';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Bot, RefreshCw, Droplets, Calendar, Check, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface WelcomeBackCardProps {
  onSyncComplete?: () => void;
}

const WelcomeBackCard = ({ onSyncComplete }: WelcomeBackCardProps) => {
  const { memory, updateMemory } = useMemoryStore();
  const { user } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Format the last login date nicely
  const formatLastLogin = () => {
    if (!memory.lastLogin) return 'first time';
    
    const lastLogin = new Date(memory.lastLogin);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };
  
  // Determine suggested crop based on memory and season
  const getSuggestedCrop = () => {
    // Starting with a fallback
    let suggestedCrop = 'maize';
    
    // If they have recent crops, suggest something different
    if (memory.recentCropsPlanted && memory.recentCropsPlanted.length > 0) {
      const recentCrops = new Set(memory.recentCropsPlanted);
      
      // Simple rotation suggestions
      if (!recentCrops.has('beans')) return 'beans';
      if (!recentCrops.has('cassava')) return 'cassava';
      if (!recentCrops.has('potatoes')) return 'potatoes';
    }
    
    return suggestedCrop;
  };
  
  const handleSyncInsights = async () => {
    setIsSyncing(true);
    
    try {
      // Simulate AI insights generation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update memory with new insights
      await updateMemory({
        lastSyncedAt: new Date().toISOString(),
        lastUsedFeature: 'ai-sync'
      });
      
      // Show success and confetti
      toast.success('AI insights synced successfully!');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      
      if (onSyncComplete) {
        onSyncComplete();
      }
    } catch (error) {
      toast.error('Failed to sync AI insights', { 
        description: 'Please try again later' 
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Card className="w-full border-green-100 dark:border-green-900">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-full">
              <Bot className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-xl">
              Welcome back, {memory.farmerName || user?.email?.split('@')[0] || 'Farmer'}!
            </CardTitle>
          </div>
          
          <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-800">
            AI Powered
          </Badge>
        </div>
        
        <CardDescription className="pt-2">
          You last visited {formatLastLogin()}. CROPGenius AI has been monitoring your farm conditions.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {memory.lastFieldCount > 0 ? (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-300">Your Farm</p>
                  <p className="text-blue-700 dark:text-blue-400 text-sm">
                    You've mapped {memory.lastFieldCount} field{memory.lastFieldCount !== 1 ? 's' : ''}.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-300">Map Your First Field</p>
                  <p className="text-amber-700 dark:text-amber-400 text-sm">
                    Use AI to optimize your farm today!
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <Droplets className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5" />
              <div>
                <p className="font-medium text-emerald-800 dark:text-emerald-300">Weather AI</p>
                <p className="text-emerald-700 dark:text-emerald-400 text-sm">
                  Rain expected next week—perfect for {getSuggestedCrop()}.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {memory.lastSyncedAt && (
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Check className="h-3 w-3" />
            Last synced {new Date(memory.lastSyncedAt).toLocaleString()}
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          onClick={handleSyncInsights}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Syncing AI Insights...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync AI Insights
            </>
          )}
        </Button>
      </CardFooter>
      
      {/* Confetti effect - using CSS for simplicity */}
      {showConfetti && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="confetti-container">
            {Array.from({ length: 50 }).map((_, i) => (
              <div 
                key={i}
                className="confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  backgroundColor: ['#FF5733', '#33FF57', '#3357FF', '#F3FF33', '#FF33F3'][Math.floor(Math.random() * 5)]
                }}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Confetti animations */}
      <style>
        {`
        .confetti-container {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          opacity: 0;
          transform: translateY(0) rotate(0);
          animation: confetti-fall 3s ease-out forwards;
          border-radius: 2px;
        }
        @keyframes confetti-fall {
          0% {
            opacity: 1;
            transform: translateY(-100px) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: translateY(300px) rotate(720deg);
          }
        }
        `}
      </style>
    </Card>
  );
};

export default WelcomeBackCard;
