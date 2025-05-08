
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Mic, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StepThreeProps {
  cropType: string;
  onCropTypeChange: (cropType: string) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

// Common crops in Africa with nice icons
const commonCrops = [
  { name: 'Maize', emoji: '🌽' },
  { name: 'Cassava', emoji: '🥔' },
  { name: 'Rice', emoji: '🌾' },
  { name: 'Beans', emoji: '🫘' },
  { name: 'Sorghum', emoji: '🌿' },
  { name: 'Millet', emoji: '🌾' },
  { name: 'Sweet Potato', emoji: '🍠' },
  { name: 'Groundnut', emoji: '🥜' },
  { name: 'Banana', emoji: '🍌' },
  { name: 'Coffee', emoji: '☕' },
  { name: 'Cotton', emoji: '🧶' },
  { name: 'Sugarcane', emoji: '🧵' },
];

export default function StepThree({
  cropType,
  onCropTypeChange,
  onNext,
  onBack,
  onSkip
}: StepThreeProps) {
  const [searchValue, setSearchValue] = useState('');
  const [filteredCrops, setFilteredCrops] = useState(commonCrops);
  const [isListening, setIsListening] = useState(false);
  const [popularCrops, setPopularCrops] = useState<string[]>([]);

  useEffect(() => {
    if (searchValue) {
      setFilteredCrops(
        commonCrops.filter(crop => 
          crop.name.toLowerCase().includes(searchValue.toLowerCase())
        )
      );
    } else {
      setFilteredCrops(commonCrops);
    }
  }, [searchValue]);

  useEffect(() => {
    // Try to load popular crops from localStorage based on past entries
    try {
      const savedFields = localStorage.getItem('userCropPreferences');
      if (savedFields) {
        const preferences = JSON.parse(savedFields);
        setPopularCrops(preferences.slice(0, 3));
      }
    } catch (error) {
      console.error("Error loading crop preferences:", error);
    }
  }, []);

  const handleCropSelect = (cropName: string) => {
    onCropTypeChange(cropName);
    
    // Save to user preferences
    try {
      const savedFields = localStorage.getItem('userCropPreferences');
      let preferences = savedFields ? JSON.parse(savedFields) : [];
      
      // Move this crop to the front or add it
      preferences = [
        cropName,
        ...preferences.filter(crop => crop !== cropName)
      ].slice(0, 5); // Keep only 5 most popular
      
      localStorage.setItem('userCropPreferences', JSON.stringify(preferences));
    } catch (error) {
      console.error("Error saving crop preferences:", error);
    }
    
    setTimeout(() => onNext(), 300);
  };

  const handleListenForCrop = () => {
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      alert('Your browser does not support speech recognition');
      return;
    }

    setIsListening(true);

    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    recognition.start();
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchValue(transcript);
      
      // If transcript matches a crop exactly, select it
      const matchingCrop = commonCrops.find(crop => 
        crop.name.toLowerCase() === transcript.toLowerCase()
      );
      
      if (matchingCrop) {
        handleCropSelect(matchingCrop.name);
      }
      
      setIsListening(false);
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-center mb-2">What are you growing here?</h2>
        <p className="text-center text-muted-foreground mb-6">
          Select a crop for your field
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="relative"
      >
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search crops..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-9 py-6"
            />
          </div>
          
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "flex-shrink-0 h-10 w-10",
              isListening && "bg-primary text-primary-foreground"
            )}
            onClick={handleListenForCrop}
          >
            <Mic className={cn("h-4 w-4", isListening && "animate-pulse")} />
          </Button>
        </div>
      </motion.div>

      {/* Popular crops */}
      {popularCrops.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h3 className="text-sm font-medium mb-2">Your Popular Crops:</h3>
          <div className="flex flex-wrap gap-2">
            {popularCrops.map((crop, i) => (
              <Badge 
                key={i}
                variant="outline"
                className={cn(
                  "cursor-pointer text-base py-1.5 px-3",
                  cropType === crop && "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
                onClick={() => handleCropSelect(crop)}
              >
                {crop}
              </Badge>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <h3 className="text-sm font-medium mb-3">Common Crops:</h3>
        <div className="grid grid-cols-3 gap-3">
          {filteredCrops.slice(0, 9).map((crop, index) => (
            <motion.div
              key={crop.name}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 + index * 0.05 }}
            >
              <Card 
                className={cn(
                  "p-3 text-center cursor-pointer hover:bg-primary/5 transition-colors",
                  cropType === crop.name && "bg-primary/10 border-primary"
                )}
                onClick={() => handleCropSelect(crop.name)}
              >
                <div className="text-2xl mb-1">{crop.emoji}</div>
                <div className="text-sm font-medium truncate">{crop.name}</div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div 
        className="flex justify-between gap-3 mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="flex-1"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        
        <div className="space-y-2 flex-1">
          <Button 
            onClick={onNext}
            disabled={!cropType && filteredCrops.length > 0}
            className="w-full"
          >
            {cropType ? "Continue" : "Select a crop"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSkip}
            className="w-full text-xs font-normal"
          >
            Skip this step
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
