import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquareText, ArrowRight, Bot, User, Zap, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export default function AIChatPreview() {
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [quickQuestions, setQuickQuestions] = useState([
    "When should I plant maize this season?",
    "How do I identify tomato blight?",
    "What's the best organic fertilizer for beans?",
    "How can I improve my soil health?"
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Add initial AI assistant message
    setMessages([{
      role: 'assistant',
      content: "Hello farmer! I'm your AI farming assistant. How can I help you today?"
    }]);
    
    // Generate contextual questions based on simulated farm data
    setTimeout(() => {
      // In a real app, these would be based on the farmer's actual crops, location, etc.
      const contextualQuestions = [
        "When should I harvest my maize crop?",
        "How to protect tomatoes from the upcoming rainfall?",
        "Best market to sell my coffee harvest?"
      ];
      
      // Update with more contextual questions
      setQuickQuestions([
        contextualQuestions[0],
        "How do I identify tomato blight?",
        contextualQuestions[1],
        contextualQuestions[2]
      ]);
      
      // Show toast for AI insight
      toast.info("AI Assistant Update", {
        description: "Generated personalized recommendations based on your crops",
      });
    }, 3000);
  }, []);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;
    
    // Add user message
    const userMessage = {
      role: 'user' as const,
      content: content
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);
    
    // Simulate AI thinking and response
    setTimeout(() => {
      let response = "";
      
      if (content.toLowerCase().includes("maize") || content.toLowerCase().includes("plant")) {
        response = "Based on your location and current climate data, the optimal planting window for maize is between April 15-30. Soil temperature should be at least 15°C for good germination.";
      } else if (content.toLowerCase().includes("tomato") || content.toLowerCase().includes("blight")) {
        response = "Tomato blight appears as dark spots on leaves that turn yellow, then brown. Look for white fuzzy growth on the underside of leaves in humid conditions. Apply copper-based fungicide early morning for best results.";
      } else if (content.toLowerCase().includes("fertilizer") || content.toLowerCase().includes("bean")) {
        response = "For beans, I recommend composted manure or fish emulsion. Apply 2-3 weeks after germination at a rate of 1/4 cup per plant. Avoid high-nitrogen fertilizers as beans fix their own nitrogen.";
      } else if (content.toLowerCase().includes("soil") || content.toLowerCase().includes("health")) {
        response = "To improve soil health: 1) Add organic matter like compost, 2) Use cover crops like clover between seasons, 3) Implement crop rotation, and 4) Maintain proper pH (6.0-7.0 for most crops). Your soil's current pH is around 6.3 based on your last test.";
      } else if (content.toLowerCase().includes("market") || content.toLowerCase().includes("sell") || content.toLowerCase().includes("coffee")) {
        response = "Current coffee prices are strong at $238/kg. Based on market analysis, I recommend selling to the Nairobi Central Market where prices are 8% higher than local markets. Best selling window is within 5 days.";
      } else if (content.toLowerCase().includes("harvest") || content.toLowerCase().includes("when")) {
        response = "For your maize variety, optimal harvest time is when kernels are firm and the husks are dry. Based on your planting date and current growth stage, I estimate your fields will be ready for harvest between October 12-18.";
      } else if (content.toLowerCase().includes("protect") || content.toLowerCase().includes("rain")) {
        response = "To protect tomatoes from heavy rain: 1) Install row covers or small tunnels, 2) Apply preventative fungicide 24-48 hours before rainfall, 3) Ensure good drainage, and 4) Stake plants higher to keep fruit off ground. Rain expected Thursday.";
      } else {
        response = "I understand you're asking about " + content + ". Based on your farm data and current conditions, I'd recommend consulting our detailed guides in the Knowledge Base. Would you like me to provide more specific information?";
      }
      
      // Add AI response with typing effect
      let displayedResponse = "";
      const aiMessage = {
        role: 'assistant' as const,
        content: response
      };
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: ""
      }]);
      
      const interval = setInterval(() => {
        if (displayedResponse.length < response.length) {
          displayedResponse = response.substring(0, displayedResponse.length + 3);
          
          setMessages(prev => [
            ...prev.slice(0, prev.length - 1),
            {
              role: 'assistant',
              content: displayedResponse
            }
          ]);
        } else {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, 30);
      
    }, 1000);
  };

  return (
    <Card className="h-full overflow-hidden border-2 hover:border-primary/50 transition-all">
      <CardHeader className="pb-3 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30">
        <CardTitle className="flex items-center gap-2">
          <MessageSquareText className="h-5 w-5 text-violet-500" />
          AI Farm Expert
        </CardTitle>
        <CardDescription>
          Get instant answers to all your farming questions
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4">
          <p className="text-sm font-medium mb-2">Quick AI Insights:</p>
          <div className="grid grid-cols-2 gap-2">
            {quickQuestions.map((question, index) => (
              <Button 
                key={index} 
                variant="outline" 
                size="sm" 
                className="h-auto py-2 justify-start text-left"
                onClick={() => handleSendMessage(question)}
              >
                <span className="flex items-center gap-1">
                  <Zap className="h-3 w-3 flex-shrink-0 text-violet-500" />
                  <span className="text-xs overflow-hidden text-ellipsis whitespace-nowrap">{question}</span>
                </span>
              </Button>
            ))}
          </div>
        </div>
        
        <div className="p-3 border-t max-h-[180px] overflow-y-auto">
          <div className="space-y-3">
            {messages.map((message, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className={`rounded-full p-1 ${
                  message.role === 'assistant' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}>
                  {message.role === 'assistant' 
                    ? <Bot className="h-4 w-4" /> 
                    : <User className="h-4 w-4" />
                  }
                </div>
                <div className="flex-1">
                  <p className="text-xs leading-relaxed">{message.content}</p>
                  {index === messages.length - 1 && isTyping && (
                    <div className="flex space-x-1 mt-1">
                      <div className="h-2 w-2 rounded-full bg-primary animate-bounce delay-100"></div>
                      <div className="h-2 w-2 rounded-full bg-primary animate-bounce delay-200"></div>
                      <div className="h-2 w-2 rounded-full bg-primary animate-bounce delay-300"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        <div className="p-3 pt-0 border-t">
          <div className="flex gap-2">
            <Input
              className="text-sm"
              placeholder="Ask about crops, weather, pests..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(inputValue);
                }
              }}
            />
            <Button 
              size="icon"
              disabled={isTyping || !inputValue.trim()}
              onClick={() => handleSendMessage(inputValue)}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          <Link to="/chat">
            <Button className="w-full mt-3 group">
              <span className="flex items-center gap-2">
                <MessageSquareText className="h-4 w-4" />
                Full AI Farm Assistant
                <ArrowRight className="h-3 w-3 ml-auto group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
