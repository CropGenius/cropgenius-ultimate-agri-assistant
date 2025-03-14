
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Leaf, Camera, ArrowRight, Check, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

interface ScanHistory {
  id: string;
  cropType: string;
  status: "healthy" | "issue" | "critical";
  date: string;
  imageUrl: string;
}

export default function CropScannerPreview() {
  const [isHovering, setIsHovering] = useState(false);
  const [scanHistory, setScanHistory] = useState<ScanHistory[]>([
    {
      id: "scan-1",
      cropType: "Tomato",
      status: "healthy",
      date: "Today",
      imageUrl: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
    },
    {
      id: "scan-2",
      cropType: "Maize",
      status: "issue",
      date: "Yesterday",
      imageUrl: "https://images.unsplash.com/photo-1559813114-ccd7f491cf21?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
    }
  ]);
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case "healthy": return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300";
      case "issue": return "text-amber-600 bg-amber-100 dark:bg-amber-900 dark:text-amber-300";
      case "critical": return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300";
      default: return "text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-300";
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch(status) {
      case "healthy": return <Check className="h-3 w-3" />;
      case "issue": return <Clock className="h-3 w-3" />;
      case "critical": return <Leaf className="h-3 w-3" />;
      default: return <Leaf className="h-3 w-3" />;
    }
  };

  return (
    <Card className="h-full overflow-hidden border-2 hover:border-primary/50 transition-all">
      <CardHeader className="pb-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
        <CardTitle className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-green-500" />
          AI Crop Scanner
        </CardTitle>
        <CardDescription>
          Scan crops to identify diseases and get instant treatments
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative overflow-hidden">
          <div 
            className="bg-gradient-to-b from-green-100 to-green-300 dark:from-green-900 dark:to-green-700 aspect-video flex items-center justify-center transform transition-transform duration-500 ease-out"
            style={{ 
              transform: isHovering ? 'scale(1.05)' : 'scale(1)', 
            }}
          >
            <div 
              className="text-center p-4 relative z-10"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <div className={`mx-auto mb-3 p-4 rounded-full bg-white/90 dark:bg-black/30 shadow-lg ${isHovering ? 'animate-pulse' : ''}`}>
                <Camera className="h-10 w-10 text-green-600 dark:text-green-300" />
              </div>
              <h3 className="font-medium mb-1 text-green-800 dark:text-green-200">Instant Disease Detection</h3>
              <p className="text-sm text-green-700 dark:text-green-300 mb-4">Identify problems with 98% accuracy</p>
              <Link to="/scan">
                <Button className="bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg transition-all">
                  <span className="flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Scan Crops Now
                  </span>
                </Button>
              </Link>
            </div>
            
            {/* Animated patterns */}
            <div className="absolute inset-0 opacity-20 dark:opacity-10">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.2),_transparent_40%)]"></div>
              <div className="absolute top-1/3 left-1/4 w-24 h-24 rounded-full bg-white dark:bg-green-300 blur-2xl"></div>
              <div className="absolute bottom-1/4 right-1/3 w-32 h-32 rounded-full bg-white dark:bg-green-400 blur-3xl"></div>
            </div>
          </div>
          
          <div className="p-4 bg-white dark:bg-gray-800">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h4 className="font-medium">Recent Scans</h4>
                {scanHistory.length > 0 ? (
                  <p className="text-xs text-muted-foreground">Latest crop health analysis</p>
                ) : (
                  <p className="text-xs text-muted-foreground">Scan your first crop to see history</p>
                )}
              </div>
              <Link to="/scan">
                <Button variant="ghost" size="sm" className="h-8 group">
                  <span className="flex items-center gap-1 text-xs">
                    View All
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </Link>
            </div>
            
            {scanHistory.length > 0 ? (
              <div className="space-y-2">
                {scanHistory.map((scan) => (
                  <div key={scan.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <img src={scan.imageUrl} alt={scan.cropType} className="w-10 h-10 rounded-md object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-sm truncate">{scan.cropType}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${getStatusColor(scan.status)}`}>
                          {getStatusIcon(scan.status)}
                          <span>{scan.status === "healthy" ? "Healthy" : scan.status === "issue" ? "Minor Issue" : "Critical"}</span>
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{scan.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <p>No scan history available</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
