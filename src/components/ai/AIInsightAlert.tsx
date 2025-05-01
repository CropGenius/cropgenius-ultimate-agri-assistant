
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { CloudSun, BarChart4, AlertTriangle, Leaf, X, MessageCircle } from 'lucide-react';
import { toast } from "sonner";

interface AIInsightAlertProps {
  message: string;
  type: 'weather' | 'market' | 'pest' | 'fertilizer';
  actionText: string;
  actionPath: string;
}

const AIInsightAlert = ({ 
  message, 
  type, 
  actionText,
  actionPath 
}: AIInsightAlertProps) => {
  const [dismissed, setDismissed] = useState(false);
  
  if (dismissed) return null;
  
  const getTypeIcon = () => {
    switch (type) {
      case 'weather':
        return <CloudSun className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      case 'market':
        return <BarChart4 className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'pest':
        return <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />;
      case 'fertilizer':
        return <Leaf className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />;
    }
  };
  
  const getTypeColor = () => {
    switch (type) {
      case 'weather':
        return 'bg-blue-50 dark:bg-blue-900/30 border-blue-100 dark:border-blue-800';
      case 'market':
        return 'bg-green-50 dark:bg-green-900/30 border-green-100 dark:border-green-800';
      case 'pest':
        return 'bg-amber-50 dark:bg-amber-900/30 border-amber-100 dark:border-amber-800';
      case 'fertilizer':
        return 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-100 dark:border-emerald-800';
    }
  };
  
  const getActionColor = () => {
    switch (type) {
      case 'weather':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'market':
        return 'bg-green-600 hover:bg-green-700 text-white';
      case 'pest':
        return 'bg-amber-600 hover:bg-amber-700 text-white';
      case 'fertilizer':
        return 'bg-emerald-600 hover:bg-emerald-700 text-white';
    }
  };
  
  const handleWhatsAppShare = () => {
    const shareText = encodeURIComponent(`${message} Check it out on CROPGenius!`);
    window.open(`https://wa.me/?text=${shareText}`, '_blank');
    toast.success("Opening WhatsApp to share insight");
  };
  
  return (
    <Card className={`${getTypeColor()} border-l-4 ${
      type === 'weather' ? 'border-l-blue-500' :
      type === 'market' ? 'border-l-green-500' :
      type === 'pest' ? 'border-l-amber-500' : 'border-l-emerald-500'
    } animate-fade-in`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-full ${
              type === 'weather' ? 'bg-blue-100 dark:bg-blue-800' :
              type === 'market' ? 'bg-green-100 dark:bg-green-800' :
              type === 'pest' ? 'bg-amber-100 dark:bg-amber-800' : 
              'bg-emerald-100 dark:bg-emerald-800'
            }`}>
              {getTypeIcon()}
            </div>
            
            <div>
              <h3 className={`font-medium ${
                type === 'weather' ? 'text-blue-800 dark:text-blue-300' :
                type === 'market' ? 'text-green-800 dark:text-green-300' :
                type === 'pest' ? 'text-amber-800 dark:text-amber-300' : 
                'text-emerald-800 dark:text-emerald-300'
              }`}>
                AI Insight
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mt-1">{message}</p>
            </div>
          </div>
          
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-7 w-7 rounded-full"
            onClick={() => setDismissed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4 justify-end">
          <Button
            variant="outline"
            size="sm"
            className="text-gray-600 dark:text-gray-400"
            onClick={handleWhatsAppShare}
          >
            <MessageCircle className="h-3 w-3 mr-1" />
            Share via WhatsApp
          </Button>
          
          <Link to={actionPath}>
            <Button 
              size="sm" 
              className={getActionColor()}
            >
              {actionText}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIInsightAlert;
