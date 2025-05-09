
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Leaf, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface StepOneProps {
  fieldName: string;
  onFieldNameChange: (name: string) => void;
  onNext: () => void;
}

export default function StepOne({ fieldName, onFieldNameChange, onNext }: StepOneProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showValidationError, setShowValidationError] = useState(false);
  const { user, farmId } = useAuth();
  
  // Generate intelligent field name suggestions
  useEffect(() => {
    const generateSuggestions = async () => {
      setIsLoading(true);
      try {
        // Validate authentication and farm selection
        if (!user?.id || !farmId) {
          throw new Error(
            !user?.id 
              ? "Authentication required to generate suggestions" 
              : "No farm selected for suggestions"
          );
        }
        
        // First get farm information for context
        const { data: farmData, error: farmError } = await supabase
          .from('farms')
          .select('name, location')
          .eq('id', farmId)
          .eq('user_id', user.id)
          .single();
          
        if (farmError) {
          console.warn("⚠️ [StepOne] Could not fetch farm data:", farmError);
        }

        // Get user's existing field names for context
        const { data: fieldData, error: fieldError } = await supabase
          .from('fields')
          .select('name')
          .eq('user_id', user.id)
          .eq('farm_id', farmId)
          .order('created_at', { ascending: false })
          .limit(10);
            
        if (fieldError) {
          console.warn("⚠️ [StepOne] Could not fetch field data:", fieldError);
        }
          
        // Common field names across Africa with regional variations
        const commonNames = [
          "Main Field", 
          "Home Garden", 
          "River Plot", 
          "Shamba Kubwa", // Swahili for "big farm"
          "Northern Field",
          "Eneo la Jua", // Sunny Area in Swahili
          "Valley Field",
          "Hillside Plot",
          "Maize Field",
          "Market Garden",
          "Family Plot"
        ];
          
        // Use farm name for some suggestions
        const farmBasedNames: string[] = [];
        if (farmData?.name) {
          farmBasedNames.push(
            `${farmData.name} Primary`,
            `${farmData.name} North`,
            `${farmData.name} South`
          );
        }
          
        // Add any existing field names with suffixes if they exist
        const existingNames = fieldData?.map(f => f.name) || [];
        const existingBasedNames: string[] = [];
          
        if (existingNames.length > 0) {
          // If user has existing fields, create numbered versions
          existingNames.forEach(name => {
            const baseName = name.replace(/\s+\d+$/, ''); // Remove any numbers at the end
            const number = existingNames.filter(n => n.startsWith(baseName)).length + 1;
            existingBasedNames.push(`${baseName} ${number}`);
          });
            
          // Add region-specific suggestions based on farm location
          if (farmData?.location) {
            existingBasedNames.push(
              `${farmData.location} Field`, 
              `New ${farmData.location} Plot`
            );
          }
        }
          
        // Combine all suggestion sources and filter out duplicates
        const allSuggestions = [
          ...farmBasedNames, 
          ...existingBasedNames,
          ...commonNames
        ].filter((value, index, self) => 
          self.indexOf(value) === index
        );
          
        // Shuffle and take top suggestions
        const shuffled = allSuggestions
          .sort(() => Math.random() - 0.5)
          .slice(0, 6);
            
        setSuggestions(shuffled);
      } catch (error) {
        console.error("Error generating field name suggestions:", error);
        setSuggestions([
          "Maize Field", 
          "Main Field", 
          "Home Garden", 
          "River Plot",
          "Northern Field",
          "Southern Field"
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    generateSuggestions();
  }, [user, farmId]);
  
  const handleSuggestionClick = (suggestion: string) => {
    onFieldNameChange(suggestion);
    setShowValidationError(false);
    
    // Add a small delay for animation effect
    setTimeout(() => onNext(), 300);
  };
  
  // Generate AI field name based on location, farm data, and crop patterns
  const generateAISuggestion = async () => {
    setIsGenerating(true);
    try {
      // Validate authentication and farm selection
      if (!user?.id || !farmId) {
        throw new Error(
          !user?.id 
            ? "Please sign in to use AI suggestions" 
            : "No farm selected for AI to use as context"
        );
      }
      
      // Get farm information for context
      const { data: farmData, error: farmError } = await supabase
        .from('farms')
        .select('name, location')
        .eq('id', farmId)
        .eq('user_id', user.id)
        .single();
          
      if (farmError) {
        console.warn("⚠️ [StepOne] Could not fetch farm data for AI:", farmError);
      }
      
      // In a real implementation, we'd fetch this from an AI service
      // For now we'll create intelligent suggestions based on farm context
      
      // Eastern/Western Africa crops
      const crops = ["Maize", "Cassava", "Sorghum", "Millet", "Rice", "Coffee", "Tea", 
                     "Banana", "Plantain", "Yam", "Sweet Potato", "Groundnut", "Cotton"];
      
      // Positive descriptive adjectives
      const adjectives = ["Fertile", "Productive", "Abundant", "Green", "Growing", "Bountiful", 
                         "Prime", "Rich", "Prosperous", "Thriving", "Flourishing"];
      
      // Location descriptors
      const locations = ["Upper", "Lower", "Northern", "Eastern", "Western", "Southern", 
                         "River", "Hill", "Valley", "Mountain", "Lake"];
      
      // Base the suggestion on the farm data if available
      let aiSuggestion: string;
      
      if (farmData) {
        const randomCrop = crops[Math.floor(Math.random() * crops.length)];
        const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        
        if (farmData.location) {
          // Use farm location in the name
          aiSuggestion = `${farmData.location} ${randomCrop} Field`;
        } else if (farmData.name) {
          // Use farm name in the field name
          const randomLocation = locations[Math.floor(Math.random() * locations.length)];
          aiSuggestion = `${farmData.name} ${randomLocation} ${randomCrop}`;
        } else {
          // Generate a completely new suggestion
          const randomLocation = locations[Math.floor(Math.random() * locations.length)];
          aiSuggestion = `${randomAdjective} ${randomLocation} ${randomCrop}`;
        }
      } else {
        // Fallback if no farm data
        const randomCrop = crops[Math.floor(Math.random() * crops.length)];
        const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const randomLocation = locations[Math.floor(Math.random() * locations.length)];
        
        // Generate name patterns
        const namePatterns = [
          `${randomAdjective} ${randomCrop} Field`,
          `${randomLocation} ${randomCrop} Plot`,
          `${randomAdjective} ${randomLocation} Field`,
          `${randomCrop} ${randomLocation}`,
          `Main ${randomCrop} Field`
        ];
        
        aiSuggestion = namePatterns[Math.floor(Math.random() * namePatterns.length)];
      }
      
      // Simulate AI completion time
      setTimeout(() => {
        onFieldNameChange(aiSuggestion);
        setShowValidationError(false);
        
        toast.success("AI suggestion generated", {
          description: `Smart field name created: "${aiSuggestion}"`,
          icon: <Sparkles className="h-5 w-5 text-yellow-500" />
        });
        setIsGenerating(false);
      }, 1200);
      
    } catch (error: any) {
      console.error("Error generating AI field name suggestion:", error);
      setIsGenerating(false);
      toast.error("Couldn't generate AI suggestion", {
        description: error.message || "Please try a suggestion below or enter a custom name"
      });
    }
  };
  
  const handleContinue = () => {
    // Validate field name
    const trimmedName = fieldName.trim();
    
    if (!trimmedName || trimmedName.length < 2) {
      setShowValidationError(true);
      toast.warning("Please enter a valid field name", {
        description: "Field name must be at least 2 characters"
      });
      return;
    }
    
    setShowValidationError(false);
    onNext();
  };
  
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-center mb-2">Let's name your field</h2>
        <p className="text-center text-muted-foreground mb-6">
          Give your field a name you'll easily recognize
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="max-w-md mx-auto space-y-4"
      >
        <div className="space-y-1">
          <Input
            placeholder="Enter field name..."
            value={fieldName}
            onChange={(e) => {
              onFieldNameChange(e.target.value);
              if (e.target.value.trim().length >= 2) {
                setShowValidationError(false);
              }
            }}
            className={`text-lg py-6 border-2 ${
              showValidationError 
                ? 'border-red-500 focus:border-red-500' 
                : 'focus:border-primary'
            }`}
          />
          {showValidationError && (
            <p className="text-sm text-red-500 pl-1">
              Field name must be at least 2 characters
            </p>
          )}
        </div>
        
        <Button 
          onClick={generateAISuggestion}
          variant="outline" 
          className="w-full flex gap-2 items-center justify-center h-12"
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
              Generating smart name...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-1" />
              Generate AI field name
            </>
          )}
        </Button>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <h3 className="text-sm font-medium text-center mb-4">
          Or choose a suggestion:
        </h3>
        
        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
          {isLoading ? (
            // Loading state
            Array(6).fill(0).map((_, index) => (
              <motion.div
                key={`loading-${index}`}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.7 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Card className="p-3 h-12 flex items-center justify-center border-dashed">
                  <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </Card>
              </motion.div>
            ))
          ) : (
            suggestions.map((suggestion, index) => (
              <motion.div
                key={suggestion}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Card 
                  className="p-3 text-center cursor-pointer hover:bg-primary/5 transition-colors border-dashed flex items-center justify-center"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      <motion.div 
        className="flex justify-center mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Button 
          onClick={handleContinue}
          size="lg"
          disabled={isLoading}
          className="w-full max-w-md"
        >
          {fieldName ? "Continue" : "I'll name it later"}
        </Button>
      </motion.div>
    </div>
  );
}
