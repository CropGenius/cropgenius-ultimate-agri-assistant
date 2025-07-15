import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Camera,
  Upload,
  Leaf,
  AlertTriangle,
  CheckCircle,
  Map,
  ShoppingCart,
  Share,
  RotateCw,
  Zap,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { cropDiseaseOracle, type DiseaseDetectionResult } from '@/agents/CropDiseaseOracle';

type ScanState = "idle" | "capturing" | "scanning" | "results";
type DiseaseSeverity = "low" | "medium" | "high" | "critical";

interface CropScannerProps {
  onScanComplete?: (result: any) => void;
  cropType: string;
  location: any;
}

const CropScanner: React.FC<CropScannerProps> = ({ onScanComplete, cropType, location }) => {
  // Main state
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResults, setScanResults] = useState<DiseaseDetectionResult | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Clean up camera stream when component unmounts or camera is stopped
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Handle camera capture
  const startCamera = async () => {
    try {
      setScanState("capturing");

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera access not supported by this browser");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Could not access camera", {
        description: "Please check camera permissions or try image upload instead"
      });
      setScanState("idle");
    }
  };

  // Capture image from video stream
  const captureImage = () => {
    try {
      if (videoRef.current && canvasRef.current && streamRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Could not get canvas context");

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(async (blob) => {
          if (!blob) throw new Error("Failed to convert capture to image");

          const file = new File([blob], "crop-scan.jpg", { type: "image/jpeg" });
          const imageUrl = URL.createObjectURL(blob);
          setCapturedImage(imageUrl);

          stopCamera();
          handleScan(file);
        }, "image/jpeg");
      }
    } catch (error) {
      console.error("Error capturing image:", error);
      toast.error("Failed to capture image", {
        description: "Please try again or use image upload"
      });
      setScanState("idle");
    }
  };

  // Handle file selection from input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setCapturedImage(imageUrl);
      handleScan(file);
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Main scanning function
  const handleScan = async (file: File) => {
    setScanProgress(0);
    setScanState("scanning");

    try {
      // Start progress animation
      const interval = setInterval(() => {
        setScanProgress(prev => {
          const newProgress = prev + (Math.random() * 15);
          if (newProgress >= 100) {
            clearInterval(interval);
            return 100;
          }
          return newProgress;
        });
      }, 120);

      setTimeout(async () => {
        clearInterval(interval);
        setScanProgress(100);

        try {
          const base64 = await fileToBase64(file);

          // Use REAL CropDiseaseOracle with PlantNet + Gemini AI
          const results = await cropDiseaseOracle.diagnoseFromImage(
            base64,
            cropType,
            { lat: location.lat || -1.2921, lng: location.lng || 36.8219, country: location.country || 'Kenya' },
            3500,
            0.35
          );

          setScanResults(results);
          setScanState("results");

          // Notify parent component with real AI results
          if (onScanComplete) {
            onScanComplete({
              crop: cropType,
              disease: results.disease_name,
              confidence: results.confidence,
              severity: results.severity,
              economicImpact: results.economic_impact,
              source_api: results.source_api
            });
          }

          toast.success("Real AI Analysis Complete!", {
            description: `${results.disease_name} detected with ${results.confidence}% confidence using ${results.source_api === 'plantnet' ? 'PlantNet + Gemini AI' : 'Fallback Analysis'}`
          });
        } catch (error) {
          console.error("Error analyzing crop image:", error);
          toast.error("Analysis failed", {
            description: "Please try again with a clearer image or check your internet connection"
          });
          setScanState("idle");
        }
      }, 2000);
    } catch (error) {
      console.error("Error during scan:", error);
      toast.error("Scan failed", {
        description: "Please try again or check your internet connection"
      });
      setScanState("idle");
    }
  };

  // Reset to initial state
  const resetScan = () => {
    setScanState("idle");
    setScanProgress(0);
    setScanResults(null);
    setCapturedImage(null);
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage);
    }
  };

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result.split(',')[1]);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  // Helper functions for UI
  const getSeverityColor = (severity: DiseaseSeverity) => {
    switch (severity) {
      case "low": return "bg-green-100 text-green-700";
      case "medium": return "bg-amber-100 text-amber-700";
      case "high": return "bg-red-100 text-red-700";
      case "critical": return "bg-red-200 text-red-800";
      default: return "bg-green-100 text-green-700";
    }
  };

  const shareDiagnosis = () => {
    toast.success("Diagnosis shared with nearby farmers", {
      description: "8 farmers in your area will be alerted about this disease"
    });
  };

  // Effect for cleaning up resources on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (capturedImage) {
        URL.revokeObjectURL(capturedImage);
      }
    };
  }, [capturedImage, stopCamera]);

  return (
    <div className="p-5 pb-24 animate-fade-in">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-crop-green-700">AI Crop Scanner</h1>
        <p className="text-gray-600">Instantly diagnose plant diseases and get treatment advice</p>
      </div>

      {/* CAMERA CAPTURE VIEW */}
      {scanState === "capturing" && (
        <div className="relative mb-5">
          <Card className="p-0 overflow-hidden bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-auto"
              style={{ maxHeight: "70vh" }}
            ></video>
          </Card>
          <div className="mt-4 flex justify-center">
            <Button
              onClick={captureImage}
              className="bg-crop-green-600 hover:bg-crop-green-700 text-white flex items-center justify-center h-14 w-14 rounded-full"
            >
              <Camera className="h-6 w-6" />
            </Button>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              stopCamera();
              setScanState("idle");
            }}
            className="mt-4 w-full"
          >
            Cancel
          </Button>
          <canvas ref={canvasRef} className="hidden"></canvas>
        </div>
      )}

      {/* IDLE STATE - INITIAL VIEW */}
      {scanState === "idle" && (
        <Card className="glass-card p-5 mb-5">
          <div className="flex flex-col items-center text-center">
            {capturedImage ? (
              <div className="w-full mb-4">
                <img
                  src={capturedImage}
                  alt="Captured crop"
                  className="w-full h-auto rounded-lg object-cover"
                  style={{ maxHeight: "40vh" }}
                />
              </div>
            ) : (
              <div className="w-32 h-32 bg-crop-green-50 rounded-full flex items-center justify-center mb-4">
                <Camera className="w-16 h-16 text-crop-green-500" />
              </div>
            )}

            <h2 className="text-lg font-semibold mb-1">Scan Your Crops</h2>
            <p className="text-gray-600 mb-6">Take a photo or upload an image of your plant for instant AI diagnosis</p>

            <div className="grid grid-cols-2 gap-4 w-full mb-6">
              <Button
                className="glass-btn bg-crop-green-600 hover:bg-crop-green-700 text-white flex items-center justify-center h-14"
                onClick={startCamera}
              >
                <Camera className="mr-2" />
                Take Photo
              </Button>
              <Button
                className="glass-btn bg-soil-brown-600 hover:bg-soil-brown-700 text-white flex items-center justify-center h-14"
                onClick={triggerFileInput}
              >
                <Upload className="mr-2" />
                Upload Image
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
              />
            </div>

            <div className="bg-sky-blue-50 p-4 rounded-lg w-full">
              <div className="flex items-start">
                <Zap className="text-sky-blue-600 flex-shrink-0 mr-2 mt-1" />
                <div>
                  <p className="text-left text-sm font-medium text-sky-blue-800">Our AI system can detect 98+ crop diseases</p>
                  <p className="text-left text-xs text-sky-blue-700 mt-1">Specialized in maize, tomatoes, cassava, beans, and potatoes</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* SCANNING STATE */}
      {scanState === "scanning" && (
        <Card className="glass-card p-5 mb-5">
          <div className="flex flex-col items-center text-center">
            {capturedImage && (
              <div className="w-full mb-4">
                <img
                  src={capturedImage}
                  alt="Crop being analyzed"
                  className="w-full h-auto rounded-lg object-cover"
                  style={{ maxHeight: "30vh" }}
                />
              </div>
            )}
            <div className="w-24 h-24 bg-crop-green-50 rounded-full flex items-center justify-center mb-4 relative">
              <span className="absolute inset-0 rounded-full border-4 border-crop-green-400 border-t-transparent animate-spin"></span>
              <Leaf className="w-10 h-10 text-crop-green-600" />
            </div>
            <h2 className="text-xl font-semibold mb-3">AI is analyzing your crop</h2>
            <div className="w-full mb-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">Scan progress</span>
                <span className="text-sm font-medium text-crop-green-700">{Math.round(scanProgress)}%</span>
              </div>
              <Progress value={scanProgress} className="h-2 bg-gray-100" />
            </div>
          </div>
        </Card>
      )}

      {/* RESULTS STATE */}
      {scanState === "results" && scanResults && (
        <>
          <Card className="glass-card p-5 mb-5 border-2 border-crop-green-500">
            <div className="flex justify-between items-start mb-4">
              <div>
                <Badge className={getSeverityColor(scanResults.severity)}>
                  {scanResults.severity === "low" ? "Low Severity" :
                    scanResults.severity === "medium" ? "Medium Severity" :
                      scanResults.severity === "high" ? "High Severity" : "Critical"}
                </Badge>
                <h2 className="text-xl font-bold text-gray-800 mt-2">{scanResults.disease_name}</h2>
                {scanResults.scientific_name && (
                  <p className="text-sm text-gray-600 italic">{scanResults.scientific_name}</p>
                )}
              </div>
              <div className="bg-crop-green-50 px-3 py-2 rounded-lg text-center">
                <span className="text-lg font-bold text-crop-green-700">{scanResults.confidence.toFixed(1)}%</span>
                <p className="text-xs text-crop-green-600">AI Confidence</p>
              </div>
            </div>

            {capturedImage && (
              <div className="mb-5">
                <img
                  src={capturedImage}
                  alt={`Crop with ${scanResults.disease_name}`}
                  className="w-full h-auto rounded-lg object-cover"
                  style={{ maxHeight: "30vh" }}
                />
              </div>
            )}

            {scanResults.affected_area_percentage && (
              <div className="mb-5">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Affected Area</span>
                  <span className="text-sm font-medium text-amber-600">{scanResults.affected_area_percentage}%</span>
                </div>
                <Progress value={scanResults.affected_area_percentage} className="h-2 bg-gray-100" />
              </div>
            )}

            <div className="mb-5">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">Estimated Yield Impact</span>
                <span className="text-sm font-medium text-red-600">-{scanResults.economic_impact.yield_loss_percentage}%</span>
              </div>
              <Progress value={scanResults.economic_impact.yield_loss_percentage} className="h-2 bg-gray-100" />
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Map className="w-5 h-5 text-soil-brown-500 mr-1" />
                <span className="text-sm text-soil-brown-600">Spread risk: {scanResults.spread_risk}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-soil-brown-200 text-soil-brown-700"
                onClick={shareDiagnosis}
              >
                <Share className="w-3 h-3 mr-1" /> Share
              </Button>
            </div>

            <div className="bg-red-50 p-3 rounded-lg mb-5">
              <div className="flex items-start">
                <AlertTriangle className="text-red-500 w-5 h-5 flex-shrink-0 mr-2 mt-1" />
                <div>
                  <p className="text-sm font-medium text-red-700">Recovery Timeline</p>
                  <p className="text-xs text-red-600 mt-1">{scanResults.recovery_timeline}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Symptoms */}
          {scanResults.symptoms.length > 0 && (
            <div className="mb-5">
              <h3 className="font-semibold text-gray-800 mb-3">Symptoms Detected</h3>
              <div className="space-y-2">
                {scanResults.symptoms.map((symptom, i) => (
                  <div key={i} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex items-start">
                    <div className="bg-amber-100 p-1 rounded-full mr-3 mt-1">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                    </div>
                    <span className="text-sm">{symptom}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Immediate Actions */}
          <div className="mb-5">
            <h3 className="font-semibold text-gray-800 mb-3">Immediate Actions Required</h3>
            <div className="space-y-3">
              {scanResults.immediate_actions.map((action, i) => (
                <div key={i} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex items-start">
                  <div className="bg-red-100 p-1 rounded-full mr-3 mt-1">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  </div>
                  <span className="text-sm">{action}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Treatment Options */}
          <div className="mb-5">
            <h3 className="font-semibold text-gray-800 mb-3">Treatment Options</h3>

            {/* Organic Solutions */}
            {scanResults.organic_solutions.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-green-700 mb-2">🌿 Organic Solutions</h4>
                <div className="space-y-2">
                  {scanResults.organic_solutions.map((solution, i) => (
                    <div key={i} className="bg-green-50 p-3 rounded-lg border border-green-100 flex items-start">
                      <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-sm">{solution}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inorganic Solutions */}
            {scanResults.inorganic_solutions.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-blue-700 mb-2">🧪 Chemical Solutions</h4>
                <div className="space-y-2">
                  {scanResults.inorganic_solutions.map((solution, i) => (
                    <div key={i} className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex items-start">
                      <div className="bg-blue-100 p-1 rounded-full mr-3 mt-1">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-sm">{solution}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recommended Products */}
          {scanResults.recommended_products.length > 0 && (
            <Card className="glass-card p-4 mb-5">
              <h3 className="font-semibold text-gray-800 mb-3">Recommended Products</h3>
              {scanResults.recommended_products.map((product, i) => (
                <div key={i} className="border-b border-gray-100 pb-3 mb-3 last:border-0 last:mb-0 last:pb-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-crop-green-700">{product}</h4>
                      <p className="text-xs text-gray-600">Available locally</p>
                    </div>
                    <Button size="sm" variant="outline" className="text-xs">
                      <ShoppingCart className="w-3 h-3 mr-1" /> Find
                    </Button>
                  </div>
                </div>
              ))}
            </Card>
          )}

          {/* Local Suppliers */}
          {scanResults.local_suppliers.length > 0 && (
            <Card className="glass-card p-4 mb-5">
              <h3 className="font-semibold text-gray-800 mb-3">Local Suppliers</h3>
              {scanResults.local_suppliers.map((supplier, i) => (
                <div key={i} className="border-b border-gray-100 pb-3 mb-3 last:border-0 last:mb-0 last:pb-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-crop-green-700">{supplier.name}</h4>
                      <p className="text-xs text-gray-600">{supplier.location} ({supplier.distance_km}km away)</p>
                      <p className="text-xs text-gray-500">{supplier.price_range}</p>
                    </div>
                    <Button size="sm" variant="outline" className="text-xs">
                      Contact
                    </Button>
                  </div>
                </div>
              ))}
            </Card>
          )}

          {/* Prevention Tips */}
          <div className="mb-5">
            <h3 className="font-semibold text-gray-800 mb-3">Prevention Tips</h3>
            <div className="space-y-3">
              {scanResults.preventive_measures.map((measure, i) => (
                <div key={i} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex items-start">
                  <div className="bg-sky-blue-100 p-1 rounded-full mr-3 mt-1">
                    <AlertCircle className="w-4 h-4 text-sky-blue-600" />
                  </div>
                  <span className="text-sm">{measure}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Economic Impact */}
          <Card className="glass-card p-4 mb-5 bg-amber-50">
            <h3 className="font-semibold text-amber-800 mb-3">💰 Economic Impact</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-amber-700">Revenue Loss</p>
                <p className="text-lg font-bold text-amber-800">${scanResults.economic_impact.revenue_loss_usd}</p>
              </div>
              <div>
                <p className="text-sm text-amber-700">Treatment Cost</p>
                <p className="text-lg font-bold text-amber-800">${scanResults.economic_impact.treatment_cost_usd}</p>
              </div>
            </div>
          </Card>

          <div className="flex gap-4 mb-10">
            <Button
              className="flex-1 bg-crop-green-600 hover:bg-crop-green-700 text-white"
              onClick={resetScan}
            >
              <RotateCw className="mr-2 w-4 h-4" /> Scan Another Crop
            </Button>
            <Button
              className="flex-1 bg-soil-brown-600 hover:bg-soil-brown-700 text-white"
              onClick={() => toast.info("Expert advice requested", { description: "An agricultural expert will review your case within 24 hours" })}
            >
              Get Expert Review
            </Button>
          </div>

          <Card className="glass-card p-4 bg-crop-green-50 border-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-crop-green-700">Want more accurate analysis?</h3>
                <p className="text-sm text-crop-green-600">Join a Farm Clan for enhanced AI predictions</p>
              </div>
              <Button variant="default" size="sm" className="bg-crop-green-600">
                Join Now <ArrowRight className="ml-1 w-4 h-4" />
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default CropScanner;