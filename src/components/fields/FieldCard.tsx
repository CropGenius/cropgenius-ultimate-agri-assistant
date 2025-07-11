import React, { useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Database } from "@/types/supabase";

interface Props {
  field: Database["public"]["Tables"]["fields"]["Row"];
  onLiveView?: (fieldId: string) => void;
}

const FieldCard: React.FC<Props> = ({ field, onLiveView }) => {
  const navigate = useNavigate();

  const handleNavigate = useCallback(() => {
    navigate(`/fields/${field.id}`);
  }, [navigate, field.id]);

  const handleLiveView = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onLiveView) onLiveView(field.id);
    },
    [onLiveView, field.id]
  );

  const health = (field as any).health_index ?? (field as any).health_score ?? null;

  return (
    <Card className="cursor-pointer hover:shadow-md transition" onClick={handleNavigate}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-sm">
          <span>{field.name}</span>
          {field.crop_type && (
            <Badge variant="secondary" className="capitalize">
              {field.crop_type}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {health !== null && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Health Index</p>
            <Progress value={Number(health)} className="h-2" />
            <p className="text-xs font-medium">{health}%</p>
          </div>
        )}
        <Button
          size="sm"
          variant="outline"
          className="w-full flex items-center gap-1"
          onClick={handleLiveView}
        >
          <Eye className="h-4 w-4" /> Live View
        </Button>
      </CardContent>
    </Card>
  );
};

export default FieldCard;
