import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, Bot, User, Mic, Camera, Paperclip } from 'lucide-react';
import { WhatsAppFarmingIntelligence } from '@/services/whatsappIntelligence';
import { toast } from 'sonner';

const Chat = () => {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: '🌾 Welcome to CropGenius AI! I\'m your personal farming assistant. How can I help you today?', 
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  const whatsappAI = new WhatsAppFarmingIntelligence();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    const userMessage = {
      id: Date.now(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    try {
      const response = await whatsappAI.handleIncomingMessage({
        from: 'user',
        text: newMessage,
        timestamp: Date.now(),
        messageId: Date.now().toString()
      });

      setTimeout(() => {
        const botMessage = {
          id: Date.now() + 1,
          text: response.message,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 1000 + Math.random() * 2000);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      setIsTyping(false);
      toast.error('Failed to get response. Please try again.');
    }
  };

  const startVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
        toast.info('Listening... Speak now');
      };
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setNewMessage(transcript);
        setIsListening(false);
      };
      
      recognition.onerror = () => {
        setIsListening(false);
        toast.error('Voice input failed. Please try again.');
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.start();
    } else {
      toast.error('Voice input not supported on this device');
    }
  };

  const quickActions = [
    { text: 'My crops are diseased', emoji: '🦠' },
    { text: 'When should I plant?', emoji: '🌱' },
    { text: 'Weather forecast', emoji: '🌤️' },
    { text: 'Market prices', emoji: '💰' },
    { text: 'Pest control help', emoji: '🐛' },
    { text: 'Fertilizer advice', emoji: '🌿' }
  ];

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="p-4 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">CropGenius AI</h1>
              <p className="text-sm text-white/70">Your farming assistant</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.sender === 'bot' && (
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              
              <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-1' : ''}`}>
                <div
                  className={`p-3 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white rounded-br-md'
                      : 'bg-white/10 text-white rounded-bl-md backdrop-blur-lg'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                </div>
                <p className="text-xs text-white/50 mt-1 px-2">
                  {formatTime(message.timestamp)}
                </p>
              </div>

              {message.sender === 'user' && (
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white/10 backdrop-blur-lg p-3 rounded-2xl rounded-bl-md">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="px-4 pb-2">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="glass-btn whitespace-nowrap flex-shrink-0"
                onClick={() => setNewMessage(action.text)}
              >
                <span className="mr-1">{action.emoji}</span>
                {action.text}
              </Button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/20">
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Ask me anything about farming..."
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="pr-20 bg-white/10 border-white/20 text-white placeholder:text-white/60 rounded-full"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-8 h-8 p-0 hover:bg-white/10"
                  onClick={startVoiceInput}
                  disabled={isListening}
                >
                  <Mic className={`w-4 h-4 ${isListening ? 'text-red-400 animate-pulse' : 'text-white/60'}`} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-8 h-8 p-0 hover:bg-white/10"
                >
                  <Camera className="w-4 h-4 text-white/60" />
                </Button>
              </div>
            </div>
            <Button 
              onClick={sendMessage} 
              disabled={!newMessage.trim() || isTyping}
              className="w-12 h-12 rounded-full bg-green-500 hover:bg-green-600"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
    </div>
  );
};

export default Chat;