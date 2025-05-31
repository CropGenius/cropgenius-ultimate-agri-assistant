import React, { useState, useCallback } from 'react';
import { useCropHealth } from '@/hooks/useCropHealth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Upload, Leaf } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const CropHealthAnalyzer: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [region, setRegion] = useState('');
  const [crop, setCrop] = useState('');
  const [season, setSeason] = useState('');
  const [symptoms, setSymptoms] = useState('');
  
  const { isAnalyzing, analysis, error, analyzeCropHealth, reset } = useCropHealth();
  const { toast } = useToast();

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!image) {
      toast.error('Please select an image');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result as string;
        await analyzeCropHealth(base64Image, {
          region,
          crop,
          season,
          symptoms
        });
      };
      reader.readAsDataURL(image);
    } catch (error) {
      console.error('Error analyzing image:', error);
    }
  }, [image, region, crop, season, symptoms, analyzeCropHealth, toast]);

  const handleReset = useCallback(() => {
    setImage(null);
    setImagePreview('');
    setRegion('');
    setCrop('');
    setSeason('');
    setSymptoms('');
    reset();
  }, [reset]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-crop-green-600" />
            Crop Health Analyzer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image">Upload Crop Image</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="flex-1"
                />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-20 w-20 object-cover rounded-lg"
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Input
                  id="region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="e.g., Northern Ghana"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="crop">Crop Type</Label>
                <Input
                  id="crop"
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  placeholder="e.g., Maize"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="season">Season</Label>
                <Input
                  id="season"
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  placeholder="e.g., Early Rainy"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="symptoms">Symptoms</Label>
                <Textarea
                  id="symptoms"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Describe any visible symptoms..."
                  className="h-20"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isAnalyzing}
              >
                Reset
              </Button>
              <Button
                type="submit"
                disabled={isAnalyzing || !image}
                className="bg-crop-green-600 hover:bg-crop-green-700"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Analyze Crop
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error.message}</p>
          </CardContent>
        </Card>
      )}

      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{analysis.crop}</h3>
              <Badge className={`${
                analysis.confidence === 'High'
                  ? 'bg-green-100 text-green-800'
                  : analysis.confidence === 'Medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
              }`}>
                {analysis.confidence} Confidence
              </Badge>
            </div>

            <div>
              <h4 className="font-medium mb-2">Diagnosis</h4>
              <p>{analysis.diagnosis}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Organic Remedy</h4>
                <p className="text-sm">{analysis.organic_remedy}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Inorganic Remedy</h4>
                <p className="text-sm">{analysis.inorganic_remedy}</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Farmer-Friendly Explanation</h4>
              <p className="text-sm">{analysis.farmer_explanation}</p>
            </div>

            {analysis.alternatives.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Alternative Possibilities</h4>
                <div className="space-y-2">
                  {analysis.alternatives.map((alt, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Badge variant="outline">{alt.issue}</Badge>
                      <span className="text-sm text-gray-500">
                        ({alt.confidence} confidence)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 