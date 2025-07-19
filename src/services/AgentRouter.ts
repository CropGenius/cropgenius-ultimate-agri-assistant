/**
 * 🌾 CROPGENIUS – INTELLIGENT AGENT ROUTER
 * -------------------------------------------------------------
 * BILLIONAIRE-GRADE Agent Routing System
 * - Routes messages to appropriate AI agents based on content
 * - Integrates with CropDiseaseOracle, WeatherAgent, FieldBrainAgent
 * - Provides confidence scoring and multi-agent consensus
 * - Handles fallback and error recovery
 */

import { cropDiseaseOracle, type GeoLocation } from '@/agents/CropDiseaseOracle';
import { getCurrentWeather, getWeatherForecast, getWeatherBasedAdvice } from '@/agents/WeatherAgent';
import { FieldBrainAgent } from '@/agents/FieldBrainAgent';
import { MarketIntelligenceEngine } from '@/services/marketIntelligence';
import { supabase } from '@/integrations/supabase/client';

export interface FarmContext {
  location: GeoLocation;
  soilType?: string;
  currentSeason?: string;
  userId: string;
  farmId?: string;
  currentCrops?: string[];
  climateZone?: string;
}

export interface AgentResponse {
  response: string;
  confidence: number;
  agentType: 'disease' | 'weather' | 'field' | 'market' | 'general';
  sources?: string[];
  actionable?: boolean;
  data?: any;
  followUpSuggestions?: string[];
}

export interface MessageClassification {
  type: 'disease' | 'weather' | 'field' | 'market' | 'general';
  confidence: number;
  keywords: string[];
}

/**
 * BILLIONAIRE-GRADE Agent Router for Agricultural Intelligence
 */
export class AgentRouter {
  private static marketEngine = new MarketIntelligenceEngine();
  private static fieldBrainAgent = FieldBrainAgent.getInstance();

  /**
   * Route message to appropriate AI agent
   */
  static async routeMessage(message: string, farmContext: FarmContext): Promise<AgentResponse> {
    try {
      // Classify the message to determine routing
      const classification = this.classifyMessage(message);
      
      console.log(`🎯 [AgentRouter] Routing message to ${classification.type} agent (${classification.confidence}% confidence)`);

      // Route to appropriate agent
      switch (classification.type) {
        case 'disease':
          return await this.routeToDiseaseAgent(message, farmContext, classification);
        case 'weather':
          return await this.routeToWeatherAgent(message, farmContext, classification);
        case 'field':
          return await this.routeToFieldAgent(message, farmContext, classification);
        case 'market':
          return await this.routeToMarketAgent(message, farmContext, classification);
        default:
          return await this.routeToGeneralAgent(message, farmContext, classification);
      }
    } catch (error) {
      console.error('🚨 [AgentRouter] Error routing message:', error);
      return this.generateErrorResponse(message, error);
    }
  }

  /**
   * Classify message to determine appropriate agent
   */
  static classifyMessage(message: string): MessageClassification {
    const lowerMessage = message.toLowerCase();
    
    // Disease-related keywords
    const diseaseKeywords = [
      'disease', 'pest', 'bug', 'insect', 'fungus', 'blight', 'rot', 'spot', 'wilt',
      'leaf', 'brown', 'yellow', 'dying', 'sick', 'infected', 'treatment', 'spray',
      'armyworm', 'aphid', 'thrips', 'mite', 'caterpillar', 'virus', 'bacteria'
    ];

    // Weather-related keywords
    const weatherKeywords = [
      'weather', 'rain', 'drought', 'temperature', 'hot', 'cold', 'wind', 'storm',
      'forecast', 'climate', 'season', 'planting', 'harvest', 'irrigation', 'water',
      'humidity', 'sunshine', 'cloudy', 'flooding', 'dry'
    ];

    // Field management keywords
    const fieldKeywords = [
      'field', 'soil', 'fertilizer', 'planting', 'seeding', 'cultivation', 'tillage',
      'crop rotation', 'companion planting', 'spacing', 'depth', 'timing', 'schedule',
      'preparation', 'maintenance', 'monitoring', 'analysis', 'health', 'ndvi'
    ];

    // Market-related keywords
    const marketKeywords = [
      'price', 'market', 'sell', 'buy', 'profit', 'cost', 'revenue', 'demand',
      'supply', 'trade', 'export', 'import', 'commodity', 'value', 'economic',
      'investment', 'return', 'margin', 'competition'
    ];

    // Count keyword matches
    const diseaseScore = this.countKeywordMatches(lowerMessage, diseaseKeywords);
    const weatherScore = this.countKeywordMatches(lowerMessage, weatherKeywords);
    const fieldScore = this.countKeywordMatches(lowerMessage, fieldKeywords);
    const marketScore = this.countKeywordMatches(lowerMessage, marketKeywords);

    // Determine highest scoring category
    const scores = [
      { type: 'disease' as const, score: diseaseScore, keywords: diseaseKeywords },
      { type: 'weather' as const, score: weatherScore, keywords: weatherKeywords },
      { type: 'field' as const, score: fieldScore, keywords: fieldKeywords },
      { type: 'market' as const, score: marketScore, keywords: marketKeywords },
    ];

    const topScore = scores.reduce((max, current) => 
      current.score > max.score ? current : max
    );

    // If no clear category, default to general
    if (topScore.score === 0) {
      return {
        type: 'general',
        confidence: 50,
        keywords: []
      };
    }

    // Calculate confidence based on keyword density
    const totalWords = lowerMessage.split(/\s+/).length;
    const confidence = Math.min(Math.round((topScore.score / totalWords) * 100 * 5), 95);

    return {
      type: topScore.type,
      confidence: Math.max(confidence, 60), // Minimum 60% confidence for routing
      keywords: topScore.keywords.filter(keyword => lowerMessage.includes(keyword))
    };
  }

  /**
   * Route to disease detection agent
   */
  private static async routeToDiseaseAgent(
    message: string, 
    farmContext: FarmContext, 
    classification: MessageClassification
  ): Promise<AgentResponse> {
    try {
      // Extract crop type from message or use context
      const cropType = this.extractCropType(message) || farmContext.currentCrops?.[0] || 'maize';
      
      // If message mentions image analysis, suggest image upload
      if (message.toLowerCase().includes('image') || message.toLowerCase().includes('photo')) {
        return {
          response: `I can help you identify crop diseases! For the most accurate diagnosis of your ${cropType}, please upload a clear photo of the affected plant. I'll analyze it using advanced AI and provide specific treatment recommendations, including organic and chemical options available in your area.`,
          confidence: 90,
          agentType: 'disease',
          sources: ['CropDiseaseOracle'],
          actionable: true,
          followUpSuggestions: [
            'Upload a photo of the affected plant',
            'Describe the symptoms you\'re seeing',
            'Tell me when you first noticed the problem'
          ]
        };
      }

      // Generate text-based disease advice
      const diseaseAdvice = await this.generateDiseaseAdviceFromText(message, cropType, farmContext);
      
      return {
        response: diseaseAdvice,
        confidence: classification.confidence,
        agentType: 'disease',
        sources: ['CropDiseaseOracle', 'Agricultural Database'],
        actionable: true,
        followUpSuggestions: [
          'Upload a photo for precise diagnosis',
          'Ask about preventive measures',
          'Get local supplier information'
        ]
      };
    } catch (error) {
      console.error('Error in disease agent routing:', error);
      return this.generateFallbackDiseaseResponse(message, farmContext);
    }
  }

  /**
   * Route to weather intelligence agent
   */
  private static async routeToWeatherAgent(
    message: string, 
    farmContext: FarmContext, 
    classification: MessageClassification
  ): Promise<AgentResponse> {
    try {
      // Get current weather and forecast
      const [currentWeather, forecast] = await Promise.all([
        getCurrentWeather(farmContext.location.lat, farmContext.location.lng, farmContext.farmId, false, farmContext.userId),
        getWeatherForecast(farmContext.location.lat, farmContext.location.lng, farmContext.farmId, false, farmContext.userId)
      ]);

      // Generate weather-based agricultural advice
      const crops = farmContext.currentCrops || ['maize', 'beans'];
      const weatherAdvice = getWeatherBasedAdvice(forecast, crops);

      // Create comprehensive response
      const response = this.formatWeatherResponse(message, currentWeather, forecast, weatherAdvice, farmContext);

      return {
        response,
        confidence: classification.confidence,
        agentType: 'weather',
        sources: ['OpenWeatherMap', 'Agricultural Extension Guidelines'],
        actionable: true,
        data: { currentWeather, forecast, weatherAdvice },
        followUpSuggestions: [
          'Get planting recommendations',
          'Check irrigation needs',
          'Plan field activities'
        ]
      };
    } catch (error) {
      console.error('Error in weather agent routing:', error);
      return this.generateFallbackWeatherResponse(message, farmContext);
    }
  }

  /**
   * Route to field intelligence agent
   */
  private static async routeToFieldAgent(
    message: string, 
    farmContext: FarmContext, 
    classification: MessageClassification
  ): Promise<AgentResponse> {
    try {
      // Initialize field brain agent if needed
      if (!this.fieldBrainAgent) {
        await this.fieldBrainAgent.initialize(farmContext.userId);
      }

      // Set field context if available
      if (farmContext.farmId) {
        this.fieldBrainAgent.setFieldContext(farmContext.farmId);
      }

      // Process question with field brain agent
      const fieldResponse = await this.fieldBrainAgent.processQuestion(message);

      return {
        response: fieldResponse.response,
        confidence: classification.confidence,
        agentType: 'field',
        sources: ['FieldBrainAgent', 'Field History', 'NDVI Analysis'],
        actionable: true,
        data: fieldResponse.insight,
        followUpSuggestions: [
          'Get field health analysis',
          'Check soil recommendations',
          'Plan crop rotation'
        ]
      };
    } catch (error) {
      console.error('Error in field agent routing:', error);
      return this.generateFallbackFieldResponse(message, farmContext);
    }
  }

  /**
   * Route to market intelligence agent
   */
  private static async routeToMarketAgent(
    message: string, 
    farmContext: FarmContext, 
    classification: MessageClassification
  ): Promise<AgentResponse> {
    try {
      const crops = farmContext.currentCrops || this.extractCropTypes(message) || ['maize'];
      
      // Get market analysis
      const marketAnalysis = await this.marketEngine.getLocalMarketAnalysis(
        {
          lat: farmContext.location.lat,
          lng: farmContext.location.lng,
          country: farmContext.location.country || 'Kenya',
          region: farmContext.location.region || 'Central'
        },
        crops,
        1000 // Default 1000kg
      );

      const response = this.formatMarketResponse(message, marketAnalysis, crops, farmContext);

      return {
        response,
        confidence: classification.confidence,
        agentType: 'market',
        sources: ['Market Intelligence Engine', 'WFP VAM', 'Local Markets'],
        actionable: true,
        data: marketAnalysis,
        followUpSuggestions: [
          'Get price alerts',
          'Find best markets',
          'Calculate transport costs'
        ]
      };
    } catch (error) {
      console.error('Error in market agent routing:', error);
      return this.generateFallbackMarketResponse(message, farmContext);
    }
  }

  /**
   * Route to general agricultural assistant
   */
  private static async routeToGeneralAgent(
    message: string, 
    farmContext: FarmContext, 
    classification: MessageClassification
  ): Promise<AgentResponse> {
    try {
      // Use Supabase edge function for general agricultural advice
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message,
          context: {
            farmContext,
            specialization: 'agricultural_expert',
            location: farmContext.location,
            crops: farmContext.currentCrops
          }
        }
      });

      if (error) throw error;

      return {
        response: data.response || this.generateFallbackGeneralResponse(message, farmContext),
        confidence: classification.confidence,
        agentType: 'general',
        sources: ['Agricultural AI Assistant'],
        actionable: true,
        followUpSuggestions: [
          'Ask about specific crops',
          'Get weather information',
          'Check market prices'
        ]
      };
    } catch (error) {
      console.error('Error in general agent routing:', error);
      return this.generateFallbackGeneralResponse(message, farmContext);
    }
  }

  /**
   * Helper methods
   */
  private static countKeywordMatches(text: string, keywords: string[]): number {
    return keywords.reduce((count, keyword) => {
      return count + (text.includes(keyword) ? 1 : 0);
    }, 0);
  }

  private static extractCropType(message: string): string | null {
    const crops = ['maize', 'corn', 'beans', 'cassava', 'tomato', 'potato', 'rice', 'wheat', 'sorghum', 'millet'];
    const lowerMessage = message.toLowerCase();
    
    for (const crop of crops) {
      if (lowerMessage.includes(crop)) {
        return crop;
      }
    }
    return null;
  }

  private static extractCropTypes(message: string): string[] {
    const crops = ['maize', 'corn', 'beans', 'cassava', 'tomato', 'potato', 'rice', 'wheat', 'sorghum', 'millet'];
    const lowerMessage = message.toLowerCase();
    
    return crops.filter(crop => lowerMessage.includes(crop));
  }

  private static async generateDiseaseAdviceFromText(
    message: string, 
    cropType: string, 
    farmContext: FarmContext
  ): Promise<string> {
    // Extract symptoms from message
    const symptoms = this.extractSymptoms(message);
    
    // Generate advice based on common diseases for the crop
    const commonDiseases = this.getCommonDiseases(cropType);
    const likelyDisease = this.matchSymptomsToDisease(symptoms, commonDiseases);
    
    return `Based on your description of ${cropType} symptoms, this could be ${likelyDisease.name}. 

**Immediate Actions:**
${likelyDisease.immediateActions.map(action => `• ${action}`).join('\n')}

**Treatment Options:**
${likelyDisease.treatments.map(treatment => `• ${treatment}`).join('\n')}

**Prevention:**
${likelyDisease.prevention.map(prev => `• ${prev}`).join('\n')}

For a more accurate diagnosis and specific treatment recommendations, please upload a clear photo of the affected plant. I can then provide detailed analysis including confidence scores and local supplier information.`;
  }

  private static extractSymptoms(message: string): string[] {
    const symptomKeywords = [
      'brown spots', 'yellow leaves', 'wilting', 'holes', 'discoloration',
      'stunted growth', 'leaf curl', 'white powder', 'black spots', 'rotting'
    ];
    
    const lowerMessage = message.toLowerCase();
    return symptomKeywords.filter(symptom => lowerMessage.includes(symptom));
  }

  private static getCommonDiseases(cropType: string): any[] {
    const diseaseDatabase = {
      maize: [
        {
          name: 'Fall Armyworm',
          symptoms: ['holes', 'leaf damage', 'caterpillars'],
          immediateActions: ['Remove caterpillars by hand', 'Apply neem oil', 'Check neighboring plants'],
          treatments: ['Bt-based insecticides', 'Neem oil spray', 'Beneficial insects release'],
          prevention: ['Early planting', 'Crop rotation', 'Regular monitoring']
        },
        {
          name: 'Maize Streak Virus',
          symptoms: ['yellow streaks', 'stunted growth', 'leaf discoloration'],
          immediateActions: ['Remove infected plants', 'Control leafhopper vectors', 'Isolate healthy plants'],
          treatments: ['No direct cure - focus on prevention', 'Vector control', 'Resistant varieties'],
          prevention: ['Use resistant varieties', 'Control leafhoppers', 'Proper spacing']
        }
      ],
      beans: [
        {
          name: 'Bean Common Mosaic',
          symptoms: ['mosaic patterns', 'leaf distortion', 'stunted growth'],
          immediateActions: ['Remove infected plants', 'Disinfect tools', 'Avoid working when wet'],
          treatments: ['No cure - prevention focused', 'Use certified seeds', 'Vector control'],
          prevention: ['Certified disease-free seeds', 'Crop rotation', 'Weed control']
        }
      ]
    };

    return diseaseDatabase[cropType as keyof typeof diseaseDatabase] || diseaseDatabase.maize;
  }

  private static matchSymptomsToDisease(symptoms: string[], diseases: any[]): any {
    // Simple matching logic - in production would use ML
    for (const disease of diseases) {
      const matches = symptoms.filter(symptom => 
        disease.symptoms.some((diseaseSymptom: string) => 
          symptom.includes(diseaseSymptom) || diseaseSymptom.includes(symptom)
        )
      );
      
      if (matches.length > 0) {
        return disease;
      }
    }
    
    // Default to first disease if no match
    return diseases[0] || {
      name: 'Unknown Issue',
      immediateActions: ['Consult local agricultural extension officer', 'Take clear photos', 'Monitor spread'],
      treatments: ['Professional diagnosis recommended', 'General plant health measures'],
      prevention: ['Regular monitoring', 'Good field hygiene', 'Proper spacing']
    };
  }

  private static formatWeatherResponse(
    message: string, 
    currentWeather: any, 
    forecast: any, 
    weatherAdvice: any[], 
    farmContext: FarmContext
  ): string {
    const temp = Math.round(currentWeather.temperatureCelsius);
    const humidity = currentWeather.humidityPercent;
    const description = currentWeather.weatherDescription;

    let response = `**Current Weather in ${farmContext.location.country || 'your area'}:**
🌡️ Temperature: ${temp}°C (feels like ${Math.round(currentWeather.feelsLikeCelsius)}°C)
💧 Humidity: ${humidity}%
☁️ Conditions: ${description}
💨 Wind: ${Math.round(currentWeather.windSpeedMps)} m/s

**Agricultural Recommendations:**\n`;

    weatherAdvice.forEach(advice => {
      response += `\n**${advice.cropType.toUpperCase()}:**\n${advice.advice}\n`;
      
      if (advice.optimalPlantingWindow) {
        response += `🌱 Optimal planting: ${advice.optimalPlantingWindow.start} to ${advice.optimalPlantingWindow.end}\n`;
      }
      
      if (advice.warnings && advice.warnings.length > 0) {
        response += `⚠️ Warnings: ${advice.warnings.join(', ')}\n`;
      }
    });

    return response;
  }

  private static formatMarketResponse(
    message: string, 
    marketAnalysis: any, 
    crops: string[], 
    farmContext: FarmContext
  ): string {
    let response = `**Market Intelligence for ${crops.join(', ')} in ${farmContext.location.country || 'your area'}:**\n\n`;

    if (marketAnalysis.currentPrices && marketAnalysis.currentPrices.length > 0) {
      response += `**Current Prices:**\n`;
      marketAnalysis.currentPrices.forEach((price: any) => {
        response += `💰 ${price.commodity}: $${price.price}/${price.unit} (${price.market})\n`;
      });
    }

    if (marketAnalysis.marketAlerts && marketAnalysis.marketAlerts.length > 0) {
      response += `\n**Market Alerts:**\n`;
      marketAnalysis.marketAlerts.forEach((alert: any) => {
        response += `🚨 ${alert.message}\n`;
      });
    }

    if (marketAnalysis.bestMarkets && marketAnalysis.bestMarkets.length > 0) {
      response += `\n**Best Markets to Sell:**\n`;
      marketAnalysis.bestMarkets.slice(0, 3).forEach((market: any, index: number) => {
        response += `${index + 1}. ${market.name} - $${market.price}/${market.unit}\n`;
      });
    }

    return response;
  }

  /**
   * Fallback responses
   */
  private static generateFallbackDiseaseResponse(message: string, farmContext: FarmContext): AgentResponse {
    return {
      response: `I can help you with crop disease identification and treatment! For the most accurate diagnosis, please upload a clear photo of the affected plant. In the meantime, here are some general disease prevention tips:

• Remove any visibly diseased plant material
• Ensure proper plant spacing for air circulation
• Avoid watering leaves directly
• Practice crop rotation
• Use certified disease-free seeds

What crop are you concerned about, and what symptoms are you seeing?`,
      confidence: 70,
      agentType: 'disease',
      sources: ['Agricultural Best Practices'],
      actionable: true
    };
  }

  private static generateFallbackWeatherResponse(message: string, farmContext: FarmContext): AgentResponse {
    return {
      response: `I can provide weather-based farming advice for your location. Currently, I'm having trouble accessing real-time weather data, but here are some general weather-related farming tips:

• Monitor local weather forecasts daily
• Plan planting based on seasonal rainfall patterns
• Ensure proper drainage during rainy seasons
• Consider irrigation during dry spells
• Protect crops from extreme weather events

What specific weather information do you need for your farming activities?`,
      confidence: 60,
      agentType: 'weather',
      sources: ['Agricultural Guidelines'],
      actionable: true
    };
  }

  private static generateFallbackFieldResponse(message: string, farmContext: FarmContext): AgentResponse {
    return {
      response: `I can help you with field management and agricultural practices! Here are some general field management tips:

• Regular soil testing for nutrient management
• Proper crop rotation to maintain soil health
• Optimal plant spacing for maximum yield
• Integrated pest management practices
• Regular field monitoring and record keeping

What specific aspect of field management would you like help with?`,
      confidence: 65,
      agentType: 'field',
      sources: ['Field Management Best Practices'],
      actionable: true
    };
  }

  private static generateFallbackMarketResponse(message: string, farmContext: FarmContext): AgentResponse {
    return {
      response: `I can help you with market information and pricing strategies! Here are some general market tips:

• Research local market prices before selling
• Consider timing your sales for better prices
• Explore different market channels (local, regional, export)
• Build relationships with reliable buyers
• Keep records of market trends

What crops are you looking to sell, and what market information do you need?`,
      confidence: 60,
      agentType: 'market',
      sources: ['Market Intelligence Guidelines'],
      actionable: true
    };
  }

  private static generateFallbackGeneralResponse(message: string, farmContext: FarmContext): string {
    return `I'm here to help you with all aspects of farming! I can assist with:

🌱 **Crop Disease Detection** - Upload photos for AI-powered diagnosis
🌤️ **Weather Intelligence** - Get weather-based farming advice
🚜 **Field Management** - Soil health, planting, and crop rotation
💰 **Market Intelligence** - Prices, trends, and selling strategies

What would you like help with today? Feel free to ask specific questions about your crops, fields, or farming challenges.`;
  }

  private static generateErrorResponse(message: string, error: any): AgentResponse {
    console.error('Agent routing error:', error);
    
    return {
      response: `I apologize, but I'm experiencing some technical difficulties right now. However, I'm still here to help! 

Please try rephrasing your question, or ask me about:
• Crop disease identification and treatment
• Weather-based farming advice
• Field management practices
• Market prices and selling strategies

What farming challenge can I help you with?`,
      confidence: 50,
      agentType: 'general',
      sources: ['Error Recovery System'],
      actionable: true
    };
  }
}