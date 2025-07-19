/**
 * 🌾 CROPGENIUS – AI CHAT WIDGET RESURRECTION
 * -------------------------------------------------------------
 * PRODUCTION-READY Agricultural Chat System with Real AI Integration
 * - Real AgentService integration for intelligent message routing
 * - Validated farm context from useFarmContext hook
 * - Persistent conversation storage in Supabase
 * - Real-time message synchronization and updates
 * - Comprehensive error handling and offline support
 * - Specialized quick actions connected to real AI functions
 */

import { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  User, 
  Bot, 
  X, 
  Maximize2, 
  Minimize2, 
  MessageSquare,
  Brain,
  Zap,
  TrendingUp,
  CloudRain,
  Sprout,
  AlertCircle,
  Loader2,
  RefreshCw,
  Camera,
  Mic,
  Settings,
  WifiOff
} from 'lucide-react';
import { useAgriculturalChat, type ChatMessage } from '@/hooks/useAgriculturalChat';
import { useFarmContext, type FarmContext } from '@/hooks/useFarmContext';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AgentType } from '@/services/ai/AgentService';
import { toast } from 'sonner';

interface AIChatWidgetProps {
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  title?: string;
  defaultOpen?: boolean;
  farmId?: string;
  conversationId?: string;
  showAgentIndicators?: boolean;
  showConfidenceScores?: boolean;
  enableQuickActions?: boolean;
  enableImageUpload?: boolean;
  enableVoiceInput?: boolean;
  maxMessages?: number;
}

/**
 * PRODUCTION-READY AI Chat Widget with Real Agricultural Intelligence
 */
const AIChatWidget: React.FC<AIChatWidgetProps> = ({
  className = '',
  position = 'bottom-right',
  title = 'CropGenius AI Assistant',
  defaultOpen = false,
  farmId,
  conversationId,
  showAgentIndicators = true,
  showConfidenceScores = true,
  enableQuickActions = true,
  enableImageUpload = false,
  enableVoiceInput = false,
  maxMessages = 50,
}) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get validated farm context
  const { context: farmContext, isLoading: contextLoading, error: contextError } = useFarmContext({
    farmId,
    enabled: !!user?.id,
    includeFields: true,
    onValidationError: (errors) => {
      console.warn('Farm context validation errors:', errors);
    }
  });

  // Use agricultural chat hook with real conversation management
  const {
    conversation,
    messages,
    isLoading,
    isLoadingMessages,
    isSending,
    error: chatError,
    sendMessage,
    sendQuickAction,
    createConversation,
    deleteConversation,
    clearMessages,
    refreshConversation,
    retryLastMessage
  } = useAgriculturalChat({
    conversationId,
    farmId,
    autoCreateConversation: true,
    enableRealTimeUpdates: true,
    maxMessages
  });

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Connection restored', {
        description: 'You are back online. Messages will sync automatically.',
      });
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('Connection lost', {
        description: 'You are offline. Messages will be sent when connection is restored.',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat is opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle errors
  useEffect(() => {
    if (chatError) {
      toast.error('Chat error', {
        description: 'There was an issue with the chat system. Please try again.',
        action: {
          label: 'Retry',
          onClick: () => refreshConversation()
        }
      });
    }
  }, [chatError, refreshConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isSending) return;
    
    // Check if user is authenticated
    if (!user?.id) {
      toast.error('Authentication required', {
        description: 'Please sign in to use the AI chat feature.',
      });
      return;
    }

    // Check farm context
    if (!farmContext) {
      toast.error('Farm context required', {
        description: 'Please set up your farm information to get personalized advice.',
      });
      return;
    }
    
    const messageToSend = inputValue.trim();
    setInputValue('');
    
    try {
      // Send message with image if selected
      await sendMessage(messageToSend, {
        imageBase64: selectedImage || undefined
      });
      
      // Clear selected image after sending
      if (selectedImage) {
        setSelectedImage(null);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Error handling is done in the hook
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file type', {
        description: 'Please select an image file.',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large', {
        description: 'Please select an image smaller than 5MB.',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setSelectedImage(base64.split(',')[1]); // Remove data:image/jpeg;base64, prefix
      toast.success('Image selected', {
        description: 'Image will be sent with your next message.',
      });
    };
    reader.readAsDataURL(file);
  };

  const handleQuickAction = async (action: string) => {
    if (!user?.id || !farmContext) {
      toast.error('Setup required', {
        description: 'Please sign in and set up your farm to use quick actions.',
      });
      return;
    }

    try {
      await sendQuickAction(action);
    } catch (error) {
      console.error('Quick action failed:', error);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  }[position];

  if (!isOpen) {
    return (
      <button
        onClick={toggleChat}
        className={`fixed ${positionClasses} bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 z-50`}
        aria-label="Open chat"
        data-testid="chat-toggle-button"
      >
        <MessageSquare className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div 
      className={`fixed ${positionClasses} w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden flex flex-col z-50 ${className}`}
      style={{ height: isMinimized ? '60px' : '500px', maxHeight: 'calc(100vh - 2rem)' }}
      data-testid="ai-chat-widget"
    >
      {/* Header */}
      <div className="bg-green-600 text-white px-4 py-3 flex items-center justify-between">
        <h3 className="font-medium">{title}</h3>
        <div className="flex space-x-2">
          <button
            onClick={toggleMinimize}
            className="text-white hover:text-green-100 focus:outline-none"
            aria-label={isMinimized ? 'Maximize' : 'Minimize'}
            data-testid="minimize-button"
          >
            {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
          </button>
          <button
            onClick={toggleChat}
            className="text-white hover:text-green-100 focus:outline-none"
            aria-label="Close chat"
            data-testid="close-button"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      {!isMinimized && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
              <div className="flex items-center space-x-2 mb-4">
                <Brain className="h-8 w-8 text-green-500" />
                <Bot className="h-10 w-10 text-gray-300" />
              </div>
              <h4 className="font-medium text-gray-700 mb-2">CropGenius AI Assistant</h4>
              <p className="text-sm text-gray-500 mb-4">
                I'm your agricultural intelligence assistant. I can help with crop diseases, weather, field management, and market insights.
              </p>
              
              {/* Quick Action Buttons */}
              {enableQuickActions && (
                <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction('disease')}
                    className="text-xs"
                    disabled={!user?.id || !farmContext}
                  >
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Disease Check
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction('weather')}
                    className="text-xs"
                    disabled={!user?.id || !farmContext}
                  >
                    <CloudRain className="h-3 w-3 mr-1" />
                    Weather
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction('market')}
                    className="text-xs"
                    disabled={!user?.id || !farmContext}
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Market Prices
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction('recommendations')}
                    className="text-xs"
                    disabled={!user?.id || !farmContext}
                  >
                    <Sprout className="h-3 w-3 mr-1" />
                    Crop Advice
                  </Button>
                </div>
              )}

              {/* Image Upload Button */}
              {enableImageUpload && (
                <div className="mt-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs"
                    disabled={!user?.id || !farmContext}
                  >
                    <Camera className="h-3 w-3 mr-1" />
                    Upload Image for Analysis
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="flex flex-col max-w-xs sm:max-w-md">
                    {/* Agent Indicator for AI messages */}
                    {message.role === 'assistant' && showAgentIndicators && message.metadata?.agentType && (
                      <div className="flex items-center space-x-1 mb-1 ml-2">
                        {getAgentIcon(message.metadata.agentType)}
                        <span className="text-xs text-gray-500 capitalize">
                          {message.metadata.agentType.replace('_', ' ')} Agent
                        </span>
                        {showConfidenceScores && message.metadata?.confidence && (
                          <Badge variant="outline" className="text-xs">
                            {Math.round(message.metadata.confidence * 100)}%
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <div
                      className={`flex rounded-lg px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-green-100 text-gray-800 rounded-br-none self-end'
                          : 'bg-white border border-gray-200 text-gray-700 rounded-bl-none'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex-shrink-0 mr-2">
                          <Bot className="h-5 w-5 text-green-500 mt-0.5" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        
                        {/* Message metadata */}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400">
                            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          
                          {/* Sources indicator */}
                          {message.metadata?.sources && message.metadata.sources.length > 0 && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Badge variant="outline" className="text-xs">
                                    {message.metadata.sources.length} source{message.metadata.sources.length > 1 ? 's' : ''}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{message.metadata.sources.join(', ')}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                        
                        {/* Follow-up suggestions */}
                        {message.metadata?.suggestions && message.metadata.suggestions.length > 0 && (
                          <div className="mt-2 space-y-1">
                            <p className="text-xs text-gray-500">Suggested follow-ups:</p>
                            <div className="flex flex-wrap gap-1">
                              {message.metadata.suggestions.slice(0, 2).map((suggestion, index) => (
                                <Button
                                  key={index}
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSendMessage({ preventDefault: () => {} } as React.FormEvent)}
                                  className="text-xs h-6 px-2 text-blue-600 hover:text-blue-800"
                                >
                                  {suggestion}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      {message.role === 'user' && (
                        <div className="flex-shrink-0 ml-2">
                          <User className="h-5 w-5 text-green-500 mt-0.5" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Typing indicator */}
              {(isSending || isLoadingMessages) && (
                <div className="flex items-center justify-start">
                  <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg rounded-bl-none px-4 py-2">
                    <Bot className="h-4 w-4 text-green-500" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-xs text-gray-500">AI thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      )}

      {/* Input */}
      {!isMinimized && (
        <div className="border-t border-gray-200 bg-white">
          {/* Connection Status */}
          {!isOnline && (
            <div className="px-3 py-1 bg-red-50 border-b border-red-200">
              <div className="flex items-center space-x-2 text-red-600">
                <WifiOff className="h-3 w-3" />
                <span className="text-xs">You are offline. Messages will be sent when connection is restored.</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => refreshConversation()}
                  className="text-xs h-5 px-2 text-red-600 hover:text-red-800"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Context Loading Status */}
          {contextLoading && (
            <div className="px-3 py-1 bg-blue-50 border-b border-blue-200">
              <div className="flex items-center space-x-2 text-blue-600">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="text-xs">Loading farm context...</span>
              </div>
            </div>
          )}

          {/* Context Error Status */}
          {contextError && (
            <div className="px-3 py-1 bg-yellow-50 border-b border-yellow-200">
              <div className="flex items-center space-x-2 text-yellow-600">
                <AlertCircle className="h-3 w-3" />
                <span className="text-xs">Farm context unavailable. Responses may be generic.</span>
              </div>
            </div>
          )}

          {/* Selected Image Preview */}
          {selectedImage && (
            <div className="px-3 py-2 bg-green-50 border-b border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-green-600">
                  <Camera className="h-3 w-3" />
                  <span className="text-xs">Image selected for analysis</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedImage(null)}
                  className="text-xs h-5 px-2 text-green-600 hover:text-green-800"
                >
                  Remove
                </Button>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSendMessage} className="p-3">
            <div className="flex items-center space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about crops, weather, diseases, or markets..."
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                disabled={isLoading}
                data-testid="chat-input"
              />
              <Button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                size="sm"
                className="px-3 py-2"
                data-testid="send-button"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {/* Chat Stats */}
            {messages.length > 0 && (
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>{messages.length} messages</span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearMessages()}
                    className="text-xs h-5 px-2 text-gray-500 hover:text-gray-700"
                  >
                    Clear
                  </Button>
                  {conversation && (
                    <span>Conversation: {conversation.title || 'Untitled'}</span>
                  )}
                </div>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
};

/**
 * Get agent icon based on agent type
 */
const getAgentIcon = (agentType: string) => {
  const icons = {
    disease: <AlertCircle className="h-3 w-3 text-red-500" />,
    weather: <CloudRain className="h-3 w-3 text-blue-500" />,
    field: <Sprout className="h-3 w-3 text-green-500" />,
    market: <TrendingUp className="h-3 w-3 text-purple-500" />,
    general: <Brain className="h-3 w-3 text-gray-500" />
  };
  
  return icons[agentType as keyof typeof icons] || icons.general;
};

export default AIChatWidget;
