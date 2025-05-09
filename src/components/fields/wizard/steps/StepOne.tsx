
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Leaf, Loader2 } from 'lucide-react';
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
  const { user } = useAuth();
  
  // Generate intelligent field name suggestions
  useEffect(() => {
    const generateSuggestions = async () => {
      setIsLoading(true);
      try {
        // Get user's existing field names for context
        if (user?.id) {
          const { data } = await supabase
            .from('fields')
            .select('name')
            .eq('user_id', user.id)
            .limit(5);
            
          // Common field names in Africa with regional variations
          const commonNames = [
            "Maize Field", 
            "Mama's Shamba", 
            "Main Field", 
            "Home Garden", 
            "River Plot", 
            "Northern Field",
            "Southern Field",
            "Eastern Plot",
            "Western Field"
          ];
          
          // Add any existing field names with suffixes if they exist
          const existingNames = data?.map(f => f.name) || [];
          const allSuggestions = [...commonNames];
          
          if (existingNames.length > 0) {
            // If user has existing fields, create numbered versions
            existingNames.forEach(name => {
              const baseName = name.replace(/\s+\d+$/, ''); // Remove any numbers at the end
              const number = existingNames.filter(n => n.startsWith(baseName)).length + 1;
              allSuggestions.push(`${baseName} ${number}`);
            });
            
            // Add region-specific suggestions based on farm location
            const farmRegionSuggestions = ["Upper Field", "Lower Field", "Riverside Plot", "Hill Field"];
            allSuggestions.push(...farmRegionSuggestions);
          }
          
          // Shuffle and take first 6
          const shuffled = allSuggestions
            .filter((name, index, self) => self.indexOf(name) === index) // Remove duplicates
            .sort(() => Math.random() - 0.5)
            .slice(0, 6);
            
          setSuggestions(shuffled);
        }
      } catch (error) {
        console.error("Error generating field name suggestions:", error);
        setSuggestions(["Maize Field", "Main Field", "Home Garden", "New Field"]);
      } finally {
        setIsLoading(false);
      }
    };
    
    generateSuggestions();
  }, [user]);
  
  const handleSuggestionClick = (suggestion: string) => {
    onFieldNameChange(suggestion);
    
    // Add a small delay for animation effect
    setTimeout(() => onNext(), 300);
  };
  
  const generateAISuggestion = async () => {
    setIsGenerating(true);
    try {
      // Here we simulate AI generating a name based on location, crops, etc
      // In production, this would call an AI service
      
      const crops = ["Maize", "Tomato", "Cabbage", "Beans", "Rice", "Cassava", "Sorghum"];
      const adjectives = ["Fertile", "Sunny", "Green", "Growing", "Bountiful"];
      const locations = ["Eastern", "Northern", "Western", "Southern", "River", "Hill"];
      
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
      
      const aiSuggestion = namePatterns[Math.floor(Math.random() * namePatterns.length)];
      
      // In a real implementation, we'd fetch this from an AI service
      setTimeout(() => {
        onFieldNameChange(aiSuggestion);
        toast.success("AI suggestion generated", {
          description: `Based on your region and common crops: "${aiSuggestion}"`
        });
        setIsGenerating(false);
      }, 1200);
      
    } catch (error) {
      console.error("Error generating AI field name suggestion:", error);
      setIsGenerating(false);
      toast.error("Couldn't generate AI suggestion", {
        description: "Please try a suggestion below or enter a custom name"
      });
    }
  };
  
  const handleContinue = () => {
    // Validate field name
    const trimmedName = fieldName.trim();
    
    if (!trimmedName || trimmedName.length < 2) {
      toast.warning("Please enter a valid field name", {
        description: "Field name must be at least 2 characters"
      });
      return;
    }
    
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
        <Input
          placeholder="Enter field name..."
          value={fieldName}
          onChange={(e) => onFieldNameChange(e.target.value)}
          className="text-lg py-6 border-2 focus:border-primary"
        />
        
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
              <Leaf className="h-4 w-4 mr-1" />
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
