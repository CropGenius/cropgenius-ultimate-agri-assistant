
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";

interface FeatureLinkProps {
  to: string;
  icon: JSX.Element;
  title: string;
  description: string;
}

export default function FeatureLink({ to, icon, title, description }: FeatureLinkProps) {
  return (
    <Link to={to} className="block group">
      <Card className="h-full transition-all border-2 hover:shadow-lg dark:hover:shadow-dark hover:border-primary/50 overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full transform translate-x-4 -translate-y-4 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-300"></div>
        <CardContent className="pt-6 relative z-10">
          <div className="mb-4 text-primary transform group-hover:scale-110 transition-transform duration-200">{icon}</div>
          <h3 className="text-xl font-medium mb-2 flex items-center gap-2">
            {title}
            <ArrowUpRight className="h-4 w-4 opacity-0 transform -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
          </h3>
          <p className="text-muted-foreground text-sm">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
