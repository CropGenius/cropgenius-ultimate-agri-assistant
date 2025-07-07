import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cropGeniusIntelligenceHub } from '@/services/CropGeniusIntelligenceHub';
import { supabase } from '@/services/supabaseClient';

export const IntelligenceHubDashboard = () => {
  const [intelligence, setIntelligence] = useState(null);
  const [loading, setLoading] = useState(false);

  const runAnalysis = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const result = await cropGeniusIntelligenceHub.analyzeFarm({
      farmer_id: user.id,
      farm_location: { lat: -1.2921, lng: 36.8219, country: 'Kenya' },
      crops: ['maize', 'beans'],
      analysis_type: 'comprehensive',
      priority: 'high'
    });
    setIntelligence(result);
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>🧠 Intelligence Hub</CardTitle>
        <Button onClick={runAnalysis} disabled={loading}>
          {loading ? 'Analyzing...' : 'Run Analysis'}
        </Button>
      </CardHeader>
      <CardContent>
        {intelligence ? (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{intelligence.overall_farm_health}%</div>
              <Progress value={intelligence.overall_farm_health} />
            </div>
            {intelligence.priority_alerts?.map((alert, i) => (
              <Alert key={i}>
                <AlertDescription>{alert.message}</AlertDescription>
              </Alert>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🧠</div>
            <p>AI-Powered Farm Intelligence</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};