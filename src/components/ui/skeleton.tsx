import { cn } from "@/lib/utils"

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div 
      className={cn('relative overflow-hidden rounded-md bg-muted animate-pulse', className)} 
      role="img"
      aria-label="Loading"
    />
  );
}

export { Skeleton }
