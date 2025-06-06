import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  ArrowDownRight,
  ArrowUpRight,
  TrendingUp,
  CircleDollarSign,
  Wheat,
  BarChart3,
} from 'lucide-react';

interface MarketImpactProps {
  location: {
    lat: number;
    lng: number;
    name: string;
  };
  crops: string[];
}

export default function MarketImpact({ location, crops }: MarketImpactProps) {
  const [marketData, setMarketData] = useState<any[]>([]);

  useEffect(() => {
    // In a real app, we would fetch real market impact data based on weather and location
    // This is a simulation with sample data
    generateMarketData();
  }, [location, crops]);

  const generateMarketData = () => {
    const defaultCrops =
      crops.length > 0 ? crops : ['Maize', 'Beans', 'Coffee'];

    const weatherImpacts = [
      {
        type: 'Heavy Rainfall',
        probability: 65,
        marketEffect:
          'Delayed harvests expected to cause temporary price increases',
      },
      {
        type: 'Drought Risk',
        probability: 20,
        marketEffect:
          'Current stocks adequate, but prices may rise if drought persists',
      },
      {
        type: 'Optimal Conditions',
        probability: 15,
        marketEffect:
          'Ideal growing conditions may lead to surplus and price decreases',
      },
    ];

    // Pick one weather impact based on weighted probability
    const rand = Math.random() * 100;
    let cumulativeProbability = 0;
    let selectedImpact;

    for (const impact of weatherImpacts) {
      cumulativeProbability += impact.probability;
      if (rand <= cumulativeProbability) {
        selectedImpact = impact;
        break;
      }
    }

    const generatedData = defaultCrops.map((crop) => {
      // Base price change on the selected weather impact
      let priceChange;
      let trend;

      if (selectedImpact.type === 'Heavy Rainfall') {
        priceChange = 5 + Math.random() * 10;
        trend = 'up';
      } else if (selectedImpact.type === 'Drought Risk') {
        priceChange = 2 + Math.random() * 8;
        trend = 'up';
      } else {
        priceChange = 2 + Math.random() * 5;
        trend = 'down';
      }

      // Add some variation per crop
      if (crop === 'Coffee' && selectedImpact.type === 'Heavy Rainfall') {
        priceChange = 2 + Math.random() * 5;
        trend = 'down';
      }

      return {
        crop,
        priceChange: priceChange,
        trend: trend,
        timeframe: Math.floor(7 + Math.random() * 14),
        reason: `${selectedImpact.type} - ${selectedImpact.marketEffect}`,
      };
    });

    setMarketData(generatedData);
  };

  return (
    <div className="space-y-4">
      {marketData.map((item, index) => (
        <div key={index} className="flex items-start space-x-3">
          <div
            className={`p-2 rounded-full ${item.trend === 'up' ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300'}`}
          >
            {item.trend === 'up' ? (
              <ArrowUpRight className="h-4 w-4" />
            ) : (
              <ArrowDownRight className="h-4 w-4" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">{item.crop}</h4>
              <Badge
                className={item.trend === 'up' ? 'bg-green-500' : 'bg-red-500'}
              >
                {item.trend === 'up' ? '+' : '-'}
                {item.priceChange.toFixed(1)}%
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{item.reason}</p>
            <p className="text-xs mt-1">
              <span className="text-muted-foreground">Expected within: </span>
              <span className="font-medium">{item.timeframe} days</span>
            </p>
          </div>
        </div>
      ))}

      <div className="pt-3 mt-3 border-t">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <BarChart3 className="h-4 w-4" />
            <span>AI Market Analysis</span>
          </div>
          <Badge variant="outline" className="text-xs">
            Updated 2h ago
          </Badge>
        </div>
      </div>
    </div>
  );
}
