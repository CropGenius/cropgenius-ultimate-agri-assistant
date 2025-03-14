
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquareText, ArrowRight, Bot, User, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function AIChatPreview() {
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [previewResponse, setPreviewResponse] = useState("");
  
  const commonQuestions = [
    "When should I plant maize this season?",
    "How do I identify tomato blight?",
    "What's the best organic fertilizer for beans?",
    "How can I improve my soil health?"
  ];

  const sampleResponses = [
    "Based on your location and current climate data, the optimal planting window for maize is between April 15-30. Soil temperature should be at least 60°F (15°C).",
    "Tomato blight shows as dark spots on leaves that turn yellow, then brown. Check the underside of leaves for white fuzzy growth in humid conditions.",
    "For beans, I recommend composted manure or fish emulsion. Apply 2-3 weeks after germination at a rate of 1/4 cup per plant.",
    "Consider cover crops like clover or vetch, implement crop rotation, and add organic matter. Your soil's current pH of 6.3 is good for most crops."
  ];

  const handleQuestionHover = (index: number) => {
    setActiveQuestion(index);
    setIsTyping(true);
    setPreviewResponse("");
    
    // Simulate typing effect
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < sampleResponses[index].length) {
        setPreviewResponse(prev => prev + sampleResponses[index].charAt(i));
        i++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
      }
    }, 15);
    
    return () => clearInterval(typingInterval);
  };

  return (
    <Card className="h-full overflow-hidden border-2 hover:border-primary/50 transition-all">
      <CardHeader className="pb-3 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30">
        <CardTitle className="flex items-center gap-2">
          <MessageSquareText className="h-5 w-5 text-violet-500" />
          AI Chat & Expert Advice
        </CardTitle>
        <CardDescription>
          Get instant answers to all your farming questions
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4">
          <p className="text-sm font-medium mb-2">Ask CropGenius AI about:</p>
          <div className="space-y-2">
            {commonQuestions.map((question, index) => (
              <Link 
                key={index} 
                to={`/chat?q=${encodeURIComponent(question)}`}
                onMouseEnter={() => handleQuestionHover(index)}
                onFocus={() => handleQuestionHover(index)}
              >
                <Button 
                  variant={activeQuestion === index ? "default" : "ghost"} 
                  size="sm" 
                  className="w-full justify-start h-auto py-2 text-left transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Zap className={`h-3 w-3 flex-shrink-0 ${activeQuestion === index ? 'text-white animate-pulse' : ''}`} />
                    <span className="text-sm font-normal">{question}</span>
                  </span>
                </Button>
              </Link>
            ))}
          </div>
        </div>
        
        <div className="p-4 border-t relative min-h-[120px]">
          {activeQuestion !== null ? (
            <div className="flex items-start gap-2">
              <div className="bg-primary rounded-full p-1 text-white flex-shrink-0">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm animate-fade-in">{previewResponse}</p>
                {isTyping && (
                  <span className="inline-block h-4 w-4 ml-1 bg-primary/20 rounded-full animate-pulse"></span>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground text-sm">
              <p>Hover over a question to see AI response</p>
            </div>
          )}
        </div>
        
        <div className="p-4 pt-0">
          <Link to="/chat">
            <Button className="w-full group">
              <span className="flex items-center gap-2">
                <MessageSquareText className="h-4 w-4" />
                Chat with AI Expert
                <ArrowRight className="h-3 w-3 ml-auto group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
