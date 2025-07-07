/**
 * 📸 DISEASE DETECTION CAMERA - AI-Powered Crop Analysis
 * Camera interface with real-time disease detection
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DiseaseResult {
  disease_name: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  immediate_actions: string[];
  treatment_cost: number;
  recovery_timeline: string;
}

export const DiseaseDetectionCamera: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DiseaseResult | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Convert to base64 for preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setCapturedImage(e.target?.result as string);
      analyzeImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (imageData: string) => {
    setIsAnalyzing(true);
    setResult(null);

    try {
      // Simulate AI analysis delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock disease detection result
      const mockResult: DiseaseResult = {
        disease_name: 'Early Blight',
        confidence: 87,
        severity: 'medium',
        immediate_actions: [
          'Remove affected leaves immediately',
          'Apply copper-based fungicide',
          'Improve air circulation around plants'
        ],
        treatment_cost: 25,
        recovery_timeline: '10-14 days'
      };
      
      setResult(mockResult);
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const triggerCamera = () => {
    fileInputRef.current?.click();
  };

  const resetAnalysis = () => {
    setResult(null);
    setCapturedImage(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Camera Interface */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Crop Disease Scanner</h2>
        
        {!capturedImage ? (
          <div className="text-center">
            <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-xl h-64 flex items-center justify-center mb-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-white">📸</span>
                </div>
                <p className="text-gray-600 mb-2">Take a photo of affected crop</p>
                <p className="text-sm text-gray-500">Ensure good lighting and clear focus</p>
              </div>
            </div>
            
            <motion.button
              onClick={triggerCamera}
              className="bg-green-600 text-white py-4 px-8 rounded-xl font-medium text-lg w-full"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              📷 Scan Crop Disease
            </motion.button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Captured Image */}
            <div className="relative rounded-xl overflow-hidden">
              <img 
                src={capturedImage} 
                alt="Captured crop" 
                className="w-full h-64 object-cover"
              />
              <button
                onClick={resetAnalysis}
                className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full"
              >
                ✕
              </button>
            </div>

            {/* Analysis Status */}
            <AnimatePresence>
              {isAnalyzing && (
                <motion.div
                  className="bg-blue-50 rounded-xl p-4 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                  <p className="text-blue-700 font-medium">AI Analysis in Progress...</p>
                  <p className="text-sm text-blue-600">Using PlantNet + Gemini AI</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Results */}
            <AnimatePresence>
              {result && (
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  {/* Disease Identification */}
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-800">Disease Detected</h3>
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${
                          result.severity === 'critical' ? 'bg-red-500' :
                          result.severity === 'high' ? 'bg-orange-500' :
                          result.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}></div>
                        <span className="text-sm font-medium text-gray-600">
                          {result.severity.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-xl font-bold text-gray-800 mb-2">{result.disease_name}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Confidence</span>
                      <span className="text-lg font-bold text-green-600">{result.confidence}%</span>
                    </div>
                  </div>

                  {/* Treatment Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-green-600">${result.treatment_cost}</p>
                      <p className="text-sm text-gray-600">Treatment Cost</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4 text-center">
                      <p className="text-lg font-bold text-blue-600">{result.recovery_timeline}</p>
                      <p className="text-sm text-gray-600">Recovery Time</p>
                    </div>
                  </div>

                  {/* Immediate Actions */}
                  <div className="bg-white border-2 border-orange-200 rounded-xl p-4">
                    <h4 className="font-bold text-gray-800 mb-3">🚨 Immediate Actions</h4>
                    <div className="space-y-2">
                      {result.immediate_actions.map((action, index) => (
                        <div key={index} className="flex items-start">
                          <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                            <span className="text-white text-xs font-bold">{index + 1}</span>
                          </div>
                          <p className="text-sm text-gray-700 flex-1">{action}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-4">
                    <motion.button
                      className="bg-green-600 text-white py-3 px-4 rounded-xl font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      💬 Get WhatsApp Help
                    </motion.button>
                    <motion.button
                      className="bg-blue-600 text-white py-3 px-4 rounded-xl font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      🏪 Find Suppliers
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageCapture}
          className="hidden"
        />
      </div>

      {/* Tips Section */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-4">
        <h3 className="font-bold text-gray-800 mb-3">📋 Photo Tips for Best Results</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-center">
            <span className="text-green-500 mr-2">✓</span>
            <span>Take photos in natural daylight</span>
          </div>
          <div className="flex items-center">
            <span className="text-green-500 mr-2">✓</span>
            <span>Focus on affected leaves or plant parts</span>
          </div>
          <div className="flex items-center">
            <span className="text-green-500 mr-2">✓</span>
            <span>Ensure image is clear and not blurry</span>
          </div>
          <div className="flex items-center">
            <span className="text-green-500 mr-2">✓</span>
            <span>Include healthy parts for comparison</span>
          </div>
        </div>
      </div>
    </div>
  );
};