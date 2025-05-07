
import { useState, useRef, useEffect } from 'react';
import { useFieldBrain } from '@/hooks/useFieldBrain';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mic, MicOff, Volume2, VolumeX, Send, Brain, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { FieldInsight } from '@/types/supabase';

interface FieldBrainAssistantProps {
  fieldId?: string;
  compact?: boolean;
  className?: string;
}

const FieldBrainAssistant = ({ fieldId, compact = false, className }: FieldBrainAssistantProps) => {
  const { 
    isInitialized,
    isLoading,
    askAgent,
    setFieldContext,
    setVoiceStyle,
    voiceStyle,
    speakMessage,
    getSuggestedAction
  } = useFieldBrain();
  
  const [question, setQuestion] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(false);
  const [lastInsight, setLastInsight] = useState<FieldInsight | null>(null);
  
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);
  
  // Set field context when the component mounts or fieldId changes
  useEffect(() => {
    if (isInitialized && fieldId) {
      setFieldContext(fieldId);
    }
  }, [isInitialized, fieldId, setFieldContext]);
  
  // Get suggested action on mount
  useEffect(() => {
    if (isInitialized && !compact) {
      const suggestedAction = getSuggestedAction();
      setResponse(`Welcome to FieldBrain AI! Here's a suggestion: ${suggestedAction.action}`);
    }
  }, [isInitialized, compact, getSuggestedAction]);
  
  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      speechRecognitionRef.current = new SpeechRecognitionAPI();
      
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.continuous = false;
        speechRecognitionRef.current.interimResults = false;
        
        speechRecognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setQuestion(transcript);
          setIsListening(false);
        };
        
        speechRecognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          toast.error('Voice input failed', {
            description: 'Please try again or type your question.'
          });
        };
        
        speechRecognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
    
    return () => {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.abort();
      }
    };
  }, []);
  
  // Handle speaking status
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const handleSpeechStart = () => setIsSpeaking(true);
      const handleSpeechEnd = () => setIsSpeaking(false);
      
      window.speechSynthesis.addEventListener('voiceschanged', handleSpeechEnd);
      
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', handleSpeechEnd);
      };
    }
  }, []);
  
  // Toggle speech recognition
  const toggleListening = () => {
    if (!speechRecognitionRef.current) {
      toast.error('Voice input not supported', {
        description: 'Your browser does not support voice recognition.'
      });
      return;
    }
    
    if (isListening) {
      speechRecognitionRef.current.abort();
      setIsListening(false);
    } else {
      setIsListening(true);
      speechRecognitionRef.current.start();
      toast.info('Listening...', {
        description: 'Speak clearly and I\'ll try to understand.'
      });
    }
  };
  
  // Handle voice style change
  const handleVoiceStyleChange = (value: string) => {
    setVoiceStyle(value as 'wise' | 'expert' | 'friendly');
  };
  
  // Toggle voice output
  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
  };
  
  // Handle form submission
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!question.trim()) return;
    
    try {
      setIsThinking(true);
      const result = await askAgent(question);
      setResponse(result.response);
      setLastInsight(result.insight || null);
      
      if (voiceEnabled) {
        speakMessage(result.response);
      }
      
      setQuestion('');
    } catch (error) {
      console.error('Error asking question:', error);
      toast.error('Failed to get answer', {
        description: 'Please try again later.'
      });
    } finally {
      setIsThinking(false);
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="w-5 h-5 mr-2" />
            <Skeleton className="h-6 w-40" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-full" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Compact version for sidebar/mini panels
  if (compact) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center">
            <Brain className="w-4 h-4 mr-2 text-primary" />
            FieldBrain AI
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a quick question..."
              className="h-8 text-sm"
              disabled={isThinking}
            />
            <Button type="submit" size="sm" className="h-8 w-8 p-0">
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }
  
  // Full version
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Brain className="w-6 h-6 mr-2 text-primary" />
          FieldBrain AI Assistant
          {isThinking && (
            <span className="ml-2 text-sm font-normal text-muted-foreground animate-pulse">
              Thinking...
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Your personal AI farming assistant. Ask any farming question.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="mb-4 p-3 bg-muted/50 rounded-lg max-h-48 overflow-y-auto">
          {response ? (
            <div className="text-sm">
              {response}
              
              {lastInsight?.actionRequired && (
                <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded border border-yellow-300 dark:border-yellow-800">
                  <span className="font-medium flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Action needed:
                  </span>
                  <p className="text-xs">{lastInsight.content}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground italic">
              Ask me anything about your farm and crops...
            </div>
          )}
          
          {isSpeaking && (
            <div className="text-xs text-primary mt-2 flex items-center">
              <Volume2 className="h-3 w-3 mr-1 animate-pulse" /> Speaking...
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex space-x-2">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask about weather, planting advice, pest management..."
              disabled={isThinking || isListening}
            />
            <Button 
              type="button" 
              variant="outline" 
              className={cn(
                "w-10 p-0", 
                isListening && "bg-red-100 text-red-600 border-red-300"
              )}
              onClick={toggleListening}
              disabled={isThinking}
            >
              {isListening ? 
                <MicOff className="h-4 w-4" /> : 
                <Mic className="h-4 w-4" />
              }
              <span className="sr-only">
                {isListening ? "Stop listening" : "Start voice input"}
              </span>
            </Button>
            <Button type="submit" disabled={isThinking || !question.trim()}>
              <Send className="h-4 w-4 mr-2" />
              Ask
            </Button>
          </div>
        </form>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2 border-t">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleVoice}
            className={cn(voiceEnabled && "text-primary")}
          >
            {voiceEnabled ? (
              <Volume2 className="h-4 w-4 mr-2" />
            ) : (
              <VolumeX className="h-4 w-4 mr-2" />
            )}
            {voiceEnabled ? "Voice on" : "Voice off"}
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Voice style:</span>
          <Select value={voiceStyle} onValueChange={handleVoiceStyleChange}>
            <SelectTrigger className="h-8 w-[120px]">
              <SelectValue placeholder="Voice style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="friendly">Friendly</SelectItem>
              <SelectItem value="expert">Expert</SelectItem>
              <SelectItem value="wise">Wise Elder</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardFooter>
    </Card>
  );
};

export default FieldBrainAssistant;
