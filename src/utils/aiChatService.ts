
// Utility file to handle AI chat communication
// In a production app, this would call Supabase Edge Functions to handle API calls securely

// Category types
export type ChatCategory = 'all' | 'crops' | 'diseases' | 'machinery' | 'market';

// Sample response data - in production this would call APIs like Gemini, GPT, etc.
const sampleResponses: Record<ChatCategory, string[]> = {
  all: [
    "Based on your question, I'd recommend rotating your crops each season to prevent soil depletion and reduce pest pressures. For your region, consider alternating between maize, legumes like beans, and cover crops.",
    "Looking at traditional and modern farming practices, I can tell you that intercropping maize with beans or cowpeas is highly effective in East Africa. It improves soil health, maximizes land use, and provides dietary diversity.",
    "The optimal time for planting in your region depends on the rainy season. For most crops in East Africa, planting should occur just before or at the start of the long rains (March-May) or short rains (October-December), depending on your specific location.",
  ],
  crops: [
    "For tomato cultivation in your climate, I recommend varieties like Money Maker or Rio Grande. Plant seedlings 45-60cm apart, ensure good drainage, and stake plants to prevent disease. Water consistently at the base to avoid leaf wetness.",
    "Looking at your soil conditions, apply a balanced NPK fertilizer during land preparation, followed by nitrogen-rich top dressing when maize reaches knee height. Consider additional micronutrients if you've noticed yellowing leaves.",
    "For drought tolerance in maize, varieties like DK8031, Duma 43, and KDV-6 have shown excellent results in Kenya. These varieties mature in 90-120 days and can withstand dry spells of up to 4 weeks during the growing season.",
  ],
  diseases: [
    "Based on your description of yellow, curling tomato leaves, this sounds like Tomato Yellow Leaf Curl Virus (TYLCV). It's spread by whiteflies. Control measures include using reflective mulches, neem-based insecticides for the vectors, and choosing resistant varieties for future plantings.",
    "For maize lethal necrosis disease management: 1) Practice crop rotation with non-cereal crops, 2) Use certified disease-free seeds, 3) Control insect vectors with appropriate insecticides, 4) Remove and destroy infected plants, and 5) Plant tolerant varieties like KH600-15A or KH600-14E.",
    "The black spots with yellow halos on bean leaves indicate Common Bacterial Blight. To manage: 1) Use disease-free certified seeds, 2) Practice crop rotation for 2-3 seasons, 3) Apply copper-based fungicides early, 4) Avoid working in fields when leaves are wet, and 5) Consider resistant varieties like KK8 or KATB1.",
  ],
  machinery: [
    "For a small-scale farm of 1-5 acres, I recommend starting with: 1) A multipurpose power tiller rather than a full tractor, 2) A backpack sprayer for pest control, 3) Basic hand tools for weeding and harvesting. This setup costs approximately 150,000-200,000 KES and is appropriate for your scale.",
    "When selecting irrigation equipment for your vegetable farm, drip irrigation is most efficient. For a quarter-acre, you'll need: 1) A 1,000L water tank, 2) Solar pump (Futurepump SF2 is appropriate), 3) Main line pipe, 4) Drip lines with appropriate emitters. This system uses 60% less water than sprinklers.",
    "For post-harvest maize processing, the multi-functional thresher by Zimplow or SARO Agro is suitable for your scale. It threshes 500-800kg per hour, works with multiple grains, and costs approximately 90,000-120,000 KES. Diesel models are more practical for rural areas with limited electricity.",
  ],
  market: [
    "Current market trends show maize prices averaging 3,200-3,800 KES per 90kg bag, with projections suggesting a 15-20% increase in the next 3 months due to regional supply shortages. Consider staggered selling to maximize profits.",
    "For your certified organic vegetables, direct market linkages with urban restaurants and supermarkets will yield 30-40% higher returns than traditional markets. Focus on consistent supply and quality packaging to meet their requirements.",
    "Based on current market data, contract farming for sorghum with East African Breweries offers the most stable returns this season - fixed price of 32 KES/kg and guaranteed purchase. Compare this with beans (fluctuating between 80-120 KES/kg) which have higher potential returns but greater market risk.",
  ],
};

// Function to generate realistic-looking AI responses
// In production, this would call an actual AI model through a secure endpoint
export const fetchAIResponse = async (
  userMessage: string,
  category: ChatCategory = 'all'
): Promise<string> => {
  // Simulate network request
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
  
  // Get relevant responses for the category
  const relevantResponses = sampleResponses[category];
  
  // Select a response based on some simple heuristics from the user message
  const lowerCaseMessage = userMessage.toLowerCase();
  
  // Simulate intelligent response selection based on keywords
  if (lowerCaseMessage.includes('tomato') || lowerCaseMessage.includes('disease')) {
    if (category === 'all' || category === 'diseases') {
      return sampleResponses.diseases[0];
    }
  }
  
  if (lowerCaseMessage.includes('maize') || lowerCaseMessage.includes('corn')) {
    if (category === 'diseases') {
      return sampleResponses.diseases[1];
    } else if (category === 'crops') {
      return sampleResponses.crops[2];
    }
  }
  
  if (lowerCaseMessage.includes('price') || lowerCaseMessage.includes('market') || lowerCaseMessage.includes('sell')) {
    if (category === 'all' || category === 'market') {
      return sampleResponses.market[0];
    }
  }
  
  if (lowerCaseMessage.includes('equipment') || lowerCaseMessage.includes('machinery') || lowerCaseMessage.includes('tool')) {
    if (category === 'all' || category === 'machinery') {
      return sampleResponses.machinery[0];
    }
  }
  
  if (lowerCaseMessage.includes('irrigation') || lowerCaseMessage.includes('water')) {
    if (category === 'all' || category === 'machinery') {
      return sampleResponses.machinery[1];
    }
  }
  
  if (lowerCaseMessage.includes('organic') || lowerCaseMessage.includes('vegetable')) {
    if (category === 'all' || category === 'market') {
      return sampleResponses.market[1];
    }
  }
  
  // If no specific match, just return a random response from the selected category
  return relevantResponses[Math.floor(Math.random() * relevantResponses.length)];
};

// In the future, we would implement a proper API integration with edge functions
export const createChatEdgeFunction = () => {
  // This would be implemented with Supabase Edge Functions
  // to securely handle API keys and communicate with AI providers
  
  console.log("In production, this would create a secure edge function for AI communication");
  
  // Example implementation would include:
  // 1. Authentication check
  // 2. Rate limiting
  // 3. Secure API key handling
  // 4. Multiple AI model fallbacks
  // 5. Error handling and logging
  
  return {
    status: "ready for implementation",
    info: "Would contain secure API integration with Gemini, OpenAI or other AI providers"
  };
};
