
import React, { useEffect, useState } from 'react';
import { useFieldBrain } from '@/hooks/useFieldBrain';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFieldBrainContext } from './FieldBrainProvider';
import { Brain, Volume2, Lightbulb, Calendar } from 'lucide-react';
import { FieldInsight } from '@/agents/FieldBrainAgent';

interface FieldBrainMiniPanelProps {
  fieldId: string;
  fieldName: string;
}

export function FieldBrainMiniPanel({ fieldId, fieldName }: FieldBrainMiniPanelProps) {
  const [latestInsight, setLatestInsight] = useState<FieldInsight | null>(null);
  const { isReady, insights, getSuggestion, speakText } = useFieldBrain(fieldId);
  const { showAssistant, selectField } = useFieldBrainContext();
  
  useEffect(() => {
    if (insights && insights.length > 0) {
      setLatestInsight(insights[0]);
    }
    
    // Auto-generate suggestion if we have no insights yet
    if (isReady && insights && insights.length === 0) {
      getSuggestion().catch(console.error);
    }
  }, [isReady, insights, getSuggestion]);

  const handleOpenAssistant = () => {
    selectField(fieldId);
    showAssistant();
  };

  const handleSpeakInsight = () => {
    if (latestInsight) {
      speakText(latestInsight.content);
    }
  };

  if (!fieldId) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-green-500" />
            <span>AI Field Insights</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={handleOpenAssistant}
          >
            <span className="sr-only">Open Field Assistant</span>
            <Lightbulb className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isReady ? (
          <div className="text-center py-6">
            <Brain className="h-10 w-10 text-muted-foreground mx-auto animate-pulse" />
            <p className="mt-2 text-sm text-muted-foreground">Loading FieldBrain...</p>
          </div>
        ) : !latestInsight ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">
              Analyzing your field data...
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-muted/50 p-3 rounded-md relative">
              <p className="text-sm">{latestInsight.content}</p>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSpeakInsight}
                className="absolute top-1 right-1 h-6 w-6"
              >
                <Volume2 className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" size="sm" onClick={handleOpenAssistant}>
                <Brain className="h-3.5 w-3.5 mr-1.5" />
                Open Assistant
              </Button>
              <Button variant="outline" size="sm" onClick={getSuggestion}>
                <Lightbulb className="h-3.5 w-3.5 mr-1.5" />
                New Insight
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
