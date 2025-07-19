/**
 * 🌾 CROPGENIUS – AI AGENT SERVICE
 * -------------------------------------------------------------
 * PRODUCTION-READY AI Message Routing and Agent Management
 * - Intelligent message routing to specialized agricultural AI agents
 * - Real-time confidence scoring and response validation
 * - Fallback mechanisms for service failures
 * - Integration with Supabase Edge Functions for AI processing
 */

import { supabase } from '@/integrations/supabase/client';
import { cropDiseaseOracle } from '@/agents/CropDiseaseOracle';
import { toast } from 'sonner';

export interface FarmContext {
  userId: string;
  farmId?: string;
  location: {
    lat: number;
    lng: number;
    country?: string;
    region?: string;
  };
  soilType?: string;
  currentSeason?: string;
  currentCrops?: string[];
  climateZone?: string;
}

export interface AgentResponse {
  id: string;
  content: string;
  confidence: number;
  agentType: AgentType;
  metadata: {
    processingTime: number;
    dataQuality: number;
    sources: string[];
    reasoning: string;
    suggestions?: string[];
  };
  timestamp: string;
}

export enum AgentType {
  CROP_DISEASE = 'crop_disease',
  WEATHER = 'weather',
  FIELD_BRAIN = 'field_brain',
  MARKET_INTELLIGENCE = 'market_intelligence',
  GENERAL_FARMING = 'general_farming',
  CROP_RECOMMENDATIONS = 'crop_recommendations'
}

export interface Agent {
  type: AgentType;
  name: string;
  description: string;
  capabilities: string[];
  confidence: number;
  isAvailable: boolean;
}

/**
 * PRODUCTION-READY AI Agent Service
 */
export class AgentService {
  private static instance: AgentService;
  private agents: Map<AgentType, Agent> = new Map();
  private messagePatterns: Map<RegExp, AgentType> = new Map();

  private constructor() {
    this.initializeAgents();
    this.initializeMessagePatterns();
  }

  static getInstance(): AgentService {
    if (!AgentService.instance) {
      AgentService.instance = new AgentService();
    }
    return AgentService.instance;
  }

  /**
   * Initialize available AI agents
   */
  private initializeAgents(): void {
    this.agents.set(AgentType.CROP_DISEASE, {
      type: AgentType.CROP_DISEASE,
      name: 'Crop Disease Oracle',
      description: 'AI-powered crop disease detection and treatment recommendations',
      capabilities: [
        'Visual disease identification',
        'Treatment recommendations',
        'Economic impact analysis',
        'Prevention strategies'
      ],
      confidence: 0.95,
      isAvailable: true
    });

    this.agents.set(AgentType.WEATHER, {
      type: AgentType.WEATHER,
      name: 'Weather Intelligence Agent',
      description: 'Agricultural weather analysis and forecasting',
      capabilities: [
        'Weather forecasting',
        'Planting recommendations',
        'Risk assessment',
        'Irrigation planning'
      ],
      confidence: 0.88,
      isAvailable: true
    });

    this.agents.set(AgentType.FIELD_BRAIN, {
      type: AgentType.FIELD_BRAIN,
      name: 'Field Brain Agent',
      description: 'Satellite field analysis and monitoring',
      capabilities: [
        'NDVI analysis',
        'Field health monitoring',
        'Yield prediction',
        'Growth stage detection'
      ],
      confidence: 0.92,
      isAvailable: true
    });

    this.agents.set(AgentType.MARKET_INTELLIGENCE, {
      type: AgentType.MARKET_INTELLIGENCE,
      name: 'Market Intelligence Engine',
      description: 'Agricultural market analysis and price optimization',
      capabilities: [
        'Price forecasting',
        'Market trends',
        'Demand analysis',
        'Selling recommendations'
      ],
      confidence: 0.85,
      isAvailable: true
    });

    this.agents.set(AgentType.CROP_RECOMMENDATIONS, {
      type: AgentType.CROP_RECOMMENDATIONS,
      name: 'Crop Recommendation Specialist',
      description: 'AI-powered crop selection and rotation planning',
      capabilities: [
        'Crop suitability analysis',
        'Rotation planning',
        'Economic viability',
        'Climate adaptation'
      ],
      confidence: 0.90,
      isAvailable: true
    });

    this.agents.set(AgentType.GENERAL_FARMING, {
      type: AgentType.GENERAL_FARMING,
      name: 'General Farming Assistant',
      description: 'General agricultural knowledge and best practices',
      capabilities: [
        'Farming best practices',
        'General advice',
        'Resource recommendations',
        'Problem solving'
      ],
      confidence: 0.80,
      isAvailable: true
    });
  }

  /**
   * Initialize message routing patterns
   */
  private initializeMessagePatterns(): void {
    // Disease-related patterns
    this.messagePatterns.set(/\b(disease|sick|pest|bug|infection|fungus|blight|rot|spot|wilt)\b/i, AgentType.CROP_DISEASE);
    this.messagePatterns.set(/\b(leaf|leaves|stem|root|fruit|plant)\s+(problem|issue|damage|yellow|brown|black)\b/i, AgentType.CROP_DISEASE);
    
    // Weather-related patterns
    this.messagePatterns.set(/\b(weather|rain|drought|temperature|climate|season|forecast)\b/i, AgentType.WEATHER);
    this.messagePatterns.set(/\b(when\s+to\s+plant|planting\s+time|irrigation|water)\b/i, AgentType.WEATHER);
    
    // Field monitoring patterns
    this.messagePatterns.set(/\b(field|satellite|ndvi|monitoring|growth|yield|harvest)\b/i, AgentType.FIELD_BRAIN);
    this.messagePatterns.set(/\b(how\s+is\s+my\s+field|field\s+health|crop\s+progress)\b/i, AgentType.FIELD_BRAIN);
    
    // Market-related patterns
    this.messagePatterns.set(/\b(price|market|sell|buy|profit|demand|supply|cost)\b/i, AgentType.MARKET_INTELLIGENCE);
    this.messagePatterns.set(/\b(when\s+to\s+sell|market\s+price|best\s+price)\b/i, AgentType.MARKET_INTELLIGENCE);
    
    // Crop recommendation patterns
    this.messagePatterns.set(/\b(what\s+to\s+plant|crop\s+recommendation|best\s+crop|rotation)\b/i, AgentType.CROP_RECOMMENDATIONS);
    this.messagePatterns.set(/\b(which\s+crop|suitable\s+crop|crop\s+selection)\b/i, AgentType.CROP_RECOMMENDATIONS);
  }

  /**
   * Route message to appropriate AI agent
   */
  async routeMessage(
    message: string,
    context: FarmContext,
    imageBase64?: string
  ): Promise<AgentResponse> {
    const startTime = Date.now();
    
    try {
      // Determine the best agent for this message
      const agentType = this.determineAgent(message, imageBase64);
      const agent = this.agents.get(agentType);
      
      if (!agent || !agent.isAvailable) {
        throw new Error(`Agent ${agentType} is not available`);
      }

      // Route to specific agent
      let response: AgentResponse;
      
      switch (agentType) {
        case AgentType.CROP_DISEASE:
          response = await this.handleCropDiseaseQuery(message, context, imageBase64);
          break;
        case AgentType.WEATHER:
          response = await this.handleWeatherQuery(message, context);
          break;
        case AgentType.FIELD_BRAIN:
          response = await this.handleFieldBrainQuery(message, context);
          break;
        case AgentType.MARKET_INTELLIGENCE:
          response = await this.handleMarketQuery(message, context);
          break;
        case AgentType.CROP_RECOMMENDATIONS:
          response = await this.handleCropRecommendationQuery(message, context);
          break;
        default:
          response = await this.handleGeneralFarmingQuery(message, context);
      }

      // Add processing metadata
      response.metadata.processingTime = Date.now() - startTime;
      response.timestamp = new Date().toISOString();

      return response;
    } catch (error) {
      console.error('Agent routing error:', error);
      
      // Fallback response
      return this.generateFallbackResponse(message, context, Date.now() - startTime);
    }
  }

  /**
   * Determine the best agent for a message
   */
  private determineAgent(message: string, imageBase64?: string): AgentType {
    // If there's an image, likely a disease detection query
    if (imageBase64) {
      return AgentType.CROP_DISEASE;
    }

    // Check message patterns
    for (const [pattern, agentType] of this.messagePatterns) {
      if (pattern.test(message)) {
        return agentType;
      }
    }

    // Default to general farming
    return AgentType.GENERAL_FARMING;
  }

  /**
   * Handle crop disease queries
   */
  private async handleCropDiseaseQuery(
    message: string,
    context: FarmContext,
    imageBase64?: string
  ): Promise<AgentResponse> {
    try {
      if (imageBase64) {
        // Use CropDiseaseOracle for image analysis
        const diagnosis = await cropDiseaseOracle.diagnoseFromImage(
          imageBase64,
          context.currentCrops?.[0] || 'unknown',
          context.location
        );

        return {
          id: `disease-${Date.now()}`,
          content: this.formatDiseaseResponse(diagnosis),
          confidence: diagnosis.confidence / 100,
          agentType: AgentType.CROP_DISEASE,
          metadata: {
            processingTime: 0,
            dataQuality: 0.9,
            sources: ['PlantNet API', 'Gemini AI'],
            reasoning: `Analyzed crop image using AI vision and identified ${diagnosis.disease_name} with ${diagnosis.confidence}% confidence`,
            suggestions: diagnosis.immediate_actions
          },
          timestamp: new Date().toISOString()
        };
      } else {
        // Text-based disease query
        return await this.callEdgeFunction('crop-disease-chat', {
          message,
          context,
          agentType: AgentType.CROP_DISEASE
        });
      }
    } catch (error) {
      console.error('Crop disease query error:', error);
      return this.generateAgentFallback(AgentType.CROP_DISEASE, message, context);
    }
  }

  /**
   * Handle weather queries
   */
  private async handleWeatherQuery(message: string, context: FarmContext): Promise<AgentResponse> {
    try {
      return await this.callEdgeFunction('weather-agent', {
        message,
        context,
        agentType: AgentType.WEATHER
      });
    } catch (error) {
      console.error('Weather query error:', error);
      return this.generateAgentFallback(AgentType.WEATHER, message, context);
    }
  }

  /**
   * Handle field brain queries
   */
  private async handleFieldBrainQuery(message: string, context: FarmContext): Promise<AgentResponse> {
    try {
      return await this.callEdgeFunction('field-brain-agent', {
        message,
        context,
        agentType: AgentType.FIELD_BRAIN
      });
    } catch (error) {
      console.error('Field brain query error:', error);
      return this.generateAgentFallback(AgentType.FIELD_BRAIN, message, context);
    }
  }

  /**
   * Handle market intelligence queries
   */
  private async handleMarketQuery(message: string, context: FarmContext): Promise<AgentResponse> {
    try {
      return await this.callEdgeFunction('market-intelligence-agent', {
        message,
        context,
        agentType: AgentType.MARKET_INTELLIGENCE
      });
    } catch (error) {
      console.error('Market query error:', error);
      return this.generateAgentFallback(AgentType.MARKET_INTELLIGENCE, message, context);
    }
  }

  /**
   * Handle crop recommendation queries
   */
  private async handleCropRecommendationQuery(message: string, context: FarmContext): Promise<AgentResponse> {
    try {
      return await this.callEdgeFunction('crop-recommendations-chat', {
        message,
        context,
        agentType: AgentType.CROP_RECOMMENDATIONS
      });
    } catch (error) {
      console.error('Crop recommendation query error:', error);
      return this.generateAgentFallback(AgentType.CROP_RECOMMENDATIONS, message, context);
    }
  }

  /**
   * Handle general farming queries
   */
  private async handleGeneralFarmingQuery(message: string, context: FarmContext): Promise<AgentResponse> {
    try {
      return await this.callEdgeFunction('general-farming-agent', {
        message,
        context,
        agentType: AgentType.GENERAL_FARMING
      });
    } catch (error) {
      console.error('General farming query error:', error);
      return this.generateAgentFallback(AgentType.GENERAL_FARMING, message, context);
    }
  }

  /**
   * Call Supabase Edge Function for AI processing
   */
  private async callEdgeFunction(functionName: string, payload: any): Promise<AgentResponse> {
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: payload
    });

    if (error) {
      throw new Error(`Edge function error: ${error.message}`);
    }

    return data as AgentResponse;
  }

  /**
   * Format disease diagnosis response
   */
  private formatDiseaseResponse(diagnosis: any): string {
    return `🔍 **Disease Analysis Complete**

**Identified Issue:** ${diagnosis.disease_name}
**Confidence:** ${diagnosis.confidence}%
**Severity:** ${diagnosis.severity}

**Immediate Actions:**
${diagnosis.immediate_actions.map((action: string) => `• ${action}`).join('\n')}

**Treatment Options:**
**Organic Solutions:**
${diagnosis.organic_solutions.map((solution: string) => `• ${solution}`).join('\n')}

**Inorganic Solutions:**
${diagnosis.inorganic_solutions.map((solution: string) => `• ${solution}`).join('\n')}

**Economic Impact:**
• Potential yield loss: ${diagnosis.economic_impact.yield_loss_percentage}%
• Estimated revenue loss: $${diagnosis.economic_impact.revenue_loss_usd}
• Treatment cost: $${diagnosis.economic_impact.treatment_cost_usd}

**Recovery Timeline:** ${diagnosis.recovery_timeline}`;
  }

  /**
   * Generate agent-specific fallback response
   */
  private generateAgentFallback(agentType: AgentType, message: string, context: FarmContext): AgentResponse {
    const agent = this.agents.get(agentType);
    const fallbackResponses = {
      [AgentType.CROP_DISEASE]: "I'm having trouble accessing the disease detection system right now. For immediate help, please consult your local agricultural extension officer or take clear photos of affected plants to share with farming experts in your area.",
      [AgentType.WEATHER]: "Weather data is temporarily unavailable. Please check your local weather service or agricultural radio broadcasts for current conditions and forecasts.",
      [AgentType.FIELD_BRAIN]: "Field monitoring services are currently offline. Consider doing a visual inspection of your fields and noting any changes in crop color, growth, or health.",
      [AgentType.MARKET_INTELLIGENCE]: "Market data is temporarily unavailable. Check with local markets, cooperatives, or agricultural price information services for current pricing.",
      [AgentType.CROP_RECOMMENDATIONS]: "Crop recommendation services are temporarily offline. Consider consulting with local agricultural experts or extension officers for crop selection advice.",
      [AgentType.GENERAL_FARMING]: "I'm experiencing technical difficulties. For general farming advice, please consult local agricultural resources, extension services, or experienced farmers in your community."
    };

    return {
      id: `fallback-${Date.now()}`,
      content: fallbackResponses[agentType] || fallbackResponses[AgentType.GENERAL_FARMING],
      confidence: 0.3,
      agentType,
      metadata: {
        processingTime: 0,
        dataQuality: 0.3,
        sources: ['fallback'],
        reasoning: 'Service temporarily unavailable, providing fallback response',
        suggestions: ['Try again later', 'Consult local agricultural experts']
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Generate general fallback response
   */
  private generateFallbackResponse(message: string, context: FarmContext, processingTime: number): AgentResponse {
    return {
      id: `fallback-${Date.now()}`,
      content: "I'm experiencing technical difficulties right now. Please try again in a few moments, or contact local agricultural support services for immediate assistance.",
      confidence: 0.2,
      agentType: AgentType.GENERAL_FARMING,
      metadata: {
        processingTime,
        dataQuality: 0.2,
        sources: ['fallback'],
        reasoning: 'System error, providing fallback response',
        suggestions: ['Try again later', 'Contact local support']
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get available agents
   */
  getAvailableAgents(): Agent[] {
    return Array.from(this.agents.values()).filter(agent => agent.isAvailable);
  }

  /**
   * Get agent by type
   */
  getAgent(type: AgentType): Agent | undefined {
    return this.agents.get(type);
  }

  /**
   * Calculate confidence score for response
   */
  getConfidenceScore(response: AgentResponse): number {
    return response.confidence;
  }

  /**
   * Update agent availability
   */
  updateAgentAvailability(type: AgentType, isAvailable: boolean): void {
    const agent = this.agents.get(type);
    if (agent) {
      agent.isAvailable = isAvailable;
    }
  }
}

// Export singleton instance
export const agentService = AgentService.getInstance();