/**
 * CropDiseaseDetectionPage Component
 * Page for detecting crop diseases from images
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { DiseaseDetectionResult, DiseaseDetectionResultData } from '@/components/crop-disease/DiseaseDetectionResult';
import { handleCropDiseaseDetectionUpload } from '@/api/cropDiseaseApi';
import { useAuthContext } from '@/providers/AuthProvider';
import { useToast } from '@/components/ui/use-toast';
import { Camera, Upload, RefreshCw, Leaf, AlertTriangle, Loader2 } from 'lucide-react';

const CROP_TYPES = [
  { value: 'maize', label: 'Maize (Corn)' },
  { value: 'tomato', label: 'Tomato' },
  { value: 'potato', label: 'Potato' },
  { value: 'cassava', label: 'Cassava' },
  { value: 'rice', label: 'Rice' },
  { value: 'wheat', label: 'Wheat' },
  { value: 'coffee', label: 'Coffee' },
  { value: 'banana', label: 'Banana' },
  { value: 'cotton', label: 'Cotton' },
  { value: 'soybean', label: 'Soybean' }
];

const CropDiseaseDetectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<string>('upload');
  const [cropType, setCropType] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [result, setResult] = useState<DiseaseDetectionResultData | null>(null);
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size should be less than 10MB');
      return;
    }
    
    setSelectedFile(file);
    setError('');
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };
  
  // Handle camera capture
  const handleCameraCapture = async () => {
    // This is a placeholder for camera capture functionality
    // In a real implementation, this would use the device camera API
    toast({
      title: 'Camera capture',
      description: 'Camera capture is not implemented in this demo',
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!cropType) {
      setError('Please select a crop type');
      return;
    }
    
    if (!selectedFile) {
      setError('Please select an image');
      return;
    }
    
    if (!user) {
      setError('You must be logged in to detect diseases');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setResult(null);
    
    try {
      const response = await handleCropDiseaseDetectionUpload(selectedFile, cropType);
      
      if (response.success && response.data) {
        setResult(response.data);
        toast({
          title: 'Disease Detection Complete',
          description: `Detected: ${response.data.disease_name} with ${response.data.confidence}% confidence`,
        });
      } else {
        throw new Error(response.error || 'Failed to detect disease');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast({
        title: 'Detection Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reset form
  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setCropType('');
    setError('');
    setResult(null);
    
    // Clear file input
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };
  
  // Redirect to auth if not logged in
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              You need to be logged in to use the disease detection feature
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button 
              onClick={() => navigate('/auth')} 
              className="w-full"
            >
              Go to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Leaf className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">Crop Disease Detection</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Upload an image of your crop to detect diseases and get treatment recommendations. 
            Our AI-powered system provides accurate diagnosis with confidence scores.
          </p>
        </div>
        
        {/* Main Content */}
        {!result ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Disease Detection
              </CardTitle>
              <CardDescription>
                Select your crop type and upload an image for analysis
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload">Upload Image</TabsTrigger>
                  <TabsTrigger value="camera">Take Photo</TabsTrigger>
                </TabsList>
                
                <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                  {/* Crop Type Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="crop-type">Crop Type</Label>
                    <Select value={cropType} onValueChange={setCropType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your crop type" />
                      </SelectTrigger>
                      <SelectContent>
                        {CROP_TYPES.map((crop) => (
                          <SelectItem key={crop.value} value={crop.value}>
                            {crop.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <TabsContent value="upload" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="image-upload">Plant Image</Label>
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-muted-foreground">
                        Supported formats: JPG, PNG, WebP. Max size: 10MB
                      </p>
                    </div>
                    
                    {previewUrl && (
                      <div className="border rounded-lg overflow-hidden">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full h-64 object-cover"
                        />
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="camera" className="space-y-4">
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">Camera capture coming soon</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCameraCapture}
                        disabled
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Take Photo
                      </Button>
                    </div>
                  </TabsContent>
                  
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={isLoading || !cropType || !selectedFile}
                      className="flex-1"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Detect Disease
                        </>
                      )}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleReset}
                      disabled={isLoading}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </form>
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Results */}
            <DiseaseDetectionResult
              result={result}
              showImage={true}
              imageUrl={previewUrl}
            />
            
            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <Button onClick={handleReset} className="flex-1">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Analyze Another Image
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                  >
                    Back to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default CropDiseaseDetectionPage;