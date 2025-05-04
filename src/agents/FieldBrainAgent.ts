
import { Field } from "@/types/field";
import { WeatherData } from "@/types/supabase";
import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Types for our agent
export type FieldInsightType = "observation" | "suggestion" | "alert" | "summary";

export interface FieldInsight {
  id: string;
  fieldId: string;
  timestamp: number;
  type: FieldInsightType;
  content: string;
  confidence: number;
  source: 'agent' | 'weather' | 'scan' | 'user' | 'system';
  actionRequired?: boolean;
  actionTaken?: boolean;
  relatedData?: Record<string, any>;
}

export interface AgentMemory {
  id: string;
  fieldId: string;
  insights: FieldInsight[];
  lastSync: number;
  fieldContext: Record<string, any>;
  userPreferences: {
    voiceStyle: 'wise' | 'expert' | 'funny';
    language: string;
    notificationLevel: 'all' | 'important' | 'critical';
  };
}

interface FieldBrainDB extends DBSchema {
  memory: {
    key: string;
    value: AgentMemory;
    indexes: { 'by-field': string };
  };
  insights: {
    key: string;
    value: FieldInsight;
    indexes: { 'by-field': string; 'by-timestamp': number };
  };
}

class FieldBrainAgent {
  private db: IDBPDatabase<FieldBrainDB> | null = null;
  private currentField: Field | null = null;
  private currentWeather: WeatherData | null = null;
  private memoryCache: Map<string, AgentMemory> = new Map();
  private isOnline: boolean = navigator.onLine;
  private isInitialized: boolean = false;
  private listeners: Set<(insight: FieldInsight) => void> = new Set();

  // Singleton pattern
  private static instance: FieldBrainAgent;
  
  private constructor() {
    // Initialize network status listener
    window.addEventListener('online', this.handleNetworkChange);
    window.addEventListener('offline', this.handleNetworkChange);
  }

  public static getInstance(): FieldBrainAgent {
    if (!FieldBrainAgent.instance) {
      FieldBrainAgent.instance = new FieldBrainAgent();
    }
    return FieldBrainAgent.instance;
  }

  /**
   * Initialize the agent with database and defaults
   */
  public async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;
    
    try {
      console.log("🧠 Initializing FieldBrain Agent");
      this.db = await openDB<FieldBrainDB>('fieldBrainDB', 1, {
        upgrade(db) {
          // Create object stores for agent memory and insights
          const memoryStore = db.createObjectStore('memory', { keyPath: 'id' });
          memoryStore.createIndex('by-field', 'fieldId');
          
          const insightsStore = db.createObjectStore('insights', { keyPath: 'id' });
          insightsStore.createIndex('by-field', 'fieldId');
          insightsStore.createIndex('by-timestamp', 'timestamp');
        }
      });
      this.isInitialized = true;
      console.log("✅ FieldBrain Agent initialized");
      return true;
    } catch (error) {
      console.error("Failed to initialize FieldBrain Agent:", error);
      return false;
    }
  }

  /**
   * Set the current field context for the agent
   */
  public async setField(field: Field): Promise<void> {
    this.currentField = field;
    await this.loadMemory(field.id);
    console.log(`🧠 FieldBrain now focused on field: ${field.name}`);
    
    // Generate initial insights if none exist
    const memory = this.memoryCache.get(field.id);
    if (!memory || memory.insights.length === 0) {
      await this.generateInitialInsights(field);
    }
  }

  /**
   * Set current weather data for context
   */
  public setWeather(weather: WeatherData): void {
    this.currentWeather = weather;
    if (this.currentField) {
      this.updateFieldContext(this.currentField.id, { currentWeather: weather });
    }
  }

  /**
   * Load memory for a specific field
   */
  private async loadMemory(fieldId: string): Promise<AgentMemory> {
    if (!this.db) await this.initialize();
    
    try {
      // Try to get from cache first
      if (this.memoryCache.has(fieldId)) {
        return this.memoryCache.get(fieldId)!;
      }
      
      // Try to get from IndexedDB
      let memory = await this.db!.get('memory', fieldId);
      
      // If not found, create new memory
      if (!memory) {
        memory = {
          id: fieldId,
          fieldId: fieldId,
          insights: [],
          lastSync: Date.now(),
          fieldContext: {},
          userPreferences: {
            voiceStyle: 'wise',
            language: 'en',
            notificationLevel: 'important'
          }
        };
        await this.db!.put('memory', memory);
      }
      
      // Load all insights for this field
      const insights = await this.db!.getAllFromIndex('insights', 'by-field', fieldId);
      memory.insights = insights;
      
      // Store in cache
      this.memoryCache.set(fieldId, memory);
      return memory;
    } catch (error) {
      console.error(`Failed to load memory for field ${fieldId}:`, error);
      // Return a default memory object
      const defaultMemory: AgentMemory = {
        id: fieldId,
        fieldId: fieldId,
        insights: [],
        lastSync: Date.now(),
        fieldContext: {},
        userPreferences: {
          voiceStyle: 'wise',
          language: 'en',
          notificationLevel: 'important'
        }
      };
      this.memoryCache.set(fieldId, defaultMemory);
      return defaultMemory;
    }
  }

  /**
   * Generate initial insights based on field data when a farmer first adds a field
   */
  private async generateInitialInsights(field: Field): Promise<void> {
    // Generate welcome message
    const welcomeInsight: FieldInsight = {
      id: `welcome-${Date.now()}`,
      fieldId: field.id,
      timestamp: Date.now(),
      type: "observation",
      content: `Welcome to your new field "${field.name}"! I'll help you manage this ${field.size} ${field.size_unit} farm land. Let me know what you're planning to grow here.`,
      confidence: 1,
      source: 'agent',
      actionRequired: false
    };
    
    // Generate soil type insight if available
    if (field.soil_type) {
      const soilInsight = this.generateSoilTypeInsight(field);
      await this.addInsight(soilInsight);
    }
    
    // Generate irrigation insight if available
    if (field.irrigation_type) {
      const irrigationInsight = this.generateIrrigationInsight(field);
      await this.addInsight(irrigationInsight);
    }
    
    await this.addInsight(welcomeInsight);
  }

  /**
   * Generate soil type insight
   */
  private generateSoilTypeInsight(field: Field): FieldInsight {
    const soilTypeMap: Record<string, string> = {
      'clay': 'Clay soil holds water well but can be heavy. Great for rice and certain vegetables.',
      'sandy': 'Sandy soil drains quickly. Good for root vegetables and drought-resistant crops.',
      'loamy': 'Loamy soil is ideal for most crops! You have excellent growing conditions.',
      'silt': 'Silty soil is fertile and holds moisture well. Excellent for market gardening.',
      'peaty': 'Peaty soil is acidic but rich in organic matter. Good for acid-loving crops.'
    };
    
    const soilAdvice = soilTypeMap[field.soil_type?.toLowerCase() || ''] || 
      `Your ${field.soil_type} soil has unique properties. I'll help you choose crops that grow well in it.`;
    
    return {
      id: `soil-${Date.now()}`,
      fieldId: field.id,
      timestamp: Date.now(),
      type: "observation",
      content: soilAdvice,
      confidence: 0.9,
      source: 'agent',
      actionRequired: false
    };
  }

  /**
   * Generate irrigation insight
   */
  private generateIrrigationInsight(field: Field): FieldInsight {
    const irrigationTypeMap: Record<string, string> = {
      'drip': 'Drip irrigation is water-efficient! Perfect for vegetables and tree crops.',
      'sprinkler': 'Your sprinkler system works well for even coverage. Monitor for water efficiency.',
      'flood': 'Flood irrigation is good for rice and similar crops. Watch for water conservation.',
      'manual': 'Manual irrigation requires careful planning. I can help you schedule watering times.',
      'rain-fed': 'Being rain-fed means watching weather closely. I\'ll alert you about rainfall patterns.'
    };
    
    const irrigationAdvice = irrigationTypeMap[field.irrigation_type?.toLowerCase() || ''] || 
      `Your ${field.irrigation_type} irrigation system will need specific management strategies.`;
    
    return {
      id: `irrigation-${Date.now()}`,
      fieldId: field.id,
      timestamp: Date.now(),
      type: "observation",
      content: irrigationAdvice,
      confidence: 0.85,
      source: 'agent',
      actionRequired: false
    };
  }

  /**
   * Add a new insight to agent memory
   */
  public async addInsight(insight: FieldInsight): Promise<void> {
    if (!this.db) await this.initialize();
    
    try {
      // Store in database
      await this.db!.put('insights', insight);
      
      // Update memory cache
      const fieldId = insight.fieldId;
      if (!this.memoryCache.has(fieldId)) {
        await this.loadMemory(fieldId);
      }
      
      const memory = this.memoryCache.get(fieldId)!;
      memory.insights.push(insight);
      memory.lastSync = Date.now();
      
      // Notify listeners
      this.notifyListeners(insight);
      
      // Try to sync if online
      if (this.isOnline) {
        this.syncWithServer(fieldId).catch(err => 
          console.error("Failed to sync insight with server:", err)
        );
      }
    } catch (error) {
      console.error("Failed to add insight:", error);
    }
  }

  /**
   * Generate a contextual suggestion based on field state
   */
  public async suggestAction(fieldId: string): Promise<FieldInsight | null> {
    if (!this.db) await this.initialize();
    
    // Load memory if needed
    if (!this.memoryCache.has(fieldId)) {
      await this.loadMemory(fieldId);
    }
    
    const memory = this.memoryCache.get(fieldId);
    if (!memory) return null;
    
    // Get field information
    const field = this.currentField?.id === fieldId ? 
      this.currentField : 
      await this.getFieldById(fieldId);
    
    if (!field) return null;
    
    // Generate suggestion based on field context, season, weather
    const suggestion = this.generateSuggestion(field, memory);
    
    // Add the suggestion to memory
    await this.addInsight(suggestion);
    
    return suggestion;
  }

  /**
   * Generate a weekly summary for the field
   */
  public async generateWeeklySummary(fieldId: string): Promise<FieldInsight | null> {
    if (!this.db) await this.initialize();
    
    // Load memory if needed
    if (!this.memoryCache.has(fieldId)) {
      await this.loadMemory(fieldId);
    }
    
    const memory = this.memoryCache.get(fieldId);
    if (!memory) return null;
    
    // Get recent insights (last 7 days)
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentInsights = memory.insights.filter(i => i.timestamp >= oneWeekAgo);
    
    // Generate summary content
    let summaryContent = "📊 Your Weekly Farm Summary:\n\n";
    
    // Get field information
    const field = this.currentField?.id === fieldId ? 
      this.currentField : 
      await this.getFieldById(fieldId);
    
    if (!field) return null;
    
    // Add field name and size
    summaryContent += `Field: ${field.name} (${field.size} ${field.size_unit})\n\n`;
    
    // Add insights summary
    if (recentInsights.length > 0) {
      const alerts = recentInsights.filter(i => i.type === "alert").length;
      const suggestions = recentInsights.filter(i => i.type === "suggestion").length;
      const observations = recentInsights.filter(i => i.type === "observation").length;
      
      summaryContent += `This week: ${alerts} alerts, ${suggestions} suggestions, and ${observations} observations.\n\n`;
      
      // Add top priority item
      const actionItems = recentInsights.filter(i => i.actionRequired && !i.actionTaken);
      if (actionItems.length > 0) {
        summaryContent += "🔴 Top priority: " + actionItems[0].content + "\n\n";
      }
    } else {
      summaryContent += "No activity recorded this week. Let's start tracking your farm progress!\n\n";
    }
    
    // Add next steps suggestion
    summaryContent += "Next Steps: " + this.getNextStepsSuggestion(field);
    
    // Create summary insight
    const summary: FieldInsight = {
      id: `summary-${Date.now()}`,
      fieldId,
      timestamp: Date.now(),
      type: "summary",
      content: summaryContent,
      confidence: 0.95,
      source: 'agent',
      actionRequired: false
    };
    
    // Add to memory
    await this.addInsight(summary);
    
    return summary;
  }

  /**
   * Get insights for a field with pagination
   */
  public async getInsights(
    fieldId: string, 
    options: { limit?: number; offset?: number; type?: string } = {}
  ): Promise<FieldInsight[]> {
    if (!this.db) await this.initialize();
    
    // Set defaults
    const limit = options.limit || 10;
    const offset = options.offset || 0;
    const type = options.type;
    
    try {
      if (!this.memoryCache.has(fieldId)) {
        await this.loadMemory(fieldId);
      }
      
      const memory = this.memoryCache.get(fieldId);
      if (!memory) return [];
      
      let insights = memory.insights;
      
      // Filter by type if specified
      if (type) {
        insights = insights.filter(i => i.type === type as FieldInsightType);
      }
      
      // Sort by timestamp descending (newest first)
      insights = insights.sort((a, b) => b.timestamp - a.timestamp);
      
      // Apply pagination
      return insights.slice(offset, offset + limit);
    } catch (error) {
      console.error("Failed to retrieve insights:", error);
      return [];
    }
  }

  /**
   * Update field context with new data
   */
  private async updateFieldContext(fieldId: string, contextData: Record<string, any>): Promise<void> {
    if (!this.memoryCache.has(fieldId)) {
      await this.loadMemory(fieldId);
    }
    
    const memory = this.memoryCache.get(fieldId);
    if (!memory) return;
    
    memory.fieldContext = { ...memory.fieldContext, ...contextData };
    memory.lastSync = Date.now();
  }

  /**
   * Generate a suggestion based on field data
   */
  private generateSuggestion(field: Field, memory: AgentMemory): FieldInsight {
    // In a real implementation, this would use more sophisticated logic or ML
    const today = new Date();
    const month = today.getMonth();
    const suggestions = [
      {
        id: `suggestion-${Date.now()}-1`,
        fieldId: field.id,
        timestamp: Date.now(),
        type: "suggestion" as FieldInsightType,
        content: "Rain expected tomorrow. Consider delaying any planned spraying until drier weather.",
        confidence: 0.87,
        source: 'agent',
        actionRequired: true,
        relatedData: { weatherForecast: 'rain' }
      },
      {
        id: `suggestion-${Date.now()}-2`,
        fieldId: field.id,
        timestamp: Date.now(),
        type: "suggestion" as FieldInsightType,
        content: "Your soil looks dry based on recent weather. Consider irrigation in the next 48 hours.",
        confidence: 0.82,
        source: 'agent',
        actionRequired: true,
        relatedData: { soilMoisture: 'low' }
      },
      {
        id: `suggestion-${Date.now()}-3`,
        fieldId: field.id,
        timestamp: Date.now(),
        type: "suggestion" as FieldInsightType,
        content: "Perfect planting conditions this week! The soil temperature and moisture are ideal.",
        confidence: 0.91,
        source: 'agent',
        actionRequired: false,
        relatedData: { soilConditions: 'optimal' }
      },
      {
        id: `suggestion-${Date.now()}-4`,
        fieldId: field.id,
        timestamp: Date.now(),
        type: "alert" as FieldInsightType,
        content: "Disease risk is high due to recent humidity. Check crops for early signs of fungal infection.",
        confidence: 0.79,
        source: 'agent',
        actionRequired: true,
        relatedData: { diseaseRisk: 'high' }
      },
      {
        id: `suggestion-${Date.now()}-5`,
        fieldId: field.id,
        timestamp: Date.now(),
        type: "observation" as FieldInsightType,
        content: "Market prices for your crops are trending upward. Consider timing your harvest to maximize profits.",
        confidence: 0.85,
        source: 'agent',
        actionRequired: false,
        relatedData: { marketTrend: 'rising' }
      }
    ];
    
    // Select suggestion based on month (simplified logic for now)
    const index = month % suggestions.length;
    return suggestions[index];
  }

  /**
   * Get next steps suggestion based on field
   */
  private getNextStepsSuggestion(field: Field): string {
    const suggestions = [
      "Check for pests in the early morning when they're most visible.",
      "Update your crop calendar to stay on track with planting and harvesting.",
      "Consider soil testing to optimize your fertilizer application.",
      "Review your irrigation system efficiency before peak growing season.",
      "Plan for crop rotation to maintain soil health and reduce pest pressure.",
      "Document any unusual plant symptoms with photos for better diagnosis."
    ];
    
    return suggestions[Math.floor(Math.random() * suggestions.length)];
  }

  /**
   * Get a field by ID (this would normally query your fields store)
   */
  private async getFieldById(fieldId: string): Promise<Field | null> {
    // In a real implementation, this would fetch from your field store
    // For now, just return the current field if IDs match
    if (this.currentField?.id === fieldId) {
      return this.currentField;
    }
    
    // Simulated field lookup
    console.log(`Would fetch field ${fieldId} from store`);
    return null;
  }

  /**
   * Sync with server when online
   */
  private async syncWithServer(fieldId: string): Promise<void> {
    // In a real implementation, this would sync with your backend
    console.log(`Would sync field ${fieldId} insights with server`);
    
    // Mark memory as synced
    const memory = this.memoryCache.get(fieldId);
    if (memory) {
      memory.lastSync = Date.now();
    }
  }

  /**
   * Update AI voice style preference
   */
  public async setVoiceStyle(fieldId: string, style: 'wise' | 'expert' | 'funny'): Promise<void> {
    if (!this.memoryCache.has(fieldId)) {
      await this.loadMemory(fieldId);
    }
    
    const memory = this.memoryCache.get(fieldId);
    if (!memory) return;
    
    memory.userPreferences.voiceStyle = style;
  }

  /**
   * Get AI voice style preference
   */
  public async getVoiceStyle(fieldId: string): Promise<'wise' | 'expert' | 'funny'> {
    if (!this.memoryCache.has(fieldId)) {
      await this.loadMemory(fieldId);
    }
    
    const memory = this.memoryCache.get(fieldId);
    return memory?.userPreferences.voiceStyle || 'wise';
  }

  /**
   * Handle user question with agent response
   */
  public async askQuestion(fieldId: string, question: string): Promise<FieldInsight> {
    if (!this.db) await this.initialize();
    
    // Load memory if needed
    if (!this.memoryCache.has(fieldId)) {
      await this.loadMemory(fieldId);
    }
    
    // Get field information
    const field = this.currentField?.id === fieldId ? 
      this.currentField : 
      await this.getFieldById(fieldId);
    
    // Generate response using the voice style preference
    const voiceStyle = await this.getVoiceStyle(fieldId);
    const response = this.generateResponse(question, voiceStyle);
    
    // Create an insight from this interaction
    const insight: FieldInsight = {
      id: `qa-${Date.now()}`,
      fieldId,
      timestamp: Date.now(),
      type: "observation" as FieldInsightType,
      content: response,
      confidence: 0.9,
      source: 'agent',
      actionRequired: false,
      relatedData: {
        question,
        fieldName: field?.name || 'unknown field'
      }
    };
    
    // Store this interaction
    await this.addInsight(insight);
    
    return insight;
  }

  /**
   * Generate a response to user question
   */
  private generateResponse(question: string, voiceStyle: 'wise' | 'expert' | 'funny'): string {
    // Simple question matcher (in real app, would use NLP/LLM service if online)
    question = question.toLowerCase();
    
    let response = "";
    
    if (question.includes('when') && question.includes('plant')) {
      response = "The best planting time depends on your crop. For most vegetables, after the last frost is safest.";
    } else if (question.includes('pest') || question.includes('insect')) {
      response = "For pest management, first identify the specific pest. Take a clear photo and I can help diagnose.";
    } else if (question.includes('fertilizer') || question.includes('nutrient')) {
      response = "Apply fertilizer early morning or late afternoon. Always water after application to prevent leaf burn.";
    } else if (question.includes('water') || question.includes('irrigation')) {
      response = "Water deeply but infrequently to encourage strong root growth. Early morning is usually best.";
    } else if (question.includes('harvest') || question.includes('yield')) {
      response = "Harvest timing affects both yield and quality. Most crops should be harvested early morning for freshness.";
    } else if (question.includes('weather') || question.includes('rain')) {
      response = "I'm monitoring weather patterns. Based on seasonal trends, prepare for typical rainfall next week.";
    } else {
      response = "That's an interesting question about your farm. Let me think about it more as I learn about your fields.";
    }
    
    // Add action step
    const actions = [
      "Try checking the crop leaves for signs of stress.",
      "Consider taking soil samples this week.",
      "Walk your field boundaries to spot any issues early.",
      "Document crop growth with weekly photos.",
      "Monitor irrigation effectiveness after watering."
    ];
    
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    
    // Format response based on voice style
    switch (voiceStyle) {
      case 'wise':
        return `${response}\n\nIn my years of experience, I would suggest: ${randomAction}`;
      case 'expert':
        return `According to agricultural research: ${response}\n\nRecommended action: ${randomAction}`;
      case 'funny':
        return `Well now, ${response}\n\nIf I were you (and I'm glad I'm not standing in manure), I'd ${randomAction} Haha!`;
      default:
        return `${response}\n\nNext step: ${randomAction}`;
    }
  }

  /**
   * Handle network status changes
   */
  private handleNetworkChange = (): void => {
    const wasOnline = this.isOnline;
    this.isOnline = navigator.onLine;
    
    if (!wasOnline && this.isOnline) {
      console.log("🌐 Network connection restored. Starting sync...");
      this.syncAllFields().catch(err => 
        console.error("Failed to sync fields after coming online:", err)
      );
    } else if (wasOnline && !this.isOnline) {
      console.log("📴 Network connection lost. Operating in offline mode.");
    }
  };

  /**
   * Sync all fields with server
   */
  private async syncAllFields(): Promise<void> {
    if (!this.db) await this.initialize();
    
    try {
      // Get all field IDs from memory cache
      const fieldIds = Array.from(this.memoryCache.keys());
      
      // Sync each field
      for (const fieldId of fieldIds) {
        await this.syncWithServer(fieldId);
      }
      
      console.log(`✅ Synced ${fieldIds.length} fields with server`);
    } catch (error) {
      console.error("Failed to sync all fields:", error);
    }
  }

  /**
   * Subscribe to new insights
   */
  public subscribe(listener: (insight: FieldInsight) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of new insight
   */
  private notifyListeners(insight: FieldInsight): void {
    this.listeners.forEach(listener => {
      try {
        listener(insight);
      } catch (error) {
        console.error("Error in insight listener:", error);
      }
    });
  }

  /**
   * Clean up resources
   */
  public cleanup(): void {
    window.removeEventListener('online', this.handleNetworkChange);
    window.removeEventListener('offline', this.handleNetworkChange);
    this.listeners.clear();
    if (this.db) {
      this.db.close();
      this.db = null;
    }
    this.isInitialized = false;
    console.log("🧠 FieldBrain Agent cleaned up");
  }
}

// Export singleton instance
export const fieldBrain = FieldBrainAgent.getInstance();
export default fieldBrain;
