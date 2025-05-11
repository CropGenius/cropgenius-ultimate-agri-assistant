
import React from 'react';
import { Sparkles, Zap, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMemoryStore } from '@/hooks/useMemoryStore';
import { useNavigate } from 'react-router-dom';

interface MoneyZoneProps {
  onUpgrade?: () => void;
}

export default function MoneyZone({ onUpgrade }: MoneyZoneProps) {
  const { memory } = useMemoryStore();
  const isProUser = memory?.isPro;
  const navigate = useNavigate();
  
  if (isProUser) {
    return null; // Don't show to Pro users
  }

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      navigate("/referrals");
    }
  };

  return (
    <div className="px-4 mt-6 pb-5">
      <Card className="bg-gradient-to-r from-emerald-600 to-green-500 text-white overflow-hidden relative">
        {/* Animated glow effect */}
        <div className="absolute -top-10 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-8 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        
        <CardContent className="p-4 relative">
          <div className="flex items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-yellow-300" />
                <Badge className="bg-white/20 hover:bg-white/30">7-day free trial</Badge>
              </div>
              
              <h3 className="text-lg font-semibold mb-1">
                Unlock Smart Forecasts + AI Support
              </h3>
              
              <p className="text-sm text-white/80 mb-3">
                Join 5,000+ farmers using CropGenius Pro
              </p>
              
              <Button 
                className="bg-white text-green-700 hover:bg-white/90 flex items-center gap-2"
                onClick={handleUpgrade}
              >
                <Zap className="h-4 w-4" />
                Go Pro
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
