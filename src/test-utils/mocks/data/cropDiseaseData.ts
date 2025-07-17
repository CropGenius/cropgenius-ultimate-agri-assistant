export const mockCropDiseaseData = {
  detectionResult: {
    id: 'detection-1',
    user_id: 'test-user-id',
    image_url: 'https://example.com/crop-image.jpg',
    disease_name: 'Corn Leaf Blight',
    scientific_name: 'Exserohilum turcicum',
    confidence_score: 0.92,
    severity: 'moderate',
    affected_area_percentage: 25,
    treatment_recommendations: [
      {
        method: 'chemical',
        product: 'Azoxystrobin-based fungicide',
        application_rate: '200ml per 20L water',
        frequency: 'Every 14 days',
        timing: 'Early morning or late evening',
        precautions: 'Wear protective equipment, avoid windy conditions',
      },
      {
        method: 'cultural',
        product: 'Crop rotation',
        application_rate: 'N/A',
        frequency: 'Next season',
        timing: 'After harvest',
        precautions: 'Use non-host crops like legumes',
      },
    ],
    prevention_tips: [
      'Ensure proper plant spacing for air circulation',
      'Remove infected plant debris',
      'Use resistant varieties when available',
      'Monitor humidity levels in the field',
      'Apply preventive fungicide sprays during high-risk periods',
    ],
    economic_impact: {
      potential_yield_loss: 15,
      treatment_cost_estimate: 2500,
      currency: 'KES',
      roi_if_treated: 85,
    },
    environmental_conditions: {
      temperature_range: '20-30°C',
      humidity_level: 'high',
      rainfall_pattern: 'frequent',
      wind_conditions: 'low',
    },
    created_at: new Date().toISOString(),
    processed_at: new Date().toISOString(),
    ai_model_version: '2.1.0',
    processing_time_ms: 1250,
  },

  detectionHistory: [
    {
      id: 'detection-1',
      user_id: 'test-user-id',
      image_url: 'https://example.com/crop-image-1.jpg',
      disease_name: 'Corn Leaf Blight',
      confidence_score: 0.92,
      severity: 'moderate',
      created_at: new Date().toISOString(),
      field_id: 'field-1',
      crop_type: 'maize',
      status: 'treated',
    },
    {
      id: 'detection-2',
      user_id: 'test-user-id',
      image_url: 'https://example.com/crop-image-2.jpg',
      disease_name: 'Bean Rust',
      confidence_score: 0.88,
      severity: 'mild',
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      field_id: 'field-2',
      crop_type: 'beans',
      status: 'monitoring',
    },
    {
      id: 'detection-3',
      user_id: 'test-user-id',
      image_url: 'https://example.com/crop-image-3.jpg',
      disease_name: 'Healthy Plant',
      confidence_score: 0.95,
      severity: 'none',
      created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
      field_id: 'field-1',
      crop_type: 'maize',
      status: 'healthy',
    },
  ],

  diseaseDatabase: [
    {
      id: 'disease-1',
      name: 'Corn Leaf Blight',
      scientific_name: 'Exserohilum turcicum',
      common_names: ['Northern Corn Leaf Blight', 'Turcicum Leaf Blight'],
      affected_crops: ['maize', 'corn', 'sorghum'],
      symptoms: [
        'Long, elliptical lesions on leaves',
        'Gray-green to tan colored spots',
        'Lesions may have dark borders',
        'Premature leaf death in severe cases',
      ],
      causes: [
        'Fungal pathogen Exserohilum turcicum',
        'High humidity conditions',
        'Moderate temperatures (20-30°C)',
        'Poor air circulation',
      ],
      favorable_conditions: {
        temperature: '20-30°C',
        humidity: '>80%',
        rainfall: 'frequent',
        wind: 'low',
      },
      economic_impact: 'Can cause 10-50% yield loss if untreated',
      geographic_distribution: 'Worldwide, especially in humid regions',
    },
    {
      id: 'disease-2',
      name: 'Bean Rust',
      scientific_name: 'Uromyces appendiculatus',
      common_names: ['Common Bean Rust', 'Bean Leaf Rust'],
      affected_crops: ['beans', 'common_bean', 'kidney_bean'],
      symptoms: [
        'Small, reddish-brown pustules on leaves',
        'Yellow halos around pustules',
        'Premature leaf drop',
        'Reduced pod formation',
      ],
      causes: [
        'Fungal pathogen Uromyces appendiculatus',
        'High humidity and moisture',
        'Moderate temperatures',
        'Dense plant canopy',
      ],
      favorable_conditions: {
        temperature: '17-27°C',
        humidity: '>90%',
        rainfall: 'moderate_to_high',
        wind: 'low_to_moderate',
      },
      economic_impact: 'Can reduce yield by 20-40% in severe infections',
      geographic_distribution: 'Common in tropical and subtropical regions',
    },
  ],

  plantNetResponse: {
    query: {
      project: 'k-world-flora',
      images: ['https://example.com/crop-image.jpg'],
      modifiers: ['crops', 'useful'],
      plant_language: 'en',
      plant_details: ['common_names', 'url'],
    },
    results: [
      {
        score: 0.92,
        species: {
          scientificNameWithoutAuthor: 'Zea mays',
          scientificNameAuthorship: 'L.',
          genus: {
            scientificNameWithoutAuthor: 'Zea',
            scientificNameAuthorship: 'L.',
          },
          family: {
            scientificNameWithoutAuthor: 'Poaceae',
            scientificNameAuthorship: 'Barnhart',
          },
          commonNames: ['Corn', 'Maize', 'Indian Corn'],
          plantDetails: {
            url: 'https://en.wikipedia.org/wiki/Maize',
          },
        },
        gbif: {
          id: '5290027',
        },
      },
    ],
    language: 'en',
    preferedReferential: 'k-world-flora',
    switchToProject: null,
    remainingIdentificationRequests: 495,
  },

  geminiResponse: {
    candidates: [
      {
        content: {
          parts: [
            {
              text: `Based on the image analysis, I can identify this as Corn Leaf Blight (Exserohilum turcicum) affecting your maize crop. Here's my detailed assessment:

**Disease Identification:**
- Disease: Northern Corn Leaf Blight
- Confidence: 92%
- Severity: Moderate (25% leaf area affected)

**Treatment Recommendations:**
1. **Immediate Action:** Apply azoxystrobin-based fungicide (200ml per 20L water) every 14 days
2. **Cultural Control:** Improve air circulation by proper spacing
3. **Preventive Measures:** Remove infected plant debris

**Economic Impact:**
- Potential yield loss: 15% if untreated
- Treatment cost: ~2,500 KES
- Expected ROI: 85% if treated promptly

**Prevention for Future:**
- Use resistant varieties
- Ensure proper field drainage
- Monitor weather conditions for high-risk periods

This disease thrives in humid conditions with temperatures between 20-30°C. Given the current weather patterns in your area, immediate treatment is recommended to prevent spread.`,
            },
          ],
          role: 'model',
        },
        finishReason: 'STOP',
        index: 0,
        safetyRatings: [
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            probability: 'NEGLIGIBLE',
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            probability: 'NEGLIGIBLE',
          },
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            probability: 'NEGLIGIBLE',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            probability: 'NEGLIGIBLE',
          },
        ],
      },
    ],
    usageMetadata: {
      promptTokenCount: 1024,
      candidatesTokenCount: 512,
      totalTokenCount: 1536,
    },
  },

  treatmentPlans: [
    {
      id: 'plan-1',
      detection_id: 'detection-1',
      disease_name: 'Corn Leaf Blight',
      treatment_type: 'integrated',
      steps: [
        {
          step: 1,
          action: 'Immediate fungicide application',
          product: 'Azoxystrobin 25% SC',
          dosage: '200ml per 20L water',
          timing: 'Within 24 hours',
          cost_estimate: 800,
          currency: 'KES',
        },
        {
          step: 2,
          action: 'Remove infected plant material',
          product: 'Manual removal',
          dosage: 'All visible infected leaves',
          timing: 'Same day as fungicide',
          cost_estimate: 200,
          currency: 'KES',
        },
        {
          step: 3,
          action: 'Follow-up fungicide application',
          product: 'Azoxystrobin 25% SC',
          dosage: '200ml per 20L water',
          timing: '14 days after first application',
          cost_estimate: 800,
          currency: 'KES',
        },
        {
          step: 4,
          action: 'Monitor and assess',
          product: 'Visual inspection',
          dosage: 'Weekly monitoring',
          timing: 'Ongoing for 4 weeks',
          cost_estimate: 0,
          currency: 'KES',
        },
      ],
      total_cost: 1800,
      expected_duration: '4 weeks',
      success_probability: 0.85,
      created_at: new Date().toISOString(),
    },
  ],
};