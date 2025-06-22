export type OnboardingData = {
  farmName: string;
  totalArea: number;
  crops: string[];
  plantingDate: Date;
  harvestDate: Date;
  primaryGoal: string;
  primaryPainPoint: string;
  hasIrrigation: boolean;
  hasMachinery: boolean;
  hasSoilTest: boolean;
  budgetBand: string;
  preferredLanguage: string;
  whatsappNumber?: string;
};

export type OnboardingResponse = {
  success: boolean;
  message: string;
  user_id: string;
  farm_id: string;
};

export type OnboardingError = {
  message: string;
  code?: string;
  details?: string;
};
