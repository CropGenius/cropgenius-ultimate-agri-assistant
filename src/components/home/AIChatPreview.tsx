
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquareText, ArrowRight, MoveRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function AIChatPreview() {
  const commonQuestions = [
    "When should I plant maize this season?",
    "How do I identify tomato blight?",
    "What's the best organic fertilizer for beans?",
    "How can I improve my soil health?"
  ];

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MessageSquareText className="h-5 w-5 text-violet-500" />
          AI Chat & Expert Advice
        </CardTitle>
        <CardDescription>
          Get instant answers to all your farming questions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
          <p className="text-sm font-medium mb-2">Ask CropGenius AI about:</p>
          <div className="space-y-2">
            {commonQuestions.map((question, index) => (
              <Link key={index} to={`/chat?q=${encodeURIComponent(question)}`}>
                <Button variant="ghost" size="sm" className="w-full justify-start h-auto py-2 text-left">
                  <span className="flex items-center gap-2">
                    <MoveRight className="h-3 w-3 flex-shrink-0" />
                    <span className="text-sm font-normal">{question}</span>
                  </span>
                </Button>
              </Link>
            ))}
          </div>
        </div>
        
        <Link to="/chat">
          <Button className="w-full">
            <span className="flex items-center gap-2">
              <MessageSquareText className="h-4 w-4" />
              Chat with AI Expert
              <ArrowRight className="h-3 w-3 ml-auto" />
            </span>
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
