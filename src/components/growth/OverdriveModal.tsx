import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useGrowthEngine } from '@/providers/GrowthEngineProvider';
import { useAuthContext } from '@/providers/AuthProvider';
import { Clock3 } from 'lucide-react';

export default function OverdriveModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuthContext();
  const { activate_overdrive } = useGrowthEngine();

  if (!user) return null;

  const handleActivate = () => {
    activate_overdrive(user.id);
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md text-center">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 justify-center">
            <Clock3 className="h-4 w-4" /> AI Overdrive Mode
          </DialogTitle>
        </DialogHeader>
        <p className="mb-4">
          2x faster insights, priority queue access, rainfall predictor unlocked — 10 credits only.
          Offer ends in 24h.
        </p>
        <DialogFooter>
          <Button className="w-full" onClick={handleActivate}>Activate Now</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}