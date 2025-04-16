
import React, { useState } from 'react';
import { useMemoryStore } from '@/hooks/useMemoryStore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { MessageCircle, Loader2 } from 'lucide-react';

interface WhatsAppOptInProps {
  onClose?: () => void;
}

const WhatsAppOptIn = ({ onClose }: WhatsAppOptInProps) => {
  const { memory, setWhatsAppPreference } = useMemoryStore();
  const [optIn, setOptIn] = useState(memory.whatsappOptIn || false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (optIn && !phoneNumber) {
      toast.error("Please enter your WhatsApp number");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real implementation, this would store the phone number in a secure location
      // and register it with WhatsApp Business API or Twilio
      await setWhatsAppPreference(optIn);
      
      if (optIn) {
        toast.success("AI WhatsApp alerts activated!", {
          description: "You'll receive personalized farm insights via WhatsApp"
        });
      } else {
        toast.info("WhatsApp alerts disabled", {
          description: "You won't receive alerts via WhatsApp"
        });
      }
      
      if (onClose) onClose();
    } catch (error) {
      toast.error("Failed to update WhatsApp preferences", {
        description: "Please try again later"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-green-600" />
          AI WhatsApp Alerts
        </CardTitle>
        <CardDescription>
          Get timely, personalized AI farm insights sent directly to WhatsApp
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-medium">Enable WhatsApp Alerts</h3>
              <p className="text-sm text-muted-foreground">
                Receive AI insights about weather changes, pest alerts and more
              </p>
            </div>
            <Switch
              checked={optIn}
              onCheckedChange={setOptIn}
            />
          </div>
          
          {optIn && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Your WhatsApp Number</label>
              <input 
                type="tel" 
                placeholder="+254 700 000000"
                className="w-full p-2 border rounded-md"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Include country code, e.g. +254 for Kenya
              </p>
            </div>
          )}
          
          <div className="bg-amber-50 p-3 rounded-md border border-amber-100">
            <h4 className="text-sm font-medium text-amber-800">Types of alerts you'll receive:</h4>
            <ul className="text-sm text-amber-700 mt-1 space-y-1">
              <li>• Critical weather changes affecting your crops</li>
              <li>• Pest and disease alerts in your region</li>
              <li>• Market price opportunities for your crops</li>
              <li>• Optimal times for planting and harvesting</li>
            </ul>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end gap-3">
          {onClose && (
            <Button 
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          
          <Button 
            type="submit"
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Preferences'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default WhatsAppOptIn;
