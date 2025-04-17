
import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CloudSun, 
  ShoppingCart, 
  Bug, 
  Sprout, 
  ArrowRight 
} from 'lucide-react';
import { AIInsightAlert as AIInsightAlertType } from '@/types/supabase';

// Uses the AIInsightAlert type from types/supabase.ts
export interface AIInsightAlertProps extends AIInsightAlertType {}

const AIInsightAlert = ({ 
  title, 
  description, 
  type, 
  actionText, 
  actionPath 
}: AIInsightAlertProps) => {
  
  // Determine icon based on insight type
  const renderIcon = () => {
    switch (type) {
      case 'weather':
        return <CloudSun className="h-5 w-5 text-blue-500" />;
      case 'market':
        return <ShoppingCart className="h-5 w-5 text-green-500" />;
      case 'pest':
        return <Bug className="h-5 w-5 text-red-500" />;
      case 'fertilizer':
        return <Sprout className="h-5 w-5 text-emerald-500" />;
      default:
        return <CloudSun className="h-5 w-5 text-blue-500" />;
    }
  };
  
  // Determine background color based on insight type
  const getBgColor = () => {
    switch (type) {
      case 'weather':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/30';
      case 'market':
        return 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800/30';
      case 'pest':
        return 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800/30';
      case 'fertilizer':
        return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/30';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/30';
    }
  };

  return (
    <Card className={`p-3 mb-4 ${getBgColor()} border`}>
      <div className="flex items-start gap-3">
        <div className={`mt-1 flex-shrink-0 ${type === 'weather' ? 'text-blue-500' : type === 'market' ? 'text-green-500' : type === 'pest' ? 'text-red-500' : 'text-emerald-500'}`}>
          {renderIcon()}
        </div>
        
        <div className="flex-1">
          <h3 className="font-medium text-sm">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {description}
          </p>
          
          <div className="mt-2 flex justify-end">
            <Button 
              asChild 
              variant="ghost" 
              size="sm" 
              className={`text-xs h-7 ${type === 'weather' ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30' : type === 'market' ? 'text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/30' : type === 'pest' ? 'text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30' : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/30'}`}
            >
              <Link to={actionPath} className="flex items-center">
                {actionText}
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AIInsightAlert;
