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
import { analyzeCropImage, type ScanResult } from "@/utils/cropScanService";

type ScanState = "idle" | "capturing" | "scanning" | "results";
type DiseaseSeverity = "low" | "medium" | "high";

// List of sample diseases for simulation
const CROP_DISEASES = [
  {
    name: "Late Blight (Phytophthora infestans)",
    severity: "medium" as DiseaseSeverity,
    treatments: [
      "Apply copper-based fungicide within 24 hours",
      "Remove and destroy affected leaves to prevent spread",
      "Increase plant spacing to improve air circulation"
    ],
    preventionTips: [
      "Use disease-resistant tomato varieties in next planting",
      "Rotate crops - avoid planting tomatoes in the same location for 2 years",
      "Apply preventive fungicide during wet seasons"
    ]
  },
  {
    name: "Powdery Mildew",
    severity: "low" as DiseaseSeverity,
    treatments: [
      "Apply sulfur-based fungicide",
      "Improve air circulation around plants",
      "Remove severely infected leaves"
    ],
    preventionTips: [
      "Plant resistant varieties",
      "Avoid overhead watering",
      "Ensure proper plant spacing"
    ]
  },
  {
    name: "Black Sigatoka",
    severity: "high" as DiseaseSeverity,
    treatments: [
      "Apply systemic fungicide immediately",
      "Remove infected leaves and destroy them",
      "Reduce humidity around plants"
    ],
    preventionTips: [
      "Regular preventative fungicide applications",
      "Plant resistant banana varieties",
      "Improve field drainage"
    ]
  },
  {
    name: "Maize Streak Virus",
    severity: "medium" as DiseaseSeverity,
    treatments: [
      "No direct treatment for virus",
      "Control leafhoppers with appropriate insecticide",
      "Remove infected plants to prevent spread"
    ],
    preventionTips: [
      "Plant resistant maize varieties",
      "Control weeds that host leafhoppers",
      "Early planting to avoid peak leafhopper populations"
    ]
  },
  {
    name: "Cassava Mosaic Disease",
    severity: "high" as DiseaseSeverity,
    treatments: [
      "Remove and destroy infected plants",
      "Apply insecticide to control whitefly vectors",
      "Use clean planting material"
    ],
    preventionTips: [
      "Plant disease-free stem cuttings",
      "Use resistant varieties",
      "Implement crop rotation"
    ]
  }
];

const CropScanner: React.FC = () => {
  // Main state
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResults, setScanResults] = useState<ScanResult | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
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
      
      // Check if the browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera access not supported by this browser");
      }

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" } // Use rear camera if available
      });
      
      // Save stream to ref for cleanup later
      streamRef.current = stream;
      
      // Connect stream to video element
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
        
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw video frame to canvas
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Could not get canvas context");
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to blob
        canvas.toBlob(async (blob) => {
          if (!blob) throw new Error("Failed to convert capture to image");
          
          // Create a file from the blob
          const file = new File([blob], "crop-scan.jpg", { type: "image/jpeg" });
          setImageFile(file);
          
          // Create preview URL
          const imageUrl = URL.createObjectURL(blob);
          setCapturedImage(imageUrl);
          
          // Stop camera stream
          stopCamera();
          
          // Start scan process
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
      setImageFile(file);
      
      // Create preview URL
      const imageUrl = URL.createObjectURL(file);
      setCapturedImage(imageUrl);
      
      // Start scan process
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
    // Reset scan progress
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

      // Simulate API call / processing time
      setTimeout(async () => {
        clearInterval(interval);
        setScanProgress(100);

        try {
          // Use the mock analyzeCropImage function from cropScanService
          const results = await analyzeCropImage(file);
          setScanResults(results);
          setScanState("results");
          
          // Show success toast
          toast.success("Scan complete!", {
            description: `AI detected ${results.diseaseDetected} with ${results.confidenceLevel.toFixed(1)}% confidence`
          });
        } catch (error) {
          console.error("Error analyzing crop image:", error);
          toast.error("Analysis failed", {
            description: "Please try again with a clearer image"
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
    setImageFile(null);
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage);
    }
  };

  // Helper functions for UI
  const getSeverityColor = (severity: DiseaseSeverity) => {
    switch (severity) {
      case "low": return "bg-crop-green-100 text-crop-green-700";
      case "medium": return "bg-amber-100 text-amber-700";
      case "high": return "bg-red-100 text-red-700";
      default: return "bg-crop-green-100 text-crop-green-700";
    }
  };

  const shareDiagnosis = () => {
    toast.success("Diagnosis shared with nearby farmers", {
      description: "8 farmers in your area will be alerted about this disease"
    });
  };

  // Effect for cleaning up resources on unmount
  useEffect(() => {
    // Store capturedImage in a ref to access the latest value in cleanup
    const capturedImageRef = React.useRef(capturedImage);
    capturedImageRef.current = capturedImage;

    return () => {
      stopCamera(); // Ensure camera stream is stopped
      if (capturedImageRef.current) {
        URL.revokeObjectURL(capturedImageRef.current); // Ensure object URL is revoked
      }
    };
  }, [stopCamera]); // capturedImage is not in dependency array to avoid re-running effect on its change, only on unmount. stopCamera is stable.

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
        <Card className="p-5 bg-white mb-5">
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
                className="bg-crop-green-600 hover:bg-crop-green-700 text-white flex items-center justify-center h-14"
                onClick={startCamera}
              >
                <Camera className="mr-2" />
                Take Photo
              </Button>
              <Button 
                className="bg-soil-brown-600 hover:bg-soil-brown-700 text-white flex items-center justify-center h-14"
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
        <Card className="p-5 bg-white mb-5">
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
            <div className="grid grid-cols-2 gap-2 w-full mt-4 text-sm">
              <div className="bg-crop-green-50 p-2 rounded-lg text-left">
                <span className="block text-crop-green-700 font-medium">98+ diseases</span>
                <span className="text-xs text-crop-green-600">in our database</span>
              </div>
              <div className="bg-crop-green-50 p-2 rounded-lg text-left">
                <span className="block text-crop-green-700 font-medium">Visual AI</span>
                <span className="text-xs text-crop-green-600">tech analyzing</span>
              </div>
              <div className="bg-crop-green-50 p-2 rounded-lg text-left">
                <span className="block text-crop-green-700 font-medium">Region data</span>
                <span className="text-xs text-crop-green-600">being checked</span>
              </div>
              <div className="bg-crop-green-50 p-2 rounded-lg text-left">
                <span className="block text-crop-green-700 font-medium">Solutions</span>
                <span className="text-xs text-crop-green-600">being prepared</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* RESULTS STATE */}
      {scanState === "results" && scanResults && (
        <>
          <Card className="p-5 bg-white mb-5 border-2 border-crop-green-500">
            <div className="flex justify-between items-start mb-4">
              <div>
                <Badge className={getSeverityColor(scanResults.severity)}>
                  {scanResults.severity === "low" ? "Low Severity" : 
                   scanResults.severity === "medium" ? "Medium Severity" : "High Severity"}
                </Badge>
                <h2 className="text-xl font-bold text-gray-800 mt-2">{scanResults.diseaseDetected}</h2>
              </div>
              <div className="bg-crop-green-50 px-3 py-2 rounded-lg text-center">
                <span className="text-lg font-bold text-crop-green-700">{scanResults.confidenceLevel.toFixed(1)}%</span>
                <p className="text-xs text-crop-green-600">AI Confidence</p>
              </div>
            </div>

            {capturedImage && (
              <div className="mb-5">
                <img
                  src={capturedImage}
                  alt={`Crop with ${scanResults.diseaseDetected}`}
                  className="w-full h-auto rounded-lg object-cover"
                  style={{ maxHeight: "30vh" }}
                />
              </div>
            )}

            <div className="mb-5">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">Affected Area</span>
                <span className="text-sm font-medium text-amber-600">{scanResults.affectedArea}%</span>
              </div>
              <Progress value={scanResults.affectedArea} className="h-2 bg-gray-100" />
            </div>

            <div className="mb-5">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">Estimated Yield Impact</span>
                <span className="text-sm font-medium text-red-600">-{scanResults.estimatedYieldImpact}%</span>
              </div>
              <Progress value={scanResults.estimatedYieldImpact} className="h-2 bg-gray-100" />
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Map className="w-5 h-5 text-soil-brown-500 mr-1" />
                <span className="text-sm text-soil-brown-600">{scanResults.similarCasesNearby} similar cases detected in your area</span>
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
                  <p className="text-sm font-medium text-red-700">Immediate Action Required</p>
                  <p className="text-xs text-red-600 mt-1">This disease can spread to your entire crop within 4-7 days if untreated.</p>
                </div>
              </div>
            </div>
          </Card>

          <div className="mb-5">
            <h3 className="font-semibold text-gray-800 mb-3">Recommended Treatments</h3>
            <div className="space-y-3">
              {scanResults.recommendedTreatments.map((treatment, i) => (
                <div key={i} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex items-start">
                  <div className="bg-crop-green-100 p-1 rounded-full mr-3 mt-1">
                    <CheckCircle className="w-4 h-4 text-crop-green-600" />
                  </div>
                  <span className="text-sm">{treatment}</span>
                </div>
              ))}
            </div>
          </div>

          <Card className="p-4 bg-white mb-5">
            <h3 className="font-semibold text-gray-800 mb-3">Available Treatment Products</h3>
            {scanResults.treatmentProducts.map((product, i) => (
              <div key={i} className="border-b border-gray-100 pb-3 mb-3 last:border-0 last:mb-0 last:pb-0">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-crop-green-700">{product.name}</h4>
                    <p className="text-xs text-gray-600">{product.availability}</p>
                  </div>
                  <span className="font-semibold text-soil-brown-700">{product.price}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="text-xs mr-2">Effectiveness:</span>
                    <div className="w-24 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-full bg-crop-green-500 rounded-full" 
                        style={{ width: `${product.effectiveness}%` }}
                      ></div>
                    </div>
                    <span className="text-xs ml-1">{product.effectiveness}%</span>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs">
                    <ShoppingCart className="w-3 h-3 mr-1" /> Buy
                  </Button>
                </div>
              </div>
            ))}
          </Card>

          <div className="mb-5">
            <h3 className="font-semibold text-gray-800 mb-3">Prevention Tips</h3>
            <div className="space-y-3">
              {scanResults.preventiveMeasures.map((measure, i) => (
                <div key={i} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex items-start">
                  <div className="bg-sky-blue-100 p-1 rounded-full mr-3 mt-1">
                    <AlertCircle className="w-4 h-4 text-sky-blue-600" />
                  </div>
                  <span className="text-sm">{measure}</span>
                </div>
              ))}
            </div>
          </div>

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

          <Card className="p-4 bg-crop-green-50 border-0">
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
