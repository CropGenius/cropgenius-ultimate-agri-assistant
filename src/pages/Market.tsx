import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';

const Market = () => {
  const marketData = [
    { crop: 'Maize', price: 45, change: +5.2, trend: 'up' },
    { crop: 'Wheat', price: 52, change: -2.1, trend: 'down' },
    { crop: 'Rice', price: 38, change: +3.8, trend: 'up' },
    { crop: 'Beans', price: 65, change: +1.5, trend: 'up' },
    { crop: 'Tomatoes', price: 28, change: -4.2, trend: 'down' },
  ];

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500 rounded-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Market Prices</h1>
            <p className="text-white/70">Real-time crop prices and trends</p>
          </div>
        </div>

        <div className="grid gap-4">
          {marketData.map((item) => (
            <Card key={item.crop} className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">{item.crop}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      <span className="text-lg font-bold text-white">{item.price}</span>
                      <span className="text-sm text-white/70">per kg</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`flex items-center gap-1 ${
                      item.trend === 'up' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {item.trend === 'up' ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      <span className="font-semibold">
                        {item.change > 0 ? '+' : ''}{item.change}%
                      </span>
                    </div>
                    <span className="text-xs text-white/50">24h change</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Market;