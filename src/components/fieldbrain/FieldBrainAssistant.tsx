
import React, { useState, useRef, useEffect } from 'react';
import { useFieldBrain } from '@/hooks/useFieldBrain';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Brain, 
  MessageSquare, 
  Send, 
  List, 
  Volume2, 
  VolumeX, 
  Lightbulb,
  Calendar,
  Settings,
  RefreshCcw
} from 'lucide-react';
import { FieldInsight } from '@/agents/FieldBrainAgent';

interface FieldBrainAssistantProps {
  fieldId?: string;
  minimized?: boolean;
  onMaximize?: () => void;
}

export function FieldBrainAssistant({ fieldId, minimized = false, onMaximize }: FieldBrainAssistantProps) {
  const [question, setQuestion] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { 
    isReady,
    isLoading,
    insights, 
    latestInsight,
    voiceStyle,
    askAgent,
    getSuggestion,
    generateWeeklySummary,
    speakText,
    changeVoiceStyle
  } = useFieldBrain(fieldId);

  // Auto scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [insights]);

  // Handle speech output
  useEffect(() => {
    const handleSpeechEnd = () => {
      setIsSpeaking(false);
    };

    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        // Voices loaded
      };
      
      window.speechSynthesis.addEventListener('end', handleSpeechEnd);
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Stop speaking when component unmounts
        window.speechSynthesis.removeEventListener('end', handleSpeechEnd);
      }
    };
  }, []);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    const userQuestion = question;
    setQuestion('');
    inputRef.current?.focus();
    
    const response = await askAgent(userQuestion);
    if (response) {
      speakResponse(response.content);
    }
  };

  const handleSuggestion = async () => {
    if (!isReady || isLoading) return;
    
    const suggestion = await getSuggestion();
    if (suggestion) {
      toast.success("New suggestion available!", {
        description: "FieldBrain has found something that might help your farm."
      });
      speakResponse(suggestion.content);
    }
  };

  const handleWeeklySummary = async () => {
    if (!isReady || isLoading) return;
    
    toast.loading("Generating your weekly summary...");
    
    const summary = await generateWeeklySummary();
    toast.dismiss();
    
    if (summary) {
      toast.success("Weekly summary ready", {
        description: "Your farm's weekly report has been generated."
      });
    }
  };

  const speakResponse = (text: string) => {
    if (!text) return;
    
    if (isSpeaking && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    
    setIsSpeaking(true);
    speakText(text);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Change voice style
  const handleVoiceStyleChange = (style: 'wise' | 'expert' | 'funny') => {
    changeVoiceStyle(style);
    toast.info(`Voice style changed to ${style}`);
  };

  // Filter insights by type based on active tab
  const filteredInsights = insights.filter(insight => {
    if (activeTab === 'chat') return true;
    if (activeTab === 'alerts') return insight.type === 'alert';
    if (activeTab === 'suggestions') return insight.type === 'suggestion';
    if (activeTab === 'summaries') return insight.type === 'summary';
    return true;
  });

  // Format timestamp to local date/time
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  if (!fieldId) {
    return (
      <Card className="p-4 text-center">
        <div className="flex flex-col items-center gap-4">
          <Brain size={48} className="text-green-500" />
          <h3 className="text-lg font-semibold">FieldBrain AI</h3>
          <p className="text-muted-foreground">Select a field to activate your AI assistant.</p>
        </div>
      </Card>
    );
  }

  if (minimized) {
    return (
      <Button 
        onClick={onMaximize} 
        variant="outline" 
        className="fixed bottom-4 right-4 rounded-full h-12 w-12 p-0 shadow-lg"
        aria-label="Open FieldBrain Assistant"
      >
        <Brain className="h-6 w-6 text-green-500" />
      </Button>
    );
  }

  return (
    <Card className="flex flex-col h-full border shadow-md">
      <div className="p-3 bg-green-500 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          <h3 className="font-semibold">FieldBrain Assistant</h3>
        </div>
        <div className="flex items-center gap-2">
          {isLoading && <RefreshCcw className="h-4 w-4 animate-spin" />}
          {isSpeaking ? (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={stopSpeaking}
              className="h-6 w-6 rounded-full p-0 text-white hover:bg-green-600"
            >
              <VolumeX className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </div>

      <Tabs defaultValue="chat" className="flex-1 flex flex-col" onValueChange={(value) => setActiveTab(value)}>
        <div className="border-b">
          <TabsList className="w-full justify-start h-10 bg-transparent p-0">
            <TabsTrigger value="chat" className="data-[state=active]:bg-background rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-green-500 data-[state=active]:shadow-none">
              <MessageSquare className="h-4 w-4 mr-1" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="alerts" className="data-[state=active]:bg-background rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-green-500 data-[state=active]:shadow-none">
              <Lightbulb className="h-4 w-4 mr-1" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="summaries" className="data-[state=active]:bg-background rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-green-500 data-[state=active]:shadow-none">
              <Calendar className="h-4 w-4 mr-1" />
              Summaries
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-background rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-green-500 data-[state=active]:shadow-none">
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="chat" className="flex-1 flex flex-col p-0 m-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {!isReady && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Brain className="mx-auto h-12 w-12 text-muted-foreground animate-pulse" />
                  <p className="mt-2">Initializing FieldBrain...</p>
                </div>
              </div>
            )}
            
            {isReady && filteredInsights.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-xs">
                  <Brain className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">Your AI Farm Assistant</h3>
                  <p className="mt-2 text-muted-foreground">
                    I'm here to help with your farming decisions. 
                    Ask me anything about your field, crops, or get suggestions.
                  </p>
                </div>
              </div>
            )}
            
            {filteredInsights.map((insight) => (
              <div key={insight.id} className="space-y-1">
                <div className="text-sm text-muted-foreground">
                  {formatTimestamp(insight.timestamp)}
                  {insight.type === 'alert' && (
                    <span className="ml-2 bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs">Alert</span>
                  )}
                  {insight.type === 'suggestion' && (
                    <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">Suggestion</span>
                  )}
                  {insight.type === 'summary' && (
                    <span className="ml-2 bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs">Summary</span>
                  )}
                </div>
                <Card className="p-3">
                  <div className="whitespace-pre-wrap">{insight.content}</div>
                  <div className="flex items-center justify-end mt-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => speakResponse(insight.content)}
                      className="h-8 w-8"
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-3 border-t">
            <form onSubmit={handleAsk} className="flex gap-2">
              <Input
                ref={inputRef}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask your farming assistant..."
                disabled={isLoading || !isReady}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !isReady || !question.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="flex-1 overflow-y-auto p-0 m-0">
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Field Insights</h3>
              <Button size="sm" onClick={handleSuggestion} disabled={isLoading}>
                <Lightbulb className="h-4 w-4 mr-2" />
                Get New Suggestion
              </Button>
            </div>

            {filteredInsights.length === 0 ? (
              <div className="text-center p-8">
                <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">No insights yet. Get a suggestion to start!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInsights.map((insight) => (
                  <Card key={insight.id} className="p-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        {formatTimestamp(insight.timestamp)}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        insight.type === 'alert' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {insight.type === 'alert' ? 'Alert' : 'Suggestion'} 
                        {insight.confidence ? ` (${Math.round(insight.confidence * 100)}%)` : ''}
                      </span>
                    </div>
                    <p className="mt-2">{insight.content}</p>
                    <div className="flex justify-end mt-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => speakResponse(insight.content)}
                        className="h-8 w-8"
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="summaries" className="flex-1 overflow-y-auto p-0 m-0">
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Weekly Summaries</h3>
              <Button size="sm" onClick={handleWeeklySummary} disabled={isLoading}>
                <Calendar className="h-4 w-4 mr-2" />
                Generate Summary
              </Button>
            </div>
            
            {filteredInsights.length === 0 ? (
              <div className="text-center p-8">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">No summaries yet. Generate one to start!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInsights.map((insight) => (
                  <Card key={insight.id} className="p-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Weekly Summary</span>
                      <span className="text-sm text-muted-foreground">
                        {formatTimestamp(insight.timestamp)}
                      </span>
                    </div>
                    <div className="mt-2 whitespace-pre-wrap">{insight.content}</div>
                    <div className="flex justify-end mt-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => speakResponse(insight.content)}
                        className="h-8 w-8"
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="flex-1 overflow-y-auto p-0 m-0">
          <div className="p-4 space-y-6">
            <h3 className="font-medium">Assistant Settings</h3>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Voice Style</h4>
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  variant={voiceStyle === 'wise' ? 'default' : 'outline'} 
                  onClick={() => handleVoiceStyleChange('wise')}
                  className="justify-start"
                >
                  <span className="text-lg mr-2">👴</span>
                  Wise Elder
                </Button>
                <Button 
                  variant={voiceStyle === 'expert' ? 'default' : 'outline'} 
                  onClick={() => handleVoiceStyleChange('expert')}
                  className="justify-start"
                >
                  <span className="text-lg mr-2">👩‍🔬</span>
                  Expert
                </Button>
                <Button 
                  variant={voiceStyle === 'funny' ? 'default' : 'outline'} 
                  onClick={() => handleVoiceStyleChange('funny')}
                  className="justify-start"
                >
                  <span className="text-lg mr-2">😄</span>
                  Funny
                </Button>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Test Speech</h4>
              <Button 
                onClick={() => speakResponse("Hello! I'm your FieldBrain assistant. I'm here to help with your farm.")}
                className="w-full"
              >
                <Volume2 className="h-4 w-4 mr-2" />
                Test Voice
              </Button>
            </div>
            
            <div className="rounded-md bg-muted p-4">
              <h4 className="text-sm font-medium mb-2">About FieldBrain</h4>
              <p className="text-sm text-muted-foreground">
                FieldBrain is your AI farming assistant that provides personalized guidance,
                monitors your fields, and helps you make better farming decisions.
                It works online and offline to ensure you always have access to farming expertise.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
