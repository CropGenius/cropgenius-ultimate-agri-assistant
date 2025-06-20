import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Mic, ArrowLeft, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import ErrorBoundary from '@/components/error/ErrorBoundary';

interface StepThreeProps {
  cropType: string;
  onCropTypeChange: (cropType: string) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

// Expanded list of common crops in Africa with better categorization
const commonCrops = [
  // Cereals
  { name: 'Maize', category: 'cereal', icon: '/crops/maize.svg' },
  { name: 'Rice', category: 'cereal', icon: '/crops/rice.svg' },
  { name: 'Sorghum', category: 'cereal', icon: '/crops/sorghum.svg' },
  { name: 'Millet', category: 'cereal', icon: '/crops/millet.svg' },
  { name: 'Wheat', category: 'cereal', icon: '/crops/wheat.svg' },
  { name: 'Teff', category: 'cereal', icon: '/crops/teff.svg' },
  { name: 'Fonio', category: 'cereal', icon: '/crops/fonio.svg' },
  
  // Roots & Tubers
  { name: 'Cassava', category: 'root', icon: '/crops/cassava.svg' },
  { name: 'Sweet Potato', category: 'root', icon: '/crops/sweet-potato.svg' },
  { name: 'Yam', category: 'root', icon: '/crops/yam.svg' },
  { name: 'Irish Potato', category: 'root', icon: '/crops/potato.svg' },
  { name: 'Taro', category: 'root', icon: '/crops/taro.svg' },
  
  // Legumes
  { name: 'Beans', category: 'legume', icon: '/crops/beans.svg' },
  { name: 'Groundnut', category: 'legume', icon: '/crops/groundnut.svg' },
  { name: 'Cowpea', category: 'legume', icon: '/crops/cowpea.svg' },
  { name: 'Soybean', category: 'legume', icon: '/crops/soybean.svg' },
  { name: 'Pigeon Pea', category: 'legume', icon: '/crops/pigeon-pea.svg' },
  { name: 'Bambara Nut', category: 'legume', icon: '/crops/bambara.svg' },
  
  // Fruits
  { name: 'Banana', category: 'fruit', icon: '/crops/banana.svg' },
  { name: 'Mango', category: 'fruit', icon: '/crops/mango.svg' },
  { name: 'Avocado', category: 'fruit', icon: '/crops/avocado.svg' },
  { name: 'Papaya', category: 'fruit', icon: '/crops/papaya.svg' },
  { name: 'Citrus', category: 'fruit', icon: '/crops/citrus.svg' },
  { name: 'Pineapple', category: 'fruit', icon: '/crops/pineapple.svg' },
  { name: 'Passion Fruit', category: 'fruit', icon: '/crops/passion-fruit.svg' },
  { name: 'Guava', category: 'fruit', icon: '/crops/guava.svg' },
  
  // Vegetables
  { name: 'Tomato', category: 'vegetable', icon: '/crops/tomato.svg' },
  { name: 'Onion', category: 'vegetable', icon: '/crops/onion.svg' },
  { name: 'Cabbage', category: 'vegetable', icon: '/crops/cabbage.svg' },
  { name: 'Kale', category: 'vegetable', icon: '/crops/kale.svg' },
  { name: 'Okra', category: 'vegetable', icon: '/crops/okra.svg' },
  { name: 'Eggplant', category: 'vegetable', icon: '/crops/eggplant.svg' },
  { name: 'Pepper', category: 'vegetable', icon: '/crops/pepper.svg' },
  { name: 'Amaranth', category: 'vegetable', icon: '/crops/amaranth.svg' },
  
  // Cash Crops
  { name: 'Coffee', category: 'cash', icon: '/crops/coffee.svg' },
  { name: 'Tea', category: 'cash', icon: '/crops/tea.svg' },
  { name: 'Cotton', category: 'cash', icon: '/crops/cotton.svg' },
  { name: 'Sugarcane', category: 'cash', icon: '/crops/sugarcane.svg' },
  { name: 'Tobacco', category: 'cash', icon: '/crops/tobacco.svg' },
  { name: 'Cocoa', category: 'cash', icon: '/crops/cocoa.svg' },
  { name: 'Cashew', category: 'cash', icon: '/crops/cashew.svg' },
  { name: 'Oil Palm', category: 'cash', icon: '/crops/oil-palm.svg' },
  { name: 'Sisal', category: 'cash', icon: '/crops/sisal.svg' },
  { name: 'Khat', category: 'cash', icon: '/crops/khat.svg' },
  
  // Others
  { name: 'Sesame', category: 'other', icon: '/crops/sesame.svg' },
  { name: 'Sunflower', category: 'other', icon: '/crops/sunflower.svg' },
  { name: 'Pyrethrum', category: 'other', icon: '/crops/pyrethrum.svg' },
  { name: 'Moringa', category: 'other', icon: '/crops/moringa.svg' },
  { name: 'Alfalfa', category: 'other', icon: '/crops/alfalfa.svg' },
  { name: 'Napier Grass', category: 'other', icon: '/crops/napier.svg' }
];

// Fallback images for crops that don't have icons
const cropCategoryIcons = {
  'cereal': '🌾',
  'root': '🥔',
  'legume': '🫘',
  'fruit': '🍎',
  'vegetable': '🥬',
  'cash': '💰',
  'other': '🌱'
};

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
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [newCropName, setNewCropName] = useState('');
  
  // Categories to group crops by
  const categories = [
    { name: 'All', icon: '🌱' },
    { name: 'Cereal', icon: '🌾' },
    { name: 'Root', icon: '🥔' },
    { name: 'Legume', icon: '🫘' },
    { name: 'Fruit', icon: '🍎' },
    { name: 'Vegetable', icon: '🥬' },
    { name: 'Cash', icon: '💰' },
  ];

  useEffect(() => {
    // Filter crops based on search value and active category
    if (searchValue || activeCategory) {
      const filtered = commonCrops.filter(crop => {
        const matchesSearch = crop.name.toLowerCase().includes(searchValue.toLowerCase());
        const matchesCategory = !activeCategory || activeCategory === 'All' || crop.category.toLowerCase() === activeCategory.toLowerCase();
        return matchesSearch && matchesCategory;
      });
      setFilteredCrops(filtered);
    } else {
      setFilteredCrops(commonCrops);
    }
  }, [searchValue, activeCategory]);

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
    
    // Play a soft click sound
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRoQFAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YWAFAACAgICAgICAgICAgICAgICAgICAgICAgICAf3hxeIF/gICAf4B+gICAgH+AgICAgICAgICAeHBye4KCgX+Af3+BgoKAgH+AgYKDgH+Af4CBgn98eHR5foKDgoB/gIGDg4J/f4CBg4SCgH+AgYODgH16eXyBhISDgH+AgoSEgn+AgIKEg4F/f4CCg4J+e3p8gIOEg4B/gIKEhIF/f4CCg4OCf3+AgYKAfXt7foGDg4OAf4CCg4OCf4CAgoODgn9/gIGCgH57fH6Bg4SDgH+BgoODgn+AgIKDg4F/f4CBgoF+fHx+gYOEg4F/gYKDg4F/gICCg4KBf3+AgYGAfnx9f4GDhIOBf4GCg4OBf4CAgoOCgX9/gIGBgH58fX+ChIODgX+BgoOCgX+AgIKDgoF/f4CBgYB+fH2AgoSEg4F/gYKDgoF/gICCg4KBf3+AgYGAfnx+gIKEhIOBgIGCg4KBf4CAgoOCgX9/gIGBgH59foCChIODgYCBgoOCgX+AgIKDgoF/f4CBgYB+fX6AgoSDg4GAgYKDgoF/gICCg4KBf3+AgYGAfn1+gIKEg4OBgIGCg4KBf4CAgoOCgX9/gIGBgH59foCChIODgYCBgoOCgX+AgIKDgoJ/f4CBgYB+fX6AgoSDg4GAgoODgoF/gICCg4KCf4CAgoGAfn1+gIKEhIOBgIKDg4KBf4CAgoOCgn+AgIKBgH59foCChIODgYCCg4OCgX+AgIKDgoJ/gICCgYB+fX6AgoSDg4GAgoODgoF/gICCg4KCf4CAgoGAfn1+gIKEg4OBgIKDg4KBf4CAgoOCgn+AgIKBgH59foCChIODgYCCg4OCgX+AgIKDgoJ/gICCgYB+fX6AgoSDg4GAgoODgoF/gICCg4KCf4CAgoGAfn1+gIKEg4OBgIKDg4KBf4CAgoOCgn+AgIKBgH59foCChIODgYCCg4OCgX+AgIKDgoJ/gICCgYB+fX6AgoSDg4GAgoODgoF/gICCg4KCf4CAgoGAfn1+gIKEg4OBgIKDg4KBf4CAgoOCgn+AgIKBgH59foCChIODgYCCg4OCgX+AgIKDgoJ/gICCgYB+fX6AgoSDg4GAgoODgoF/gICCg4KCf4CAgoGAfn1+gIKEg4OBgIKDg4KBf4CAgoOCgn+AgIKBgH59foCChIODgYCCg4OCgX+AgIKDgoJ/gICCgYB+fX6AgoSDg4GAgoODgoF/gICCg4KCf4CAgoGAfn1+gIKEg4OBgIKDg4KBgICBgoKCf4CAgoGAfn5+gIKEg4OBgIKDg4KBgICBgoKCf4CAgoGAfn5+gIKEg4OBgIKDg4KBgICBgoKCf4CAgoGAfn5+gIKEg4OBgIKDg4KBgICBgoKCf4CAgoGAfn5+gIKEg4OBgIKDg4KBgICBgoKCf4CAgoGAfn5+gIKEg4OBgIKDg4KBgICBgoKCf4CAgoGAfn5+gIKEg4OBgIKDg4KBgICBgoKCf4CAgoGAfn5+gIKEg4OBgIKDg4KBgICBgoKCf4CAgoGAfn5+gIKEg4OBgIKDg4KBgICBgoKCf4CAgoGAfn5+gYODg4GAgoODgoGAgIGCgoJ/gICCgYB+fn6Bg4ODgYCCg4OCgYCAgYKCgn+AgIKBgH5+foGDg4OBgIKDg4KBgICBgoKCf4CAgoGAfn5+foGDg4OBgIKDg4KBgICBgoKCf4CAgoGAfn5+');
      audio.volume = 0.2;
      audio.play().catch(e => console.log('Audio play prevented by browser'));
    } catch (error) {
      console.log('Audio playback not supported');
    }
    
    setTimeout(() => onNext(), 300);
  };

  const handleListenForCrop = () => {
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      toast.warning('Speech recognition not supported in your browser');
      return;
    }

    setIsListening(true);

    // Properly typed SpeechRecognition interface
    interface SpeechRecognitionEvent extends Event {
      results: {
        [index: number]: {
          [index: number]: {
            transcript: string;
            confidence: number;
          }
        }
      }
    }

    interface SpeechRecognitionErrorEvent extends Event {
      error: string;
      message: string;
    }

    interface SpeechRecognition extends EventTarget {
      lang: string;
      interimResults: boolean;
      maxAlternatives: number;
      start(): void;
      stop(): void;
      onresult: ((event: SpeechRecognitionEvent) => void) | null;
      onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
      onend: (() => void) | null;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition() as SpeechRecognition;
    
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    recognition.start();
    
    recognition.onresult = (event: SpeechRecognitionEvent) => {
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
    
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      
      toast.error('Could not understand speech', {
        description: 'Please try again or type your crop name'
      });
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
  };
  
  const handleSuggestNewCrop = () => {
    if (!newCropName.trim()) {
      toast.warning('Please enter a crop name');
      return;
    }
    
    // Check if crop already exists
    if (commonCrops.some(crop => crop.name.toLowerCase() === newCropName.toLowerCase())) {
      toast.info('This crop already exists', {
        description: 'Try searching for it in the crop list'
      });
      setShowSuggestionModal(false);
      return;
    }
    
    // Add the crop to user preferences
    try {
      const savedFields = localStorage.getItem('userCropPreferences');
      let preferences = savedFields ? JSON.parse(savedFields) : [];
      preferences = [newCropName, ...preferences].slice(0, 10);
      localStorage.setItem('userCropPreferences', JSON.stringify(preferences));
    } catch (error) {
      console.error("Error saving crop suggestion:", error);
    }
    
    // Select the new crop
    onCropTypeChange(newCropName);
    
    toast.success('New crop added!', {
      description: `${newCropName} has been added to your crops`
    });
    
    setShowSuggestionModal(false);
    setTimeout(() => onNext(), 500);
  };
  
  const renderCropIcon = (crop: { name: string; category: string; icon: string }) => {
    // First try to use the icon path
    if (crop.icon) {
      // Check if the icon is an SVG path or a fallback emoji
      if (crop.icon.startsWith('/')) {
        try {
          return (
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-1">
              <img 
                src={crop.icon} 
                alt={crop.name} 
                className="w-6 h-6"
                onError={(e) => {
                  // If image fails to load, use category icon as fallback
                  (e.target as HTMLElement).style.display = 'none';
                  const fallbackEl = e.currentTarget.parentElement;
                  if (fallbackEl) {
                    fallbackEl.innerHTML = cropCategoryIcons[crop.category as keyof typeof cropCategoryIcons] || '🌱';
                  }
                }}
              />
            </div>
          );
        } catch (e) {
          // If there's an error loading the image, use the category icon
          return <div className="text-2xl mb-1">{cropCategoryIcons[crop.category as keyof typeof cropCategoryIcons] || '🌱'}</div>;
        }
      } else {
        // Direct emoji
        return <div className="text-2xl mb-1">{crop.icon}</div>;
      }
    }
    
    // Fallback to category icon
    return <div className="text-2xl mb-1">{cropCategoryIcons[crop.category as keyof typeof cropCategoryIcons] || '🌱'}</div>;
  };

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold mb-2">What are you growing here?</h2>
          <p className="text-center text-muted-foreground mb-2">
            Select or search for a crop
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
                placeholder="Search for a crop..."
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

        {/* Category filter */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="overflow-x-auto pb-2 no-scrollbar"
        >
          <div className="flex space-x-2 min-w-max">
            {categories.map((category) => (
              <Badge 
                key={category.name}
                variant={activeCategory === category.name ? "default" : "outline"}
                className="cursor-pointer px-3 py-1 text-sm"
                onClick={() => setActiveCategory(activeCategory === category.name ? null : category.name)}
              >
                <span className="mr-1">{category.icon}</span>
                {category.name}
              </Badge>
            ))}
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

        {/* Crop grid */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="space-y-3"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">
              {filteredCrops.length > 0 ? (
                `${filteredCrops.length} crop${filteredCrops.length !== 1 ? 's' : ''} available`
              ) : (
                'No crops match your search'
              )}
            </h3>
            
            {filteredCrops.length === 0 && (
              <Button 
                variant="link" 
                size="sm"
                onClick={() => {
                  setShowSuggestionModal(true);
                  setNewCropName(searchValue);
                }}
                className="text-primary font-medium"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add "{searchValue}"
              </Button>
            )}
          </div>
          
          {filteredCrops.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {filteredCrops.slice(0, 12).map((crop, index) => (
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
                    {renderCropIcon(crop)}
                    <div className="text-sm font-medium truncate">{crop.name}</div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center bg-muted/50">
              <p className="text-muted-foreground">No crops match your search</p>
              <Button 
                variant="link" 
                onClick={() => {
                  setShowSuggestionModal(true);
                  setNewCropName(searchValue);
                }}
                className="mt-2"
              >
                Suggest a new crop
              </Button>
            </Card>
          )}
          
          {filteredCrops.length > 12 && (
            <div className="text-center">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSearchValue('')}
              >
                {filteredCrops.length - 12} more crops available - refine your search
              </Button>
            </div>
          )}
          
          <div className="text-center pt-2">
            <Button 
              variant="link" 
              size="sm"
              onClick={() => {
                setShowSuggestionModal(true);
                setNewCropName('');
              }}
              className="text-primary"
            >
              <Plus className="h-4 w-4 mr-1" />
              Can't find your crop? Add it
            </Button>
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
        
        {/* Suggest new crop dialog */}
        <Dialog open={showSuggestionModal} onOpenChange={setShowSuggestionModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add a new crop</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="Enter crop name"
                value={newCropName}
                onChange={(e) => setNewCropName(e.target.value)}
                className="w-full"
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowSuggestionModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSuggestNewCrop}>
                Add Crop
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ErrorBoundary>
  );
}
