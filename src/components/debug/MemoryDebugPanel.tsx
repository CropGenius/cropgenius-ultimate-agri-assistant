import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { simulateMemoryScenarios, logCurrentMemory } from '@/utils/devMemory';
import { useMemoryStore } from '@/hooks/useMemoryStore';

const MemoryDebugPanel = () => {
  const { memory, syncMemory, resetMemory } = useMemoryStore();
  const [isVisible, setIsVisible] = useState(false);
  const [memorySnapshot, setMemorySnapshot] = useState<any>(null);

  const refreshMemorySnapshot = async () => {
    const snapshot = await logCurrentMemory();
    setMemorySnapshot(snapshot);
  };

  useEffect(() => {
    refreshMemorySnapshot();
  }, [memory]);

  if (!isVisible) {
    return (
      <div className="fixed bottom-20 right-4 z-40">
        <Button
          size="sm"
          variant="secondary"
          className="px-2 py-1 h-auto text-xs"
          onClick={() => setIsVisible(true)}
        >
          Memory Debug
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 z-40 w-80 max-h-[500px] overflow-y-auto">
      <Card className="shadow-lg border-gray-200 dark:border-gray-700">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Memory Debug Panel</CardTitle>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={() => setIsVisible(false)}
            >
              ×
            </Button>
          </div>
          <CardDescription className="text-xs">
            Developer tools for memory system
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3 pt-0 pb-2 text-xs">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">Current Memory State:</span>
              <Badge variant="outline" className="text-[10px]">
                {memory.syncStatus}
              </Badge>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded p-2 max-h-32 overflow-y-auto text-xs font-mono">
              {JSON.stringify(memorySnapshot || memory, null, 2)}
            </div>
          </div>

          <div className="space-y-1">
            <p className="font-medium">Simulate user types:</p>
            <div className="grid grid-cols-2 gap-1">
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs w-full"
                onClick={() =>
                  simulateMemoryScenarios.newUser().then(refreshMemorySnapshot)
                }
              >
                New User
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs w-full"
                onClick={() =>
                  simulateMemoryScenarios
                    .returningUser()
                    .then(refreshMemorySnapshot)
                }
              >
                Returning User
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs w-full"
                onClick={() =>
                  simulateMemoryScenarios
                    .powerUser()
                    .then(refreshMemorySnapshot)
                }
              >
                Power User
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs w-full"
                onClick={() =>
                  simulateMemoryScenarios
                    .referredUser()
                    .then(refreshMemorySnapshot)
                }
              >
                Referred User
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs w-full"
                onClick={() =>
                  simulateMemoryScenarios
                    .offlineUser()
                    .then(refreshMemorySnapshot)
                }
              >
                Offline User
              </Button>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-0 flex gap-2">
          <Button
            size="sm"
            variant="destructive"
            className="h-7 text-xs flex-1"
            onClick={() => resetMemory()}
          >
            Reset
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-7 text-xs flex-1"
            onClick={() => syncMemory().then(refreshMemorySnapshot)}
          >
            Sync Now
          </Button>
          <Button
            size="sm"
            variant="default"
            className="h-7 text-xs flex-1"
            onClick={refreshMemorySnapshot}
          >
            Refresh
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default MemoryDebugPanel;
