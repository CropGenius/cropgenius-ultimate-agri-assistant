
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useMemoryStore } from '@/hooks/useMemoryStore';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, Map, Sprout, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AIInsightAlert from './AIInsightAlert';
import { supabase } from '@/integrations/supabase/client';
import { AIInsightAlert as AIInsightAlertType } from '@/types/supabase';

const WelcomeSection = () => {
  const { user } = useAuth();
  const { memory, updateMemory, trackAIUsage } = useMemoryStore();
  const [timeOfDay, setTimeOfDay] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [insights, setInsights] = useState<AIInsightAlertType[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(false);

  useEffect(() => {
    // Get time of day
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('morning');
    else if (hour < 17) setTimeOfDay('afternoon');
    else setTimeOfDay('evening');

    // Format today's date
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    setDate(today.toLocaleDateString(undefined, options));

    // Update last login time
    if (user) {
      updateMemory({
        lastLogin: new Date().toISOString()
      });
    }
  }, [user]);

  // Get AI insights for the current user's fields
  useEffect(() => {
    const getInsights = async () => {
      if (!user) return;
      
      try {
        setInsightsLoading(true);
        
        // This would normally call an edge function that generates real insights
        // For now we're using sample insights
        const sampleInsights: AIInsightAlertType[] = [
          {
            title: "Rain Expected in 48 Hours",
            description: "Predicted 32mm rainfall for East Maize Field. Consider postponing fertilizer application.",
            type: "weather",
            actionText: "View Weather Details",
            actionPath: "/weather"
          },
          {
            title: "Maize Prices Rising",
            description: "Local market prices up 8% since last week. Consider selling within 14 days.",
            type: "market",
            actionText: "View Market Analysis",
            actionPath: "/market"
          },
          {
            title: "Fall Armyworm Risk Detected",
            description: "High risk in your area based on current conditions. Inspect South Field soon.",
            type: "pest",
            actionText: "View Pest Prevention Plan",
            actionPath: "/scan"
          }
        ];
        
        // In a real implementation, the insights would be fetched from Supabase edge function
        // based on actual field data, weather patterns, and market conditions
        setInsights(sampleInsights);

        // Track this as AI usage
        await trackAIUsage(30, 'insights');
      } catch (error) {
        console.error("Error fetching insights:", error);
      } finally {
        setInsightsLoading(false);
      }
    };
    
    getInsights();
  }, [user]);

  // If no user, show empty state
  if (!user) return null;

  const farmerName = memory?.farmerName || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Farmer';

  return (
    <section className="mb-6">
      {/* Welcome banner */}
      <div className="mb-4">
        <h1 className="text-xl font-semibold">Good {timeOfDay}, {farmerName}</h1>
        <p className="text-sm text-muted-foreground">{date}</p>
      </div>

      {/* AI Insights Section */}
      {insights.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium flex items-center gap-1">
              <Bot className="h-4 w-4 text-primary" />
              AI Field Insights
            </h2>
            <Link 
              to="/scan"
              className="text-xs text-muted-foreground hover:text-primary flex items-center gap-0.5"
            >
              All insights
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* AI Insight Cards */}
          <div>
            {insights.map((insight, index) => (
              <AIInsightAlert
                key={index}
                title={insight.title}
                description={insight.description}
                type={insight.type}
                actionText={insight.actionText}
                actionPath={insight.actionPath}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {!insights.length && !insightsLoading && (
        <Card className="mb-4 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex gap-3 items-start">
              <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-sm">AI needs more field data</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Add your first field to receive personalized AI insights about weather, pests, and market conditions.
                </p>
                <div className="flex gap-2 mt-3">
                  <Button asChild size="sm" className="h-8">
                    <Link to="/fields">
                      <Map className="mr-1.5 h-3.5 w-3.5" />
                      Add Field
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="h-8">
                    <Link to="/scan">
                      <Sprout className="mr-1.5 h-3.5 w-3.5" />
                      Try Crop Scanner
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
};

export default WelcomeSection;
