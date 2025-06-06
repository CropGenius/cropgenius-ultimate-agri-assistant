import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  className?: string;
  size?: number;
  text?: string;
}

export function LoadingSpinner({
  className = '',
  size = 24,
  text = 'Loading...',
}: LoadingSpinnerProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 ${className}`}
    >
      <Loader2
        className="animate-spin text-primary"
        style={{ width: size, height: size }}
      />
      {text && (
        <span className="mt-2 text-sm text-muted-foreground">{text}</span>
      )}
    </div>
  );
}

export function InlineLoadingSpinner({
  className = '',
  size = 16,
}: Omit<LoadingSpinnerProps, 'text'>) {
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <Loader2
        className="animate-spin text-primary"
        style={{ width: size, height: size }}
      />
    </div>
  );
}
