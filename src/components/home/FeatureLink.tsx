
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface FeatureLinkProps {
  to: string;
  icon: ReactNode;
  title: string;
  description: string;
  badge?: string;
  className?: string;
}

export default function FeatureLink({ 
  to, 
  icon, 
  title, 
  description, 
  badge, 
  className 
}: FeatureLinkProps) {
  return (
    <Link to={to}>
      <Card className={cn(
        "h-full transition-all hover:shadow-md hover:border-primary/50", 
        className
      )}>
        <CardContent className="p-4 flex flex-col justify-between h-full">
          <div>
            <div className="flex justify-between items-start mb-2">
              <div className="bg-primary/10 dark:bg-primary/20 p-2 rounded-lg">
                {icon}
              </div>
              {badge && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300">
                  {badge}
                </span>
              )}
            </div>
            <h3 className="font-medium mt-2">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {description}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
