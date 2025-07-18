import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WhatsAppMessage {
  id: string;
  message_content: string;
  message_type: string;
  sent_at: string;
  status: string;
}

export const WhatsAppIntegration: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isOptedIn, setIsOptedIn] = useState(false);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkOptInStatus();
    loadRecentMessages();
  }, []);

  const checkOptInStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('user_memory')
        .select('memory_data')
        .eq('user_id', user.id)
        .single();

      if (data?.memory_data?.whatsappOptIn) {
        setIsOptedIn(true);
        setPhoneNumber(data.memory_data.whatsappPhone || '');
      }
    } catch (error) {
      console.error('Error checking opt-in status:', error);
    }
  };

  const loadRecentMessages = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('sent_at', { ascending: false })
        .limit(10);

      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleOptIn = async () => {
    if (!phoneNumber.match(/^\+\d{10,15}$/)) {
      toast.error('Please enter a valid phone number with country code');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('user_memory')
        .upsert({
          user_id: user.id,
          memory_data: {
            whatsappOptIn: true,
            whatsappPhone: phoneNumber,
            optInDate: new Date().toISOString()
          }
        });

      setIsOptedIn(true);
      toast.success('WhatsApp notifications enabled!');
    } catch (error) {
      toast.error('Failed to enable WhatsApp notifications');
    } finally {
      setLoading(false);
    }
  };

  const sendTestMessage = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.functions.invoke('whatsapp-notification', {
        body: {
          userId: user.id,
          phone: phoneNumber,
          message: '🌱 Welcome to CropGenius! Your farming assistant is now active.',
          insightType: 'general'
        }
      });

      toast.success('Test message sent!');
      loadRecentMessages();
    } catch (error) {
      toast.error('Failed to send test message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📱 WhatsApp Farming Assistant
          {isOptedIn && <Badge variant="secondary">Active</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isOptedIn ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Get instant farming advice, weather alerts, and market updates via WhatsApp.
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="+254712345678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleOptIn} disabled={loading}>
                Enable WhatsApp
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Phone: {phoneNumber}</span>
              <Button size="sm" onClick={sendTestMessage} disabled={loading}>
                Send Test Message
              </Button>
            </div>
            
            {messages.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Recent Messages</h4>
                {messages.map((msg) => (
                  <div key={msg.id} className="p-2 bg-muted rounded text-sm">
                    <div className="flex justify-between items-start">
                      <span className="font-medium">{msg.message_type}</span>
                      <Badge variant={msg.status === 'sent' ? 'default' : 'destructive'}>
                        {msg.status}
                      </Badge>
                    </div>
                    <p className="mt-1">{msg.message_content}</p>
                    <span className="text-xs text-muted-foreground">
                      {new Date(msg.sent_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};