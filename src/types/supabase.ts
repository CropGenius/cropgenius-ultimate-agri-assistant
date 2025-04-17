
export interface Field {
  id: string;
  user_id: string;
  farm_id: string;
  name: string;
  size: number;
  size_unit: string;
  boundary: any;
  location_description: string | null;
  soil_type: string | null;
  irrigation_type: string | null;
  created_at: string | null;
  updated_at: string | null;
  is_shared: boolean;
  shared_with: any[] | null;
}

export interface Farm {
  id: string;
  user_id: string;
  name: string;
  location: string | null;
  total_size: number | null;
  size_unit: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface UserMemory {
  id: string;
  user_id: string;
  memory_data: {
    farmerName: string | null;
    lastLogin: string | null;
    lastFieldCount: number;
    lastUsedFeature: string | null;
    recentCropsPlanted: string[];
    preferredCrops: string[];
    commonIssues: string[];
    aiInteractions: number;
    scanCount: number;
    weatherChecks: number;
    marketChecks: number;
    taskCompletionRate: number;
    geniusScore: number;
    invitesSent: number;
    offlineSessions: number;
    proTrialEligible: boolean;
    proTrialUsed: boolean;
    proStatus: boolean;
    proExpirationDate: string | null;
    whatsappOptIn: boolean;
    whatsappNumber: string | null;
    syncStatus: 'pending' | 'synced' | 'failed';
    lastSyncedAt: string | null;
    timeSpentUsingAI: number;
    insightsViewed: number;
    insightsIgnored: number;
    sharesCount: number;
    highValueActionsCount: number;
    lastProPromptTime: string | null;
  };
  created_at: string;
  updated_at: string;
}

export interface AIInsightAlert {
  title: string;
  description: string;
  type: 'weather' | 'market' | 'pest' | 'fertilizer';
  actionText: string;
  actionPath: string;
}

export interface Referral {
  id: string;
  inviter_id: string;
  invitee_contact: string;
  contact_type: 'email' | 'phone';
  status: 'sent' | 'accepted' | 'declined';
  created_at: string;
  accepted_at: string | null;
}

export interface WhatsAppMessage {
  id: string;
  user_id: string;
  phone_number: string;
  message_type: string;
  message_content: string;
  sent_at: string;
  status: string;
}
