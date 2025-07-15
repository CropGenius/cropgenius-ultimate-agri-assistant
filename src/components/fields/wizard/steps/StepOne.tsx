
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Leaf, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { supabase } from '@/services/supabaseClient';
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
  
  // Generate intelligent field name suggestions with fail-safe
  useEffect(() => {
    const generateSuggestions = async () => {
      setIsLoading(true);
      try {
        // Prepare default suggestions that always work
        const defaultSuggestions = [
          "Main Field", 
          "Home Garden", 
          "River Plot", 
          "Shamba Kubwa", // Swahili for "big farm"
          "Northern Field",
          "Valley Field"
        ];
        
        // Try to get user-specific suggestions, but don't block if it fails
        let farmBasedNames: string[] = [];
        let existingBasedNames: string[] = [];
        
        if (user?.id && farmId) {
          try {
            // Get farm information for context
            const { data: farmData, error: farmError } = await supabase
              .from('farms')
              .select('name, location')
              .eq('id', farmId)
              .eq('user_id', user.id)
              .maybeSingle();
              
            if (farmError) {
              console.warn("⚠️ [StepOne] Could not fetch farm data:", farmError);
            }
            
            // Get user's existing field names for context
            const { data: fieldData, error: fieldError } = await supabase
              .from('fields')
              .select('name')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false })
              .limit(10);
                
            if (fieldError) {
              console.warn("⚠️ [StepOne] Could not fetch field data:", fieldError);
            }
            
            // Use farm name for some suggestions if available
            if (farmData?.name) {
              farmBasedNames = [
                `${farmData.name} Primary`,
                `${farmData.name} North`,
                `${farmData.name} South`
              ];
            }
              
            // Add any existing field names with suffixes if they exist
            const existingNames = fieldData?.map(f => f.name) || [];
              
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
          } catch (error) {
            console.error("Error fetching personalized suggestions:", error);
            // Continue with defaults
          }
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
          
        // Combine all suggestion sources and filter out duplicates
        const allSuggestions = [
          ...farmBasedNames, 
          ...existingBasedNames,
          ...commonNames
        ].filter((value, index, self) => 
          self.indexOf(value) === index
        );
          
        // Ensure we have at least the default suggestions
        const finalSuggestions = allSuggestions.length >= 6 
          ? allSuggestions.sort(() => Math.random() - 0.5).slice(0, 6)
          : [...defaultSuggestions].sort(() => Math.random() - 0.5).slice(0, 6);
            
        setSuggestions(finalSuggestions);
      } catch (error) {
        console.error("Error generating field name suggestions:", error);
        // Fail-safe: always provide default suggestions
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
      // Get farm information for context if possible
      let farmData = null;
      
      if (user?.id && farmId) {
        try {
          const { data, error } = await supabase
            .from('farms')
            .select('name, location')
            .eq('id', farmId)
            .eq('user_id', user.id)
            .single();
              
          if (!error) {
            farmData = data;
          }
        } catch (err) {
          console.warn("⚠️ [StepOne] Could not fetch farm data for AI:", err);
          // Continue anyway
        }
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
        // Sanitize the suggestion to remove any problematic characters
        const sanitized = aiSuggestion.replace(/[^a-zA-Z0-9\s'-]/g, "").trim();
        onFieldNameChange(sanitized || "AI Generated Field");
        setShowValidationError(false);
        
        toast.success("AI suggestion generated", {
          description: `Smart field name created: "${sanitized || 'AI Generated Field'}"`,
          icon: <Sparkles className="h-5 w-5 text-yellow-500" />
        });
        setIsGenerating(false);
      }, 1200);
      
    } catch (error: any) {
      console.error("Error generating AI field name suggestion:", error);
      // Never fail - provide a fallback name
      
      const fallbackName = "AI Generated Field " + Math.floor(Math.random() * 1000);
      onFieldNameChange(fallbackName);
      
      setTimeout(() => {
        setIsGenerating(false);
        toast.success("Field name generated", {
          description: `Created "${fallbackName}"`,
          icon: <Sparkles className="h-5 w-5 text-yellow-500" />
        });
      }, 800);
    }
  };
  
  const handleContinue = () => {
    // Validate field name, but with auto-correction
    let finalName = fieldName.trim();
    
    if (!finalName || finalName.length < 2) {
      // Auto-correct: use "Unnamed Field" + timestamp if empty
      const timestamp = new Date().toLocaleTimeString().replace(/:/g, '');
      finalName = `Unnamed Field ${timestamp}`;
      onFieldNameChange(finalName);
      
      toast.info("Default name applied", {
        description: `Using "${finalName}" for your field`
      });
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
                ? 'border-amber-500 focus:border-amber-500' 
                : 'focus:border-primary'
            }`}
          />
          {showValidationError && (
            <p className="text-sm text-amber-500 pl-1">
              A name will be auto-generated if left blank
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
          Continue
        </Button>
      </motion.div>
    </div>
  );
}
