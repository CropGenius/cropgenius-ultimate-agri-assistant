import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  CheckCircle2, 
  Users, 
  Star, 
  Award, 
  Verified,
  TrendingUp,
  Clock,
  MapPin,
  Sparkles,
  Heart,
  Eye,
  Lock,
  Zap
} from 'lucide-react';

interface TrustMetric {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

interface TestimonialData {
  name: string;
  location: string;
  avatar: string;
  rating: number;
  text: string;
  crop: string;
  improvement: string;
}

interface TrustIndicatorsProps {
  accuracy?: number;
  totalUsers?: number;
  successRate?: number;
  lastUpdated?: string;
  verificationLevel?: 'basic' | 'verified' | 'premium';
  showTestimonials?: boolean;
  showLiveStats?: boolean;
}

export const TrustIndicators: React.FC<TrustIndicatorsProps> = ({
  accuracy = 99.7,
  totalUsers = 12847,
  successRate = 94.2,
  lastUpdated = '2 minutes ago',
  verificationLevel = 'verified',
  showTestimonials = true,
  showLiveStats = true
}) => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [liveUserCount, setLiveUserCount] = useState(totalUsers);

  const trustMetrics: TrustMetric[] = [
    {
      label: 'AI Accuracy',
      value: `${accuracy}%`,
      icon: <Sparkles className="h-4 w-4" />,
      color: 'text-emerald-600',
      description: 'Verified by agricultural experts'
    },
    {
      label: 'Active Farmers',
      value: liveUserCount.toLocaleString(),
      icon: <Users className="h-4 w-4" />,
      color: 'text-blue-600',
      description: 'Trust our platform daily'
    },
    {
      label: 'Success Rate',
      value: `${successRate}%`,
      icon: <TrendingUp className="h-4 w-4" />,
      color: 'text-purple-600',
      description: 'Farmers see improved yields'
    },
    {
      label: 'Response Time',
      value: '< 2s',
      icon: <Zap className="h-4 w-4" />,
      color: 'text-orange-600',
      description: 'Lightning-fast AI analysis'
    }
  ];

  const testimonials: TestimonialData[] = [
    {
      name: 'James Mwangi',
      location: 'Nakuru, Kenya',
      avatar: '👨🏿‍🌾',
      rating: 5,
      text: 'CropGenius saved my maize crop! The AI detected blight 2 weeks before I noticed.',
      crop: 'Maize',
      improvement: '+35% yield'
    },
    {
      name: 'Fatima Hassan',
      location: 'Kano, Nigeria',
      avatar: '👩🏿‍🌾',
      rating: 5,
      text: 'Weather predictions are incredibly accurate. I time my planting perfectly now.',
      crop: 'Tomatoes',
      improvement: '+28% profit'
    },
    {
      name: 'Samuel Osei',
      location: 'Kumasi, Ghana',
      avatar: '👨🏿‍🌾',
      rating: 5,
      text: 'Market insights helped me sell at the perfect time. Made 40% more this season!',
      crop: 'Cocoa',
      improvement: '+40% revenue'
    }
  ];

  const getVerificationBadge = () => {
    switch (verificationLevel) {
      case 'premium':
        return {
          icon: <Award className="h-4 w-4 text-yellow-500" />,
          text: 'Premium Verified',
          color: 'bg-gradient-to-r from-yellow-400 to-orange-500',
          description: 'Highest level of AI accuracy and support'
        };
      case 'verified':
        return {
          icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
          text: 'AI Verified',
          color: 'bg-gradient-to-r from-emerald-400 to-green-500',
          description: 'Trusted by agricultural experts worldwide'
        };
      default:
        return {
          icon: <Shield className="h-4 w-4 text-blue-500" />,
          text: 'Secure',
          color: 'bg-gradient-to-r from-blue-400 to-cyan-500',
          description: 'Your data is protected and private'
        };
    }
  };

  const verificationBadge = getVerificationBadge();

  // Simulate live user count updates
  useEffect(() => {
    if (showLiveStats) {
      const interval = setInterval(() => {
        setLiveUserCount(prev => prev + Math.floor(Math.random() * 3));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [showLiveStats]);

  // Auto-rotate testimonials
  useEffect(() => {
    if (showTestimonials) {
      const interval = setInterval(() => {
        setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [showTestimonials, testimonials.length]);

  return (
    <div className="space-y-6">
      {/* Verification Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center justify-center"
      >
        <div className={`${verificationBadge.color} text-white px-4 py-2 rounded-full flex items-center space-x-2 shadow-lg`}>
          {verificationBadge.icon}
          <span className="text-sm font-semibold">{verificationBadge.text}</span>
        </div>
      </motion.div>

      {/* Trust Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        {trustMetrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/80 backdrop-blur-md rounded-xl p-4 border border-white/30"
          >
            <div className="flex items-center space-x-2 mb-2">
              <div className={`p-1.5 rounded-lg bg-gray-100 ${metric.color}`}>
                {metric.icon}
              </div>
              <span className="text-xs font-medium text-gray-600">{metric.label}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</p>
            <p className="text-xs text-gray-500">{metric.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Live Activity Indicator */}
      {showLiveStats && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200/50"
        >
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-3 h-3 bg-green-500 rounded-full"
              />
              <span className="text-sm font-medium text-green-700">Live Activity</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-green-600">
              <Eye className="h-3 w-3" />
              <span>{Math.floor(Math.random() * 50) + 20} farmers online now</span>
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2">
            <Clock className="h-3 w-3 inline mr-1" />
            Data updated {lastUpdated}
          </p>
        </motion.div>
      )}

      {/* Security & Privacy */}
      <div className="bg-white/60 backdrop-blur-md rounded-xl p-4 border border-white/30">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Lock className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Your Data is Safe</h4>
            <p className="text-xs text-gray-600">End-to-end encryption • GDPR compliant</p>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Security Level</span>
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
            ))}
            <span className="text-gray-700 font-medium ml-1">Enterprise</span>
          </div>
        </div>
      </div>

      {/* Testimonials Carousel */}
      {showTestimonials && (
        <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 border border-white/30">
          <div className="flex items-center space-x-2 mb-4">
            <Heart className="h-5 w-5 text-red-500" />
            <h4 className="font-semibold text-gray-900">Farmer Success Stories</h4>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTestimonial}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-start space-x-3">
                <div className="text-2xl">{testimonials[currentTestimonial].avatar}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h5 className="font-semibold text-gray-900">{testimonials[currentTestimonial].name}</h5>
                    <div className="flex items-center space-x-1">
                      {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
                    <MapPin className="h-3 w-3" />
                    <span>{testimonials[currentTestimonial].location}</span>
                    <span>•</span>
                    <span>{testimonials[currentTestimonial].crop}</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">"{testimonials[currentTestimonial].text}"</p>
                  <div className="inline-flex items-center space-x-1 bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-medium">
                    <TrendingUp className="h-3 w-3" />
                    <span>{testimonials[currentTestimonial].improvement}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Testimonial Dots */}
          <div className="flex items-center justify-center space-x-2 mt-4">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentTestimonial ? 'bg-emerald-500 w-6' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Trust Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center"
      >
        <p className="text-sm text-gray-600">
          Trusted by <span className="font-semibold text-emerald-600">{totalUsers.toLocaleString()}+</span> farmers across Africa
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {verificationBadge.description}
        </p>
      </motion.div>
    </div>
  );
};

export default TrustIndicators;