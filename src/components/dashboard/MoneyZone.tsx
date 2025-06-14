import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign, Zap, Crown, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface MoneyZoneProps {
  onUpgrade: () => void;
}

export default function MoneyZone({ onUpgrade }: MoneyZoneProps) {
  const proFeatures = [
    {
      icon: <TrendingUp className="h-5 w-5 text-green-600" />,
      title: "AI Market Predictions",
      description: "Get price forecasts 7 days ahead"
    },
    {
      icon: <Zap className="h-5 w-5 text-blue-600" />,
      title: "Weather Alerts",
      description: "Real-time notifications via WhatsApp"
    },
    {
      icon: <DollarSign className="h-5 w-5 text-purple-600" />,
      title: "Profit Optimizer",
      description: "Maximize your farm's profitability"
    }
  ];

  const marketInsights = [
    {
      crop: "Maize",
      price: "KSh 45/kg",
      change: "+12%",
      trend: "up"
    },
    {
      crop: "Beans",
      price: "KSh 120/kg", 
      change: "+8%",
      trend: "up"
    },
    {
      crop: "Tomatoes",
      price: "KSh 80/kg",
      change: "-3%",
      trend: "down"
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Market Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span>💰 Market Pulse</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {marketInsights.map((item, index) => (
              <motion.div
                key={item.crop}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <h4 className="font-medium text-gray-900">{item.crop}</h4>
                  <p className="text-sm text-gray-600">{item.price}</p>
                </div>
                <Badge 
                  className={`${
                    item.trend === 'up' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {item.change}
                </Badge>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Get detailed market analysis
                </p>
                <p className="text-xs text-blue-700">
                  Unlock 7-day price predictions
                </p>
              </div>
              <Button size="sm" onClick={onUpgrade} className="bg-blue-600 hover:bg-blue-700">
                <Crown className="h-3 w-3 mr-1" />
                Pro
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pro Upgrade */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Crown className="h-5 w-5 text-purple-600" />
            <span>🚀 CropGenius Pro</span>
            <Badge className="bg-purple-100 text-purple-800 text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-700 mb-4">
              Supercharge your farming with AI-powered insights and real-time alerts.
            </p>
            
            <div className="space-y-3">
              {proFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-3"
                >
                  <div className="mt-0.5">{feature.icon}</div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {feature.title}
                    </h4>
                    <p className="text-xs text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="pt-4 border-t border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-lg font-bold text-purple-900">KSh 500/month</p>
                  <p className="text-xs text-purple-700">Cancel anytime</p>
                </div>
                <Badge className="bg-green-100 text-green-800 text-xs">
                  Save 30%
                </Badge>
              </div>
              
              <Button 
                onClick={onUpgrade}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Pro
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              
              <p className="text-xs text-center text-gray-600 mt-2">
                Join 10,000+ farmers already using Pro
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
