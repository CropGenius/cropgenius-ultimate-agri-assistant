import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/services/supabaseClient";
import { toast } from "sonner";
import { AgentMemory, FieldInsight, FieldInsightSourceType, FieldInsightType } from '@/types/supabase';

/**
 * FieldBrainAgent - AI-powered farming assistant that provides personalized advice
 * based on field history, weather conditions, and crop data.
 */
export class FieldBrainAgent {
  private static instance: FieldBrainAgent;
  private userId: string | null = null;
  private fieldId: string | null = null;
  private memories: AgentMemory[] = [];
  private insights: FieldInsight[] = [];
  private ndviData: Map<string, {score: number, timestamp: number, healthStatus: string}> = new Map();
  private isInitialized = false;
  private isOnline = navigator.onLine;
  private syncInProgress = false;
  private lastSyncTime = 0;
  private voiceStyle: 'wise' | 'expert' | 'friendly' = 'friendly';
  private speechSynthesis: SpeechSynthesis | null = null;

  // Static method to get the singleton instance
  public static getInstance(): FieldBrainAgent {
    if (!FieldBrainAgent.instance) {
      FieldBrainAgent.instance = new FieldBrainAgent();
    }
    return FieldBrainAgent.instance;
  }

  private constructor() {
    // Initialize online status tracking
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
    
    // Initialize speech synthesis if available
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.speechSynthesis = window.speechSynthesis;
    }
    
    console.log("🧠 [FieldBrainAgent] Created");
  }

  /**
   * Initialize the FieldBrainAgent with a user ID
   */
  public async initialize(userId: string): Promise<boolean> {
    try {
      this.userId = userId;
      
      // Load memories from IndexedDB
      await this.loadFromLocalStorage();
      
      // Try to sync with server if online
      if (this.isOnline) {
        await this.syncWithServer();
      }
      
      this.isInitialized = true;
      console.log(`🧠 [FieldBrainAgent] Initialized for user: ${userId}`);
      
      // Add a system memory to record initialization
      this.addMemory({
        fieldId: 'system',
        content: `Agent initialized for user ${userId}`,
        source: 'system',
        timestamp: Date.now(),
        tags: ['system', 'initialization']
      });
      
      return true;
    } catch (error) {
      console.error("🧠 [FieldBrainAgent] Initialization failed:", error);
      return false;
    }
  }

  /**
   * Set the active field context for the agent
   */
  public setFieldContext(fieldId: string): void {
    this.fieldId = fieldId;
    console.log(`🧠 [FieldBrainAgent] Field context set to: ${fieldId}`);
    
    // Add a memory about switching field context
    this.addMemory({
      fieldId,
      content: `User switched to field ${fieldId}`,
      source: 'system',
      timestamp: Date.now(),
      tags: ['context-switch', 'field-change']
    });
  }

  /**
   * Set the voice style for the agent
   */
  public setVoiceStyle(style: 'wise' | 'expert' | 'friendly'): void {
    this.voiceStyle = style;
    console.log(`🧠 [FieldBrainAgent] Voice style set to: ${style}`);
    
    // Create a memory about the voice style change
    this.addMemory({
      fieldId: this.fieldId || 'system',
      content: `User changed voice style to ${style}`,
      source: 'system',
      timestamp: Date.now(),
      tags: ['settings', 'voice-style']
    });
  }

  /**
   * Ask the FieldBrain a question and get a response
   */
  public async ask(question: string): Promise<{ response: string; insight?: FieldInsight }> {
    if (!this.isInitialized) {
      return { response: "I'm still waking up. Please try again in a moment." };
    }
    
    try {
      // Record the user's question as a memory
      this.addMemory({
        fieldId: this.fieldId || 'general',
        content: `User asked: ${question}`,
        source: 'user',
        timestamp: Date.now(),
        tags: ['question']
      });
      
      // Get relevant memories for context
      const relevantMemories = this.getRelevantMemories(question);
      
      let response = '';
      
      // Check if we're online and can use the AI service
      if (this.isOnline) {
        try {
          // In a real implementation, this would call an AI service
          // For now, we'll generate a simple response based on the question
          response = this.generateLocalResponse(question, relevantMemories);
        } catch (error) {
          console.error("🧠 [FieldBrainAgent] Failed to get AI response:", error);
          // Fall back to local processing
          response = this.generateFallbackResponse(question);
        }
      } else {
        // Offline mode - use simple pattern matching
        response = this.generateOfflineResponse(question);
      }
      
      // Create an insight from this interaction
      const insight: FieldInsight = {
        id: uuidv4(),
        fieldId: this.fieldId || 'general',
        timestamp: Date.now(),
        type: 'suggestion' as FieldInsightType,
        content: response,
        confidence: 0.85,
        source: 'agent' as FieldInsightSourceType,
        actionRequired: false,
        relatedData: {}
      };
      
      // Save the insight
      this.insights.push(insight);
      this.saveToLocalStorage();
      
      // Save agent's response as a memory
      this.addMemory({
        fieldId: this.fieldId || 'general',
        content: `Agent responded: ${response}`,
        source: 'agent',
        timestamp: Date.now(),
        tags: ['response']
      });
      
      // Try to sync in the background
      this.syncWithServer().catch(error => {
        console.error("🧠 [FieldBrainAgent] Background sync failed:", error);
      });
      
      return { response, insight };
    } catch (error) {
      console.error("🧠 [FieldBrainAgent] Error processing question:", error);
      return { 
        response: "I'm having trouble thinking right now. Let's try again later."
      };
    }
  }

  /**
   * Get a suggested action based on field context and history
   */
  public getSuggestedAction(): { action: string; urgency: 'low' | 'medium' | 'high' } {
    if (!this.fieldId) {
      return { 
        action: "Select a field to get personalized advice",
        urgency: 'low'
      };
    }
    
    // In a real implementation, this would analyze field history, weather, etc.
    // For now, we'll return a simple suggestion
    const actions = [
      { action: "Check soil moisture levels after yesterday's rain", urgency: 'medium' as const },
      { action: "Consider applying fertilizer this week", urgency: 'low' as const },
      { action: "Inspect the northern edge for signs of pest activity", urgency: 'medium' as const },
      { action: "Review your harvest schedule for next week", urgency: 'low' as const },
      { action: "Weather forecast shows heavy rain - secure young plants", urgency: 'high' as const }
    ];
    
    return actions[Math.floor(Math.random() * actions.length)];
  }

  /**
   * Update NDVI data for a field from satellite imagery
   */
  public updateNDVIData(fieldId: string, ndviScore: number, healthStatus: string): void {
    this.ndviData.set(fieldId, {
      score: ndviScore,
      timestamp: Date.now(),
      healthStatus
    });
    
    // Add memory about NDVI update
    this.addMemory({
      fieldId,
      content: `NDVI score updated: ${ndviScore}% - ${healthStatus}`,
      source: 'satellite',
      timestamp: Date.now(),
      tags: ['ndvi', 'satellite', 'health']
    });
  }

  /**
   * Get the agent's assessment of field health (now using NDVI data)
   */
  public getFieldHealth(): { score: number; assessment: string } {
    if (!this.fieldId) {
      return { score: 0, assessment: "No field selected" };
    }
    
    // Use NDVI data if available
    const ndviData = this.ndviData.get(this.fieldId);
    if (ndviData && Date.now() - ndviData.timestamp < 7 * 24 * 60 * 60 * 1000) {
      return { 
        score: ndviData.score, 
        assessment: `Satellite analysis shows ${ndviData.healthStatus}. ${this.getHealthRecommendation(ndviData.score)}` 
      };
    }
    
    // Fallback to estimated score
    const score = 60 + Math.floor(Math.random() * 30);
    let assessment = "Your field is doing well overall.";
    if (score < 70) {
      assessment = "Your field needs some attention soon.";
    } else if (score > 85) {
      assessment = "Your field is thriving! Excellent work.";
    }
    
    return { score, assessment };
  }

  /**
   * Get health recommendation based on NDVI score
   */
  private getHealthRecommendation(ndviScore: number): string {
    if (ndviScore < 40) {
      return "Consider immediate intervention - check irrigation and soil nutrients.";
    } else if (ndviScore < 60) {
      return "Monitor closely and consider fertilizer application.";
    } else if (ndviScore < 80) {
      return "Good health - continue current practices.";
    } else {
      return "Excellent vegetation health - optimal growing conditions.";
    }
  }

  /**
   * Speak a message using the browser's speech synthesis
   */
  public speak(text: string): void {
    if (!this.speechSynthesis) {
      console.warn("🧠 [FieldBrainAgent] Speech synthesis not available");
      return;
    }
    
    // Cancel any ongoing speech
    this.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice characteristics based on selected style
    switch (this.voiceStyle) {
      case 'wise':
        utterance.pitch = 0.9;
        utterance.rate = 0.9;
        break;
      case 'expert':
        utterance.pitch = 1.1;
        utterance.rate = 1.1;
        break;
      case 'friendly':
        utterance.pitch = 1.0;
        utterance.rate = 1.0;
        break;
    }
    
    // Try to find a suitable voice in the user's language
    if (this.speechSynthesis.getVoices().length > 0) {
      const voices = this.speechSynthesis.getVoices();
      const userLanguage = navigator.language || 'en-US';
      const matchingVoice = voices.find(voice => voice.lang === userLanguage) || 
                            voices.find(voice => voice.lang.startsWith(userLanguage.split('-')[0])) ||
                            voices[0];
      
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }
    }
    
    // Speak the text
    this.speechSynthesis.speak(utterance);
  }

  /**
   * Add a memory to the agent's memory store
   */
  public addMemory(memory: Omit<AgentMemory, 'id'>): void {
    const newMemory: AgentMemory = {
      id: uuidv4(),
      ...memory
    };
    
    this.memories.push(newMemory);
    this.saveToLocalStorage();
    
    // Try to sync in the background
    if (this.isOnline) {
      this.syncWithServer().catch(error => {
        console.error("🧠 [FieldBrainAgent] Memory sync failed:", error);
      });
    }
  }

  /**
   * Add a field insight from an external source
   */
  public addInsight(insight: Omit<FieldInsight, 'id'>): FieldInsight {
    const newInsight: FieldInsight = {
      id: uuidv4(),
      ...insight
    };
    
    this.insights.push(newInsight);
    this.saveToLocalStorage();
    
    // Try to sync in the background
    if (this.isOnline) {
      this.syncWithServer().catch(error => {
        console.error("🧠 [FieldBrainAgent] Insight sync failed:", error);
      });
    }
    
    return newInsight;
  }

  /**
   * Get all insights for the current field
   */
  public getFieldInsights(fieldId?: string): FieldInsight[] {
    const targetFieldId = fieldId || this.fieldId;
    if (!targetFieldId) return [];
    
    return this.insights.filter(insight => 
      insight.fieldId === targetFieldId
    ).sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get recent agent memories
   */
  public getRecentMemories(limit: number = 10): AgentMemory[] {
    return [...this.memories]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Generate a weekly summary for the current field
   */
  public generateWeeklySummary(): FieldInsight {
    const fieldId = this.fieldId || 'general';
    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    
    // Get recent memories and insights for this field
    const recentFieldMemories = this.memories.filter(m => 
      m.fieldId === fieldId && m.timestamp > oneWeekAgo
    );
    
    // In a real implementation, this would analyze the memories and generate insights
    // For now, we'll create a simple summary
    const content = `Weekly Summary: Based on ${recentFieldMemories.length} observations this week, ` +
      `your field is doing well overall. Continue with your current management practices ` +
      `and consider planning for the upcoming seasonal changes.`;
    
    const summary: FieldInsight = {
      id: uuidv4(),
      fieldId,
      timestamp: now,
      type: 'summary' as FieldInsightType,
      content,
      confidence: 0.9,
      source: 'agent' as FieldInsightSourceType,
      actionRequired: false,
      relatedData: {
        weatherForecast: "Stable conditions expected for the next week."
      }
    };
    
    // Save the summary insight
    this.insights.push(summary);
    this.saveToLocalStorage();
    
    return summary;
  }

  /**
   * Clean up and prepare for shutdown
   */
  public shutdown(): void {
    // Remove event listeners
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    
    // Final sync attempt if online
    if (this.isOnline) {
      this.syncWithServer().catch(console.error);
    }
    
    console.log("🧠 [FieldBrainAgent] Shutdown complete");
  }

  /**
   * Handle coming online
   */
  private handleOnline = (): void => {
    this.isOnline = true;
    console.log("🧠 [FieldBrainAgent] Network connection restored");
    
    // Try to sync with server
    this.syncWithServer().catch(error => {
      console.error("🧠 [FieldBrainAgent] Sync on reconnect failed:", error);
    });
  };

  /**
   * Handle going offline
   */
  private handleOffline = (): void => {
    this.isOnline = false;
    console.log("🧠 [FieldBrainAgent] Network connection lost, switching to offline mode");
  };

  /**
   * Load memories and insights from local storage
   */
  private async loadFromLocalStorage(): Promise<void> {
    try {
      // Load memories
      const memoriesJson = localStorage.getItem(`fieldBrain_memories_${this.userId}`);
      if (memoriesJson) {
        this.memories = JSON.parse(memoriesJson);
      }
      
      // Load insights
      const insightsJson = localStorage.getItem(`fieldBrain_insights_${this.userId}`);
      if (insightsJson) {
        this.insights = JSON.parse(insightsJson);
      }
      
      console.log(`🧠 [FieldBrainAgent] Loaded ${this.memories.length} memories and ${this.insights.length} insights from local storage`);
    } catch (error) {
      console.error("🧠 [FieldBrainAgent] Error loading from local storage:", error);
      // Initialize with empty arrays if loading fails
      this.memories = [];
      this.insights = [];
    }
  }

  /**
   * Save memories and insights to local storage
   */
  private saveToLocalStorage(): void {
    try {
      // Save memories
      localStorage.setItem(
        `fieldBrain_memories_${this.userId}`, 
        JSON.stringify(this.memories)
      );
      
      // Save insights
      localStorage.setItem(
        `fieldBrain_insights_${this.userId}`, 
        JSON.stringify(this.insights)
      );
    } catch (error) {
      console.error("🧠 [FieldBrainAgent] Error saving to local storage:", error);
      
      // If we hit storage limits, prune older memories
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.pruneMemories();
        this.saveToLocalStorage(); // Try again after pruning
      }
    }
  }

  /**
   * Prune older memories to free up space
   */
  private pruneMemories(): void {
    if (this.memories.length > 100) {
      // Sort by timestamp (newest first) and keep the latest 100
      this.memories.sort((a, b) => b.timestamp - a.timestamp);
      this.memories = this.memories.slice(0, 100);
    }
    
    if (this.insights.length > 50) {
      // Sort by timestamp (newest first) and keep the latest 50
      this.insights.sort((a, b) => b.timestamp - a.timestamp);
      this.insights = this.insights.slice(0, 50);
    }
    
    console.log("🧠 [FieldBrainAgent] Pruned memories to save space");
  }

  /**
   * Sync memories and insights with server
   */
  private async syncWithServer(): Promise<void> {
    if (this.syncInProgress || !this.userId || !this.isOnline) return;
    
    // Prevent multiple simultaneous syncs
    this.syncInProgress = true;
    
    try {
      // Only sync if enough time has passed since last sync (rate limiting)
      const now = Date.now();
      if (now - this.lastSyncTime < 60000) {
        console.log("🧠 [FieldBrainAgent] Skipping sync (rate limited)");
        this.syncInProgress = false;
        return;
      }
      
      this.lastSyncTime = now;
      
      // In a real implementation, this would sync with the server
      // For now, we'll just simulate a successful sync
      console.log(`🧠 [FieldBrainAgent] Synced ${this.memories.length} memories and ${this.insights.length} insights`);
      
      // If this were real, we'd upload new memories/insights and download any new ones from the server
      
      this.syncInProgress = false;
    } catch (error) {
      console.error("🧠 [FieldBrainAgent] Sync failed:", error);
      this.syncInProgress = false;
    }
  }

  /**
   * Get memories relevant to a given query
   */
  private getRelevantMemories(query: string): AgentMemory[] {
    // In a real implementation, this would use semantic search
    // For now, we'll just do simple keyword matching
    const queryWords = query.toLowerCase().split(/\s+/);
    
    return this.memories
      .filter(memory => {
        const content = memory.content.toLowerCase();
        return queryWords.some(word => content.includes(word));
      })
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);
  }

  /**
   * Generate a response based on local pattern matching
   */
  private generateLocalResponse(question: string, relevantMemories: AgentMemory[]): string {
    const q = question.toLowerCase();
    
    // Simple pattern matching for common questions
    if (q.includes('weather') || q.includes('rain') || q.includes('forecast')) {
      return "The weather looks good for farming today. There's a slight chance of rain in the afternoon, which should help your crops.";
    }
    
    if (q.includes('plant') || q.includes('seed') || q.includes('sow')) {
      return "Now is a good time to plant maize and beans. Make sure the soil is well-prepared and wait until after the morning dew has dried.";
    }
    
    if (q.includes('fertilizer') || q.includes('nutrient') || q.includes('feed')) {
      return "Your crops could benefit from some additional nitrogen. Consider applying a balanced fertilizer in the next few days, preferably before it rains.";
    }
    
    if (q.includes('pest') || q.includes('insect') || q.includes('disease')) {
      return "I've noticed some reports of stem borers in the region. Inspect your crops carefully and consider using an integrated pest management approach.";
    }
    
    if (relevantMemories.length > 0) {
      // Try to generate a response based on memories
      return `Based on what I remember, ${relevantMemories[0].content.replace('User asked: ', '').replace('Agent responded: ', '')}`;
    }
    
    // Generic responses if no pattern matches
    const genericResponses = [
      "Your farm is looking healthy overall. Continue with your current practices and monitor for changes.",
      "Consider checking soil moisture levels today. The recent weather patterns suggest it might be getting dry.",
      "This is a good time to plan your next planting cycle. The seasonal forecast looks favorable.",
      "Remember to rotate your crops to maintain soil health and prevent pest buildups.",
      "Have you checked your irrigation system recently? Regular maintenance helps prevent problems later."
    ];
    
    return genericResponses[Math.floor(Math.random() * genericResponses.length)];
  }

  /**
   * Generate a fallback response when AI service fails
   */
  private generateFallbackResponse(question: string): string {
    return "I'm thinking about your question regarding " + 
      question.split(' ').slice(0, 3).join(' ') + "... " +
      "Let's discuss this more when I have better information.";
  }

  /**
   * Generate an offline-mode response
   */
  private generateOfflineResponse(question: string): string {
    return "I'm currently in offline mode with limited capabilities. " +
      "I've saved your question about " + 
      question.split(' ').slice(0, 3).join(' ') + 
      " and will provide a better answer when connection is restored.";
  }
}

export default FieldBrainAgent;
