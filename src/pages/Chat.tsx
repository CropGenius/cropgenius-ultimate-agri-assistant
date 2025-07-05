import React, { useState, useEffect, useRef } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Mic, 
  Camera, 
  Paperclip, 
  Bot, 
  User, 
  Sparkles,
  Leaf,
  Cloud,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type: 'text' | 'image' | 'suggestion';
  suggestions?: string[];
  metadata?: {
    confidence?: number;
    category?: string;
    urgent?: boolean;
  };
}

const Chat: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Hello ${user?.email?.split('@')[0] || 'Farmer'}! 👋 I'm your AI farming assistant. I can help you with crop diseases, weather insights, market prices, and farming advice. What would you like to know?`,
      sender: 'ai',
      timestamp: new Date(),
      type: 'text',
      suggestions: [
        'Scan my crops for diseases',
        'What\'s the weather forecast?',
        'Check market prices',
        'Give me farming tips'
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateAIResponse = (userMessage: string): Message => {
    const responses = {
      disease: {
        content: "I can help you identify crop diseases! 🔬 You can either upload a photo of your crops or describe the symptoms you're seeing. For the most accurate diagnosis, I recommend taking a clear photo of the affected plant parts.",
        suggestions: ['Upload crop photo', 'Describe symptoms', 'Common diseases in my area']
      },
      weather: {
        content: "Based on current weather data for your location: ☀️ Temperature: 26°C, Partly cloudy with 15% chance of rain. Perfect conditions for field work! The next 3 days look ideal for planting or harvesting.",
        suggestions: ['7-day forecast', 'Irrigation schedule', 'Best planting times']
      },
      market: {
        content: "Current market prices in your region: 📈 Maize: KES 45/kg (↑8%), Beans: KES 120/kg (↓3%), Tomatoes: KES 80/kg (↑12%). Maize prices are trending upward - good time to sell!",
        suggestions: ['Price alerts', 'Best selling locations', 'Market trends']
      },
      tips: {
        content: "Here are some key farming tips for this season: 🌱 1) Monitor soil moisture regularly 2) Apply organic fertilizer before the rains 3) Check for pest activity weekly 4) Plan your harvest timing based on market trends",
        suggestions: ['Soil health tips', 'Pest management', 'Fertilizer schedule']
      },
      default: {
        content: "I understand you're asking about farming. I can help with crop diseases, weather forecasting, market prices, and general farming advice. What specific area would you like assistance with?",
        suggestions: ['Crop health', 'Weather insights', 'Market prices', 'Farming tips']
      }
    };

    const lowerMessage = userMessage.toLowerCase();
    let responseKey: keyof typeof responses = 'default';

    if (lowerMessage.includes('disease') || lowerMessage.includes('sick') || lowerMessage.includes('problem')) {
      responseKey = 'disease';
    } else if (lowerMessage.includes('weather') || lowerMessage.includes('rain') || lowerMessage.includes('forecast')) {
      responseKey = 'weather';
    } else if (lowerMessage.includes('price') || lowerMessage.includes('market') || lowerMessage.includes('sell')) {
      responseKey = 'market';
    } else if (lowerMessage.includes('tip') || lowerMessage.includes('advice') || lowerMessage.includes('help')) {
      responseKey = 'tips';
    }

    const response = responses[responseKey];
    
    return {
      id: Date.now().toString(),
      content: response.content,
      sender: 'ai',
      timestamp: new Date(),
      type: 'text',
      suggestions: response.suggestions,
      metadata: {
        confidence: 0.95,
        category: responseKey,
        urgent: responseKey === 'disease'
      }
    };
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI processing time
    setTimeout(() => {
      const aiResponse = simulateAIResponse(inputMessage);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickActions = [
    { icon: Camera, label: 'Scan Crop', action: () => setInputMessage('I want to scan my crops for diseases') },
    { icon: Cloud, label: 'Weather', action: () => setInputMessage('What\'s the weather forecast?') },
    { icon: TrendingUp, label: 'Market', action: () => setInputMessage('Show me current market prices') },
    { icon: Leaf, label: 'Tips', action: () => setInputMessage('Give me farming tips for this season') }
  ];

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto p-4">
        {/* Header */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <span>CropGenius AI Assistant</span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-muted-foreground font-normal">Online & Ready</span>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {quickActions.map((action, index) => (
            <motion.button
              key={action.label}
              whileTap={{ scale: 0.95 }}
              onClick={action.action}
              className="flex flex-col items-center p-3 bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all"
            >
              <action.icon className="h-5 w-5 text-green-600 mb-1" />
              <span className="text-xs font-medium text-gray-700">{action.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Messages */}
        <Card className="flex-1 flex flex-col">
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                    <div className={`flex items-start gap-2 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`p-2 rounded-full ${
                        message.sender === 'user' 
                          ? 'bg-green-100' 
                          : 'bg-gradient-to-br from-blue-500 to-purple-600'
                      }`}>
                        {message.sender === 'user' ? (
                          <User className="h-4 w-4 text-green-600" />
                        ) : (
                          <Bot className="h-4 w-4 text-white" />
                        )}
                      </div>
                      
                      <div className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`p-3 rounded-2xl ${
                          message.sender === 'user'
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          {message.metadata?.confidence && (
                            <div className="flex items-center gap-1 mt-2 text-xs opacity-75">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>{Math.round(message.metadata.confidence * 100)}% confident</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {message.metadata?.urgent && (
                            <Badge variant="destructive" className="text-xs ml-2">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Urgent
                            </Badge>
                          )}
                        </div>

                        {/* Suggestions */}
                        {message.suggestions && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {message.suggestions.map((suggestion, index) => (
                              <motion.button
                                key={index}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-700 hover:border-green-300 hover:bg-green-50 transition-all"
                              >
                                {suggestion}
                              </motion.button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex justify-start"
                >
                  <div className="flex items-start gap-2">
                    <div className="p-2 rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-gray-100 p-3 rounded-2xl">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </CardContent>

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={() => setIsListening(!isListening)}
              >
                <Mic className={`h-4 w-4 ${isListening ? 'text-red-500' : 'text-gray-500'}`} />
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
              >
                <Paperclip className="h-4 w-4 text-gray-500" />
              </Button>

              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about farming..."
                className="flex-1"
              />

              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Chat;