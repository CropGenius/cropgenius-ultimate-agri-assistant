import { Alert, AlertDescription } from '@/components/ui/alert';
import { Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGrowthEngine } from '@/providers/GrowthEngineProvider';
import { useAuthContext } from '@/providers/AuthProvider';

export default function LowCreditBanner({ credits }: { credits: number }) {
  const { user } = useAuthContext();
  const { trigger_referral_funnel } = useGrowthEngine();

  if (!user) return null;

  const handleInvite = () => trigger_referral_funnel(user.id);

  return (
    <Alert variant="destructive" className="flex items-center justify-between animate-pulse mb-2">
      <div className="flex items-center gap-2">
        <Flame className="h-4 w-4 text-red-600" />
        <AlertDescription>
          Only {credits} free AI questions left. Invite friends or upgrade.
        </AlertDescription>
      </div>
      <Button size="sm" onClick={handleInvite}>
        Invite Friends
      </Button>
    </Alert>
  );
} 