import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { WhatsAppIntegration } from '@/components/communication/WhatsAppIntegration';
import { MarketIntelligenceDashboard } from '@/components/market/MarketIntelligenceDashboard';
import { YieldPredictionPanel } from '@/components/ai/YieldPredictionPanel';
import { IntelligenceHubDashboard } from '@/components/intelligence/IntelligenceHubDashboard';
import { CreditManagementPanel } from '@/components/credits/CreditManagementPanel';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const BackendDashboard = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 space-y-4">
        <h1 className="text-3xl font-bold">🚀 CropGenius Backend Dashboard</h1>
        <p className="text-muted-foreground">Access all 47 backend features</p>
          <Button
            variant="secondary"
            onClick={async () => {
              try {
                const { error, data } = await supabase.functions.invoke('create_farm_tasks_policy_if_not_exists');
                if (error) throw error;
                toast.success(data?.message ?? 'Farm task RLS policy activated.');
              } catch (err: any) {
                if (err?.message?.includes('already')) {
                  toast.info('Policy already present.');
                } else {
                  toast.error('Policy activation failed', { description: err.message });
                }
              }
            }}
          >
            🔐 Activate Farm/Task RLS Policy
          </Button>
      </div>

      <Tabs defaultValue="intelligence" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="intelligence">🧠 Intelligence</TabsTrigger>
          <TabsTrigger value="market">💰 Market</TabsTrigger>
          <TabsTrigger value="whatsapp">📱 WhatsApp</TabsTrigger>
          <TabsTrigger value="yield">📊 Yield</TabsTrigger>
          <TabsTrigger value="credits">💳 Credits</TabsTrigger>
        </TabsList>

        <TabsContent value="intelligence" className="space-y-4">
          <IntelligenceHubDashboard />
        </TabsContent>

        <TabsContent value="market" className="space-y-4">
          <MarketIntelligenceDashboard />
        </TabsContent>

        <TabsContent value="whatsapp" className="space-y-4">
          <WhatsAppIntegration />
        </TabsContent>

        <TabsContent value="yield" className="space-y-4">
          <YieldPredictionPanel fieldId="sample-field-id" />
        </TabsContent>

        <TabsContent value="credits" className="space-y-4">
          <CreditManagementPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};