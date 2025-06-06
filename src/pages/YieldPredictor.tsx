import { useState } from 'react';
import Layout from '@/components/Layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  ArrowUp,
  ArrowDown,
  Calendar,
  Cloud,
  Droplets,
  LineChart as LineChartIcon,
  Check,
  Zap,
  AlertTriangle,
  ThumbsUp,
  Tractor,
  DollarSign,
  BarChart as BarChartIcon,
  RefreshCcw,
  Plus,
  Minus,
} from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Form schema
const formSchema = z.object({
  cropType: z.string().min(1, 'Crop type is required'),
  farmSize: z.string().min(1, 'Farm size is required'),
  soilType: z.string().min(1, 'Soil type is required'),
  plantingDate: z.string().min(1, 'Planting date is required'),
  expectedRainfall: z.string().min(1, 'Expected rainfall is required'),
  fertilizerUse: z.enum(['none', 'organic', 'synthetic', 'hybrid']),
  previousYield: z.string().optional(),
});

// Mock data for the charts
const farmYieldData = [
  { month: 'Jan', yield: 0, rainfall: 40 },
  { month: 'Feb', yield: 0, rainfall: 50 },
  { month: 'Mar', yield: 10, rainfall: 70 },
  { month: 'Apr', yield: 30, rainfall: 80 },
  { month: 'May', yield: 50, rainfall: 60 },
  { month: 'Jun', yield: 80, rainfall: 30 },
  { month: 'Jul', yield: 110, rainfall: 20 },
  { month: 'Aug', yield: 120, rainfall: 10 },
  { month: 'Sep', yield: 130, rainfall: 30 },
  { month: 'Oct', yield: 100, rainfall: 50 },
  { month: 'Nov', yield: 40, rainfall: 60 },
  { month: 'Dec', yield: 0, rainfall: 40 },
];

const marketPriceData = [
  { month: 'Jan', price: 1.2 },
  { month: 'Feb', price: 1.1 },
  { month: 'Mar', price: 1.0 },
  { month: 'Apr', price: 0.9 },
  { month: 'May', price: 0.8 },
  { month: 'Jun', price: 1.0 },
  { month: 'Jul', price: 1.3 },
  { month: 'Aug', price: 1.5 },
  { month: 'Sep', price: 1.7 },
  { month: 'Oct', price: 1.4 },
  { month: 'Nov', price: 1.3 },
  { month: 'Dec', price: 1.2 },
];

const fertilityFactors = [
  { name: 'Nitrogen', score: 65 },
  { name: 'Phosphorus', score: 70 },
  { name: 'Potassium', score: 60 },
  { name: 'pH Level', score: 80 },
  { name: 'Organic Matter', score: 55 },
];

const regionYields = [
  { region: 'Your Farm', yield: 72 },
  { region: 'Central', yield: 65 },
  { region: 'Eastern', yield: 70 },
  { region: 'Western', yield: 60 },
  { region: 'Northern', yield: 50 },
];

const YieldPredictor = () => {
  const [predictionData, setPredictionData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [optimizationOptions, setOptimizationOptions] = useState<any[]>([]);
  const [showOptimizations, setShowOptimizations] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cropType: '',
      farmSize: '',
      soilType: '',
      plantingDate: '',
      expectedRainfall: 'moderate',
      fertilizerUse: 'organic',
      previousYield: '',
    },
  });

  const onSubmit = (data) => {
    setIsAnalyzing(true);

    // Simulate AI analysis
    setTimeout(() => {
      // Generate a prediction based on form inputs
      const predictedData = {
        cropType: data.cropType,
        estimatedYield: calculateEstimatedYield(data),
        estimatedRevenue: calculateEstimatedRevenue(data),
        optimalHarvestDate: calculateOptimalHarvestDate(data.plantingDate),
        risks: generateRisks(data),
        marketTrend: determineMarketTrend(data.cropType),
        soilHealth: 'Good',
        confidenceScore: 87,
        comparisonToAverage: '+15%',
        waterRequirements: calculateWaterRequirements(data),
      };

      setPredictionData(predictedData);

      // Generate optimization suggestions
      const optimizations = [
        {
          id: 1,
          title: 'Apply nitrogen-rich fertilizer before rainfall',
          impact: 'high',
          yieldIncrease: '+8%',
          costImpact: '$45/acre',
          implementation: 'Easy',
          timeRequired: '1-2 days',
          description:
            'Soil analysis shows nitrogen deficiency. Applying before forecasted rain will maximize absorption.',
        },
        {
          id: 2,
          title: 'Plant in east-west rows to increase sunlight exposure',
          impact: 'medium',
          yieldIncrease: '+5%',
          costImpact: 'Minimal',
          implementation: 'Medium',
          timeRequired: 'During planting',
          description:
            'Your field orientation can be optimized to increase total sunlight exposure by 12%.',
        },
        {
          id: 3,
          title: 'Install drip irrigation for water efficiency',
          impact: 'high',
          yieldIncrease: '+12%',
          costImpact: '$120/acre',
          implementation: 'Complex',
          timeRequired: '1 week',
          description:
            'Given your water source and rainfall patterns, drip irrigation would significantly improve yield consistency.',
        },
      ];

      setOptimizationOptions(optimizations);
      setShowOptimizations(true);
      setIsAnalyzing(false);

      toast.success('AI Analysis Complete', {
        description:
          "We've analyzed your farm data and generated yield predictions",
      });
    }, 2500);
  };

  // Helper functions for prediction
  const calculateEstimatedYield = (data) => {
    // Mock calculation
    const baseYield =
      data.cropType === 'Maize'
        ? 7.5
        : data.cropType === 'Tomatoes'
          ? 25
          : data.cropType === 'Cassava'
            ? 15
            : 10;

    const farmSize = parseFloat(data.farmSize);
    return (baseYield * farmSize).toFixed(1);
  };

  const calculateEstimatedRevenue = (data) => {
    const yieldAmount = parseFloat(calculateEstimatedYield(data));
    const pricePerUnit =
      data.cropType === 'Maize'
        ? 0.35
        : data.cropType === 'Tomatoes'
          ? 0.85
          : data.cropType === 'Cassava'
            ? 0.25
            : 0.5;

    return (yieldAmount * pricePerUnit * 1000).toFixed(0);
  };

  const calculateOptimalHarvestDate = (plantingDate) => {
    // Mock calculation
    const date = new Date(plantingDate);
    date.setDate(date.getDate() + 120); // Add 120 days
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateWaterRequirements = (data) => {
    // Mock calculation
    const baseReq =
      data.cropType === 'Maize'
        ? 500
        : data.cropType === 'Tomatoes'
          ? 700
          : data.cropType === 'Cassava'
            ? 400
            : 550;

    return `${baseReq} mm/season`;
  };

  const generateRisks = (data) => {
    // Mock risks based on inputs
    const risks = [];

    if (data.expectedRainfall === 'low') {
      risks.push({
        type: 'Drought',
        probability: 'High',
        impact: 'Severe',
        mitigation:
          'Install irrigation system, use drought-resistant varieties',
      });
    }

    if (data.soilType === 'Sandy') {
      risks.push({
        type: 'Nutrient Leaching',
        probability: 'Medium',
        impact: 'Moderate',
        mitigation: 'Use slow-release fertilizers, add organic matter to soil',
      });
    }

    // Always add at least one risk for demonstration
    if (risks.length === 0) {
      risks.push({
        type: 'Pest Infestation',
        probability: 'Medium',
        impact: 'Moderate',
        mitigation: 'Regular scouting, use organic pest control methods',
      });
    }

    return risks;
  };

  const determineMarketTrend = (cropType) => {
    // Mock market trend
    const trends = {
      Maize: { trend: 'rising', percentage: '+8%' },
      Tomatoes: { trend: 'steady', percentage: '+2%' },
      Cassava: { trend: 'falling', percentage: '-5%' },
      Rice: { trend: 'rising', percentage: '+10%' },
    };

    return trends[cropType] || { trend: 'steady', percentage: '+0%' };
  };

  const applyOptimization = (optimizationId) => {
    // Find the optimization
    const optimization = optimizationOptions.find(
      (opt) => opt.id === optimizationId
    );

    if (optimization) {
      // Update prediction data to reflect optimization
      if (predictionData) {
        const yieldIncrease =
          parseFloat(optimization.yieldIncrease.replace('%', '')) / 100;
        const currentYield = parseFloat(predictionData.estimatedYield);
        const newYield = (currentYield * (1 + yieldIncrease)).toFixed(1);

        // Update revenue as well
        const currentRevenue = parseFloat(predictionData.estimatedRevenue);
        const newRevenue = (currentRevenue * (1 + yieldIncrease)).toFixed(0);

        // Create updated prediction data
        const updatedPrediction = {
          ...predictionData,
          estimatedYield: newYield,
          estimatedRevenue: newRevenue,
          appliedOptimizations: [
            ...(predictionData.appliedOptimizations || []),
            optimization,
          ],
        };

        setPredictionData(updatedPrediction);

        // Mark optimization as applied
        const updatedOptions = optimizationOptions.map((opt) =>
          opt.id === optimizationId ? { ...opt, applied: true } : opt
        );
        setOptimizationOptions(updatedOptions);

        toast.success(`Optimization Applied: ${optimization.title}`, {
          description: `Yield prediction increased to ${newYield} tons`,
        });
      }
    }
  };

  return (
    <Layout>
      <div className="p-5 pb-20">
        <h1 className="text-2xl font-bold mb-5">AI Yield Predictor</h1>

        {!predictionData ? (
          <Card className="mb-5">
            <CardHeader>
              <CardTitle className="text-lg">Enter Your Farm Details</CardTitle>
              <CardDescription>
                Our AI will analyze your data and predict your crop yield
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="cropType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Crop Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select crop type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Maize">Maize</SelectItem>
                              <SelectItem value="Tomatoes">Tomatoes</SelectItem>
                              <SelectItem value="Cassava">Cassava</SelectItem>
                              <SelectItem value="Rice">Rice</SelectItem>
                              <SelectItem value="Beans">Beans</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="farmSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Farm Size (acres)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g., 5.5"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="soilType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Soil Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select soil type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Clay">Clay</SelectItem>
                              <SelectItem value="Sandy">Sandy</SelectItem>
                              <SelectItem value="Loam">Loam</SelectItem>
                              <SelectItem value="Clay Loam">
                                Clay Loam
                              </SelectItem>
                              <SelectItem value="Sandy Loam">
                                Sandy Loam
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="plantingDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Planting Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="expectedRainfall"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expected Rainfall</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select expected rainfall" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">
                                Low (Below Average)
                              </SelectItem>
                              <SelectItem value="moderate">
                                Moderate (Average)
                              </SelectItem>
                              <SelectItem value="high">
                                High (Above Average)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fertilizerUse"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fertilizer Use</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select fertilizer type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              <SelectItem value="organic">
                                Organic Only
                              </SelectItem>
                              <SelectItem value="synthetic">
                                Synthetic Only
                              </SelectItem>
                              <SelectItem value="hybrid">
                                Hybrid Approach
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="previousYield"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Previous Yield (tons) - Optional
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g., 25.5"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            If you've grown this crop before
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing Your Farm...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Predict My Crop Yield
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Results Summary Card */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">
                      {predictionData.cropType} Yield Prediction
                    </CardTitle>
                    <CardDescription>
                      AI analysis based on your farm data
                    </CardDescription>
                  </div>
                  <Badge className="bg-green-700">
                    {predictionData.confidenceScore}% Confidence
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-sm text-gray-500 mb-1">
                      Estimated Yield
                    </div>
                    <div className="text-2xl font-bold flex items-center">
                      {predictionData.estimatedYield} tons
                      <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">
                        {predictionData.comparisonToAverage}
                      </Badge>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-sm text-gray-500 mb-1">
                      Estimated Revenue
                    </div>
                    <div className="text-2xl font-bold flex items-center">
                      ${predictionData.estimatedRevenue}
                      <Badge
                        className={`ml-2 ${
                          predictionData.marketTrend.trend === 'rising'
                            ? 'bg-green-100 text-green-800'
                            : predictionData.marketTrend.trend === 'falling'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                        } hover:bg-opacity-90`}
                      >
                        {predictionData.marketTrend.trend === 'rising' ? (
                          <div className="flex items-center">
                            <ArrowUp className="h-3 w-3 mr-1" />
                            {predictionData.marketTrend.percentage}
                          </div>
                        ) : predictionData.marketTrend.trend === 'falling' ? (
                          <div className="flex items-center">
                            <ArrowDown className="h-3 w-3 mr-1" />
                            {predictionData.marketTrend.percentage}
                          </div>
                        ) : (
                          'Steady'
                        )}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                  <div className="flex justify-between mb-2">
                    <div className="text-sm text-gray-500">
                      Optimal Harvest Date
                    </div>
                    <div className="flex items-center text-sm font-medium">
                      <Calendar className="h-4 w-4 mr-1 text-green-700" />
                      {predictionData.optimalHarvestDate}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="text-sm text-gray-500">
                      Water Requirements
                    </div>
                    <div className="flex items-center text-sm font-medium">
                      <Droplets className="h-4 w-4 mr-1 text-blue-600" />
                      {predictionData.waterRequirements}
                    </div>
                  </div>
                </div>

                {/* Risk Section */}
                {predictionData.risks.length > 0 && (
                  <div className="mb-2">
                    <div className="font-medium text-gray-700 mb-2 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1 text-amber-500" />
                      Risk Factors to Consider
                    </div>
                    <div className="space-y-2">
                      {predictionData.risks.map((risk, index) => (
                        <div
                          key={index}
                          className="bg-white p-3 rounded-lg shadow-sm"
                        >
                          <div className="flex justify-between">
                            <div className="font-medium">{risk.type}</div>
                            <Badge
                              className={`${
                                risk.probability === 'High'
                                  ? 'bg-red-100 text-red-800'
                                  : risk.probability === 'Medium'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {risk.probability} Risk
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {risk.mitigation}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => {
                    setPredictionData(null);
                    setOptimizationOptions([]);
                    setShowOptimizations(false);
                  }}
                >
                  Start New Prediction
                </Button>
              </CardContent>
            </Card>

            {/* Tabs with Details */}
            <Tabs defaultValue="charts" className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="charts">
                  <BarChartIcon className="h-4 w-4 mr-2" />
                  Charts & Analytics
                </TabsTrigger>
                <TabsTrigger value="comparison">
                  <LineChartIcon className="h-4 w-4 mr-2" />
                  Regional Comparison
                </TabsTrigger>
                <TabsTrigger value="soil">
                  <Tractor className="h-4 w-4 mr-2" />
                  Soil Analysis
                </TabsTrigger>
              </TabsList>

              <TabsContent value="charts" className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      Yield & Rainfall Correlation
                    </CardTitle>
                    <CardDescription>
                      Expected yield throughout the growing season
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={farmYieldData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <Tooltip />
                          <Legend />
                          <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="yield"
                            stroke="#10b981"
                            activeDot={{ r: 8 }}
                            name="Yield (tons)"
                          />
                          <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="rainfall"
                            stroke="#3b82f6"
                            name="Rainfall (mm)"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      Market Price Forecast
                    </CardTitle>
                    <CardDescription>
                      Projected market prices for {predictionData.cropType}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={marketPriceData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="price"
                            stroke="#f59e0b"
                            activeDot={{ r: 8 }}
                            name="Price ($/kg)"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="bg-amber-50 p-3 rounded-md mt-4 flex items-start">
                      <DollarSign className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-amber-800">
                          Price Insights
                        </div>
                        <p className="text-sm text-amber-700">
                          Prices for {predictionData.cropType} are expected to
                          {predictionData.marketTrend.trend === 'rising'
                            ? ` rise by ${predictionData.marketTrend.percentage} over the next 3 months. Consider storing your harvest until peak prices in August-September.`
                            : predictionData.marketTrend.trend === 'falling'
                              ? ` fall by ${predictionData.marketTrend.percentage} over the next 3 months. Consider selling early or exploring value-added products.`
                              : ' remain stable. Focus on quality to secure the best price.'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="comparison" className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      Regional Yield Comparison
                    </CardTitle>
                    <CardDescription>
                      How your farm compares to regional averages
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={regionYields}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="region" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar
                            dataKey="yield"
                            name="Yield (tons/acre)"
                            fill="#10b981"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="bg-green-50 p-3 rounded-md mt-4 flex items-start">
                      <ThumbsUp className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-green-800">
                          Your Performance
                        </div>
                        <p className="text-sm text-green-700">
                          Your predicted yield is{' '}
                          {predictionData.comparisonToAverage} higher than the
                          regional average. Your soil management and crop
                          selection are working well.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="soil" className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      Soil Fertility Analysis
                    </CardTitle>
                    <CardDescription>
                      Key soil health factors affecting your yield
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          layout="vertical"
                          data={fertilityFactors}
                          margin={{
                            top: 20,
                            right: 20,
                            bottom: 20,
                            left: 80,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" domain={[0, 100]} />
                          <YAxis type="category" dataKey="name" />
                          <Tooltip />
                          <Legend />
                          <Bar
                            dataKey="score"
                            name="Health Score (%)"
                            fill="#3b82f6"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                      <div className="bg-blue-50 p-3 rounded-md flex items-start">
                        <Cloud className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium text-blue-800">
                            Soil Health
                          </div>
                          <p className="text-sm text-blue-700">
                            Your soil has good overall health but could benefit
                            from added organic matter to improve structure and
                            water retention.
                          </p>
                        </div>
                      </div>

                      <div className="bg-blue-50 p-3 rounded-md flex items-start">
                        <Droplets className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium text-blue-800">
                            Recommendations
                          </div>
                          <p className="text-sm text-blue-700">
                            Add compost or manure before your next planting
                            season. Consider crop rotation with legumes to
                            improve nitrogen levels naturally.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Optimization Suggestions */}
            {showOptimizations && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-amber-500" />
                    AI Yield Optimization Suggestions
                  </CardTitle>
                  <CardDescription>
                    Apply these insights to potentially increase your yield
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {optimizationOptions.map((optimization) => (
                      <div
                        key={optimization.id}
                        className={`border p-4 rounded-lg ${
                          optimization.applied
                            ? 'bg-green-50 border-green-200'
                            : 'bg-white'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium flex items-center">
                              {optimization.title}
                              {optimization.applied && (
                                <Badge className="ml-2 bg-green-100 text-green-800">
                                  <div className="flex items-center">
                                    <Check className="h-3 w-3 mr-1" />
                                    Applied
                                  </div>
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {optimization.description}
                            </p>
                          </div>
                          <Badge
                            className={`${
                              optimization.impact === 'high'
                                ? 'bg-green-100 text-green-800'
                                : optimization.impact === 'medium'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {optimization.yieldIncrease} yield
                          </Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mt-3 text-sm">
                          <div>
                            <span className="text-gray-500">Cost: </span>
                            <span className="font-medium">
                              {optimization.costImpact}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Difficulty: </span>
                            <span className="font-medium">
                              {optimization.implementation}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Time: </span>
                            <span className="font-medium">
                              {optimization.timeRequired}
                            </span>
                          </div>
                        </div>

                        {!optimization.applied && (
                          <Button
                            className="w-full mt-3 bg-amber-600 hover:bg-amber-700"
                            onClick={() => applyOptimization(optimization.id)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Apply This Optimization
                          </Button>
                        )}

                        {optimization.applied && (
                          <Button
                            variant="outline"
                            className="w-full mt-3"
                            onClick={() => {
                              toast.info(
                                'This would open detailed implementation steps'
                              );
                            }}
                          >
                            View Implementation Steps
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default YieldPredictor;
