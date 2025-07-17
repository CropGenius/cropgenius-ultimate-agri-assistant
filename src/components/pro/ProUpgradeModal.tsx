
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMemoryStore } from '@/hooks/useMemoryStore';
import { 
  Zap, 
  CheckCircle2, 
  CloudSun, 
  Leaf, 
  BarChart4, 
  Languages, 
  Wifi, 
  MessageCircle,
  AlertTriangle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ProUpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant?: 'weather' | 'market' | 'yield' | 'standard';
}

const ProUpgradeModal = ({ 
  open, 
  onOpenChange,
  variant = 'standard' 
}: ProUpgradeModalProps) => {
  const { memory, activateProTrial } = useMemoryStore();
  
  const getProTriggerMessage = () => {
    switch (variant) {
      case 'weather':
        return "I detected critical weather changes affecting your crops. Pro users get hyperlocal forecasts and custom action plans.";
      case 'market':
        return "Market prices for your crops are fluctuating. Pro users receive detailed price analysis and optimal selling time predictions.";
      case 'yield':
        return `Farmers with ${memory.lastFieldCount || 1} fields saw 38% higher yields with Pro features. Unlock your farm's full potential.`;
      default:
        return "Unlock advanced AI farming features to increase your yields and maximize profits.";
    }
  };
  
  const getHighlightedFeature = () => {
    switch (variant) {
      case 'weather':
        return {
          icon: <CloudSun className="h-5 w-5 text-blue-500" />,
          title: "Hyperlocal Weather AI",
          description: "Field-specific forecasts and action plans"
        };
      case 'market':
        return {
          icon: <BarChart4 className="h-5 w-5 text-green-500" />,
          title: "Market Price Optimizer",
          description: "Know exact times to sell for maximum profit"
        };
      case 'yield':
        return {
          icon: <Leaf className="h-5 w-5 text-emerald-500" />,
          title: "Advanced Yield Predictions",
          description: "AI-powered harvest forecasting and optimization"
        };
      default:
        return {
          icon: <Zap className="h-5 w-5 text-amber-500" />,
          title: "Complete AI Farm Assistant",
          description: "All Pro features unlocked for your farm"
        };
    }
  };
  
  const handleUpgrade = async () => {
    // In a production app, this would connect to a payment processor
    toast.info("This would connect to a payment processor in production", {
      description: "For now, we'll activate a free trial"
    });
    
    // Activate a free trial
    await activateProTrial(7);
    onOpenChange(false);
  };
  
  const handleGetFreeTrial = async () => {
    // Open invite modal
    onOpenChange(false);
    
    // In a real app, this would open the invite modal
    toast.info("Invite friends to get a free trial", {
      description: "Each friend who joins gives you 7 days of Pro features",
      action: {
        label: "Invite Friends",
        onClick: () => {
          // This would trigger opening the invite modal
          console.log("Open invite modal");
        }
      }
    });
  };
  
  const highlightedFeature = getHighlightedFeature();
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-2 rounded-full">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <DialogTitle>Unlock GeniusGrow Pro</DialogTitle>
          </div>
          <DialogDescription>
            {getProTriggerMessage()}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Highlighted feature based on trigger */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/40 dark:to-emerald-900/40 p-4 rounded-lg border border-green-100 dark:border-green-800">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white dark:bg-gray-800 rounded-full">
                {highlightedFeature.icon}
              </div>
              <div>
                <h3 className="font-medium text-green-800 dark:text-green-300 flex items-center gap-2">
                  {highlightedFeature.title}
                  <Badge className="ml-1 bg-green-200 text-green-800 border-0">
                    Pro
                  </Badge>
                </h3>
                <p className="text-sm text-green-700 dark:text-green-400">
                  {highlightedFeature.description}
                </p>
              </div>
            </div>
          </div>
          
          {/* Pro features list */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">All Pro features include:</h4>
            
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">Hyperlocal weather AI with 3-hour precision</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">Advanced pest & disease alerts with treatments</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">Market price predictions & profit optimization</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">WhatsApp AI notifications with voice support</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">Offline mode with full functionality</span>
              </div>
            </div>
            
            <div className="bg-amber-50 dark:bg-amber-900/30 p-3 rounded-lg border border-amber-100 dark:border-amber-900 mt-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  <span className="font-medium">Farmers report:</span> Up to 38% higher yields and 25% higher profits using GeniusGrow Pro
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-col gap-2">
          <Button
            className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white"
            onClick={handleUpgrade}
          >
            <Zap className="h-4 w-4 mr-2" />
            Upgrade to Pro Now
          </Button>
          
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGetFreeTrial}
          >
            Get 7 Days Free by Inviting Friends
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProUpgradeModal;
