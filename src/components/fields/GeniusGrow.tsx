import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sprout, Droplets, Leaf, ChevronRight, Volume2 } from 'lucide-react';
import { useErrorLogging } from '@/hooks/use-error-logging';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface GeniusGrowProps {
  fieldName?: string;
  fieldSize?: number;
  fieldSizeUnit?: string;
  cropType?: string;
  soilType?: string;
  onClose?: () => void;
}

interface FertilizerRecommendation {
  npk: {
    n: number;
    p: number;
    k: number;
  };
  amountPerHectare: number;
  amountTotal: number;
  brandOptions: {
    name: string;
    description: string;
    price?: number;
    availability?: string;
  }[];
  applicationTiming: string;
  additionalNotes: string;
}

export default function GeniusGrow({
  fieldName = 'Your Field',
  fieldSize = 1,
  fieldSizeUnit = 'hectares',
  cropType = 'maize',
  soilType = 'loamy',
  onClose
}: GeniusGrowProps) {
  const { logError, logSuccess, trackOperation } = useErrorLogging('GeniusGrow');
  const [selectedCrop, setSelectedCrop] = useState(cropType);
  const [selectedSoilType, setSelectedSoilType] = useState(soilType);
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<FertilizerRecommendation | null>(null);
  const [speakingRecommendation, setSpeakingRecommendation] = useState(false);

  const generateRecommendation = trackOperation('generateRecommendation', async () => {
    setLoading(true);
    try {
      console.log("🧠 [GeniusGrow] Generating fertilizer recommendation for:", selectedCrop, "on", selectedSoilType, "soil");
      
      // In a real app, this would call an AI service
      // Simulating API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate recommendation based on crop and soil type
      const recommendation = getFertilizerRecommendation(selectedCrop, selectedSoilType, fieldSize);
      setRecommendation(recommendation);
      
      logSuccess('recommendation_generated', { crop: selectedCrop, soil: selectedSoilType });
      toast.success("AI Recommendation Ready", {
        description: `Optimal fertilizer plan generated for your ${fieldName}`
      });
    } catch (error) {
      logError(error as Error, { context: 'fertilizerRecommendation' });
      toast.error("Failed to generate recommendation", {
        description: "Please try again or check your internet connection"
      });
    } finally {
      setLoading(false);
    }
  });

  const getFertilizerRecommendation = (
    crop: string, 
    soil: string, 
    size: number
  ): FertilizerRecommendation => {
    // In a real app, this would be an AI calculation based on many factors
    // This is a simplified demonstration with sample data
    const baseRecommendations: Record<string, any> = {
      maize: {
        npk: { n: 120, p: 60, k: 40 },
        amountPerHectare: 250,
        applicationTiming: "Split application: 40% at planting, 60% at knee-high stage",
        sandy: { npk: { n: 140, p: 70, k: 50 }, amountPerHectare: 280 },
        clay: { npk: { n: 100, p: 80, k: 60 }, amountPerHectare: 240 },
        loamy: { npk: { n: 120, p: 60, k: 40 }, amountPerHectare: 250 },
      },
      wheat: {
        npk: { n: 100, p: 50, k: 50 },
        amountPerHectare: 220,
        applicationTiming: "Apply 70% before sowing, 30% at tillering stage",
        sandy: { npk: { n: 120, p: 60, k: 60 }, amountPerHectare: 250 },
        clay: { npk: { n: 90, p: 70, k: 50 }, amountPerHectare: 210 },
        loamy: { npk: { n: 100, p: 50, k: 50 }, amountPerHectare: 220 },
      },
      cassava: {
        npk: { n: 80, p: 40, k: 120 },
        amountPerHectare: 300,
        applicationTiming: "Apply all at once, one month after planting",
        sandy: { npk: { n: 100, p: 50, k: 140 }, amountPerHectare: 320 },
        clay: { npk: { n: 70, p: 60, k: 110 }, amountPerHectare: 280 },
        loamy: { npk: { n: 80, p: 40, k: 120 }, amountPerHectare: 300 },
      },
      coffee: {
        npk: { n: 150, p: 30, k: 150 },
        amountPerHectare: 400,
        applicationTiming: "Split into three equal applications throughout the growing season",
        sandy: { npk: { n: 170, p: 40, k: 170 }, amountPerHectare: 420 },
        clay: { npk: { n: 140, p: 50, k: 140 }, amountPerHectare: 380 },
        loamy: { npk: { n: 150, p: 30, k: 150 }, amountPerHectare: 400 },
      }
    };
    
    // Get base recommendation for crop
    const baseRec = baseRecommendations[crop] || baseRecommendations.maize;
    
    // Adjust based on soil type
    const soilAdjusted = baseRec[soil] || baseRec;
    const npk = soilAdjusted.npk || baseRec.npk;
    const amountPerHectare = soilAdjusted.amountPerHectare || baseRec.amountPerHectare;
    
    // Sample brands (in a real app, would come from a database)
    const brands = [
      {
        name: "AfriGrow Premium",
        description: `NPK ${npk.n}:${npk.p}:${npk.k} blend, specially formulated for ${crop}`,
        price: Math.round((amountPerHectare * size * 0.8) * 10) / 10,
        availability: "Available in local stores"
      },
      {
        name: "EcoFarm Organic",
        description: `Organic ${crop} fertilizer, environmentally friendly`,
        price: Math.round((amountPerHectare * size * 1.2) * 10) / 10,
        availability: "Limited availability"
      },
      {
        name: "CropBoost Standard",
        description: `General purpose fertilizer suitable for ${crop}`,
        price: Math.round((amountPerHectare * size * 0.6) * 10) / 10,
        availability: "Widely available"
      }
    ];
    
    return {
      npk,
      amountPerHectare,
      amountTotal: amountPerHectare * size,
      brandOptions: brands,
      applicationTiming: baseRec.applicationTiming,
      additionalNotes: `For best results, ensure proper soil moisture when applying fertilizer. Consider adding micronutrients for ${soil} soil.`
    };
  };

  const speakRecommendation = () => {
    if (!recommendation) return;
    
    setSpeakingRecommendation(true);
    
    const text = `According to GeniusGrow, your ${fieldName} requires an N-P-K fertilizer with a ratio of ${recommendation.npk.n}-${recommendation.npk.p}-${recommendation.npk.k}. You should apply approximately ${recommendation.amountTotal} kilograms total. ${recommendation.applicationTiming}`;
    
    // In a real app, this would use a proper text-to-speech API
    // Here we're using the browser's built-in speech synthesis
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = 'en-US';
    speech.rate = 0.9;
    
    speech.onend = () => {
      setSpeakingRecommendation(false);
    };
    
    speech.onerror = () => {
      setSpeakingRecommendation(false);
      toast.error("Speech playback failed", {
        description: "Could not play audio recommendation"
      });
    };
    
    window.speechSynthesis.speak(speech);
  };

  const handleBuyNow = (brand: string) => {
    toast.info("Finding local suppliers", {
      description: `Searching for ${brand} near you`
    });
    
    // In a real app, this would open a page with local suppliers
    setTimeout(() => {
      toast.success("Suppliers found", {
        description: "5 local stores carry this product",
        action: {
          label: "View",
          onClick: () => console.log("View suppliers clicked")
        }
      });
    }, 1500);
  };

  return (
    <Card className="border-primary/20 shadow-lg">
      <CardHeader className="bg-primary-50 dark:bg-primary-900/30 pb-3">
        <CardTitle className="flex items-center gap-2">
          <Sprout className="h-5 w-5 text-primary" />
          GeniusGrow AI Fertilizer Recommender
        </CardTitle>
        <CardDescription>
          Get AI-powered fertilizer recommendations tailored to your crops and soil
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="crop-select">Crop</Label>
            <Select 
              value={selectedCrop} 
              onValueChange={setSelectedCrop}
              disabled={loading}
            >
              <SelectTrigger id="crop-select" className="w-full">
                <SelectValue placeholder="Select crop" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="maize">Maize (Corn)</SelectItem>
                <SelectItem value="wheat">Wheat</SelectItem>
                <SelectItem value="cassava">Cassava</SelectItem>
                <SelectItem value="coffee">Coffee</SelectItem>
                <SelectItem value="rice">Rice</SelectItem>
                <SelectItem value="sorghum">Sorghum</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="soil-select">Soil Type</Label>
            <Select 
              value={selectedSoilType} 
              onValueChange={setSelectedSoilType}
              disabled={loading}
            >
              <SelectTrigger id="soil-select" className="w-full">
                <SelectValue placeholder="Select soil type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="loamy">Loamy</SelectItem>
                <SelectItem value="sandy">Sandy</SelectItem>
                <SelectItem value="clay">Clay</SelectItem>
                <SelectItem value="silty">Silty</SelectItem>
                <SelectItem value="peaty">Peaty</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="field-size">Field Size</Label>
            <div className="flex gap-2">
              <Input
                id="field-size"
                type="number"
                value={fieldSize.toString()}
                onChange={(e) => parseInt(e.target.value) > 0 && setSelectedCrop(e.target.value)}
                className="w-full"
                disabled={loading}
              />
              <Select 
                value={fieldSizeUnit} 
                disabled={true}
              >
                <SelectTrigger className="w-24 flex-shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hectares">ha</SelectItem>
                  <SelectItem value="acres">acres</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-end">
            <Button 
              className="w-full" 
              onClick={generateRecommendation}
              disabled={loading}
            >
              {loading ? (
                <>Analyzing with AI...</>
              ) : (
                <>
                  Get AI Recommendation
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
        
        {recommendation && (
          <div className="mt-6 space-y-4 animate-in fade-in-50">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold">AI Fertilizer Recommendation</h3>
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-1"
                onClick={speakRecommendation}
                disabled={speakingRecommendation}
              >
                <Volume2 className={cn("h-4 w-4", speakingRecommendation && "animate-pulse")} />
                {speakingRecommendation ? "Playing..." : "Listen"}
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">N</div>
                <div className="text-xl font-semibold">{recommendation.npk.n}</div>
                <div className="text-xs text-muted-foreground">Nitrogen</div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">P</div>
                <div className="text-xl font-semibold">{recommendation.npk.p}</div>
                <div className="text-xs text-muted-foreground">Phosphorus</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-md">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">K</div>
                <div className="text-xl font-semibold">{recommendation.npk.k}</div>
                <div className="text-xs text-muted-foreground">Potassium</div>
              </div>
            </div>
            
            <div className="bg-muted/50 p-4 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">Application Details</h4>
                <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">
                  {recommendation.amountTotal} kg total
                </span>
              </div>
              <p className="text-sm">{recommendation.applicationTiming}</p>
              <p className="text-sm text-muted-foreground mt-2">{recommendation.additionalNotes}</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Recommended Products</h4>
              <div className="space-y-2">
                {recommendation.brandOptions.map((brand, index) => (
                  <div 
                    key={index} 
                    className="border rounded-md p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{brand.name}</div>
                        <div className="text-sm text-muted-foreground">{brand.description}</div>
                        <div className="text-xs mt-1">{brand.availability}</div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {brand.price && (
                          <span className="font-semibold">${brand.price}</span>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleBuyNow(brand.name)}
                        >
                          Find Suppliers
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        {onClose && (
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
