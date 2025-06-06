import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  ArrowRight,
  Calendar,
  TrendingUp,
  Smartphone,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMemoryStore } from '@/hooks/useMemoryStore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface MoneyZoneProps {
  onUpgrade?: () => void;
}

export default function MoneyZone({ onUpgrade }: MoneyZoneProps) {
  const { memory, checkProStatus } = useMemoryStore();
  const { isActive: isProUser } = checkProStatus();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: 'AI Planning',
      description: 'Plan your season in minutes',
      icon: <Calendar className="h-5 w-5 text-primary" />,
    },
    {
      title: 'Market Insight',
      description: 'Sell high, never guess again',
      icon: <TrendingUp className="h-5 w-5 text-green-500" />,
    },
    {
      title: 'Offline Mode',
      description: 'Access insights anywhere',
      icon: <Smartphone className="h-5 w-5 text-amber-500" />,
    },
  ];

  if (isProUser) {
    return null; // Don't show to Pro users
  }

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      navigate('/referrals');
    }
  };

  const handleSlideChange = (index: number) => {
    setCurrentSlide(index);
  };

  // Calculate time remaining for the free trial (days, hours, minutes)
  const daysRemaining = 5;
  const hoursRemaining = 22;
  const minutesRemaining = 10;

  return (
    <div className="px-4 mt-6 pb-5">
      <Card className="bg-gradient-to-r from-indigo-600 to-violet-500 text-white overflow-hidden relative">
        {/* Animated glow effect */}
        <div className="absolute -top-10 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-8 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>

        <CardContent className="p-4 relative group" onClick={handleUpgrade}>
          <div className="mb-2 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
              <Badge className="bg-white/20 hover:bg-white/30 group-hover:bg-white/40 transition-all">
                7-day free trial
              </Badge>
            </div>

            <Badge
              variant="outline"
              className="bg-black/20 text-white text-xs border-white/40 font-mono"
            >
              {daysRemaining}d:{hoursRemaining}h:{minutesRemaining}m
            </Badge>
          </div>

          <h3 className="text-lg font-bold mb-1 group-hover:translate-x-0.5 transition-transform">
            CropGenius Pro = Bigger Yields, Smarter Sales
          </h3>

          <div className="mt-3 mb-5 flex space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'bg-white w-4' : 'bg-white/40 w-1.5'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSlideChange(index);
                }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 mb-3"
          >
            <div className="p-2 rounded-full bg-white/20">
              {slides[currentSlide].icon}
            </div>
            <div>
              <p className="font-semibold">{slides[currentSlide].title}</p>
              <p className="text-sm text-white/80">
                {slides[currentSlide].description}
              </p>
            </div>
          </motion.div>

          {/* Testimonial */}
          <div className="bg-white/10 p-2 rounded-md text-sm mb-4 border border-white/10">
            <p className="font-medium">₦280,000 extra from Pro</p>
            <p className="text-xs text-white/80">— Ayodele, Enugu</p>
          </div>

          <Button
            className="w-full bg-white text-violet-700 hover:bg-white/90 flex items-center justify-center gap-2 group-hover:shadow-lg transition-all"
            onClick={handleUpgrade}
          >
            <Zap className="h-4 w-4" />
            Start My Free Trial Now
            <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
