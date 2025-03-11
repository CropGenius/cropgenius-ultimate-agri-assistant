
import { useState } from "react";
import Layout from "@/components/Layout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart2, 
  Calendar, 
  DollarSign, 
  AreaChart,
  TrendingUp, 
  ArrowUp, 
  ArrowDown, 
  CloudRain,
  Thermometer,
  Droplets,
  Leaf,
  AlertTriangle,
  CircleCheck,
  ArrowRight,
  RefreshCcw,
  ChevronDown,
  ChevronUp,
  Tractor,
  Sprout
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";

const YieldPredictor = () => {
  // Farmer's farm details
  const [farmDetails, setFarmDetails] = useState({
    cropType: "maize",
    farmSize: 4.5, // acres
    plantingDate: "2023-03-15",
    cropVariety: "Hybrid 614",
    soilType: "clay-loam",
    irrigation: "partial", // none, partial, full
    fertilizerUse: "medium", // low, medium, high
  });

  // AI prediction results
  const [prediction, setPrediction] = useState({
    estimatedYield: 5.7, // tons per acre
    totalYield: 25.65, // tons total
    estimatedRevenue: 8977.5, // USD
    profitMargin: 68, // percentage
    harvestDate: "2023-07-20",
    pricePerTon: 350, // USD
    confidenceScore: 89, // percentage
    yieldComparisonToAverage: 23, // percentage above/below average
    riskFactors: [
      {
        type: "weather",
        description: "Potential drought in mid-growing season",
        impact: "medium",
        mitigationAvailable: true,
        mitigationStrategy: "Increase irrigation in weeks 8-10"
      },
      {
        type: "pest",
        description: "Fall armyworm risk above average",
        impact: "high",
        mitigationAvailable: true,
        mitigationStrategy: "Apply targeted pesticide before week 6"
      }
    ],
    marketTrends: [
      {
        month: "July",
        price: 330,
        demand: "moderate"
      },
      {
        month: "August",
        price: 350,
        demand: "high"
      },
      {
        month: "September",
        price: 380,
        demand: "very high"
      }
    ],
    optimizations: [
      {
        action: "Increase nitrogen fertilizer by 15%",
        yieldImprovement: 8, // percentage
        costIncrease: 5, // percentage
        netProfitImprovement: 3 // percentage
      },
      {
        action: "Apply foliar feed in week A",
        yieldImprovement: 12, // percentage
        costIncrease: 7, // percentage
        netProfitImprovement: 5 // percentage
      },
      {
        action: "Plant at higher density",
        yieldImprovement: 10, // percentage
        costIncrease: 3, // percentage
        netProfitImprovement: 7 // percentage
      }
    ]
  });

  // UI state
  const [showOptimizations, setShowOptimizations] = useState(false);
  const [showRiskFactors, setShowRiskFactors] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [optimizationSelected, setOptimizationSelected] = useState([false, false, false]);

  // Mock price forecast data for the chart
  const priceForecastData = [
    { month: 'Jun', price: 320, pastAverage: 300 },
    { month: 'Jul', price: 330, pastAverage: 310 },
    { month: 'Aug', price: 350, pastAverage: 320 },
    { month: 'Sep', price: 380, pastAverage: 315 },
    { month: 'Oct', price: 350, pastAverage: 300 },
    { month: 'Nov', price: 330, pastAverage: 290 },
  ];

  // Mock yield comparison data
  const yieldComparisonData = [
    { name: 'Your Farm', yield: prediction.estimatedYield, fill: '#22c55e' },
    { name: 'Region Avg', yield: 4.6, fill: '#3b82f6' },
    { name: 'Country Avg', yield: 3.8, fill: '#6b7280' },
  ];

  // Handle form changes
  const handleInputChange = (field, value) => {
    setFarmDetails({
      ...farmDetails,
      [field]: value
    });
  };

  // Calculate predictions based on farm details
  const calculateYieldPrediction = () => {
    setIsCalculating(true);
    
    // Simulate AI processing delay
    setTimeout(() => {
      // Update predictions (in a real app, this would call an API)
      const newYield = parseFloat((Math.random() * 2 + 5).toFixed(1)); // Random between 5-7
      const newTotal = parseFloat((newYield * farmDetails.farmSize).toFixed(2));
      const newPrice = Math.floor(Math.random() * 50 + 330); // Random between 330-380
      
      setPrediction({
        ...prediction,
        estimatedYield: newYield,
        totalYield: newTotal,
        pricePerTon: newPrice,
        estimatedRevenue: parseFloat((newTotal * newPrice).toFixed(2)),
        confidenceScore: Math.floor(Math.random() * 10 + 85), // Random between 85-95
        yieldComparisonToAverage: Math.floor(Math.random() * 15 + 15), // Random between 15-30
      });
      
      toast.success("AI yield prediction complete", {
        description: "Analysis based on 10,452 similar farms in your region",
      });
      
      setIsCalculating(false);
    }, 2000);
  };

  // Toggle optimization selection
  const toggleOptimization = (index) => {
    const newSelection = [...optimizationSelected];
    newSelection[index] = !newSelection[index];
    setOptimizationSelected(newSelection);
    
    const optimization = prediction.optimizations[index];
    
    if (!optimizationSelected[index]) {
      toast.success(`Added: ${optimization.action}`, {
        description: `Expected yield improvement: ${optimization.yieldImprovement}%`,
      });
    } else {
      toast.info(`Removed: ${optimization.action}`);
    }
  };

  // Apply selected optimizations
  const applyOptimizations = () => {
    const selectedCount = optimizationSelected.filter(Boolean).length;
    
    if (selectedCount === 0) {
      toast.error("No optimizations selected", {
        description: "Please select at least one optimization to apply",
      });
      return;
    }
    
    // Calculate combined improvement
    let totalYieldImprovement = 0;
    let totalCostIncrease = 0;
    let totalProfitImprovement = 0;
    
    optimizationSelected.forEach((selected, index) => {
      if (selected) {
        const opt = prediction.optimizations[index];
        totalYieldImprovement += opt.yieldImprovement;
        totalCostIncrease += opt.costIncrease;
        totalProfitImprovement += opt.netProfitImprovement;
      }
    });
    
    // Apply improvements to prediction
    const improvedYield = parseFloat((prediction.estimatedYield * (1 + totalYieldImprovement / 100)).toFixed(2));
    const improvedTotal = parseFloat((improvedYield * farmDetails.farmSize).toFixed(2));
    const improvedRevenue = parseFloat((improvedTotal * prediction.pricePerTon).toFixed(2));
    const improvedMargin = Math.min(99, prediction.profitMargin + totalProfitImprovement);
    
    setPrediction({
      ...prediction,
      estimatedYield: improvedYield,
      totalYield: improvedTotal,
      estimatedRevenue: improvedRevenue,
      profitMargin: improvedMargin,
      confidenceScore: Math.max(75, prediction.confidenceScore - 5), // Slight confidence reduction
    });
    
    // Reset selections
    setOptimizationSelected([false, false, false]);
    
    toast.success("Optimizations applied to yield forecast", {
      description: `Expected profit improvement: ${totalProfitImprovement}%`,
    });
  };

  return (
    <Layout>
      <div className="p-5 pb-20 animate-fade-in">
        <h1 className="text-2xl font-bold text-crop-green-700 mb-1">AI Yield Predictor</h1>
        <p className="text-gray-600 mb-5">Predict your harvest yield and optimize for maximum profit</p>
        
        {/* Farm Details Input Card */}
        <Card className="mb-5">
          <CardHeader className="pb-2">
            <div className="flex items-center">
              <Tractor className="h-5 w-5 mr-2 text-soil-brown-600" />
              <CardTitle className="text-lg">Farm Details</CardTitle>
            </div>
            <CardDescription>Enter your farm information for accurate prediction</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cropType">Crop Type</Label>
                <Select 
                  value={farmDetails.cropType}
                  onValueChange={(value) => handleInputChange('cropType', value)}
                >
                  <SelectTrigger id="cropType">
                    <SelectValue placeholder="Select crop" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maize">Maize (Corn)</SelectItem>
                    <SelectItem value="rice">Rice</SelectItem>
                    <SelectItem value="tomato">Tomatoes</SelectItem>
                    <SelectItem value="cassava">Cassava</SelectItem>
                    <SelectItem value="beans">Beans</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="farmSize">Farm Size (acres)</Label>
                <Input 
                  id="farmSize" 
                  type="number" 
                  value={farmDetails.farmSize}
                  onChange={(e) => handleInputChange('farmSize', parseFloat(e.target.value))}
                  min="0.1"
                  step="0.1"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cropVariety">Crop Variety</Label>
                <Select 
                  value={farmDetails.cropVariety}
                  onValueChange={(value) => handleInputChange('cropVariety', value)}
                >
                  <SelectTrigger id="cropVariety">
                    <SelectValue placeholder="Select variety" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hybrid 614">Hybrid 614</SelectItem>
                    <SelectItem value="Hybrid 6213">Hybrid 6213</SelectItem>
                    <SelectItem value="DK8031">DK8031</SelectItem>
                    <SelectItem value="PAN 53">PAN 53</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="soilType">Soil Type</Label>
                <Select 
                  value={farmDetails.soilType}
                  onValueChange={(value) => handleInputChange('soilType', value)}
                >
                  <SelectTrigger id="soilType">
                    <SelectValue placeholder="Select soil type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clay">Clay</SelectItem>
                    <SelectItem value="clay-loam">Clay Loam</SelectItem>
                    <SelectItem value="sandy-loam">Sandy Loam</SelectItem>
                    <SelectItem value="sandy">Sandy</SelectItem>
                    <SelectItem value="silt-loam">Silt Loam</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="irrigation">Irrigation Level</Label>
                <Select 
                  value={farmDetails.irrigation}
                  onValueChange={(value) => handleInputChange('irrigation', value)}
                >
                  <SelectTrigger id="irrigation">
                    <SelectValue placeholder="Select irrigation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Rainfed)</SelectItem>
                    <SelectItem value="partial">Partial Irrigation</SelectItem>
                    <SelectItem value="full">Full Irrigation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fertilizerUse">Fertilizer Use</Label>
                <Select 
                  value={farmDetails.fertilizerUse}
                  onValueChange={(value) => handleInputChange('fertilizerUse', value)}
                >
                  <SelectTrigger id="fertilizerUse">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button 
              className="w-full mt-5 bg-crop-green-600 hover:bg-crop-green-700"
              onClick={calculateYieldPrediction}
              disabled={isCalculating}
            >
              {isCalculating ? (
                <>
                  <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                  AI Analyzing...
                </>
              ) : (
                <>
                  <BarChart2 className="h-4 w-4 mr-2" />
                  Calculate Yield Prediction
                </>
              )}
            </Button>
          </CardContent>
        </Card>
        
        {/* Yield Prediction Results */}
        <Card className="mb-5 border-crop-green-200">
          <CardHeader className="pb-2 bg-crop-green-50 rounded-t-lg">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-crop-green-600" />
              <CardTitle className="text-lg">AI Yield Prediction</CardTitle>
            </div>
            <CardDescription className="flex items-center">
              <CircleCheck className="h-4 w-4 mr-1 text-crop-green-500" />
              AI confidence score: {prediction.confidenceScore}%
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-crop-green-50 rounded-lg p-3 border border-crop-green-100">
                <p className="text-xs text-gray-600">Estimated Yield</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-bold text-crop-green-700">{prediction.estimatedYield}</p>
                  <p className="text-sm ml-1 text-gray-600">tons/acre</p>
                </div>
                <div className="flex items-center mt-1">
                  <ArrowUp className="h-3 w-3 text-crop-green-500" />
                  <p className="text-xs text-crop-green-700">{prediction.yieldComparisonToAverage}% above average</p>
                </div>
              </div>
              
              <div className="bg-crop-green-50 rounded-lg p-3 border border-crop-green-100">
                <p className="text-xs text-gray-600">Total Harvest</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-bold text-crop-green-700">{prediction.totalYield}</p>
                  <p className="text-sm ml-1 text-gray-600">tons total</p>
                </div>
                <p className="text-xs text-gray-600 mt-1">From {farmDetails.farmSize} acres</p>
              </div>
              
              <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                <p className="text-xs text-gray-600">Estimated Revenue</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-bold text-amber-700">${prediction.estimatedRevenue}</p>
                </div>
                <p className="text-xs text-gray-600 mt-1">At ${prediction.pricePerTon}/ton</p>
              </div>
              
              <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                <p className="text-xs text-gray-600">Profit Margin</p>
                <div className="flex flex-col">
                  <p className="text-2xl font-bold text-amber-700">{prediction.profitMargin}%</p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div 
                      className="bg-amber-500 h-1.5 rounded-full" 
                      style={{ width: `${prediction.profitMargin}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Yield Comparison Chart */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Yield Comparison</h3>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={yieldComparisonData}
                    margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis unit=" t/a" />
                    <Tooltip />
                    <Bar dataKey="yield" nameKey="name" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Price Forecast Chart */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Price Forecast & Best Selling Time</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={priceForecastData}
                    margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis unit="$" domain={['dataMin - 50', 'dataMax + 20']} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#22c55e" 
                      activeDot={{ r: 8 }} 
                      name="Forecast Price"
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="pastAverage" 
                      stroke="#9ca3af" 
                      name="Past Average"
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center mt-2 bg-crop-green-50 p-2 rounded-md">
                <Calendar className="h-4 w-4 mr-2 text-crop-green-600" />
                <span className="text-sm text-crop-green-700 font-medium">
                  Best selling time: <span className="font-bold">September</span> (highest price point)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Risk Factors Analysis */}
        <Card className="mb-5 border-amber-200">
          <CardHeader 
            className="pb-2 cursor-pointer"
            onClick={() => setShowRiskFactors(!showRiskFactors)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                <CardTitle className="text-lg">Risk Factors & Mitigation</CardTitle>
              </div>
              {showRiskFactors ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </div>
            <CardDescription>AI-identified risks that may affect your yield</CardDescription>
          </CardHeader>
          {showRiskFactors && (
            <CardContent className="pt-4">
              <div className="space-y-4">
                {prediction.riskFactors.map((risk, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-lg border ${
                      risk.impact === 'high' 
                        ? 'border-red-200 bg-red-50' 
                        : risk.impact === 'medium'
                          ? 'border-amber-200 bg-amber-50'
                          : 'border-blue-200 bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className={`p-2 rounded-full mr-3 ${
                        risk.impact === 'high' 
                          ? 'bg-red-100' 
                          : risk.impact === 'medium'
                            ? 'bg-amber-100'
                            : 'bg-blue-100'
                      }`}>
                        {risk.type === 'weather' ? (
                          <CloudRain className={`h-5 w-5 ${
                            risk.impact === 'high' 
                              ? 'text-red-500' 
                              : risk.impact === 'medium'
                                ? 'text-amber-500'
                                : 'text-blue-500'
                          }`} />
                        ) : risk.type === 'pest' ? (
                          <Leaf className={`h-5 w-5 ${
                            risk.impact === 'high' 
                              ? 'text-red-500' 
                              : risk.impact === 'medium'
                                ? 'text-amber-500'
                                : 'text-blue-500'
                          }`} />
                        ) : (
                          <AlertTriangle className={`h-5 w-5 ${
                            risk.impact === 'high' 
                              ? 'text-red-500' 
                              : risk.impact === 'medium'
                                ? 'text-amber-500'
                                : 'text-blue-500'
                          }`} />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center">
                          <h3 className="font-medium text-gray-800">{risk.description}</h3>
                          <Badge 
                            className={`ml-2 ${
                              risk.impact === 'high' 
                                ? 'bg-red-100 text-red-700 border-0' 
                                : risk.impact === 'medium'
                                  ? 'bg-amber-100 text-amber-700 border-0'
                                  : 'bg-blue-100 text-blue-700 border-0'
                            }`}
                          >
                            {risk.impact === 'high' ? 'High Risk' : risk.impact === 'medium' ? 'Medium Risk' : 'Low Risk'}
                          </Badge>
                        </div>
                        
                        {risk.mitigationAvailable && (
                          <div className="mt-2 p-2 bg-white rounded border border-gray-100">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">AI Recommendation:</span> {risk.mitigationStrategy}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
        
        {/* Yield Optimization Recommendations */}
        <Card className="mb-5 border-crop-green-200">
          <CardHeader 
            className="pb-2 cursor-pointer"
            onClick={() => setShowOptimizations(!showOptimizations)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Sprout className="h-5 w-5 mr-2 text-crop-green-600" />
                <CardTitle className="text-lg">AI Yield Optimization</CardTitle>
              </div>
              {showOptimizations ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </div>
            <CardDescription>Strategies to improve your yield and profit</CardDescription>
          </CardHeader>
          {showOptimizations && (
            <CardContent className="pt-4">
              <div className="space-y-3 mb-4">
                {prediction.optimizations.map((opt, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-lg border ${
                      optimizationSelected[index] 
                        ? 'border-crop-green-400 bg-crop-green-50' 
                        : 'border-gray-200 bg-white'
                    } cursor-pointer hover:border-crop-green-300 transition-colors`}
                    onClick={() => toggleOptimization(index)}
                  >
                    <div className="flex items-start">
                      <div className={`w-6 h-6 rounded-full mr-3 flex items-center justify-center ${
                        optimizationSelected[index] 
                          ? 'bg-crop-green-500 text-white' 
                          : 'border-2 border-gray-300'
                      }`}>
                        {optimizationSelected[index] && <Check className="h-4 w-4" />}
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-medium text-gray-800">{opt.action}</h3>
                        
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          <div className="bg-gray-50 p-2 rounded text-center">
                            <p className="text-xs text-gray-500">Yield</p>
                            <p className="text-sm font-bold text-crop-green-600">+{opt.yieldImprovement}%</p>
                          </div>
                          <div className="bg-gray-50 p-2 rounded text-center">
                            <p className="text-xs text-gray-500">Cost</p>
                            <p className="text-sm font-bold text-amber-600">+{opt.costIncrease}%</p>
                          </div>
                          <div className="bg-gray-50 p-2 rounded text-center">
                            <p className="text-xs text-gray-500">Profit</p>
                            <p className="text-sm font-bold text-crop-green-600">+{opt.netProfitImprovement}%</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button 
                className="w-full bg-crop-green-600 hover:bg-crop-green-700"
                onClick={applyOptimizations}
                disabled={!optimizationSelected.some(Boolean)}
              >
                <Check className="h-4 w-4 mr-2" />
                Apply Selected Optimizations
              </Button>
            </CardContent>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default YieldPredictor;
