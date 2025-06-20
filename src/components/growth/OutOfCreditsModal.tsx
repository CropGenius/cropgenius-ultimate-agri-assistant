import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { useAuthContext } from '@/providers/AuthProvider';
import { useGrowthEngine } from '@/providers/GrowthEngineProvider';

export default function OutOfCreditsModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuthContext();
  const { trigger_referral_funnel } = useGrowthEngine();

  const handleShare = () => {
    if (!user) return;
    trigger_referral_funnel(user.id);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md text-center">
        <DialogHeader>
          <DialogTitle>You're out of credits ⚠️</DialogTitle>
        </DialogHeader>
        <p className="mb-4">Help 3 friends map their farm and earn 10 more credits.</p>
        <Button className="w-full flex items-center gap-2" onClick={handleShare}>
          <Share2 className="h-4 w-4" /> Share Now
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  );
} 