import React from 'react';
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Bot,
  Cpu,
  Lightbulb,
  LoaderCircle,
  MessageSquare,
  RefreshCw,
  Send,
  Tractor,
  User,
  Wheat,
  Zap,
  Globe,
} from "lucide-react";
import { 
  ChatCategory, 
  fetchAIResponse, 
  availableLanguages,
  translateMessage
} from "@/utils/aiChatService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function Chat() {
  const { toast: uiToast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your AI farming assistant. I can help with crop diseases, weather analysis, growing techniques, market information, and more. What would you like to know about farming today?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeCategory, setActiveCategory] = useState<ChatCategory>("all");
  const [language, setLanguage] = useState("en");

  const generateUniqueId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    // Add user message to chat
    const userMessage: Message = {
      id: generateUniqueId(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsSubmitting(true);
    
    try {
      // Call the AI service to get a response
      const aiResponseText = await fetchAIResponse(userMessage.content, activeCategory);
      
      // Translate the response if needed
      const translatedResponse = language !== "en" 
        ? await translateMessage(aiResponseText, language)
        : aiResponseText;
      
      // Add AI response to chat
      const aiMessage: Message = {
        id: generateUniqueId(),
        role: "assistant",
        content: translatedResponse,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      toast("Failed to get response. Please try again.", {
        description: "Network error or API issue occurred",
      });
      
      // Still add a fallback response to maintain user experience
      const fallbackMessage: Message = {
        id: generateUniqueId(),
        role: "assistant",
        content: "I'm sorry, I encountered an issue while processing your question. Please try again or ask something different.",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearConversation = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Hello! I'm your AI farming assistant. I can help with crop diseases, weather analysis, growing techniques, market information, and more. What would you like to know about farming today?",
        timestamp: new Date(),
      },
    ]);
    toast("Conversation cleared", {
      description: "Started a new conversation"
    });
  };

  return (
    <Layout>
      <div className="container max-w-6xl py-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AI Farming Assistant</h1>
            <p className="text-muted-foreground">
              Expert agricultural knowledge powered by Gemini AI
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <Select
                value={language}
                onValueChange={(value) => setLanguage(value)}
              >
                <SelectTrigger className="w-full md:w-[140px]">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  {availableLanguages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={clearConversation} className="w-full md:w-auto">
              <RefreshCw className="mr-2 h-4 w-4" />
              Clear Conversation
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-3 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">AI Assistant Categories</CardTitle>
                <CardDescription>
                  Select a category for specialized advice
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div 
                  className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${activeCategory === 'all' ? 'bg-primary/10' : 'hover:bg-muted'}`}
                  onClick={() => setActiveCategory('all')}
                >
                  <Cpu className="h-4 w-4 text-primary" />
                  <span className="font-medium">General Farming</span>
                </div>
                <div 
                  className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${activeCategory === 'crops' ? 'bg-primary/10' : 'hover:bg-muted'}`}
                  onClick={() => setActiveCategory('crops')}
                >
                  <Wheat className="h-4 w-4 text-amber-500" />
                  <span className="font-medium">Crop Management</span>
                </div>
                <div 
                  className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${activeCategory === 'diseases' ? 'bg-primary/10' : 'hover:bg-muted'}`}
                  onClick={() => setActiveCategory('diseases')}
                >
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="font-medium">Disease Control</span>
                </div>
                <div 
                  className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${activeCategory === 'machinery' ? 'bg-primary/10' : 'hover:bg-muted'}`}
                  onClick={() => setActiveCategory('machinery')}
                >
                  <Tractor className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">Farm Machinery</span>
                </div>
                <div 
                  className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${activeCategory === 'market' ? 'bg-primary/10' : 'hover:bg-muted'}`}
                  onClick={() => setActiveCategory('market')}
                >
                  <Zap className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Market Insights</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Popular Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div 
                  className="p-2 text-sm rounded-md bg-muted/50 hover:bg-muted cursor-pointer"
                  onClick={() => setInputMessage("What are the best practices for controlling tomato blight?")}
                >
                  What are the best practices for controlling tomato blight?
                </div>
                <div 
                  className="p-2 text-sm rounded-md bg-muted/50 hover:bg-muted cursor-pointer"
                  onClick={() => setInputMessage("How can I improve soil fertility naturally?")}
                >
                  How can I improve soil fertility naturally?
                </div>
                <div 
                  className="p-2 text-sm rounded-md bg-muted/50 hover:bg-muted cursor-pointer"
                  onClick={() => setInputMessage("When is the best time to plant maize in Kenya?")}
                >
                  When is the best time to plant maize in Kenya?
                </div>
                <div 
                  className="p-2 text-sm rounded-md bg-muted/50 hover:bg-muted cursor-pointer"
                  onClick={() => setInputMessage("What irrigation methods work best for small farms?")}
                >
                  What irrigation methods work best for small farms?
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-9">
            <Card className="h-[75vh] flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    <CardTitle>AI Farming Expert</CardTitle>
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    <span className="text-xs">Connected</span>
                  </Badge>
                </div>
                <CardDescription>
                  Ask any farming question to get expert advice and recommendations
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1 overflow-y-auto pb-0">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`flex items-start gap-3 max-w-[85%] ${
                          message.role === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        } p-3 rounded-lg`}
                      >
                        {message.role === 'assistant' && (
                          <Avatar className="h-8 w-8 border">
                            <Bot className="h-4 w-4" />
                          </Avatar>
                        )}
                        <div className="space-y-1">
                          <div 
                            className={message.role === 'user' ? 'text-primary-foreground' : 'text-foreground'}
                          >
                            {message.content}
                          </div>
                          <div className="text-xs opacity-70">
                            {message.timestamp.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                        {message.role === 'user' && (
                          <Avatar className="h-8 w-8 border">
                            <User className="h-4 w-4" />
                          </Avatar>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {isSubmitting && (
                    <div className="flex justify-start">
                      <div className="flex items-start gap-3 max-w-[85%] bg-muted p-3 rounded-lg">
                        <Avatar className="h-8 w-8 border">
                          <Bot className="h-4 w-4" />
                        </Avatar>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                            <span className="text-sm">Processing your question...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="pt-3">
                <div className="flex items-center w-full gap-2">
                  <Input
                    placeholder="Type your farming question here..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && !isSubmitting) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={isSubmitting}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={!inputMessage.trim() || isSubmitting}
                  >
                    {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
