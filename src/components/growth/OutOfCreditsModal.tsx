import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useGrowthEngine } from '@/providers/GrowthEngineProvider';

export default function OutOfCreditsModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const { trigger_referral_funnel } = useGrowthEngine();

  const handleShare = () => {
    if (!user) return;
    trigger_referral_funnel(user.id);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        className="max-w-md text-center"
        aria-describedby="out-of-credits-description"
      >
        <DialogHeader>
          <DialogTitle>You're out of credits ⚠️</DialogTitle>
          <DialogDescription id="out-of-credits-description">
            Help 3 friends map their farm and earn 10 more credits.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter>
          <Button className="w-full flex items-center gap-2" onClick={handleShare}>
            <Share2 className="h-4 w-4" /> Share Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}