
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StepFourProps {
  size: number | undefined;
  sizeUnit: string;
  onSizeChange: (size: number | undefined) => void;
  onSizeUnitChange: (sizeUnit: string) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

// Common field sizes in hectares
const commonSizes = [0.1, 0.25, 0.5, 1, 2, 5, 10];

export default function StepFour({
  size,
  sizeUnit,
  onSizeChange,
  onSizeUnitChange,
  onNext,
  onBack,
  onSkip
}: StepFourProps) {
  const handleSizeSelect = (selectedSize: number) => {
    onSizeChange(selectedSize);
    setTimeout(() => onNext(), 300);
  };

  const handleCustomSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      onSizeChange(undefined);
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue > 0) {
        onSizeChange(numValue);
      }
    }
  };

  const getEquivalentSize = (size: number | undefined, unit: string) => {
    if (size === undefined) return '';
    
    if (unit === 'hectares') {
      // Convert to acres
      return `(${(size * 2.47105).toFixed(2)} acres)`;
    } else if (unit === 'acres') {
      // Convert to hectares
      return `(${(size * 0.404686).toFixed(2)} ha)`;
    }
    
    return '';
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-center mb-2">How big is your field?</h2>
        <p className="text-center text-muted-foreground mb-6">
          Select the approximate size or enter a custom value
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="grid grid-cols-3 gap-3">
          {commonSizes.map((commonSize, index) => (
            <motion.div
              key={commonSize}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 + index * 0.05 }}
            >
              <Card 
                className={cn(
                  "p-3 text-center cursor-pointer hover:bg-primary/5 transition-colors",
                  size === commonSize && "bg-primary/10 border-primary"
                )}
                onClick={() => handleSizeSelect(commonSize)}
              >
                <div className="font-medium">{commonSize} {sizeUnit}</div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="pt-4"
      >
        <h3 className="text-sm font-medium mb-3">Or enter a custom size:</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Input 
              type="number"
              placeholder="Custom size"
              value={size === undefined ? '' : size}
              onChange={handleCustomSizeChange}
              min="0.01"
              step="0.01"
              className="text-center"
            />
            {size !== undefined && (
              <div className="text-xs text-center mt-1 text-muted-foreground">
                {getEquivalentSize(size, sizeUnit)}
              </div>
            )}
          </div>
          
          <Select
            value={sizeUnit}
            onValueChange={onSizeUnitChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hectares">Hectares</SelectItem>
              <SelectItem value="acres">Acres</SelectItem>
              <SelectItem value="square_meters">Square Meters</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="pt-4 text-center"
      >
        <p className="text-muted-foreground text-sm">
          If you're not sure, AI can help estimate the size based on your field boundary.
        </p>
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
            className="w-full"
          >
            {size !== undefined ? "Continue" : "I'm not sure"}
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
