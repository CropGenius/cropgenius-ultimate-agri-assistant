
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, LucidePlant } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface StepOneProps {
  fieldName: string;
  onFieldNameChange: (name: string) => void;
  onNext: () => void;
}

export default function StepOne({ fieldName, onFieldNameChange, onNext }: StepOneProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  
  useEffect(() => {
    // Generate field name suggestions
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
            "Northern Field"
          ];
          
          // Add any existing field names with suffixes if they exist
          const existingNames = data?.map(f => f.name) || [];
          const allSuggestions = [...commonNames];
          
          if (existingNames.length > 0) {
            // If user has "Maize Field", suggest "Maize Field 2"
            existingNames.forEach(name => {
              if (commonNames.includes(name)) {
                allSuggestions.push(`${name} 2`);
              }
            });
          }
          
          setSuggestions(allSuggestions.slice(0, 4));
        }
      } catch (error) {
        console.error("Error generating field name suggestions:", error);
        setSuggestions(["Maize Field", "Mama's Shamba", "Home Garden", "New Field"]);
      } finally {
        setIsLoading(false);
      }
    };
    
    generateSuggestions();
  }, [user]);
  
  const handleSuggestionClick = (suggestion: string) => {
    onFieldNameChange(suggestion);
    setTimeout(() => onNext(), 300);
  };
  
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-center mb-2">Let's name this field</h2>
        <p className="text-center text-muted-foreground mb-6">
          Give your field a name you'll easily recognize
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="max-w-md mx-auto"
      >
        <Input
          placeholder="Enter field name..."
          value={fieldName}
          onChange={(e) => onFieldNameChange(e.target.value)}
          className="text-lg py-6"
        />
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
          {suggestions.map((suggestion, index) => (
            <motion.div
              key={suggestion}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Card 
                className="p-3 text-center cursor-pointer hover:bg-primary/5 transition-colors border-dashed"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div 
        className="flex justify-center mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Button 
          onClick={onNext}
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
