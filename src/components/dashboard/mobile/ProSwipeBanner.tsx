import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ArrowRight, ChevronLeft, ChevronRight, Crown, Sparkle, Zap, TrendingUp, BarChart2 } from 'lucide-react';

type Testimonial = {
  id: number;
  name: string;
  role: string;
  content: string;
  rating: number;
};

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'James Kariuki',
    role: 'Maize Farmer, Nakuru',
    content: 'CropGenius Pro helped me increase my yield by 30% with its AI recommendations!',
    rating: 5,
  },
  {
    id: 2,
    name: 'Sarah Auma',
    role: 'Vegetable Farmer, Kisumu',
    content: 'The weather alerts saved my crops from unexpected rains. Worth every shilling!',
    rating: 5,
  },
  {
    id: 3,
    name: 'David Omondi',
    role: 'Coffee Farmer, Nyeri',
    content: 'Market predictions are spot on. I now sell at the best prices.',
    rating: 4,
  },
];

const ProSwipeBanner: React.FC<{ onUpgrade: () => void; className?: string }> = ({
  onUpgrade,
  className = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // 1 for forward, -1 for backward
  const constraintsRef = useRef<HTMLDivElement>(null);

  const nextTestimonial = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <div 
      ref={constraintsRef}
      className={cn(
        'relative bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 overflow-hidden',
        'shadow-lg',
        className
      )}
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Crown className="h-5 w-5 text-yellow-300" />
            <h3 className="text-white font-bold text-lg">CropGenius Pro</h3>
          </div>
          <div className="flex space-x-1">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex ? 'bg-white w-4' : 'bg-white/50'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentTestimonial.id}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -100 : 100 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="mb-6"
          >
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl mb-4">
              <p className="text-white/90 text-sm mb-3">"{currentTestimonial.content}"</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium text-sm">{currentTestimonial.name}</p>
                  <p className="text-white/70 text-xs">{currentTestimonial.role}</p>
                </div>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      filled={i < currentTestimonial.rating}
                      className="h-4 w-4 text-yellow-300"
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between items-center">
          <button
            onClick={prevTestimonial}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-5 w-5 text-white" />
          </button>
          
          <button
            onClick={onUpgrade}
            className="flex-1 mx-4 py-3 px-6 bg-white text-purple-700 rounded-xl font-semibold
                      flex items-center justify-center space-x-2 hover:bg-opacity-90 transition-all"
          >
            <span>Upgrade to Pro</span>
            <ArrowRight className="h-4 w-4" />
          </button>
          
          <button
            onClick={nextTestimonial}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

const StarIcon: React.FC<{ filled: boolean; className?: string }> = ({ filled, className }) => (
  <svg
    className={className}
    viewBox="0 0 20 20"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path
      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
    />
  </svg>
);

export default ProSwipeBanner;
