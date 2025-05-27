export interface CropListing {
  id: number;
  cropType: string;
  quantity: number;
  unit: string;
  quality: string;
  location: string;
  price: number;
  marketPrice: number;
  expiresIn: string;
  priceStatus: 'rising' | 'falling' | 'stable';
  priceChange: number;
  holdRecommendation: {
    recommend: boolean;
    days: number;
    expectedIncrease: number;
  };
  seller: {
    name: string;
    rating: number;
    verified: boolean;
    transactions: number;
  };
  isMine?: boolean;
  photo?: string;
  bulkDeal?: {
    farmersJoined: number;
    targetFarmers: number;
    bonusPercentage: number;
  };
}

export interface Buyer {
  id: number;
  name: string;
  location: string;
  lookingFor: string[];
  verified: boolean;
  rating: number;
  transactions: number;
  offersAboveMarket: number;
  paymentMethods: string[];
  dealSize: 'small' | 'medium' | 'large';
  paysFast: boolean;
}

export interface MyCrop {
  id: number;
  cropType: string;
  readyToSell: boolean;
  harvestDate: string;
  quantity: number;
  unit: string;
  quality: string;
  location: string;
  isListed: boolean;
  currentPrice: number;
  suggestedPrice: number;
  marketTrend: {
    status: 'rising' | 'falling' | 'stable';
    forecast: string;
    changePercent: number;
  };
}

export interface BulkDeal {
  id: number;
  cropType: string;
  organizer: string;
  farmersJoined: number;
  targetFarmers: number;
  priceBonus: number;
  deadline: string;
  location: string;
  minQuantity: number;
  buyer: string;
  isNew: boolean;
}

export interface AIInsights {
  lastUpdated: string;
  marketOverview: string;
  topOpportunities: {
    crop: string;
    action: string;
    reason: string;
  }[];
}

export interface PostTradeFormData {
  cropType: string;
  quantity: number;
  unit: string;
  quality: string;
  location: string;
  price: number;
}