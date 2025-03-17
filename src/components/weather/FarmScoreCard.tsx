
import { useState, useEffect } from "react";
import { BarChart4 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

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
  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border p-3 mb-4">
      <div className="flex justify-between items-center mb-1">
        <h3 className="font-medium text-sm flex items-center">
          <BarChart4 className="h-4 w-4 mr-1 text-purple-500" />
          AI Farm Efficiency Score
        </h3>
        <div className="flex items-center">
          <span className="font-bold text-xl">{farmScore}%</span>
          {showScoreAnimation && (
            <span className={`ml-1 text-xs ${scoreChange > 0 ? 'text-green-500' : 'text-red-500'} animate-fade-in`}>
              {scoreChange > 0 ? `+${scoreChange}` : scoreChange}
            </span>
          )}
        </div>
      </div>
      
      <Progress 
        value={farmScore} 
        className="h-2 mb-3"
      />
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded flex flex-col">
          <span className="text-muted-foreground">Task Completion</span>
          <span className="font-medium">{taskStats.completed}/{taskStats.total} Tasks</span>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded flex flex-col">
          <span className="text-muted-foreground">Yield Impact</span>
          <span className="font-medium text-green-600 dark:text-green-400">+{taskStats.yieldBoost}% Boost</span>
        </div>
      </div>
    </div>
  );
}
