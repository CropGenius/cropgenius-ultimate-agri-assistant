import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cropGeniusIntelligenceHub, FarmIntelligenceRequest } from '@/services/CropGeniusIntelligenceHub';
import { supabase } from '@/services/supabaseClient';
import { toast } from 'sonner';

interface FarmAlert {
  type: string;
  severity: string;
  message: string;
  action_required: boolean;
  estimated_impact: string;
}

interface IntelligenceData {
  overall_farm_health: number;
  priority_alerts: FarmAlert[];
  recommendations: {
    immediate_actions: string[];
    short_term_planning: string[];
    economic_opportunities: string[];
  };
  economic_summary: {
    potential_revenue_impact: number;
    recommended_investments: number;
  };
}

export const IntelligenceHubDashboard: React.FC = () => {
  const [intelligence, setIntelligence] = useState<IntelligenceData | null>(null);
  const [loading, setLoading] = useState(false);

  const runComprehensiveAnalysis = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const request: FarmIntelligenceRequest = {
        farmer_id: user.id,
        farm_location: { lat: -1.2921, lng: 36.8219, country: 'Kenya', region: 'Central' },
        crops: ['maize', 'beans', 'tomato'],
        analysis_type: 'comprehensive',
        priority: 'high'
      };

      const result = await cropGeniusIntelligenceHub.analyzeFarm(request);
      setIntelligence(result);
      toast.success('Farm analysis completed!');
    } catch (error) {
      console.error('Error running analysis:', error);
      toast.error('Failed to complete farm analysis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>🧠 Intelligence Hub</CardTitle>
          <Button onClick={runComprehensiveAnalysis} disabled={loading}>
            {loading ? 'Analyzing...' : 'Run Analysis'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {intelligence ? (
          <div className="space-y-6">
            <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
              <div className="text-4xl font-bold text-green-600">
                {intelligence.overall_farm_health}%
              </div>
              <div className="text-sm text-muted-foreground">Farm Health Score</div>
              <Progress value={intelligence.overall_farm_health} className="w-48 mx-auto mt-3" />
            </div>
            {intelligence.priority_alerts.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold">🚨 Priority Alerts</h3>
                {intelligence.priority_alerts.slice(0, 3).map((alert, index) => (
                  <Alert key={index}>
                    <AlertDescription>{alert.message}</AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🧠</div>
            <h3 className="text-lg font-medium mb-2">AI-Powered Farm Intelligence</h3>
            <p className="text-sm text-muted-foreground">
              Comprehensive analysis of farm health, risks, and opportunities
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};