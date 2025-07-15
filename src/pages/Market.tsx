import React from 'react';
import Layout from '@/components/Layout';
import { MarketIntelligenceDashboard } from '@/components/market/MarketIntelligenceDashboard';
import { Button } from '@/components/ui/button';
import { BarChart3, TestTube } from 'lucide-react';
import { testMarketIntelligence } from '@/utils/testMarketIntelligence';
import { toast } from 'sonner';

const Market = () => {
  const handleTestMarketIntelligence = async () => {
    toast.info('Testing Market Intelligence System...');
    try {
      const result = await testMarketIntelligence();
      if (result.success) {
        toast.success('Market Intelligence Test Passed!', {
          description: result.message
        });
      } else {
        toast.error('Market Intelligence Test Failed', {
          description: result.error
        });
      }
    } catch (error) {
      toast.error('Test Error', {
        description: String(error)
      });
    }
  };

  return (
    <Layout>
      <div className="p-4 space-y-4 pb-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Market Intelligence</h1>
              <p className="text-sm text-white/70">Real-time market data from database</p>
            </div>
          </div>
          {import.meta.env.DEV && (
            <Button 
              onClick={handleTestMarketIntelligence}
              size="sm"
              variant="outline"
              className="glass-btn"
            >
              <TestTube className="w-4 h-4 mr-2" />
              Test System
            </Button>
          )}
        </div>

        {/* Real Market Intelligence Dashboard */}
        <MarketIntelligenceDashboard />
      </div>
    </Layout>
  );
};

export default Market;