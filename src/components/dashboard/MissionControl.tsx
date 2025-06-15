import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Droplets, Wheat, TrendingUp, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

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
}

export default function MissionControl({ actions, loading }: MissionControlProps) {
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
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>🧠 Today's Genius Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>🧠 Today's Genius Actions</span>
          <Badge variant="secondary">{actions.length} actions</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {actions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No urgent actions needed right now</p>
            <p className="text-sm">Your farm is running smoothly!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {actions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border-2 ${getActionColor(action.type, action.urgent)} 
                           hover:shadow-md transition-all cursor-pointer group`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="mt-1">
                      {getActionIcon(action.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{action.title}</h3>
                        {action.urgent && (
                          <Badge variant="destructive" className="text-xs">
                            URGENT
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
