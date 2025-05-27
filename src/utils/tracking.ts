import { analytics } from '@/lib/analytics';

// Track page views
export const trackPageView = (pageName: string, additionalProps: Record<string, any> = {}) => {
  if (!analytics) return;
  
  analytics.capture('$pageview', {
    page: pageName,
    url: window.location.pathname,
    ...additionalProps,
  });
};

// Track field mapping events
export const trackFieldMapping = (method: 'manual' | 'gps' | 'import', duration: number) => {
  analytics?.capture('field_mapping_completed', {
    method,
    duration,
    timestamp: new Date().toISOString(),
  });};

// Track AI assistant usage
export const trackAIAssistant = (topic: string, queryLength: number) => {
  analytics?.capture('ai_assistant_used', {
    topic,
    query_length: queryLength,
    timestamp: new Date().toISOString(),
  });
};

// Track pro feature usage
export const trackProUpgrade = (plan: string, location: string) => {
  analytics?.capture('pro_upgrade_clicked', {
    plan,
    location,
    timestamp: new Date().toISOString(),
  });
};

// Track WhatsApp message sent
export const trackWhatsAppMessage = (messageType: string) => {
  analytics?.capture('whatsapp_message_sent', {
    type: messageType,
    timestamp: new Date().toISOString(),
  });
};

// Track feature engagement
export const trackFeatureEngagement = (feature: string, action: string, metadata: Record<string, any> = {}) => {
  analytics?.capture('feature_engagement', {
    feature,
    action,
    ...metadata,
    timestamp: new Date().toISOString(),
  });
};

// Track errors
export const trackError = (error: Error, context: Record<string, any> = {}) => {
  analytics?.capture('error_occurred', {
    message: error.message,
    error_name: error.name,
    stack: error.stack,
    ...context,
    timestamp: new Date().toISOString(),
  });
};
