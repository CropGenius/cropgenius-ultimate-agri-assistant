
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Leaf, Camera, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function CropScannerPreview() {
  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-green-500" />
          AI Crop Scanner
        </CardTitle>
        <CardDescription>
          Scan crops to identify diseases and get instant treatments
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative">
          <div className="bg-gradient-to-b from-green-100 to-green-300 dark:from-green-900 dark:to-green-700 aspect-video flex items-center justify-center">
            <div className="text-center p-4">
              <Camera className="h-12 w-12 text-green-600 dark:text-green-300 mx-auto mb-3" />
              <h3 className="font-medium mb-1 text-green-800 dark:text-green-200">Instant Disease Detection</h3>
              <p className="text-sm text-green-700 dark:text-green-300 mb-4">Identify problems with 98% accuracy</p>
              <Link to="/scan">
                <Button className="bg-green-600 hover:bg-green-700">
                  <span className="flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Scan Crops Now
                  </span>
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="p-4 bg-white dark:bg-gray-800">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Recent Scans</h4>
                <p className="text-xs text-muted-foreground">Scan your first crop to see history</p>
              </div>
              <Link to="/scan">
                <Button variant="ghost" size="sm" className="h-8">
                  <span className="flex items-center gap-1 text-xs">
                    View All
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
