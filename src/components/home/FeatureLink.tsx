
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
    <Link to={to} className="block">
      <Card className="h-full transition-all hover:shadow-md hover:border-primary/50">
        <CardContent className="pt-6">
          <div className="mb-4 text-primary">{icon}</div>
          <h3 className="text-xl font-medium mb-2 flex items-center gap-2">
            {title} <ArrowUpRight className="h-4 w-4" />
          </h3>
          <p className="text-muted-foreground text-sm">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
