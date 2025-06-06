import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; // Properly import Label
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Award,
  Book,
  BookOpen,
  Check,
  ChevronRight,
  Clock,
  Coins,
  FileCheck,
  FilePlus,
  Filter,
  HelpCircle,
  Library,
  Lightbulb,
  MessageCircle,
  Microscope,
  Sparkles,
  Star,
  ThumbsUp,
  Tractor,
  Trophy,
  User,
  Users,
  Zap,
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Type definitions
interface Question {
  id: number;
  title: string;
  body: string;
  category: string;
  tags: string[];
  authorId: number;
  author: string;
  authorRank: string;
  authorBadges: string[];
  authorAvatar?: string;
  datePosted: string;
  views: number;
  upvotes: number;
  answers: Answer[];
  status: 'open' | 'answered' | 'solved';
  isAIVerified?: boolean;
  isFeatured?: boolean;
  isFollowing?: boolean;
}

interface Answer {
  id: number;
  authorId: number;
  author: string;
  authorRank: string;
  authorBadges: string[];
  authorAvatar?: string;
  datePosted: string;
  body: string;
  upvotes: number;
  isAccepted: boolean;
  isAIVerified?: boolean;
  comments: Comment[];
}

interface Comment {
  id: number;
  authorId: number;
  author: string;
  body: string;
  datePosted: string;
}

interface TrainingResource {
  id: number;
  title: string;
  description: string;
  category: string;
  type: 'course' | 'tutorial' | 'video' | 'article';
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  author: string;
  authorType: 'expert' | 'organization' | 'ai';
  datePublished: string;
  thumbnail?: string;
  popularity: number;
  isFree: boolean;
  isAICertified: boolean;
  isRecommended?: boolean;
  progress?: number;
  tags: string[];
}

interface Expert {
  id: number;
  name: string;
  specialization: string;
  badges: string[];
  rating: number;
  answers: number;
  avatar?: string;
  availability: string;
  verified: boolean;
  organization?: string;
  bio: string;
  isFollowing?: boolean;
}

interface Badge {
  id: number;
  name: string;
  description: string;
  icon: any;
  category: 'achievement' | 'expertise' | 'contribution';
  level: 'bronze' | 'silver' | 'gold';
  requirements: string;
  earnedBy: number;
  image?: string;
  isEarned?: boolean;
  progress?: number;
}

const Community = () => {
  // State hooks
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      title: "What's the best natural pesticide for tomato plants?",
      body: "I'm growing organic tomatoes and noticing some pest damage. What natural solutions have worked well for others?",
      category: 'Organic Farming',
      tags: ['Tomatoes', 'Pest Control', 'Organic'],
      authorId: 101,
      author: 'Sarah K.',
      authorRank: 'Experienced Farmer',
      authorBadges: ['Organic Certified', 'Top Contributor'],
      datePosted: '2 days ago',
      views: 156,
      upvotes: 24,
      answers: [
        {
          id: 1,
          authorId: 102,
          author: 'Dr. Emmanuel N.',
          authorRank: 'Agricultural Expert',
          authorBadges: ['PhD Entomology', 'Verified Expert'],
          datePosted: '1 day ago',
          body: 'For tomato plants, I recommend a neem oil solution. Mix 1 tablespoon of neem oil with 1 teaspoon of mild liquid soap and 1 liter of water. Spray on the affected plants every 7-14 days. Neem oil disrupts feeding and reproduction of many pests without harming beneficial insects if used correctly. Another effective option is a garlic spray: Blend 5-6 garlic cloves with 1 liter of water, strain and spray. The sulfur compounds in garlic act as a natural repellent.',
          upvotes: 46,
          isAccepted: true,
          isAIVerified: true,
          comments: [
            {
              id: 1,
              authorId: 101,
              author: 'Sarah K.',
              body: "Thanks! I'll try the neem oil solution first. Is it safe to use until harvest time?",
              datePosted: '1 day ago',
            },
            {
              id: 2,
              authorId: 102,
              author: 'Dr. Emmanuel N.',
              body: 'Yes, but stop spraying 7 days before harvest and wash your tomatoes well before consumption.',
              datePosted: '1 day ago',
            },
          ],
        },
        {
          id: 2,
          authorId: 103,
          author: 'Thomas M.',
          authorRank: 'Urban Farmer',
          authorBadges: ['Community Builder'],
          datePosted: '2 days ago',
          body: "I've had success with diatomaceous earth for controlling tomato pests. It's a powder made from fossilized algae that cuts through insects' exoskeletons. Apply it around the base of plants and lightly on leaves. It must be reapplied after rain. It's completely natural and safe for consumption.",
          upvotes: 18,
          isAccepted: false,
          comments: [],
        },
      ],
      status: 'solved',
      isAIVerified: true,
    },
    {
      id: 2,
      title: 'When is the best time to plant maize in Central Region?',
      body: "I'm a new farmer in the Central Region and planning my first maize planting. When should I plant for optimal yields?",
      category: 'Crop Planning',
      tags: ['Maize', 'Planting Schedule', 'Central Region'],
      authorId: 104,
      author: 'Joseph N.',
      authorRank: 'New Farmer',
      authorBadges: [],
      datePosted: '3 days ago',
      views: 203,
      upvotes: 31,
      answers: [
        {
          id: 3,
          authorId: 105,
          author: 'Grace O.',
          authorRank: 'Master Farmer',
          authorBadges: ['Crop Specialist', 'Mentor'],
          datePosted: '2 days ago',
          body: "In the Central Region, the optimal planting times for maize are mid-March to early April for the long rains season, and mid-September to early October for the short rains season. However, with changing climate patterns, it's best to monitor local rainfall forecasts. Plant when there's consistent soil moisture after the first good rains. The soil temperature should be at least 18°C for good germination. You should also consider using drought-tolerant varieties given the increasing rainfall variability.",
          upvotes: 42,
          isAccepted: false,
          comments: [],
        },
      ],
      status: 'answered',
      isFeatured: true,
    },
  ]);

  const [trainingResources, setTrainingResources] = useState<
    TrainingResource[]
  >([
    {
      id: 1,
      title: 'Organic Pest Management Master Course',
      description:
        'Comprehensive training on controlling pests without chemical pesticides. Learn natural solutions that protect crops and biodiversity.',
      category: 'Pest Management',
      type: 'course',
      level: 'intermediate',
      duration: '4 hours',
      author: 'International Organic Farming Institute',
      authorType: 'organization',
      datePublished: '2 months ago',
      thumbnail: 'https://images.unsplash.com/photo-1632634415872-7d402cd7fa32',
      popularity: 1245,
      isFree: false,
      isAICertified: true,
      tags: ['Organic', 'Pest Control', 'Certification'],
    },
    {
      id: 2,
      title: 'Soil Health Fundamentals',
      description:
        'Learn testing, maintaining, and improving your soil quality for maximum crop yields.',
      category: 'Soil Management',
      type: 'tutorial',
      level: 'beginner',
      duration: '2 hours',
      author: 'Dr. Fertility',
      authorType: 'expert',
      datePublished: '3 weeks ago',
      popularity: 856,
      isFree: true,
      isAICertified: true,
      isRecommended: true,
      progress: 65,
      tags: ['Soil', 'Nutrients', 'Testing'],
    },
    {
      id: 3,
      title: 'Drip Irrigation Implementation',
      description:
        'Step-by-step guide to set up water-efficient irrigation systems for small farms.',
      category: 'Water Management',
      type: 'video',
      level: 'intermediate',
      duration: '1.5 hours',
      author: 'WaterWise Farming',
      authorType: 'organization',
      datePublished: '1 month ago',
      popularity: 723,
      isFree: true,
      isAICertified: true,
      tags: ['Irrigation', 'Water Conservation', 'Installation'],
    },
  ]);

  const [experts, setExperts] = useState<Expert[]>([
    {
      id: 1,
      name: 'Dr. James Mwangi',
      specialization: 'Crop Diseases & Prevention',
      badges: [
        'PhD Plant Pathology',
        'Research Award Winner',
        '300+ Solutions',
      ],
      rating: 4.9,
      answers: 328,
      availability: 'Available for consultations',
      verified: true,
      organization: 'National Agricultural Research Institute',
      bio: 'Specialist in identifying and treating crop diseases with over 15 years of research experience focused on sustainable disease management.',
    },
    {
      id: 2,
      name: 'Mary Wangari',
      specialization: 'Organic Certification & Methods',
      badges: ['Certified Organic Inspector', 'Mentorship Award'],
      rating: 4.8,
      answers: 245,
      availability: 'Responds within 24 hours',
      verified: true,
      organization: 'Organic Farmers Association',
      bio: 'Helping farmers transition to certified organic methods for over a decade. Expert in organic certification requirements and natural farming techniques.',
    },
    {
      id: 3,
      name: 'Robert Ochieng',
      specialization: 'Agricultural Economics & Market Access',
      badges: ['Market Specialist', 'Business Mentor'],
      rating: 4.7,
      answers: 189,
      availability: 'Available weekdays',
      verified: true,
      bio: 'Former agricultural export manager now helping small-scale farmers access better markets and improve profitability through smart business practices.',
    },
  ]);

  const [badges, setBadges] = useState<Badge[]>([
    {
      id: 1,
      name: 'Soil Master',
      description:
        'Awarded for exceptional knowledge in soil health and management',
      icon: Trophy,
      category: 'expertise',
      level: 'gold',
      requirements: 'Answer 50 soil-related questions with high ratings',
      earnedBy: 86,
      isEarned: false,
      progress: 65,
    },
    {
      id: 2,
      name: 'Community Champion',
      description:
        'Awarded for helping other farmers through consistent high-quality contributions',
      icon: Users,
      category: 'contribution',
      level: 'silver',
      requirements: 'Help 100 farmers with verified solutions',
      earnedBy: 124,
      isEarned: true,
    },
    {
      id: 3,
      name: 'Crop Doctor',
      description:
        'Awarded for expertise in identifying and treating crop diseases',
      icon: Microscope,
      category: 'expertise',
      level: 'bronze',
      requirements: 'Successfully identify and solve 25 crop disease problems',
      earnedBy: 210,
      isEarned: false,
      progress: 40,
    },
  ]);

  const [selectedTab, setSelectedTab] = useState('questions');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [askingQuestion, setAskingQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    title: '',
    body: '',
    category: '',
    tags: '',
  });
  const [showAIRecommendations, setShowAIRecommendations] = useState(true);

  // Filter questions based on category and search query
  const filteredQuestions = questions.filter((question) => {
    const matchesCategory =
      selectedCategory === 'all' || question.category === selectedCategory;
    const matchesSearch =
      question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.body.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Event handlers
  const askQuestion = () => {
    setAskingQuestion(true);
  };

  const submitQuestion = () => {
    if (!newQuestion.title || !newQuestion.body || !newQuestion.category) {
      toast.error('Please fill in all required fields', {
        description: 'Title, description, and category are required',
      });
      return;
    }

    const tagsArray = newQuestion.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag !== '');

    const newQuestionObj: Question = {
      id: questions.length + 1,
      title: newQuestion.title,
      body: newQuestion.body,
      category: newQuestion.category,
      tags: tagsArray,
      authorId: 999, // Using a placeholder ID for the current user
      author: 'You',
      authorRank: 'Farmer',
      authorBadges: [],
      datePosted: 'Just now',
      views: 0,
      upvotes: 0,
      answers: [],
      status: 'open',
    };

    setQuestions([newQuestionObj, ...questions]);
    setNewQuestion({
      title: '',
      body: '',
      category: '',
      tags: '',
    });
    setAskingQuestion(false);

    toast.success('Your question has been posted!', {
      description: 'Experts will be notified and can now answer your question',
    });

    // Simulate AI recommendation
    setTimeout(() => {
      toast.info('AI Assistant Found Something', {
        description:
          'Based on your question, we found 3 similar issues with solutions',
      });
    }, 3000);
  };

  const cancelQuestion = () => {
    setAskingQuestion(false);
    setNewQuestion({
      title: '',
      body: '',
      category: '',
      tags: '',
    });
  };

  const upvoteQuestion = (questionId: number) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId ? { ...q, upvotes: q.upvotes + 1 } : q
      )
    );

    toast.success('Upvoted question', {
      description: 'Thank you for your feedback!',
    });
  };

  const upvoteAnswer = (questionId: number, answerId: number) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          const updatedAnswers = q.answers.map((a) =>
            a.id === answerId ? { ...a, upvotes: a.upvotes + 1 } : a
          );
          return { ...q, answers: updatedAnswers };
        }
        return q;
      })
    );

    toast.success('Upvoted answer', {
      description: 'Thank you for your feedback!',
    });
  };

  const followQuestion = (questionId: number) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId ? { ...q, isFollowing: !q.isFollowing } : q
      )
    );

    const question = questions.find((q) => q.id === questionId);
    const isNowFollowing = !(question?.isFollowing || false);

    if (isNowFollowing) {
      toast.success('Following question', {
        description: "You'll be notified of new answers",
      });
    } else {
      toast.info('Unfollowed question', {
        description: "You'll no longer receive notifications",
      });
    }
  };

  const enrollInTraining = (resourceId: number) => {
    setTrainingResources(
      trainingResources.map((r) =>
        r.id === resourceId ? { ...r, isRecommended: false, progress: 0 } : r
      )
    );

    const resource = trainingResources.find((r) => r.id === resourceId);

    toast.success(`Enrolled in "${resource?.title}"`, {
      description: 'Your learning materials are now available in My Learning',
    });
  };

  const followExpert = (expertId: number) => {
    setExperts(
      experts.map((e) =>
        e.id === expertId ? { ...e, isFollowing: !e.isFollowing } : e
      )
    );

    const expert = experts.find((e) => e.id === expertId);
    const isNowFollowing = !(expert?.isFollowing || false);

    if (isNowFollowing) {
      toast.success(`Following ${expert?.name}`, {
        description:
          "You'll be notified when they answer questions in your areas of interest",
      });
    } else {
      toast.info(`Unfollowed ${expert?.name}`, {
        description:
          "You'll no longer receive notifications about their activity",
      });
    }
  };

  const contactExpert = (expertId: number) => {
    const expert = experts.find((e) => e.id === expertId);

    toast.info('Contact request sent', {
      description: `${expert?.name} will receive your message and contact details`,
    });
  };

  return (
    <Layout>
      <div className="p-5 pb-20 animate-fade-in">
        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-crop-green-700">
                AI Expert Community
              </h1>
              <p className="text-gray-600">
                Africa's largest AI-powered farming knowledge network
              </p>
            </div>
            <Button
              onClick={askQuestion}
              className="bg-crop-green-600 hover:bg-crop-green-700 text-white flex items-center"
            >
              <FilePlus className="h-4 w-4 mr-2" />
              Ask a Question
            </Button>
          </div>
        </div>

        {/* AI Recommendations Card (conditionally shown) */}
        {showAIRecommendations && (
          <Card className="mb-5 border-crop-green-200 bg-crop-green-50">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg text-crop-green-700 flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-amber-500" />
                  AI Personalized Recommendations
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAIRecommendations(false)}
                  className="h-8 w-8 p-0"
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="bg-white p-3 rounded-lg border border-gray-100">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">
                        Based on your crops: Soil Health Fundamentals
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        This course will help you improve your maize yields
                        through better soil management
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => enrollInTraining(2)}
                      >
                        View Course
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-gray-100">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-crop-green-100 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-crop-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">
                        Expert match: Dr. James Mwangi
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Crop disease specialist can help with your tomato plant
                        issues
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => followExpert(1)}
                      >
                        Connect
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-gray-100">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Award className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">
                        You're 65% to earning the Soil Master badge!
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Answer more soil-related questions to unlock this
                        achievement
                      </p>
                      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: '65%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ask Question Modal */}
        {askingQuestion && (
          <Card className="mb-5 border-amber-200 animate-fade-in">
            <CardHeader>
              <CardTitle className="text-lg">
                Ask Your Farming Question
              </CardTitle>
              <CardDescription>
                Our AI will immediately match you with experts and existing
                answers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="question-title">Question Title</Label>
                  <Input
                    id="question-title"
                    placeholder="E.g., How do I treat brown spots on my tomato leaves?"
                    value={newQuestion.title}
                    onChange={(e) =>
                      setNewQuestion({ ...newQuestion, title: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="question-body">Description</Label>
                  <Textarea
                    id="question-body"
                    placeholder="Provide details about your question..."
                    className="min-h-[120px]"
                    value={newQuestion.body}
                    onChange={(e) =>
                      setNewQuestion({ ...newQuestion, body: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="question-category">Category</Label>
                  <Select
                    value={newQuestion.category}
                    onValueChange={(value) =>
                      setNewQuestion({ ...newQuestion, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Crop Planning">
                        Crop Planning
                      </SelectItem>
                      <SelectItem value="Pest Management">
                        Pest Management
                      </SelectItem>
                      <SelectItem value="Disease Control">
                        Disease Control
                      </SelectItem>
                      <SelectItem value="Soil Management">
                        Soil Management
                      </SelectItem>
                      <SelectItem value="Irrigation">Irrigation</SelectItem>
                      <SelectItem value="Organic Farming">
                        Organic Farming
                      </SelectItem>
                      <SelectItem value="Harvesting">Harvesting</SelectItem>
                      <SelectItem value="Storage">Storage</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="question-tags">Tags (comma separated)</Label>
                  <Input
                    id="question-tags"
                    placeholder="E.g., tomatoes, diseases, organic"
                    value={newQuestion.tags}
                    onChange={(e) =>
                      setNewQuestion({ ...newQuestion, tags: e.target.value })
                    }
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline" onClick={cancelQuestion}>
                Cancel
              </Button>
              <Button
                className="bg-crop-green-600 hover:bg-crop-green-700 text-white"
                onClick={submitQuestion}
              >
                Post Question
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Main Tabs Navigation */}
        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="mb-6"
        >
          <TabsList className="w-full bg-muted grid grid-cols-4">
            <TabsTrigger value="questions" className="text-xs sm:text-sm">
              <HelpCircle className="h-4 w-4 mr-1 hidden sm:inline" />
              Questions
            </TabsTrigger>
            <TabsTrigger value="training" className="text-xs sm:text-sm">
              <Book className="h-4 w-4 mr-1 hidden sm:inline" />
              Learning
            </TabsTrigger>
            <TabsTrigger value="experts" className="text-xs sm:text-sm">
              <User className="h-4 w-4 mr-1 hidden sm:inline" />
              Experts
            </TabsTrigger>
            <TabsTrigger value="achievements" className="text-xs sm:text-sm">
              <Trophy className="h-4 w-4 mr-1 hidden sm:inline" />
              Achievements
            </TabsTrigger>
          </TabsList>

          {/* Questions Tab */}
          <TabsContent value="questions" className="mt-4">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="w-full md:w-2/3">
                <Input
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mb-4"
                />
              </div>
              <div className="w-full md:w-1/3">
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Crop Planning">Crop Planning</SelectItem>
                    <SelectItem value="Pest Management">
                      Pest Management
                    </SelectItem>
                    <SelectItem value="Disease Control">
                      Disease Control
                    </SelectItem>
                    <SelectItem value="Soil Management">
                      Soil Management
                    </SelectItem>
                    <SelectItem value="Irrigation">Irrigation</SelectItem>
                    <SelectItem value="Organic Farming">
                      Organic Farming
                    </SelectItem>
                    <SelectItem value="Harvesting">Harvesting</SelectItem>
                    <SelectItem value="Storage">Storage</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              {filteredQuestions.length === 0 ? (
                <Card className="bg-gray-50">
                  <CardContent className="pt-6 text-center">
                    <HelpCircle className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium">
                      No questions found
                    </h3>
                    <p className="mt-1 text-gray-500">
                      Try adjusting your search or filters
                    </p>
                    <Button
                      className="mt-4 bg-crop-green-600 hover:bg-crop-green-700 text-white"
                      onClick={askQuestion}
                    >
                      Ask a New Question
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredQuestions.map((question) => (
                  <Card
                    key={question.id}
                    className={
                      question.isFeatured ? 'border-amber-300 bg-amber-50' : ''
                    }
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-grow">
                          <div className="flex items-center">
                            <h3 className="font-semibold text-lg mr-2">
                              {question.title}
                            </h3>
                            {question.isAIVerified && (
                              <Badge className="bg-crop-green-100 text-crop-green-700 border-0 flex items-center">
                                <Check className="h-3 w-3 mr-1" />
                                AI Verified
                              </Badge>
                            )}
                            {question.isFeatured && (
                              <Badge className="ml-2 bg-amber-100 text-amber-700 border-0 flex items-center">
                                <Sparkles className="h-3 w-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                          </div>

                          <div className="mt-1 text-sm text-gray-500 flex items-center flex-wrap gap-1">
                            <span className="flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              {question.author}
                            </span>
                            <span>•</span>
                            <span>{question.datePosted}</span>
                            <span>•</span>
                            <span className="flex items-center">
                              <MessageCircle className="h-3 w-3 mr-1" />
                              {question.answers.length} answers
                            </span>
                            <span>•</span>
                            <span>{question.views} views</span>
                          </div>

                          <div className="mt-2">
                            <p className="text-gray-700">
                              {question.body.length > 150
                                ? `${question.body.substring(0, 150)}...`
                                : question.body}
                            </p>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-1">
                            <Badge className="bg-gray-100 text-gray-800 border-0">
                              {question.category}
                            </Badge>
                            {question.tags.map((tag, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-gray-600"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          {/* First answer preview if exists */}
                          {question.answers.length > 0 &&
                            question.status === 'solved' && (
                              <div className="mt-4 bg-crop-green-50 p-3 rounded-lg border border-crop-green-100">
                                <div className="flex items-start">
                                  <div className="mt-0.5">
                                    <Check className="h-5 w-5 text-crop-green-600" />
                                  </div>
                                  <div className="ml-2">
                                    <div className="text-sm font-medium text-gray-900 flex items-center">
                                      Accepted Answer from{' '}
                                      {question.answers[0].author}
                                      {question.answers[0].isAIVerified && (
                                        <Badge className="ml-2 h-5 bg-crop-green-100 text-crop-green-700 border-0 flex items-center">
                                          <Check className="h-3 w-3 mr-1" />
                                          AI Verified
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-700 mt-1">
                                      {question.answers[0].body.length > 120
                                        ? `${question.answers[0].body.substring(0, 120)}...`
                                        : question.answers[0].body}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex justify-between mt-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-gray-600 flex items-center"
                            onClick={() => upvoteQuestion(question.id)}
                          >
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            {question.upvotes}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className={`text-gray-600 flex items-center ${question.isFollowing ? 'bg-crop-green-50' : ''}`}
                            onClick={() => followQuestion(question.id)}
                          >
                            {question.isFollowing ? 'Following' : 'Follow'}
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          className="bg-crop-green-600 hover:bg-crop-green-700 text-white"
                        >
                          View Question
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Training Tab */}
          <TabsContent value="training" className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center">
                <Book className="h-5 w-5 mr-2 text-crop-green-600" />
                AI-Certified Learning Resources
              </h2>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="text-gray-600">
                  <Filter className="h-4 w-4 mr-1" />
                  Filter
                </Button>
                <Button variant="outline" size="sm" className="text-gray-600">
                  My Learning
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trainingResources.map((resource) => (
                <Card key={resource.id} className="overflow-hidden">
                  <div className="h-36 bg-gray-200 relative">
                    {resource.thumbnail ? (
                      <div
                        className="w-full h-full bg-center bg-cover"
                        style={{
                          backgroundImage: `url(${resource.thumbnail})`,
                        }}
                      ></div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <Library className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex space-x-1">
                      <Badge
                        className={
                          resource.isFree
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }
                      >
                        {resource.isFree ? 'Free' : 'Premium'}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center">
                          {resource.type === 'course' && (
                            <Book className="h-4 w-4 text-crop-green-600 mr-1" />
                          )}
                          {resource.type === 'tutorial' && (
                            <FileCheck className="h-4 w-4 text-blue-600 mr-1" />
                          )}
                          {resource.type === 'video' && (
                            <Library className="h-4 w-4 text-amber-600 mr-1" />
                          )}
                          {resource.type === 'article' && (
                            <BookOpen className="h-4 w-4 text-purple-600 mr-1" />
                          )}
                          <span className="text-xs font-medium uppercase text-gray-500">
                            {resource.type}
                          </span>
                          <span className="mx-1">•</span>
                          <span className="text-xs text-gray-500">
                            {resource.level}
                          </span>
                          <span className="mx-1">•</span>
                          <span className="text-xs text-gray-500">
                            {resource.duration}
                          </span>
                        </div>

                        <h3 className="font-semibold text-gray-900 mt-1">
                          {resource.title}
                        </h3>

                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {resource.description}
                        </p>

                        <div className="mt-2 flex items-center">
                          <span className="text-xs text-gray-500">
                            {resource.author}
                          </span>
                          <span className="mx-1">•</span>
                          <span className="text-xs text-gray-500">
                            {resource.popularity} learners
                          </span>
                        </div>

                        {resource.progress !== undefined && (
                          <div className="mt-2">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Progress</span>
                              <span>{resource.progress}%</span>
                            </div>
                            <Progress
                              value={resource.progress}
                              className="h-1.5"
                            />
                          </div>
                        )}

                        <div className="mt-3 flex flex-wrap gap-1">
                          <Badge className="bg-gray-100 text-gray-800 border-0">
                            {resource.category}
                          </Badge>
                          {resource.tags.slice(0, 2).map((tag, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-gray-600"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {resource.tags.length > 2 && (
                            <Badge variant="outline" className="text-gray-600">
                              +{resource.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-4">
                      {resource.progress !== undefined ? (
                        <Button className="w-full bg-crop-green-600 hover:bg-crop-green-700 text-white">
                          Continue Learning
                        </Button>
                      ) : (
                        <Button
                          className="w-full bg-crop-green-600 hover:bg-crop-green-700 text-white"
                          onClick={() => enrollInTraining(resource.id)}
                        >
                          Enroll Now
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Experts Tab */}
          <TabsContent value="experts" className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center">
                <User className="h-5 w-5 mr-2 text-crop-green-600" />
                AI-Verified Farming Experts
              </h2>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="text-gray-600">
                  <Filter className="h-4 w-4 mr-1" />
                  Filter by Specialty
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {experts.map((expert) => (
                <Card key={expert.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="md:w-1/4 flex flex-col items-center text-center">
                        <div className="w-24 h-24 rounded-full bg-gray-200 mb-2 overflow-hidden">
                          {expert.avatar ? (
                            <img
                              src={expert.avatar}
                              alt={expert.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-crop-green-100">
                              <User className="h-12 w-12 text-crop-green-500" />
                            </div>
                          )}
                        </div>
                        <h3 className="font-semibold">{expert.name}</h3>
                        <p className="text-sm text-gray-600">
                          {expert.specialization}
                        </p>
                        <div className="mt-1 flex items-center justify-center">
                          <Star className="h-4 w-4 text-amber-500 mr-1" />
                          <span className="font-medium">{expert.rating}</span>
                          <span className="mx-1">•</span>
                          <span className="text-sm text-gray-600">
                            {expert.answers} answers
                          </span>
                        </div>

                        <div className="mt-3 space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className={`text-gray-600 ${expert.isFollowing ? 'bg-crop-green-50' : ''}`}
                            onClick={() => followExpert(expert.id)}
                          >
                            {expert.isFollowing ? 'Following' : 'Follow'}
                          </Button>
                          <Button
                            size="sm"
                            className="bg-crop-green-600 hover:bg-crop-green-700 text-white"
                            onClick={() => contactExpert(expert.id)}
                          >
                            Contact
                          </Button>
                        </div>
                      </div>

                      <div className="md:w-3/4">
                        <div className="mb-3">
                          {expert.verified && (
                            <Badge className="bg-blue-100 text-blue-700 border-0 mb-2 flex items-center w-fit">
                              <Check className="h-3 w-3 mr-1" />
                              Verified Expert
                            </Badge>
                          )}

                          <p className="text-gray-700">{expert.bio}</p>

                          {expert.organization && (
                            <p className="text-sm text-gray-600 mt-2">
                              <span className="font-medium">Organization:</span>{' '}
                              {expert.organization}
                            </p>
                          )}

                          <p className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">Availability:</span>{' '}
                            {expert.availability}
                          </p>
                        </div>

                        <div className="mt-4">
                          <p className="text-sm font-medium mb-2">
                            Expert Badges:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {expert.badges.map((badge, index) => (
                              <Badge
                                key={index}
                                className="bg-crop-green-100 text-crop-green-700 border-0 px-3 py-1"
                              >
                                {badge}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-crop-green-600" />
                Your Farming Achievements
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {badges.map((badge) => (
                <Card
                  key={badge.id}
                  className={`overflow-hidden ${badge.isEarned ? 'border-amber-300' : ''}`}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center text-center">
                      <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
                          badge.level === 'gold'
                            ? 'bg-amber-100'
                            : badge.level === 'silver'
                              ? 'bg-gray-200'
                              : 'bg-amber-50'
                        }`}
                      >
                        {badge.image ? (
                          <img
                            src={badge.image}
                            alt={badge.name}
                            className="w-10 h-10"
                          />
                        ) : (
                          <badge.icon
                            className={`h-8 w-8 ${
                              badge.level === 'gold'
                                ? 'text-amber-600'
                                : badge.level === 'silver'
                                  ? 'text-gray-500'
                                  : 'text-amber-700'
                            }`}
                          />
                        )}
                      </div>

                      <h3 className="font-semibold text-gray-900">
                        {badge.name}
                      </h3>

                      <p className="text-sm text-gray-600 mt-1">
                        {badge.description}
                      </p>

                      <div className="mt-2 flex items-center justify-center">
                        <Badge
                          className={`
                          ${
                            badge.level === 'gold'
                              ? 'bg-amber-100 text-amber-800'
                              : badge.level === 'silver'
                                ? 'bg-gray-200 text-gray-800'
                                : 'bg-amber-50 text-amber-700'
                          }
                        `}
                        >
                          {badge.level.charAt(0).toUpperCase() +
                            badge.level.slice(1)}{' '}
                          Level
                        </Badge>
                        <span className="mx-1">•</span>
                        <span className="text-xs text-gray-500">
                          {badge.earnedBy} farmers earned
                        </span>
                      </div>

                      <div className="mt-3 w-full">
                        {badge.isEarned ? (
                          <Badge className="w-full py-1 bg-crop-green-100 text-crop-green-700 border-0 flex items-center justify-center">
                            <Check className="h-3 w-3 mr-1" />
                            Badge Earned!
                          </Badge>
                        ) : badge.progress !== undefined ? (
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span>Progress</span>
                              <span>{badge.progress}%</span>
                            </div>
                            <Progress
                              value={badge.progress}
                              className="h-1.5"
                            />
                            <p className="text-xs text-gray-600 mt-1">
                              {badge.requirements}
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-600 mt-1">
                            {badge.requirements}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Community;
