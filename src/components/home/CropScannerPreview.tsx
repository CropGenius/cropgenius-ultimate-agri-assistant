
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Leaf, Camera, ArrowRight, Check, Clock, AlertTriangle, Smartphone, Scan, Loader } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

interface ScanHistory {
  id: string;
  cropType: string;
  status: "healthy" | "issue" | "critical";
  date: string;
  imageUrl: string;
  confidence: number;
  recommendations?: string[];
}

export default function CropScannerPreview() {
  const [isHovering, setIsHovering] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanHistory, setScanHistory] = useState<ScanHistory[]>([
    {
      id: "scan-1",
      cropType: "Tomato",
      status: "healthy",
      date: "Today, 10:25 AM",
      imageUrl: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
      confidence: 98,
      recommendations: ["Continue regular watering schedule", "Monitor for early signs of blight"]
    },
    {
      id: "scan-2",
      cropType: "Maize",
      status: "issue",
      date: "Yesterday, 4:12 PM",
      imageUrl: "https://images.unsplash.com/photo-1559813114-ccd7f491cf21?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
      confidence: 94,
      recommendations: ["Apply organic fungicide", "Ensure adequate spacing between plants"]
    },
    {
      id: "scan-3",
      cropType: "Cassava",
      status: "critical",
      date: "3 days ago",
      imageUrl: "https://images.unsplash.com/photo-1598515823267-e793cb7251a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
      confidence: 99,
      recommendations: ["Immediate action: Remove affected plants", "Apply recommended treatment to prevent spread"]
    }
  ]);
  const [selectedScan, setSelectedScan] = useState<ScanHistory | null>(null);
  const [showScanDetails, setShowScanDetails] = useState(false);
  
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
      case "critical": return <AlertTriangle className="h-3 w-3" />;
      default: return <Leaf className="h-3 w-3" />;
    }
  };

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      // Simulate adding a new scan to history
      const newScan = {
        id: `scan-${Date.now()}`,
        cropType: "Pepper",
        status: "healthy",
        date: "Just now",
        imageUrl: "https://images.unsplash.com/photo-1588891558371-c4c613a7eae4?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
        confidence: 97,
        recommendations: ["Continue current care regimen", "Consider additional watering during dry periods"]
      };
      setScanHistory([newScan, ...scanHistory.slice(0, 2)]);
    }, 2000);
  };

  const handleScanClick = (scan: ScanHistory) => {
    setSelectedScan(scan);
    setShowScanDetails(true);
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
              {isScanning ? (
                <div className="flex flex-col items-center">
                  <div className="mx-auto mb-3 p-4 rounded-full bg-white/90 dark:bg-black/30 shadow-lg animate-pulse">
                    <Loader className="h-10 w-10 text-green-600 dark:text-green-300 animate-spin" />
                  </div>
                  <h3 className="font-medium text-green-800 dark:text-green-200">Analyzing Crop...</h3>
                  <p className="text-sm text-green-700 dark:text-green-300">Using advanced AI vision models</p>
                </div>
              ) : (
                <>
                  <div className={`mx-auto mb-3 p-4 rounded-full bg-white/90 dark:bg-black/30 shadow-lg ${isHovering ? 'animate-pulse' : ''}`}>
                    <Camera className="h-10 w-10 text-green-600 dark:text-green-300" />
                  </div>
                  <h3 className="font-medium mb-1 text-green-800 dark:text-green-200">Instant Disease Detection</h3>
                  <p className="text-sm text-green-700 dark:text-green-300 mb-4">Identify problems with 98% accuracy</p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button className="bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg transition-all" onClick={handleScan}>
                      <span className="flex items-center gap-2">
                        <Camera className="h-4 w-4" />
                        Scan Now
                      </span>
                    </Button>
                    <Link to="/scan">
                      <Button variant="outline" className="bg-white/80 hover:bg-white dark:bg-black/50 dark:hover:bg-black/70">
                        <span className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4" />
                          Upload Photo
                        </span>
                      </Button>
                    </Link>
                  </div>
                </>
              )}
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
            
            {!showScanDetails ? (
              <div className="space-y-2">
                {scanHistory.map((scan) => (
                  <div 
                    key={scan.id} 
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                    onClick={() => handleScanClick(scan)}
                  >
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
            ) : selectedScan && (
              <div className="animate-fade-in">
                <div className="flex items-center gap-3 mb-3">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-0 h-8 w-8"
                    onClick={() => setShowScanDetails(false)}
                  >
                    <ArrowRight className="h-4 w-4 rotate-180" />
                  </Button>
                  <h3 className="font-medium">Scan Details</h3>
                </div>
                
                <div className="flex gap-3 mb-3">
                  <img 
                    src={selectedScan.imageUrl} 
                    alt={selectedScan.cropType} 
                    className="w-16 h-16 rounded-md object-cover" 
                  />
                  <div>
                    <h4 className="font-medium">{selectedScan.cropType}</h4>
                    <p className="text-xs text-muted-foreground">{selectedScan.date}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${getStatusColor(selectedScan.status)}`}>
                        {getStatusIcon(selectedScan.status)}
                        <span>{selectedScan.status === "healthy" ? "Healthy" : selectedScan.status === "issue" ? "Minor Issue" : "Critical"}</span>
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 px-2 py-0.5 rounded-full">
                        {selectedScan.confidence}% confident
                      </span>
                    </div>
                  </div>
                </div>
                
                {selectedScan.recommendations && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                    <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">AI Recommendations:</h4>
                    <ul className="space-y-1">
                      {selectedScan.recommendations.map((recommendation, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                          <span className="text-xs text-green-700 dark:text-green-300">{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="mt-3">
                  <Button variant="outline" size="sm" className="w-full">
                    <Scan className="h-4 w-4 mr-2" />
                    Scan Again
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
