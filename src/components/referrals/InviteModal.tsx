
import React, { useState } from 'react';
import { useMemoryStore } from '@/hooks/useMemoryStore';
import { useAuthContext as useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Gift, Users, Check, Loader2 } from 'lucide-react';

interface InviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const InviteModal = ({ open, onOpenChange }: InviteModalProps) => {
  const { user } = useAuth();
  const { memory, updateMemory } = useMemoryStore();
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'email' | 'phone'>('email');

  const sendInvite = async () => {
    if (!user) {
      toast.error("You must be logged in to send invites");
      return;
    }

    let contactInfo;
    if (activeTab === 'email') {
      if (!inviteEmail.trim() || !inviteEmail.includes('@')) {
        toast.error("Please enter a valid email address");
        return;
      }
      contactInfo = inviteEmail.trim();
    } else {
      if (!invitePhone.trim()) {
        toast.error("Please enter a valid phone number");
        return;
      }
      contactInfo = invitePhone.trim();
    }

    setIsLoading(true);
    try {
      // Store the invitation in Supabase
      const { error } = await supabase
        .from('referrals')
        .insert({
          inviter_id: user.id,
          invitee_contact: contactInfo,
          contact_type: activeTab,
          status: 'sent',
          created_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      // Update the user's invitation count in memory
      await updateMemory({
        invitesSent: (memory.invitesSent || 0) + 1
      });

      // Show success message
      toast.success(`Invitation sent to ${contactInfo}`, {
        description: "They'll receive a link to join CROPGenius"
      });

      // Calculate pro days earned
      const proDays = (memory.invitesSent || 0) * 7;
      
      // Close the modal
      onOpenChange(false);
      
      // Reset form
      setInviteEmail('');
      setInvitePhone('');
      
    } catch (error) {
      console.error("Error sending invite:", error);
      toast.error("Failed to send invitation", {
        description: "Please try again later"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-green-500" />
            Invite & Get Pro Features
          </DialogTitle>
          <DialogDescription>
            Invite friends to CROPGenius and unlock Pro features for both of you.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="font-medium">Friends invited: {memory.invitesSent || 0}</span>
            </div>
            
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
              {((memory.invitesSent || 0) * 7)} days Pro unlocked
            </div>
          </div>

          <Tabs 
            defaultValue="email" 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value as 'email' | 'phone')}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="phone">Phone</TabsTrigger>
            </TabsList>
            
            <TabsContent value="email">
              <div className="space-y-2">
                <Label htmlFor="email">Friend's Email Address</Label>
                <Input
                  id="email"
                  placeholder="farmer@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="phone">
              <div className="space-y-2">
                <Label htmlFor="phone">Friend's Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="+254712345678"
                  value={invitePhone}
                  onChange={(e) => setInvitePhone(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  They'll receive an SMS with your invite link
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={sendInvite} disabled={isLoading} className="gap-2">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Send Invite
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InviteModal;
