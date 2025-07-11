import { useCredits } from '@/hooks/useCredits';
import { Sparkles, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const CreditBadge = () => {
  const { balance, isLoading, error } = useCredits();
  const formatted = new Intl.NumberFormat().format(balance);

  if (isLoading) {
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Loading...</span>
      </Badge>
    );
  }

  if (error) {
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        Error
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="flex items-center gap-1 font-semibold">
      <Sparkles className="h-3 w-3 text-yellow-500" />
      <span>{formatted} Credits</span>
    </Badge>
  );
};