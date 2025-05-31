import { genai } from '@google/generative-ai';

export interface CropHealthAnalysis {
  crop: string;
  diagnosis: string;
  confidence: 'High' | 'Medium' | 'Low';
  organic_remedy: string;
  inorganic_remedy: string;
  farmer_explanation: string;
  alternatives: Array<{
    issue: string;
    confidence: 'High' | 'Medium' | 'Low';
  }>;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export class CropHealthService {
  private static instance: CropHealthService;
  private client: any;

  private constructor() {
    // Initialize Gemini client with API key from environment variable
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key not found in environment variables');
    }
    this.client = genai.Client({ apiKey });
  }

  public static getInstance(): CropHealthService {
    if (!CropHealthService.instance) {
      CropHealthService.instance = new CropHealthService();
    }
    return CropHealthService.instance;
  }

  private validateImage(imageData: string): void {
    // Check if the image data is a valid base64 string
    if (!imageData.startsWith('data:image/')) {
      throw new Error('Invalid image format. Please upload a valid image file.');
    }

    // Extract the base64 data and mime type
    const [header, base64Data] = imageData.split(',');
    const mimeType = header.split(':')[1].split(';')[0];

    // Validate mime type
    if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) {
      throw new Error(`Unsupported image type. Please upload a ${ALLOWED_IMAGE_TYPES.join(', ')} file.`);
    }

    // Calculate approximate size (base64 increases size by ~33%)
    const sizeInBytes = Math.ceil((base64Data.length * 3) / 4);
    if (sizeInBytes > MAX_IMAGE_SIZE) {
      throw new Error(`Image size exceeds the maximum limit of ${MAX_IMAGE_SIZE / (1024 * 1024)}MB.`);
    }
  }

  private async processImage(imageData: string): Promise<string> {
    try {
      // Extract the base64 data
      const base64Data = imageData.split(',')[1];
      
      // If the image is too large, we might want to resize it
      // For now, we'll just return the original data
      return base64Data;
    } catch (error) {
      console.error('Error processing image:', error);
      throw new Error('Failed to process image. Please try again with a different image.');
    }
  }

  public async analyzeCropHealth(
    imageData: string,
    context: {
      region?: string;
      crop?: string;
      season?: string;
      symptoms?: string;
    } = {}
  ): Promise<CropHealthAnalysis> {
    try {
      // Validate image
      this.validateImage(imageData);

      // Process image
      const processedImageData = await this.processImage(imageData);

      // Build prompt
      const prompt = this.buildPrompt(context);
      
      // Make API call
      const response = await this.client.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [
          {
            parts: [
              { text: prompt },
              { inlineData: { mimeType: 'image/jpeg', data: processedImageData } }
            ]
          }
        ]
      });

      // Parse and validate response
      const result = JSON.parse(response.text);
      return this.validateAndFormatResponse(result);
    } catch (error) {
      console.error('Error analyzing crop health:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to analyze crop health. Please try again.');
    }
  }

  private buildPrompt(context: {
    region?: string;
    crop?: string;
    season?: string;
    symptoms?: string;
  }): string {
    return `You are a crop health AI trained on African agriculture, pests, and plant diseases.
Your job is to identify the crop, detect any visible disease or pest symptoms, and provide a complete diagnosis using the image and contextual information.

Apply these rules with zero deviation:

1. Identify the crop and name the specific disease or pest, if any. Use scientific and local names when relevant.

2. Assume the farm is in Sub-Saharan Africa — prioritize pests, diseases, and remedies that occur in tropical, humid, or dryland African farming zones.

3. If symptoms are unclear, return the top 3 most likely issues, ranked by visual confidence.

4. Always give 2 types of remedies:
   - Organic remedy (e.g., neem oil, crop rotation, compost treatments)
   - Inorganic remedy (e.g., chemical fungicides, insecticides, mineral solutions)

5. Include a short farmer-friendly explanation in plain language.

Context:
${JSON.stringify(context, null, 2)}

Return the analysis in this exact JSON structure:
{
  "crop": "string",
  "diagnosis": "string",
  "confidence": "High|Medium|Low",
  "organic_remedy": "string",
  "inorganic_remedy": "string",
  "farmer_explanation": "string",
  "alternatives": [
    {
      "issue": "string",
      "confidence": "High|Medium|Low"
    }
  ]
}`;
  }

  private validateAndFormatResponse(response: any): CropHealthAnalysis {
    // Validate required fields
    const requiredFields = [
      'crop',
      'diagnosis',
      'confidence',
      'organic_remedy',
      'inorganic_remedy',
      'farmer_explanation',
      'alternatives'
    ];

    for (const field of requiredFields) {
      if (!response[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate confidence values
    const validConfidences = ['High', 'Medium', 'Low'];
    if (!validConfidences.includes(response.confidence)) {
      throw new Error('Invalid confidence value');
    }

    // Validate alternatives
    if (!Array.isArray(response.alternatives)) {
      throw new Error('Alternatives must be an array');
    }

    for (const alt of response.alternatives) {
      if (!alt.issue || !validConfidences.includes(alt.confidence)) {
        throw new Error('Invalid alternative format');
      }
    }

    return response as CropHealthAnalysis;
  }
}

export const cropHealthService = CropHealthService.getInstance(); 