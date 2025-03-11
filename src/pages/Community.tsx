
import { useState } from "react";
import Layout from "@/components/Layout";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  GraduationCap, 
  Heart,
  HelpCircle,
  Lightbulb, 
  MessageCircle, 
  MessageSquare, 
  Search,
  Shield,
  ThumbsDown,
  ThumbsUp,
  Trophy,
  User,
  Users,
  Zap
} from "lucide-react";

// Type definitions
interface Question {
  id: number;
  title: string;
  body: string;
  author: {
    name: string;
    avatar?: string;
    rank: string;
    badgeColor: string;
    region: string;
  };
  tags: string[];
  postedAt: string;
  viewCount: number;
  answerCount: number;
  upvotes: number;
  isVerified: boolean;
  aiRecommended: boolean;
  isBounty?: boolean;
  bountyAmount?: number;
  isAnswered: boolean;
  topAnswer?: Answer;
}

interface Answer {
  id: number;
  body: string;
  author: {
    name: string;
    avatar?: string;
    rank: string;
    badgeColor: string;
    region: string;
    isExpert?: boolean;
  };
  postedAt: string;
  upvotes: number;
  downvotes: number;
  isVerified: boolean;
  isAccepted: boolean;
  isAiEnhanced?: boolean;
}

interface Expert {
  id: number;
  name: string;
  avatar?: string;
  specialization: string;
  rating: number;
  answersCount: number;
  region: string;
  crops: string[];
  acceptRate: number;
  isOnline: boolean;
  responseTime: string;
}

interface FarmerLeaderboard {
  id: number;
  name: string;
  avatar?: string;
  region: string;
  rank: string;
  totalPoints: number;
  questionsCount: number;
  answersCount: number;
  acceptedAnswers: number;
  badges: {
    name: string;
    icon: any;
    color: string;
  }[];
}

const Community = () => {
  // State hooks
  const [selectedTab, setSelectedTab] = useState("questions");
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      title: "How do I deal with tomato blight in the rainy season?",
      body: "My tomato plants are showing signs of blight with brown spots on the leaves. This always happens during the rainy season. What's the best organic solution that won't harm other crops?",
      author: {
        name: "David K.",
        rank: "Rising Farmer",
        badgeColor: "sky-blue",
        region: "Eastern Region"
      },
      tags: ["Tomatoes", "Disease", "Organic"],
      postedAt: "2 hours ago",
      viewCount: 56,
      answerCount: 3,
      upvotes: 12,
      isVerified: true,
      aiRecommended: true,
      isAnswered: true,
      topAnswer: {
        id: 101,
        body: "Tomato blight thrives in humid conditions. For organic control, I recommend a mixture of 2 tablespoons of baking soda, 2 tablespoons of vegetable oil, and a few drops of liquid soap in 1 gallon of water. Spray this on your plants every 7-10 days. Also, remove affected leaves immediately and improve air circulation by properly spacing plants. Mulching helps prevent rain from splashing soil-borne spores onto plants.",
        author: {
          name: "Dr. Nana B.",
          rank: "Expert Agronomist",
          badgeColor: "amber",
          region: "Central Region",
          isExpert: true
        },
        postedAt: "1 hour ago",
        upvotes: 18,
        downvotes: 0,
        isVerified: true,
        isAccepted: true,
        isAiEnhanced: true
      }
    },
    {
      id: 2,
      title: "When is the best time to plant maize in Central Region?",
      body: "I'm a new farmer in the Central Region. When is the optimal time to plant maize considering recent weather patterns? I've heard different advice from neighboring farmers.",
      author: {
        name: "Sarah M.",
        rank: "Beginner",
        badgeColor: "green",
        region: "Central Region"
      },
      tags: ["Maize", "Planting", "Seasons"],
      postedAt: "1 day ago",
      viewCount: 84,
      answerCount: 5,
      upvotes: 24,
      isVerified: true,
      aiRecommended: false,
      isBounty: true,
      bountyAmount: 50,
      isAnswered: true
    },
    {
      id: 3,
      title: "How much water do cassava plants need during dry season?",
      body: "I'm growing cassava on a 2-acre plot, and we're heading into the dry season. How much and how often should I irrigate my cassava plants? Also, does mulching help?",
      author: {
        name: "Joseph O.",
        rank: "Established Farmer",
        badgeColor: "purple",
        region: "Western Region"
      },
      tags: ["Cassava", "Irrigation", "Dry Season"],
      postedAt: "3 days ago",
      viewCount: 112,
      answerCount: 7,
      upvotes: 31,
      isVerified: true,
      aiRecommended: true,
      isAnswered: true
    },
    {
      id: 4,
      title: "Which fertilizer is best for banana plants?",
      body: "I have 50 banana plants and want to maximize yield. Which fertilizer mix gives the best results? Also, how often should I apply it?",
      author: {
        name: "Grace T.",
        rank: "Master Farmer",
        badgeColor: "amber",
        region: "Southern Region"
      },
      tags: ["Bananas", "Fertilizer", "Soil"],
      postedAt: "5 days ago",
      viewCount: 203,
      answerCount: 11,
      upvotes: 47,
      isVerified: true,
      aiRecommended: false,
      isAnswered: true
    }
  ]);
  
  const [experts, setExperts] = useState<Expert[]>([
    {
      id: 1,
      name: "Dr. Nana B.",
      specialization: "Plant Pathology",
      rating: 4.9,
      answersCount: 143,
      region: "Central Region",
      crops: ["Tomatoes", "Peppers", "Leafy Greens"],
      acceptRate: 97,
      isOnline: true,
      responseTime: "Usually responds in <1 hour"
    },
    {
      id: 2,
      name: "Prof. Kwame A.",
      specialization: "Soil Science",
      rating: 4.8,
      answersCount: 218,
      region: "Eastern Region",
      crops: ["Maize", "Rice", "Cassava"],
      acceptRate: 94,
      isOnline: false,
      responseTime: "Usually responds in <3 hours"
    },
    {
      id: 3,
      name: "Elizabeth M.",
      specialization: "Organic Farming",
      rating: 4.7,
      answersCount: 165,
      region: "Western Region",
      crops: ["Vegetables", "Herbs", "Fruits"],
      acceptRate: 91,
      isOnline: true,
      responseTime: "Usually responds in <1 hour"
    }
  ]);
  
  const [leaderboard, setLeaderboard] = useState<FarmerLeaderboard[]>([
    {
      id: 1,
      name: "Grace T.",
      region: "Southern Region",
      rank: "Master Farmer",
      totalPoints: 3845,
      questionsCount: 28,
      answersCount: 175,
      acceptedAnswers: 138,
      badges: [
        { name: "Top Contributor", icon: Trophy, color: "amber" },
        { name: "Verified Expert", icon: Shield, color: "sky-blue" },
        { name: "Community Mentor", icon: Users, color: "purple" }
      ]
    },
    {
      id: 2,
      name: "Michael D.",
      region: "Central Region",
      rank: "Elite Farmer",
      totalPoints: 2760,
      questionsCount: 15,
      answersCount: 134,
      acceptedAnswers: 102,
      badges: [
        { name: "Knowledge Guru", icon: Lightbulb, color: "amber" },
        { name: "Fast Responder", icon: Zap, color: "red" }
      ]
    },
    {
      id: 3,
      name: "Rebecca N.",
      region: "Eastern Region",
      rank: "Elite Farmer",
      totalPoints: 2435,
      questionsCount: 32,
      answersCount: 98,
      acceptedAnswers: 87,
      badges: [
        { name: "Problem Solver", icon: CheckCircle2, color: "green" },
        { name: "Top Questioner", icon: HelpCircle, color: "blue" }
      ]
    }
  ]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    title: "",
    body: "",
    tags: [""]
  });
  
  // Event handlers
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() === "") return;
    
    toast({
      title: "Searching...",
      description: `Finding answers for "${searchQuery}"`,
    });
    
    // Simulated search - in a real app, this would query a backend
    setTimeout(() => {
      toast.success("Search complete", {
        description: "We found several matching questions and answers",
      });
    }, 1000);
  };
  
  const handleAskQuestion = () => {
    setIsAskingQuestion(true);
    setSelectedQuestion(null);
  };
  
  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newQuestion.title.trim() === "" || newQuestion.body.trim() === "") {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Submitting question...",
      description: "Our AI is analyzing your question",
    });
    
    // Simulate AI processing
    setTimeout(() => {
      // Create new question
      const newQuestionObj: Question = {
        id: questions.length + 1,
        title: newQuestion.title,
        body: newQuestion.body,
        author: {
          name: "Emmanuel", // Default user
          rank: "Established Farmer",
          badgeColor: "purple",
          region: "Central Region"
        },
        tags: newQuestion.tags.filter(tag => tag.trim() !== ""),
        postedAt: "Just now",
        viewCount: 1,
        answerCount: 0,
        upvotes: 0,
        isVerified: false,
        aiRecommended: false,
        isAnswered: false
      };
      
      // Add to questions list
      setQuestions([newQuestionObj, ...questions]);
      
      // Reset form
      setNewQuestion({
        title: "",
        body: "",
        tags: [""]
      });
      
      setIsAskingQuestion(false);
      
      toast.success("Question posted successfully!", {
        description: "Expert farmers and agronomists will see your question",
      });
      
      // Simulate AI finding a potential answer
      setTimeout(() => {
        toast({
          title: "AI Assistance",
          description: "We found 3 similar questions with verified answers that might help you",
        });
      }, 3000);
    }, 2000);
  };
  
  const handleViewQuestion = (id: number) => {
    const question = questions.find(q => q.id === id);
    if (question) {
      setSelectedQuestion(question);
      setIsAskingQuestion(false);
    }
  };
  
  const handleUpvoteQuestion = (id: number) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, upvotes: q.upvotes + 1 } : q
    ));
    
    toast.success("Question upvoted!", {
      description: "Your vote helps others find good content",
    });
  };
  
  const handleUpvoteAnswer = (questionId: number, answerId: number) => {
    // In a real app, this would update the specific answer
    // For now, we'll just simulate it with the top answer if available
    if (selectedQuestion?.topAnswer) {
      const updatedQuestion = {
        ...selectedQuestion,
        topAnswer: {
          ...selectedQuestion.topAnswer,
          upvotes: selectedQuestion.topAnswer.upvotes + 1
        }
      };
      setSelectedQuestion(updatedQuestion);
      
      // Also update in the main list
      setQuestions(questions.map(q => 
        q.id === questionId ? updatedQuestion : q
      ));
      
      toast.success("Answer upvoted!", {
        description: "Your vote helps identify helpful answers",
      });
    }
  };
  
  const handleDownvoteAnswer = (questionId: number, answerId: number) => {
    // Similar to upvote, but for downvoting
    if (selectedQuestion?.topAnswer) {
      const updatedQuestion = {
        ...selectedQuestion,
        topAnswer: {
          ...selectedQuestion.topAnswer,
          downvotes: selectedQuestion.topAnswer.downvotes + 1
        }
      };
      setSelectedQuestion(updatedQuestion);
      
      // Also update in the main list
      setQuestions(questions.map(q => 
        q.id === questionId ? updatedQuestion : q
      ));
      
      toast({
        title: "Answer downvoted",
        description: "Your feedback helps improve answer quality",
      });
    }
  };
  
  const handleAcceptAnswer = (questionId: number, answerId: number) => {
    if (selectedQuestion?.topAnswer) {
      const updatedQuestion = {
        ...selectedQuestion,
        isAnswered: true,
        topAnswer: {
          ...selectedQuestion.topAnswer,
          isAccepted: true
        }
      };
      setSelectedQuestion(updatedQuestion);
      
      // Also update in the main list
      setQuestions(questions.map(q => 
        q.id === questionId ? updatedQuestion : q
      ));
      
      toast.success("Answer accepted as solution!", {
        description: "This will help other farmers with similar issues",
      });
    }
  };

  return (
    <Layout>
      <div className="p-5 pb-20 animate-fade-in">
        {/* Header */}
        <div className="mb-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-crop-green-700">AI Farming Community</h1>
              <p className="text-gray-600">Expert answers and knowledge sharing</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search questions..."
                  className="pl-8 w-full sm:w-auto"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
              
              <Button 
                className="bg-crop-green-600 hover:bg-crop-green-700 text-white"
                onClick={handleAskQuestion}
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Ask Question
              </Button>
            </div>
          </div>
        </div>

        {/* Main Tabs Navigation */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
          <TabsList className="w-full bg-muted grid grid-cols-3">
            <TabsTrigger value="questions" className="text-xs sm:text-sm">
              <MessageSquare className="h-4 w-4 mr-1 hidden sm:inline" />
              Questions & Answers
            </TabsTrigger>
            <TabsTrigger value="experts" className="text-xs sm:text-sm">
              <GraduationCap className="h-4 w-4 mr-1 hidden sm:inline" />
              Expert Directory
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="text-xs sm:text-sm">
              <Trophy className="h-4 w-4 mr-1 hidden sm:inline" />
              Farmer Leaderboard
            </TabsTrigger>
          </TabsList>

          {/* Questions & Answers Tab */}
          <TabsContent value="questions" className="mt-4">
            {isAskingQuestion ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ask a Question</CardTitle>
                  <CardDescription>
                    Get answers from expert farmers and agricultural specialists
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitQuestion} className="space-y-4">
                    <div>
                      <Label htmlFor="question-title">Question Title</Label>
                      <Input 
                        id="question-title" 
                        placeholder="e.g., How do I treat tomato blight?" 
                        value={newQuestion.title}
                        onChange={(e) => setNewQuestion({...newQuestion, title: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="question-body">Details</Label>
                      <Textarea 
                        id="question-body" 
                        placeholder="Describe your problem in detail..." 
                        className="min-h-32"
                        value={newQuestion.body}
                        onChange={(e) => setNewQuestion({...newQuestion, body: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="question-tags">Tags (separate with commas)</Label>
                      <Input 
                        id="question-tags" 
                        placeholder="e.g., Tomatoes, Disease, Organic" 
                        value={newQuestion.tags.join(", ")}
                        onChange={(e) => setNewQuestion({
                          ...newQuestion, 
                          tags: e.target.value.split(",").map(tag => tag.trim())
                        })}
                      />
                    </div>
                    
                    <div className="bg-sky-blue-50 p-3 rounded-lg border border-sky-blue-200">
                      <p className="flex items-center text-sm font-medium text-sky-blue-800">
                        <Zap className="h-4 w-4 mr-1 text-sky-blue-600" />
                        AI Enhancement
                      </p>
                      <p className="text-xs text-sky-blue-700 mt-1">
                        Our AI will analyze your question, suggest edits for clarity, and find similar answered questions
                      </p>
                    </div>
                  </form>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2">
                  <Button 
                    variant="outline"
                    onClick={() => setIsAskingQuestion(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="bg-crop-green-600 hover:bg-crop-green-700 text-white"
                    onClick={handleSubmitQuestion}
                  >
                    Post Question
                  </Button>
                </CardFooter>
              </Card>
            ) : selectedQuestion ? (
              <div className="space-y-4">
                <Button 
                  variant="outline" 
                  className="mb-2"
                  onClick={() => setSelectedQuestion(null)}
                >
                  ← Back to Questions
                </Button>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold">{selectedQuestion.title}</h3>
                      <div className="flex items-center gap-2">
                        {selectedQuestion.isVerified && (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                            <Shield className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        {selectedQuestion.aiRecommended && (
                          <Badge className="bg-crop-green-100 text-crop-green-700 border-0">
                            <Zap className="h-3 w-3 mr-1" />
                            AI Recommended
                          </Badge>
                        )}
                        {selectedQuestion.isBounty && (
                          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                            <Coins className="h-3 w-3 mr-1" />
                            Bounty: {selectedQuestion.bountyAmount} points
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500 mt-2 mb-4">
                      <p>Asked {selectedQuestion.postedAt}</p>
                      <span className="mx-2">•</span>
                      <p>{selectedQuestion.viewCount} views</p>
                      <span className="mx-2">•</span>
                      <div className="flex items-center">
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        <p>{selectedQuestion.upvotes} upvotes</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 mb-4">
                      <div className="flex flex-col items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleUpvoteQuestion(selectedQuestion.id)}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium">{selectedQuestion.upvotes}</span>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8 text-gray-400"
                          disabled
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div>
                        <p className="text-gray-800">{selectedQuestion.body}</p>
                        
                        <div className="flex flex-wrap gap-1 mt-4">
                          {selectedQuestion.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="bg-gray-50">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-end mt-4">
                          <div className="flex items-center text-xs text-gray-600">
                            <p>Asked by</p>
                            <Badge className={`ml-2 bg-${selectedQuestion.author.badgeColor}-100 text-${selectedQuestion.author.badgeColor}-800 border-0`}>
                              {selectedQuestion.author.name}
                            </Badge>
                            <p className="ml-2">{selectedQuestion.author.region}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Separator className="my-6" />
                    
                    {/* Display the top answer */}
                    {selectedQuestion.topAnswer ? (
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-lg font-semibold flex items-center">
                            {selectedQuestion.topAnswer.isAccepted && (
                              <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
                            )}
                            {selectedQuestion.topAnswer.isAccepted ? "Accepted Answer" : "Top Answer"}
                          </h4>
                          
                          {selectedQuestion.topAnswer.isAiEnhanced && (
                            <Badge className="bg-crop-green-100 text-crop-green-700 border-0">
                              <Zap className="h-3 w-3 mr-1" />
                              AI Enhanced
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex gap-3">
                          <div className="flex flex-col items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => handleUpvoteAnswer(selectedQuestion.id, selectedQuestion.topAnswer!.id)}
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <span className="text-sm font-medium">{selectedQuestion.topAnswer.upvotes}</span>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => handleDownvoteAnswer(selectedQuestion.id, selectedQuestion.topAnswer!.id)}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div>
                            <p className="text-gray-800">{selectedQuestion.topAnswer.body}</p>
                            
                            <div className="flex flex-wrap items-center justify-between mt-4">
                              <div className="flex items-center text-xs text-gray-600">
                                <p>Answered {selectedQuestion.topAnswer.postedAt}</p>
                                <div className="ml-2 flex items-center">
                                  {selectedQuestion.topAnswer.author.isExpert ? (
                                    <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                                      <GraduationCap className="h-3 w-3 mr-1" />
                                      {selectedQuestion.topAnswer.author.name}
                                    </Badge>
                                  ) : (
                                    <Badge className={`bg-${selectedQuestion.topAnswer.author.badgeColor}-100 text-${selectedQuestion.topAnswer.author.badgeColor}-800 border-0`}>
                                      {selectedQuestion.topAnswer.author.name}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              {!selectedQuestion.topAnswer.isAccepted && (
                                <Button 
                                  size="sm" 
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => handleAcceptAnswer(selectedQuestion.id, selectedQuestion.topAnswer!.id)}
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                  Accept Answer
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <MessageCircle className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">No answers yet. Be the first to answer!</p>
                      </div>
                    )}
                    
                    <div className="mt-6">
                      <h4 className="text-lg font-semibold mb-4">Your Answer</h4>
                      <Textarea 
                        placeholder="Share your knowledge and help other farmers..." 
                        className="min-h-32 mb-4"
                      />
                      <div className="bg-crop-green-50 p-3 rounded-lg border border-crop-green-100 mb-4">
                        <p className="flex items-center text-sm font-medium text-crop-green-800">
                          <Zap className="h-4 w-4 mr-1 text-crop-green-600" />
                          AI Assistance
                        </p>
                        <p className="text-xs text-crop-green-700 mt-1">
                          Our AI will enhance your answer with research-backed information and improve clarity
                        </p>
                      </div>
                      <div className="flex justify-end">
                        <Button 
                          className="bg-crop-green-600 hover:bg-crop-green-700 text-white"
                          onClick={() => {
                            toast.success("Answer submitted for review", {
                              description: "Your answer will be visible after AI verification",
                            });
                          }}
                        >
                          Post Answer
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map(question => (
                  <Card 
                    key={question.id} 
                    className={`cursor-pointer hover:shadow-md transition-shadow ${
                      question.aiRecommended ? 'border-crop-green-300' : ''
                    }`}
                    onClick={() => handleViewQuestion(question.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start">
                        <div className="flex flex-col items-center mr-4 text-center">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 mb-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpvoteQuestion(question.id);
                            }}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <span className="text-sm font-medium">{question.upvotes}</span>
                          <p className="text-xs text-gray-500 mt-1">votes</p>
                        </div>
                        
                        <div className="flex flex-col items-center mx-2 text-center">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            question.answerCount > 0 
                              ? question.isAnswered 
                                ? 'bg-green-100' 
                                : 'bg-amber-100'
                              : 'bg-gray-100'
                          }`}>
                            <span className={`text-sm font-medium ${
                              question.answerCount > 0 
                                ? question.isAnswered 
                                  ? 'text-green-700' 
                                  : 'text-amber-700'
                                : 'text-gray-500'
                            }`}>{question.answerCount}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">answers</p>
                        </div>
                        
                        <div className="flex flex-col items-center mx-2 text-center">
                          <div className="h-8 w-8 rounded-full bg-sky-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-sky-blue-700">{question.viewCount}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">views</p>
                        </div>
                        
                        <div className="flex-grow ml-2">
                          <div className="flex items-center">
                            <h3 className="font-semibold text-lg hover:text-crop-green-700 transition-colors">
                              {question.title}
                            </h3>
                          </div>
                          
                          <div className="flex flex-wrap gap-1 my-2">
                            {question.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="bg-gray-50">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-xs text-gray-500">
                              <p>Asked {question.postedAt}</p>
                              <span className="mx-1">•</span>
                              <p>by</p>
                              <Badge className={`ml-1 bg-${question.author.badgeColor}-100 text-${question.author.badgeColor}-800 border-0`}>
                                {question.author.name}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center">
                              {question.isVerified && (
                                <Badge className="bg-blue-100 text-blue-800 border-blue-200 mr-1">
                                  <Shield className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                              {question.aiRecommended && (
                                <Badge className="bg-crop-green-100 text-crop-green-700 border-0">
                                  <Zap className="h-3 w-3 mr-1" />
                                  AI Recommended
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Expert Directory Tab */}
          <TabsContent value="experts" className="mt-4">
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center">
                <GraduationCap className="h-5 w-5 mr-2 text-crop-green-600" />
                Agricultural Experts
              </h2>
              <p className="text-sm text-gray-600">Connect with certified agricultural experts for personalized advice</p>
              
              {experts.map(expert => (
                <Card key={expert.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-4">
                        <div className="h-14 w-14 rounded-full bg-crop-green-100 flex items-center justify-center">
                          <User className="h-8 w-8 text-crop-green-600" />
                        </div>
                        <div className={`mt-2 text-xs text-center px-2 py-1 rounded-full ${
                          expert.isOnline 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {expert.isOnline ? 'Online' : 'Offline'}
                        </div>
                      </div>
                      
                      <div className="flex-grow">
                        <div className="flex items-center mb-1">
                          <h3 className="font-semibold text-lg mr-2">{expert.name}</h3>
                          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                            <GraduationCap className="h-3 w-3 mr-1" />
                            Expert
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{expert.specialization}</p>
                        
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
                          <div>
                            <p className="text-xs text-gray-500">Region</p>
                            <p className="text-sm font-medium">{expert.region}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Accept Rate</p>
                            <p className="text-sm font-medium">{expert.acceptRate}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Total Answers</p>
                            <p className="text-sm font-medium">{expert.answersCount}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Response Time</p>
                            <p className="text-sm font-medium">{expert.responseTime}</p>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 mb-1">Specializes in</p>
                          <div className="flex flex-wrap gap-1">
                            {expert.crops.map((crop, index) => (
                              <Badge key={index} className="bg-crop-green-100 text-crop-green-700 border-0">
                                {crop}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-center text-sm">
                          <div className="flex items-center bg-amber-100 px-2 py-1 rounded-full mr-2">
                            <Star className="h-4 w-4 text-amber-500 mr-1" />
                            <span className="font-medium text-amber-700">{expert.rating}/5.0</span>
                          </div>
                          
                          <div className="flex items-center bg-blue-100 px-2 py-1 rounded-full">
                            <ThumbsUp className="h-4 w-4 text-blue-500 mr-1" />
                            <span className="font-medium text-blue-700">{Math.floor(expert.answersCount * 0.9)}+ helpful answers</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex justify-end mt-4 space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-gray-600"
                        onClick={() => {
                          toast({
                            title: "View Profile",
                            description: `Viewing detailed profile of ${expert.name}`,
                          });
                        }}
                      >
                        <GraduationCap className="h-4 w-4 mr-1" />
                        View Profile
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-crop-green-600 hover:bg-crop-green-700 text-white"
                        onClick={() => {
                          toast.success("Request sent!", {
                            description: `${expert.name} will respond to your questions soon`,
                          });
                        }}
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Ask Question
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Farmer Leaderboard Tab */}
          <TabsContent value="leaderboard" className="mt-4">
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-crop-green-600" />
                Community Leaderboard
              </h2>
              <p className="text-sm text-gray-600">Top farmers who share valuable knowledge and help others</p>
              
              {leaderboard.map((farmer, index) => (
                <Card 
                  key={farmer.id} 
                  className={`overflow-hidden ${
                    index === 0 ? 'border-amber-400 bg-amber-50' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-4 text-center">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold ${
                          index === 0 
                            ? 'bg-amber-500' 
                            : index === 1 
                              ? 'bg-gray-400' 
                              : 'bg-soil-brown-400'
                        }`}>
                          {index + 1}
                        </div>
                        <p className="text-xs font-medium mt-1">{farmer.totalPoints} pts</p>
                      </div>
                      
                      <div className="flex-grow">
                        <div className="flex items-center mb-1">
                          <h3 className="font-semibold text-lg mr-2">{farmer.name}</h3>
                          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                            {farmer.rank}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                          <div>
                            <p className="text-xs text-gray-500">Region</p>
                            <p className="text-sm font-medium">{farmer.region}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Questions</p>
                            <p className="text-sm font-medium">{farmer.questionsCount}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Answers</p>
                            <p className="text-sm font-medium">{farmer.answersCount}</p>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 mb-1">Badges Earned</p>
                          <div className="flex flex-wrap gap-1">
                            {farmer.badges.map((badge, badgeIndex) => (
                              <Badge 
                                key={badgeIndex} 
                                className={`bg-${badge.color}-100 text-${badge.color}-700 border-0`}
                              >
                                <badge.icon className="h-3 w-3 mr-1" />
                                {badge.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="flex items-center bg-green-100 px-2 py-1 rounded-full mr-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                            <span className="text-xs font-medium text-green-700">
                              {farmer.acceptedAnswers} accepted answers
                            </span>
                          </div>
                          
                          <div className="flex items-center bg-blue-100 px-2 py-1 rounded-full">
                            <Heart className="h-4 w-4 text-red-500 mr-1" />
                            <span className="text-xs font-medium text-blue-700">
                              Helped {farmer.acceptedAnswers * 3}+ farmers
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action button */}
                    <div className="flex justify-end mt-4">
                      <Button 
                        variant="outline"
                        size="sm" 
                        className="text-gray-600"
                        onClick={() => {
                          toast({
                            title: "Viewing Profile",
                            description: `Viewing detailed contributions of ${farmer.name}`,
                          });
                        }}
                      >
                        <User className="h-4 w-4 mr-1" />
                        View Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <div className="text-center py-4">
                <p className="text-sm text-gray-600 mb-2">You're currently ranked #24 in your region</p>
                <Button 
                  variant="outline"
                  onClick={() => {
                    toast({
                      title: "Improve Your Ranking",
                      description: "Answer more questions to climb the leaderboard!",
                    });
                  }}
                >
                  <Trophy className="h-4 w-4 mr-1" />
                  View Your Profile & Ranking
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Community;
