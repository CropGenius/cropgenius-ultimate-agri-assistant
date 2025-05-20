import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Tractor, TrendingUp, Info } from "lucide-react";
import { useState } from "react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FarmScoreCardProps {
  farmScore: number;
  scoreChange: number;
  showScoreAnimation: boolean;
  taskStats: {
    completed: number;
    total: number;
    efficiencyGain: number;
    yieldBoost: number;
  };
}

export default function FarmScoreCard({ 
  farmScore, 
  scoreChange, 
  showScoreAnimation, 
  taskStats 
}: FarmScoreCardProps) {
  const [isHovering, setIsHovering] = useState(false);
  
  const getScoreColor = () => {
    if (farmScore >= 80) return "text-green-600";
    if (farmScore >= 60) return "text-amber-600";
    return "text-red-600";
  };

  const getProgressColor = () => {
    if (farmScore >= 80) return "bg-green-600";
    if (farmScore >= 60) return "bg-amber-600";
    return "bg-red-600";
  };

  return (
    <Card 
      className="mb-5 border-2 overflow-hidden transition-all hover:shadow-md"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <CardContent className="p-0">
        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                Farm Health Score
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Your Farm Health Score is calculated based on completed tasks, 
                      weather adaptability, and AI-recommended actions.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </h2>
              <p className="text-sm text-muted-foreground">Based on AI analytics</p>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center">
                <div className={`text-3xl font-bold ${getScoreColor()}`}>
                  {farmScore}%
                </div>
                {showScoreAnimation && (
                  <span className="text-green-600 ml-1 animate-fade-in text-xs font-medium">
                    +{scoreChange}
                  </span>
                )}
              </div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <Tractor className="h-3 w-3 mr-1 opacity-70" />
                <span>{taskStats.completed}/{taskStats.total} tasks completed</span>
              </div>
            </div>
          </div>
          
          <Progress 
            value={farmScore} 
            className={`h-2 mt-3 transition-all duration-500 ${isHovering ? "h-3" : ""} ${getProgressColor()}`}
          />
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="flex items-center p-2 rounded-md bg-white dark:bg-gray-800 shadow-sm group hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
              <TrendingUp className="h-4 w-4 text-green-600 mr-2 group-hover:scale-110 transition-transform" />
              <div>
                <p className="text-xs font-medium">Efficiency Gain</p>
                <p className="text-sm font-bold text-green-600">+{taskStats.efficiencyGain}%</p>
              </div>
            </div>
            <div className="flex items-center p-2 rounded-md bg-white dark:bg-gray-800 shadow-sm group hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors">
              <BarChart3 className="h-4 w-4 text-amber-600 mr-2 group-hover:scale-110 transition-transform" />
              <div>
                <p className="text-xs font-medium">Yield Boost</p>
                <p className="text-sm font-bold text-amber-600">+{taskStats.yieldBoost}%</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
