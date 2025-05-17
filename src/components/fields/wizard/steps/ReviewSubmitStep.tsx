import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Sparkles, Info, MapPin, Trees, Droplets, CalendarDays, Hash, Maximize, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { Boundary, Coordinates } from '@/types/field';

interface FieldData {
  name: string;
  boundary?: Boundary | null;
  location?: Coordinates | null;
  size?: number | null;
  size_unit?: string;
  crop_type?: string;
  planting_date?: Date | null;
  soil_type?: string;
  irrigation_type?: string;
  location_description?: string;
}

interface ReviewSubmitStepProps {
  initialFieldData: FieldData;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  onAnalyze?: () => void;
  locationName?: string;
  errors?: Partial<Record<string, string>>;
}

const DetailItem: React.FC<{ icon: React.ElementType, label: string, value?: string | number | null }> = ({ icon: Icon, label, value }) => (
  value ? (
    <div className="flex items-center space-x-2">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="font-medium">{label}:</span>
      <span>{String(value)}</span>
    </div>
  ) : null
);

export default function ReviewSubmitStep({
  initialFieldData,
  onSubmit,
  onBack,
  isSubmitting,
  onAnalyze,
  locationName,
  errors
}: ReviewSubmitStepProps) {
  const { name, size, size_unit, crop_type, planting_date, soil_type, irrigation_type, location_description } = initialFieldData;

  return (
    <div className="space-y-6">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4 }}>
        <h2 className="text-2xl font-bold text-center mb-2">Review Your Field Details</h2>
        <p className="text-center text-muted-foreground mb-6">
          Confirm the information below is correct before creating your field.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center'>
                <User className='mr-2 h-5 w-5 text-primary'/> Field: {name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {locationName && <DetailItem icon={MapPin} label="General Location" value={locationName} />}
            <DetailItem icon={Maximize} label="Size" value={size ? `${size} ${size_unit}` : 'Not set'} />
            <DetailItem icon={Trees} label="Crop Type" value={crop_type || 'Not set'} />
            <DetailItem icon={CalendarDays} label="Planting Date" value={planting_date ? format(new Date(planting_date), 'PPP') : 'Not set'} />
            <DetailItem icon={Info} label="Soil Type" value={soil_type || 'Not set'} />
            <DetailItem icon={Droplets} label="Irrigation" value={irrigation_type || 'Not set'} />
            {location_description && (
                <>
                    <Separator className='my-3'/>
                    <div className="flex items-start space-x-2">
                        <Hash className="h-4 w-4 text-muted-foreground mt-1" />
                        <div>
                            <span className="font-medium">Notes:</span>
                            <p className='text-sm text-muted-foreground'>{location_description}</p>
                        </div>
                    </div>
                </>
            )}
            {errors?.submit && <p className="text-sm text-red-500 mt-2">{errors.submit}</p>}
          </CardContent>
        </Card>
      </motion.div>

      {onAnalyze && (
        <motion.div className="pt-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <Button variant="outline" onClick={onAnalyze} className="w-full">
            <Sparkles className="h-4 w-4 mr-2" /> Analyze Field with AI (Optional)
          </Button>
          {errors?.analyze && <p className="text-sm text-red-500 mt-1">{errors.analyze}</p>}
        </motion.div>
      )}

      <motion.div 
        className="flex justify-between gap-3 mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Button variant="ghost" onClick={onBack} className="flex-1" disabled={isSubmitting}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <Button onClick={onSubmit} className="flex-1" disabled={isSubmitting}>
          <Send className="h-4 w-4 mr-2" /> {isSubmitting ? 'Creating Field...' : 'Create Field'}
        </Button>
      </motion.div>
    </div>
  );
}
