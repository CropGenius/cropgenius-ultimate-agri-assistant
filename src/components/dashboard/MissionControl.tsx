import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Droplets, Wheat, TrendingUp, AlertTriangle, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Action {
  id: string;
  title: string;
  description: string;
  type: 'water' | 'harvest' | 'market' | 'alert';
  urgent?: boolean;
}

interface MissionControlProps {
  actions: Action[];
  loading: boolean;
  title?: string;
  onComplete?: (taskId: string) => void;
}

export default function MissionControl({ actions, loading, title = "🧠 Today's Genius Actions", onComplete }: MissionControlProps) {
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  
  const handleTaskComplete = (taskId: string) => {
    // Add to completed tasks
    setCompletedTaskIds(prev => [...prev, taskId]);
    
    // Call the parent's onComplete handler after a short delay for animation
    setTimeout(() => {
      onComplete?.(taskId);
    }, 800);
  };
  
  // Force loading to false after 5 seconds to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.log('MissionControl: Force ending loading state after timeout');
        // This would normally update a state in the parent, but we can't do that from here
        // Instead, this is just a safety log to help debug if loading gets stuck
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [loading]);

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'water':
        return <Droplets className="h-5 w-5 text-blue-600" />;
      case 'harvest':
        return <Wheat className="h-5 w-5 text-green-600" />;
      case 'market':
        return <TrendingUp className="h-5 w-5 text-purple-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getActionColor = (type: string, urgent?: boolean) => {
    if (urgent) return 'border-red-200 bg-red-50';
    switch (type) {
      case 'water':
        return 'border-blue-200 bg-blue-50';
      case 'harvest':
        return 'border-green-200 bg-green-50';
      case 'market':
        return 'border-purple-200 bg-purple-50';
      default:
        return 'border-yellow-200 bg-yellow-50';
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-8 w-8 animate-spin text-green-500" />
        </div>
        <div className="space-y-3 px-2">
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-4 rounded-lg border border-gray-100 bg-gray-50 animate-pulse">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="mt-1">
                      <div className="h-5 w-5 bg-gray-200 rounded-full" />
                    </div>
                    <div className="flex-1">
                      <div className="h-5 w-32 bg-gray-200 rounded mb-2" />
                      <div className="h-3 w-48 bg-gray-200 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end px-4 pt-3">
        <Badge variant="outline" className="bg-gray-50 text-gray-600">{actions.length} actions</Badge>
      </div>
      <div className="p-4">
        {actions.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-lg font-medium">No actions for today. Great work!</p>
            <p className="text-sm text-gray-400 mt-1">Your farm is running smoothly!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {actions.map((action, index) => (
              <AnimatePresence key={action.id}>
                {!completedTaskIds.includes(action.id) ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className={`p-4 rounded-xl border ${action.urgent ? 'border-red-200 bg-red-50' : 'border-gray-100'} 
                               hover:shadow-md transition-all cursor-pointer group`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="mt-1 p-2 rounded-full bg-gray-100">
                          {getActionIcon(action.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-medium text-gray-900">{action.title}</h3>
                            {action.urgent && (
                              <Badge variant="destructive" className="text-xs font-normal">
                                URGENT
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{action.description}</p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleTaskComplete(action.id)}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 1, height: 'auto' }}
                    animate={{ opacity: 0, height: 0, marginBottom: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.5 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 rounded-lg border-2 border-green-200 bg-green-50 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <p className="font-medium text-green-800">Task completed!</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
