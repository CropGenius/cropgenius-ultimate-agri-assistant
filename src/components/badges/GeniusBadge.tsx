
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Share2, MessageCircle, Facebook } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export type BadgeType = "smart_farmer" | "crop_master" | "weather_wizard" | "fertilizer_expert" | "soil_scientist";

interface BadgeData {
  type: BadgeType;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  textColor: string;
  badgeColor: string;
  earnedAt: string;
}

interface GeniusBadgeProps {
  type: BadgeType;
  showShareOptions?: boolean;
}

const getBadgeData = (type: BadgeType): BadgeData => {
  const commonProps = {
    earnedAt: new Date().toISOString(),
  };
  
  switch (type) {
    case "smart_farmer":
      return {
        ...commonProps,
        type,
        title: "Smart Farmer",
        description: "Applied AI recommendations to your farm",
        icon: <Award className="h-10 w-10" />,
        color: "bg-green-100 dark:bg-green-900/30",
        badgeColor: "bg-green-600",
        textColor: "text-green-800 dark:text-green-300",
      };
    case "crop_master":
      return {
        ...commonProps,
        type,
        title: "Crop Master",
        description: "Successfully optimized your crop selection",
        icon: <Award className="h-10 w-10" />,
        color: "bg-blue-100 dark:bg-blue-900/30",
        badgeColor: "bg-blue-600",
        textColor: "text-blue-800 dark:text-blue-300",
      };
    case "weather_wizard":
      return {
        ...commonProps,
        type,
        title: "Weather Wizard",
        description: "Made a farm decision based on AI weather insights",
        icon: <Award className="h-10 w-10" />,
        color: "bg-purple-100 dark:bg-purple-900/30",
        badgeColor: "bg-purple-600",
        textColor: "text-purple-800 dark:text-purple-300",
      };
    case "fertilizer_expert":
      return {
        ...commonProps,
        type,
        title: "Fertilizer Expert",
        description: "Optimized your fertilizer application with AI",
        icon: <Award className="h-10 w-10" />,
        color: "bg-amber-100 dark:bg-amber-900/30",
        badgeColor: "bg-amber-600",
        textColor: "text-amber-800 dark:text-amber-300",
      };
    case "soil_scientist":
      return {
        ...commonProps,
        type,
        title: "Soil Scientist",
        description: "Analyzed your soil with CROPGenius AI",
        icon: <Award className="h-10 w-10" />,
        color: "bg-red-100 dark:bg-red-900/30",
        badgeColor: "bg-red-600",
        textColor: "text-red-800 dark:text-red-300",
      };
    default:
      return {
        ...commonProps,
        type: "smart_farmer",
        title: "Smart Farmer",
        description: "Applied AI recommendations to your farm",
        icon: <Award className="h-10 w-10" />,
        color: "bg-green-100 dark:bg-green-900/30",
        badgeColor: "bg-green-600",
        textColor: "text-green-800 dark:text-green-300",
      };
  }
};

const GeniusBadge = ({ type, showShareOptions = true }: GeniusBadgeProps) => {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const badgeData = getBadgeData(type);

  const getShareMessage = () => {
    return `I just earned the ${badgeData.title} badge on CROPGenius! 🌱 I'm using AI to optimize my farm. Join me and get Pro features for free!`;
  };

  const shareToWhatsApp = () => {
    const message = encodeURIComponent(getShareMessage());
    window.open(`https://wa.me/?text=${message}`, '_blank');
    toast.success("Opening WhatsApp sharing");
    setTimeout(() => setIsShareOpen(false), 500);
  };

  const shareToFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    const message = encodeURIComponent(getShareMessage());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${message}`, '_blank');
    toast.success("Opening Facebook sharing");
    setTimeout(() => setIsShareOpen(false), 500);
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}?ref=badge&type=${type}`);
    toast.success("Share link copied to clipboard!");
    setTimeout(() => setIsShareOpen(false), 500);
  };

  return (
    <Card className={`${badgeData.color} border-none shadow-sm overflow-hidden`}>
      <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full ${badgeData.badgeColor} opacity-10`} />
      
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${badgeData.badgeColor} text-white`}>
            {badgeData.icon}
          </div>
          <div>
            <CardTitle className={badgeData.textColor}>{badgeData.title}</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              {badgeData.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      {showShareOptions && (
        <CardFooter className="pt-0 pb-3">
          <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full gap-2" size="sm">
                <Share2 className="h-4 w-4" />
                Share Achievement
              </Button>
            </DialogTrigger>
            
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share Your Achievement</DialogTitle>
                <DialogDescription>
                  Share your farming success and invite friends to join CROPGenius!
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <p className="text-sm border-l-4 border-green-500 pl-3 py-2 bg-green-50 dark:bg-green-900/20 rounded">
                  "I just earned the {badgeData.title} badge on CROPGenius! 🌱 I'm using AI to optimize my farm. Join me and get Pro features for free!"
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="gap-2 bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                    onClick={shareToWhatsApp}
                  >
                    <MessageCircle className="h-5 w-5" />
                    Share to WhatsApp
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="gap-2 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                    onClick={shareToFacebook}
                  >
                    <Facebook className="h-5 w-5" />
                    Share to Facebook
                  </Button>
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  variant="secondary" 
                  onClick={copyShareLink}
                >
                  Copy Invite Link
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      )}
    </Card>
  );
};

export default GeniusBadge;
