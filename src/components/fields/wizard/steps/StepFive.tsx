
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface StepFiveProps {
  plantingDate: Date | null;
  onPlantingDateChange: (date: Date | null) => void;
  onBack: () => void;
  onSubmit: () => void;
  onSkip: () => void;
  isSubmitting: boolean;
}

export default function StepFive({
  plantingDate,
  onPlantingDateChange,
  onBack,
  onSubmit,
  onSkip,
  isSubmitting
}: StepFiveProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  const getCurrentWeek = () => {
    const today = new Date();
    return new Date(today.setDate(today.getDate() - today.getDay()));
  };

  const getLastWeek = () => {
    const today = new Date();
    return new Date(today.setDate(today.getDate() - today.getDay() - 7));
  };

  const getNextWeek = () => {
    const today = new Date();
    return new Date(today.setDate(today.getDate() - today.getDay() + 7));
  };

  const handleQuickSelectDate = (date: Date) => {
    onPlantingDateChange(date);
    setTimeout(() => onSubmit(), 500);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-center mb-2">When did you plant?</h2>
        <p className="text-center text-muted-foreground mb-6">
          Select a planting date or choose a general timeframe
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-2 gap-3"
      >
        <Card 
          className="p-3 text-center cursor-pointer hover:bg-primary/5 transition-colors"
          onClick={() => handleQuickSelectDate(getCurrentWeek())}
        >
          <div className="text-sm font-medium">This week</div>
        </Card>
        
        <Card 
          className="p-3 text-center cursor-pointer hover:bg-primary/5 transition-colors"
          onClick={() => handleQuickSelectDate(getLastWeek())}
        >
          <div className="text-sm font-medium">Last week</div>
        </Card>
        
        <Card 
          className="p-3 text-center cursor-pointer hover:bg-primary/5 transition-colors"
          onClick={() => handleQuickSelectDate(getNextWeek())}
        >
          <div className="text-sm font-medium">Next week</div>
        </Card>
        
        <Card 
          className="p-3 text-center cursor-pointer hover:bg-primary/5 transition-colors"
          onClick={() => onSkip()}
        >
          <div className="text-sm font-medium">Not yet planted</div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="pt-4"
      >
        <h3 className="text-sm font-medium mb-3 text-center">Or pick an exact date:</h3>
        
        <div className="flex justify-center">
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-64 justify-start text-left font-normal",
                  !plantingDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {plantingDate ? format(plantingDate, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={plantingDate || undefined}
                onSelect={(date) => {
                  onPlantingDateChange(date);
                  setCalendarOpen(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </motion.div>

      <motion.div 
        className="flex justify-between gap-3 mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="flex-1"
          disabled={isSubmitting}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        
        <div className="space-y-2 flex-1">
          <Button 
            onClick={onSubmit}
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Field..." : "Finish & Create Field"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSkip}
            className="w-full text-xs font-normal"
            disabled={isSubmitting}
          >
            Skip this step
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
