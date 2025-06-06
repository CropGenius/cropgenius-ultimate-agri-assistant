import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FieldHistory } from '@/types/field';
import { History, AlertCircle, RefreshCw } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface HistorySectionProps {
  history: FieldHistory[];
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  showAll?: boolean;
}

export function HistorySection({
  history = [],
  isLoading = false,
  error = null,
  onRetry,
  showAll = false,
}: HistorySectionProps) {
  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="p-6 space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error loading history</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>
            {error.message || 'Failed to load field history. Please try again.'}
          </p>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="mt-2"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  // Show empty state
  if (history.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg">
        <History className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
        <h3 className="text-lg font-medium text-muted-foreground">
          No history yet
        </h3>
        <p className="text-sm text-muted-foreground">
          Activities and changes will appear here.
        </p>
      </div>
    );
  }

  // Sort history by date (newest first)
  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Group history by date
  const groupedHistory = sortedHistory.reduce(
    (acc, record) => {
      const date = format(new Date(record.date), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(record);
      return acc;
    },
    {} as Record<string, FieldHistory[]>
  );

  // Limit to 5 most recent days if not showing all
  const displayHistory = showAll
    ? Object.entries(groupedHistory)
    : Object.entries(groupedHistory).slice(0, 5);

  return (
    <div className="space-y-6">
      {displayHistory.map(([date, records]) => (
        <div key={date} className="space-y-3">
          <div className="flex items-center">
            <h3 className="text-sm font-medium text-muted-foreground">
              {format(new Date(date), 'MMMM d, yyyy')}
            </h3>
            <div className="ml-4 h-px flex-1 bg-border" />
          </div>

          <div className="space-y-3">
            {records.map((record) => (
              <Card
                key={record.id}
                className="overflow-hidden hover:shadow-sm transition-shadow"
              >
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <div className="flex-shrink-0 mr-3 mt-0.5">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        </div>
                        <h3 className="font-medium capitalize">
                          {record.activityType
                            .replace(/([A-Z])/g, ' $1')
                            .trim()}
                        </h3>
                      </div>
                      <p className="text-xs text-muted-foreground ml-5 mt-0.5">
                        {formatDistanceToNow(new Date(record.date), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      <History className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  {record.notes && (
                    <div className="mt-2 pl-5 text-sm">
                      <p>{record.notes}</p>
                    </div>
                  )}

                  {record.details && Object.keys(record.details).length > 0 && (
                    <div className="mt-3 p-3 bg-muted/30 rounded text-xs border border-muted">
                      <ScrollArea className="max-h-40">
                        <pre className="whitespace-pre-wrap text-xs">
                          {JSON.stringify(record.details, null, 2)}
                        </pre>
                      </ScrollArea>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {!showAll && history.length > 5 && (
        <div className="text-center pt-2">
          <Button variant="ghost" size="sm" onClick={() => {}}>
            Show more history
          </Button>
        </div>
      )}
    </div>
  );
}
