import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { usePlantNet } from '../hooks/usePlantNet';
import { useGemini } from '../hooks/useGemini';
import { CameraIcon, ImageIcon, XCircleIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface DiseaseDetectionPanelProps {
  onDetectionComplete?: (result: any) => void;
}

export const DiseaseDetectionPanel: React.FC<DiseaseDetectionPanelProps> = ({ onDetectionComplete }) => {
  const { user } = useAuth();
  const [image, setImage] = useState<File | null>(null);
  const [detectionResult, setDetectionResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { analyzePlant } = usePlantNet();
  const { generateTreatmentAdvice } = useGemini();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setImage(files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!image || !user) return;

    setIsLoading(true);
    try {
      // Upload image to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('plant-images')
        .upload(`detection/${user.id}/${Date.now()}`, image);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('plant-images')
        .getPublicUrl(uploadData.path);

      // Analyze with PlantNet
      const plantNetResult = await analyzePlant(publicUrl);
      
      // Get treatment advice from Gemini
      const treatmentAdvice = await generateTreatmentAdvice(
        plantNetResult.species?.scientificName || 'unknown plant',
        plantNetResult.diseases?.[0]?.name || 'unknown disease'
      );

      setDetectionResult({
        plant: plantNetResult.species,
        disease: plantNetResult.diseases?.[0],
        advice: treatmentAdvice,
        imageUrl: publicUrl
      });

      // Save to Supabase
      await supabase.from('disease_history').insert({
        user_id: user.id,
        plant_name: plantNetResult.species?.commonName,
        disease_name: plantNetResult.diseases?.[0]?.name,
        treatment_advice: treatmentAdvice,
        image_url: publicUrl,
        created_at: new Date().toISOString()
      });

      if (onDetectionComplete) {
        onDetectionComplete(detectionResult);
      }
    } catch (error) {
      console.error('Error during analysis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Crop Disease Detection</h2>
      
      {!detectionResult ? (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <CameraIcon className="w-12 h-12 mx-auto text-gray-400" />
            <div className="mt-2 text-gray-600">
              <p>Upload a photo of your crop</p>
              <p className="text-sm">We'll analyze it for diseases and provide treatment advice</p>
            </div>
            <div className="mt-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Upload Photo
              </label>
            </div>
          </div>

          {image && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center space-y-2"
            >
              <img
                src={URL.createObjectURL(image)}
                alt="Uploaded"
                className="w-32 h-32 object-cover rounded-lg"
              />
              <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
              >
                {isLoading ? 'Analyzing...' : 'Analyze Now'}
              </button>
            </motion.div>
          )}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <XCircleIcon className="w-6 h-6 text-red-500" />
            <h3 className="text-lg font-semibold">Detection Results</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold">Plant Identified</h4>
              <p>{detectionResult.plant?.commonName || 'Unknown plant'}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold">Disease Detected</h4>
              <p>{detectionResult.disease?.name || 'No disease detected'}</p>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold">Treatment Advice</h4>
            <p className="mt-2 whitespace-pre-wrap">{detectionResult.advice}</p>
          </div>

          <button
            onClick={() => {
              setDetectionResult(null);
              setImage(null);
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Start New Analysis
          </button>
        </motion.div>
      )}
    </div>
  );
};
