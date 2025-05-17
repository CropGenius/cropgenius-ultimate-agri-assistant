import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Leaf, Droplets } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define known soil types and irrigation types for dropdowns
const soilTypes = ['Loamy', 'Sandy', 'Clay', 'Silty', 'Peaty', 'Chalky'];
const irrigationTypes = ['Drip', 'Sprinkler', 'Flood', 'Rain-fed', 'Center Pivot'];

interface SoilIrrigationStepProps {
  soilType: string;
  irrigationType: string;
  locationDescription?: string;
  onChange: (key: 'soil_type' | 'irrigation_type' | 'location_description', value: string) => void;
  errors?: Partial<Record<'soil_type' | 'irrigation_type' | 'location_description', string>>;
  onNext: () => void;
  onBack: () => void;
  onSkip?: () => void;
}

export default function SoilIrrigationStep({
  soilType,
  irrigationType,
  locationDescription,
  onChange,
  errors,
  onNext,
  onBack,
  onSkip
}: SoilIrrigationStepProps) {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-center mb-2">Soil & Irrigation Details</h2>
        <p className="text-center text-muted-foreground mb-6">
          Provide details about the soil and irrigation methods used for this field.
        </p>
      </motion.div>

      <motion.div className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <div>
          <label htmlFor="soilType" className="block text-sm font-medium mb-1">Soil Type <Leaf className="inline h-4 w-4 ml-1" /></label>
          <Select value={soilType} onValueChange={(value) => onChange('soil_type', value)}>
            <SelectTrigger id="soilType">
              <SelectValue placeholder="Select soil type" />
            </SelectTrigger>
            <SelectContent>
              {soilTypes.map(type => (
                <SelectItem key={type} value={type.toLowerCase()}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.soil_type && <p className="text-sm text-red-500 mt-1">{errors.soil_type}</p>}
        </div>

        <div>
          <label htmlFor="irrigationType" className="block text-sm font-medium mb-1">Irrigation Type <Droplets className="inline h-4 w-4 ml-1" /></label>
          <Select value={irrigationType} onValueChange={(value) => onChange('irrigation_type', value)}>
            <SelectTrigger id="irrigationType">
              <SelectValue placeholder="Select irrigation type" />
            </SelectTrigger>
            <SelectContent>
              {irrigationTypes.map(type => (
                <SelectItem key={type} value={type.toLowerCase().replace(' ', '_')}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.irrigation_type && <p className="text-sm text-red-500 mt-1">{errors.irrigation_type}</p>}
        </div>

        <div>
          <label htmlFor="locationDescription" className="block text-sm font-medium mb-1">Notes / Location Description (Optional)</label>
          <Textarea
            id="locationDescription"
            placeholder="E.g., 'Field behind the old barn', 'North-facing slope', etc."
            value={locationDescription || ''}
            onChange={(e) => onChange('location_description', e.target.value)}
            rows={3}
          />
          {errors?.location_description && <p className="text-sm text-red-500 mt-1">{errors.location_description}</p>}
        </div>
      </motion.div>

      <motion.div 
        className="flex justify-between gap-3 mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Button variant="ghost" onClick={onBack} className="flex-1">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div className="flex-1 space-y-2">
          <Button onClick={onNext} className="w-full">
            Continue
          </Button>
          {onSkip && (
            <Button variant="link" onClick={onSkip} className="w-full text-xs font-normal">
              Skip this step
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
