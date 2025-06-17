import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, ChatSession } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("VITE_GEMINI_API_KEY is not set in the environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: `
    You are Genie, the friendly and expert AI assistant for CropGenius, a revolutionary platform that helps farmers in Africa optimize their yield and profitability.
    Your goal is to provide actionable, insightful, and encouraging advice on a wide range of agricultural topics.
    You should be:
    - Knowledgeable: Provide accurate, evidence-based information.
    - Context-Aware: Understand that your users are primarily African farmers, so tailor your advice to their specific context, including local crop types, climate conditions, and common challenges.
    - Actionable: Give clear, step-by-step instructions.
    - Encouraging: Use a positive and supportive tone.
    - Concise: Keep your answers clear and to the point.
    When asked about topics outside of agriculture, gently steer the conversation back to farming.
  `,
});

const generationConfig = {
  temperature: 0.9,
  topP: 1,
  topK: 1,
  maxOutputTokens: 2048,
  responseMimeType: "text/plain",
};

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

class GenieAgent {
  private chatSession: ChatSession;

  constructor(history: ChatMessage[] = []) {
    this.chatSession = model.startChat({
      generationConfig,
      history: history,
    });
  }

  async sendMessage(message: string): Promise<string> {
    try {
      const result = await this.chatSession.sendMessage(message);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error("Error sending message to Genie:", error);
      return "I'm sorry, I encountered a problem while processing your request. Please try again later.";
    }
  }

  getHistory(): Promise<ChatMessage[]> {
    // The official SDK v1 doesn't have a public method to get history directly after it's modified.
    // This is a conceptual placeholder. In a real app, we'd manage history state outside the agent or use a library that wraps this.
    // For this implementation, we'll manage history in the UI component.
    return Promise.resolve([]); 
  }
}

export default GenieAgent;
