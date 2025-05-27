import posthog, { PostHog } from 'posthog-js';

type AnalyticsEvent = {
  name: string;
  properties?: Record<string, unknown>;
  timestamp?: Date;
  userId?: string | number;
  sessionId?: string;
};

type AnalyticsUser = {
  id: string | number;
  name?: string;
  email?: string;
  phone?: string;
  language?: string;
  plan?: string;
  signupDate?: Date;
  lastActive?: Date;
  properties?: Record<string, unknown>;
};

type DeviceInfo = {
  type: 'mobile' | 'tablet' | 'desktop';
  os: string;
  browser: string;
  screen: {
    width: number;
    height: number;
  };
};

type LocationInfo = {
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
  ip?: string;
};

type SessionInfo = {
  id: string;
  startTime: Date;
  referrer: string;
  landingPage: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
};

type AnalyticsConfig = {
  apiKey: string;
  host: string;
  capturePageView?: boolean;
  autocapture?: boolean;
  disableSessionRecording?: boolean;
  debug?: boolean;
  enablePerformanceTracking?: boolean;
  enableErrorTracking?: boolean;
};

// Internal state
let isInitialized = false;
let analyticsInstance: PostHog | null = null;
let currentSession: SessionInfo | null = null;
let lastActivityTime: number = Date.now();
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

// Session Management
const generateSessionId = (): string => {
  return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const initializeSession = (): SessionInfo => {
  const urlParams = new URLSearchParams(window.location.search);
  
  return {
    id: generateSessionId(),
    startTime: new Date(),
    referrer: document.referrer,
    landingPage: window.location.pathname,
    utmSource: urlParams.get('utm_source') || undefined,
    utmMedium: urlParams.get('utm_medium') || undefined,
    utmCampaign: urlParams.get('utm_campaign') || undefined,
    utmTerm: urlParams.get('utm_term') || undefined,
    utmContent: urlParams.get('utm_content') || undefined,
  };
};

// Device and Location Detection
const getDeviceInfo = (): DeviceInfo => {
  const userAgent = navigator.userAgent;
  const screen = {
    width: window.screen.width,
    height: window.screen.height,
  };

  // Simplified device detection
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isTablet = /iPad|Android(?!.*Mobile)|Tablet|Silk|Kindle|PlayBook/i.test(userAgent);

  return {
    type: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
    os: (() => {
      if (/Windows/i.test(userAgent)) return 'Windows';
      if (/Mac/i.test(userAgent)) return 'macOS';
      if (/Linux/i.test(userAgent)) return 'Linux';
      if (/Android/i.test(userAgent)) return 'Android';
      if (/iOS|iPhone|iPad|iPod/i.test(userAgent)) return 'iOS';
      return 'Unknown';
    })(),
    browser: (() => {
      if (/Firefox/i.test(userAgent)) return 'Firefox';
      if (/Chrome/i.test(userAgent)) return 'Chrome';
      if (/Safari/i.test(userAgent)) return 'Safari';
      if (/Edge/i.test(userAgent)) return 'Edge';
      if (/MSIE|Trident/i.test(userAgent)) return 'IE';
      return 'Unknown';
    })(),
    screen,
  };
};

// Engagement Tracking
const trackEngagement = (properties: Record<string, unknown> = {}) => {
  if (!isInitialized || !analyticsInstance) return;
  
  lastActivityTime = Date.now();
  
  analyticsInstance.capture('$engagement', {
    ...properties,
    session_id: currentSession?.id,
    session_duration: currentSession ? (Date.now() - currentSession.startTime.getTime()) / 1000 : 0,
    timestamp: new Date().toISOString(),
  });
};

// Auto-capture common interactions
const setupAutocapture = () => {
  // Track time on page
  let pageStartTime = Date.now();
  
  // Track page visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      pageStartTime = Date.now();
    } else {
      const timeSpent = (Date.now() - pageStartTime) / 1000;
      if (timeSpent > 0) {
        trackEvent('page_engagement', {
          time_spent_seconds: timeSpent,
          page: window.location.pathname,
        });
      }
    }
  });

  // Track clicks with enhanced data
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (!target) return;

    const clickData = {
      element: target.tagName.toLowerCase(),
      id: target.id || undefined,
      class: target.className || undefined,
      text: target.textContent?.trim().substring(0, 100) || undefined,
      href: (target as HTMLAnchorElement).href || undefined,
      page: window.location.pathname,
      x: e.clientX,
      y: e.clientY,
    };

    trackEvent('element_click', clickData);
  }, { capture: true });

  // Track form interactions
  document.addEventListener('submit', (e) => {
    const target = e.target as HTMLFormElement;
    if (!target) return;

    trackEvent('form_submit', {
      form_id: target.id || undefined,
      form_action: target.action || undefined,
      form_method: target.method || 'get',
      page: window.location.pathname,
    });
  });
};

/**
 * Initialize the analytics module
 * @param config Configuration options for analytics
 * @returns The PostHog instance or null if initialization fails
 */
export const initAnalytics = (config?: Partial<AnalyticsConfig>): PostHog | null => {
  if (isInitialized) {
    console.warn('Analytics already initialized');
    return analyticsInstance;
  }

  // Use provided config or fall back to environment variables
  const {
    apiKey = import.meta.env.VITE_POSTHOG_KEY,
    host = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',
    capturePageView = true,
    autocapture = true,
    disableSessionRecording = import.meta.env.DEV, // Disable in dev by default
    debug = import.meta.env.DEV,
    enablePerformanceTracking = true,
    enableErrorTracking = true,
  } = config || {};

  if (!apiKey) {
    console.warn('PostHog API key is required to initialize analytics');
    return null;
  }

  try {
    // Initialize session
    currentSession = initializeSession();
    
    // Get device and location info
    const deviceInfo = getDeviceInfo();
    
    posthog.init(apiKey, {
      api_host: host,
      capture_pageview: capturePageView,
      autocapture,
      disable_session_recording: disableSessionRecording,
      session_recording: {
        maskAllInputs: false,
        maskInputOptions: {
          password: true,
          email: true,
          tel: true,
          number: true,
        },
        recordCrossOriginIframes: true,
      },
      persistence: 'localStorage',
      persistence_name: 'cropgenius_analytics',
      loaded: (posthog) => {
        if (debug) {
          console.log('Analytics initialized');
        }
        
        // Set initial device and session properties
        posthog.register({
          $current_url: window.location.href,
          $host: window.location.hostname,
          $pathname: window.location.pathname,
          $referrer: document.referrer,
          $referring_domain: document.referrer ? new URL(document.referrer).hostname : '',
          $device_type: deviceInfo.type,
          $os: deviceInfo.os,
          $browser: deviceInfo.browser,
          $screen_width: deviceInfo.screen.width,
          $screen_height: deviceInfo.screen.height,
          $session_id: currentSession.id,
          $initial_referrer: document.referrer,
          $initial_referring_domain: document.referrer ? new URL(document.referrer).hostname : '',
        });
        
        // Track session start
        trackEvent('session_start', {
          session_id: currentSession.id,
          referrer: currentSession.referrer,
          landing_page: currentSession.landingPage,
          utm_source: currentSession.utmSource,
          utm_medium: currentSession.utmMedium,
          utm_campaign: currentSession.utmCampaign,
          utm_term: currentSession.utmTerm,
          utm_content: currentSession.utmContent,
        });
        
        // Initialize performance monitoring if enabled
        if (enablePerformanceTracking) {
          // Track initial page load time
          if (typeof window !== 'undefined' && 'performance' in window) {
            const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
            if (navTiming) {
              posthog.capture('$performance_metric', {
                metric_name: 'page_load_time',
                value: navTiming.loadEventEnd - navTiming.startTime,
                category: 'performance',
              });
            }
          }
          
          // Initialize performance monitoring
          if (typeof window !== 'undefined') {
            // Track long tasks in the background
            if ('PerformanceObserver' in window) {
              const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry: any) => {
                  if (entry.entryType === 'longtask' && entry.duration > 100) {
                    trackEvent('performance_metric', {
                      metric_name: 'long_task',
                      value: entry.duration,
                      category: 'performance',
                      start_time: entry.startTime,
                      name: entry.name,
                    });
                  }
                });
              });
              observer.observe({ entryTypes: ['longtask'] });
            }
          }
        }
        
        // Initialize error tracking if enabled
        if (enableErrorTracking && typeof window !== 'undefined') {
          window.onerror = (message, source, lineno, colno, error) => {
            trackEvent('error_occurred', {
              error_name: error?.name || 'Unknown',
              error_message: error?.message || String(message),
              error_stack: error?.stack || 'No stack trace',
              source,
              lineno,
              colno,
            });
            return false; // Let the default handler run as well
          };
          
          // Track unhandled promise rejections
          window.addEventListener('unhandledrejection', (event) => {
            trackEvent('unhandled_rejection', {
              reason: event.reason?.message || 'Unknown reason',
              stack: event.reason?.stack || 'No stack trace',
            });
          });
        }
        
        // Set up auto-capture for common interactions
        setupAutocapture();
        
        // Track page view with additional context
        if (capturePageView) {
          trackPageView();
        }
      },
    });

    analyticsInstance = posthog;
    isInitialized = true;

    return posthog;
  } catch (error) {
    console.error('Failed to initialize analytics:', error);
    return null;
  }
};

/**
 * Get the analytics instance
 * @returns The PostHog instance or null if not initialized
 */
export const getAnalytics = (): PostHog | null => {
  if (!isInitialized) {
    console.warn('Analytics not initialized. Call initAnalytics() first.');
    return null;
  }
  return analyticsInstance;
};

/**
 * Check if analytics is initialized
 * @returns boolean indicating if analytics is initialized
 */
export const isAnalyticsInitialized = (): boolean => {
  return isInitialized;
};

/**
 * Track a custom event with enhanced context
 * @param event Name of the event or event object
 * @param properties Additional properties to include with the event
 * @param userContext Additional user context to include
 */
export const trackEvent = (
  event: string | AnalyticsEvent,
  properties: Record<string, unknown> = {},
  userContext?: Partial<AnalyticsUser>
): void => {
  if (!isInitialized || !analyticsInstance) {
    console.warn('Analytics not initialized');
    return;
  }

  try {
    const eventName = typeof event === 'string' ? event : event.name;
    const eventProperties = {
      ...(typeof event === 'object' ? event.properties : {}),
      ...properties,
    };

    // Update last activity time
    lastActivityTime = Date.now();

    // Get current scroll position
    const scrollPosition = {
      scroll_x: window.scrollX,
      scroll_y: window.scrollY,
      scroll_height: document.documentElement.scrollHeight,
      viewport_height: window.innerHeight,
    };

    // Add comprehensive context
    const allProperties = {
      // Event properties
      ...eventProperties,
      
      // Session context
      $session_id: currentSession?.id,
      $window_id: `w_${Math.random().toString(36).substr(2, 9)}`,
      
      // Page context
      $current_url: window.location.href,
      $host: window.location.hostname,
      $pathname: window.location.pathname,
      $search: window.location.search,
      $referrer: document.referrer,
      
      // Timing
      $time: new Date().toISOString(),
      $timestamp: Date.now(),
      $session_duration: currentSession ? (Date.now() - currentSession.startTime.getTime()) / 1000 : 0,
      
      // Viewport and scroll
      $viewport_width: window.innerWidth,
      $viewport_height: window.innerHeight,
      ...scrollPosition,
      
      // Device info
      $device: getDeviceInfo(),
      
      // User context if available
      ...(userContext ? { user: userContext } : {})
    };

    // Send the event
    analyticsInstance.capture(eventName, allProperties);
    
    // For high-value events, also update user properties
    if (eventName.startsWith('user_') || eventName.endsWith('_completed')) {
      updateUserProperties({
        last_event: eventName,
        last_event_time: new Date().toISOString(),
        ...(userContext || {})
      });
    }
    
    // Log in debug mode
    if (import.meta.env.DEV) {
      console.log(`[Analytics] Tracked event: ${eventName}`, allProperties);
    }
  } catch (error) {
    console.error('Error tracking event:', error);
  }
};

/**
 * Track a page view with enhanced context
 * @param pageName Optional page name (defaults to current pathname)
 */
export const trackPageView = (pageName?: string) => {
  const page = pageName || window.location.pathname;
  
  trackEvent('$pageview', {
    $title: document.title,
    $url: window.location.href,
    $path: window.location.pathname,
    $search: window.location.search,
    $referrer: document.referrer,
    $load_time: performance.timing.loadEventEnd - performance.timing.navigationStart,
    $page: page,
  });
};

/**
 * Identify a user with comprehensive properties
 * @param user User information including ID and optional properties
 */
export const identifyUser = (user: AnalyticsUser): void => {
  if (!isInitialized || !analyticsInstance) {
    console.warn('Analytics not initialized');
    return;
  }

  try {
    const { 
      id, 
      name, 
      email, 
      phone, 
      language = navigator.language,
      plan = 'free',
      signupDate = new Date().toISOString(),
      lastActive = new Date().toISOString(),
      properties = {}
    } = user;

    // Get device info
    const deviceInfo = getDeviceInfo();

    // Enhanced user properties
    const userProperties = {
      // Core identity
      $user_id: id,
      $name: name,
      $email: email,
      $phone: phone,

      // Account info
      $created: signupDate,
      $last_seen: lastActive,
      $plan: plan,
      $language: language,

      // Device info
      $device_type: deviceInfo.type,
      $os: deviceInfo.os,
      $browser: deviceInfo.browser,
      $screen_width: deviceInfo.screen.width,
      $screen_height: deviceInfo.screen.height,

      // Session info
      $initial_referrer: currentSession?.referrer || document.referrer,
      $initial_landing_page: currentSession?.landingPage || window.location.pathname,
      $initial_utm_source: currentSession?.utmSource,
      $initial_utm_medium: currentSession?.utmMedium,
      $initial_utm_campaign: currentSession?.utmCampaign,

      // Custom properties
      ...properties,
    };

    // Identify the user
    analyticsInstance.identify(String(id), userProperties);

    // Update user properties
    if (analyticsInstance.people) {
      analyticsInstance.people.set({
        name,
        email,
        phone,
        language,
        plan,
        last_active: lastActive,
        $last_updated: new Date().toISOString(),
        ...properties,
      });
    }

    // Track the identification
    trackEvent('user_identified', {
      user_id: String(id),
      ...(name && { name }),
      ...(email && { email }),
      has_phone: !!phone,
    });
  } catch (error) {
    console.error('Error identifying user:', error);
  }
};

/**
 * Update user properties without creating a new identify call
 * @param properties Properties to update
 */
export const updateUserProperties = (properties: Record<string, any>): void => {
  if (!isInitialized || !analyticsInstance?.people) {
    console.warn('Analytics not initialized or people feature not available');
    return;
  }
  
  try {
    analyticsInstance.people.set({
      ...properties,
      $last_updated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating user properties:', error);
  }
};

/**
 * Track user signup with additional context
 * @param user User information
 * @param signupMethod Method used to sign up (e.g., 'email', 'google', 'facebook')
 * @param properties Additional properties
 */
export const trackSignup = (
  user: AnalyticsUser,
  signupMethod: string,
  properties: Record<string, any> = {}
): void => {
  identifyUser(user);
  
  trackEvent('user_signed_up', {
    signup_method: signupMethod,
    user_id: String(user.id),
    ...properties,
  });
  
  // Update user properties
  updateUserProperties({
    $signup_method: signupMethod,
    $signed_up_at: new Date().toISOString(),
    ...properties,
  });
};

/**
 * Track user login
 * @param userId User ID
 * @param properties Additional properties
 */
export const trackLogin = (userId: string | number, properties: Record<string, any> = {}): void => {
  trackEvent('user_logged_in', {
    user_id: String(userId),
    ...properties,
  });
  
  // Update last login time
  updateUserProperties({
    $last_login: new Date().toISOString(),
    login_count: (properties.login_count || 0) + 1,
  });
};

/**
 * Reset the analytics instance (useful for logout)
 */
export const resetAnalytics = (): void => {
  if (analyticsInstance) {
    analyticsInstance.reset();
    isInitialized = false;
    analyticsInstance = null;
  }
};

// Common event helpers with enhanced tracking
export const Events = {
  // User lifecycle events
  userCreated: (userId: string | number, method: string, properties: Record<string, any> = {}) =>
    trackEvent('user_created', { user_id: String(userId), method, ...properties }),
    
  userOnboarded: (userId: string | number, stepsCompleted: string[], properties: Record<string, any> = {}) =>
    trackEvent('user_onboarded', { 
      user_id: String(userId),
      steps_completed: stepsCompleted,
      onboarding_complete: true,
      ...properties 
    }),
    
  // Feature usage tracking
  featureUsed: (feature: string, action: string, properties: Record<string, any> = {}) =>
    trackEvent('feature_used', { 
      feature, 
      action,
      ...properties 
    }),
    
  // Engagement tracking
  contentEngagement: (contentId: string, contentType: string, action: string, properties: Record<string, any> = {}) =>
    trackEvent('content_engagement', {
      content_id: contentId,
      content_type: contentType,
      action,
      ...properties,
    }),
    
  // Field and crop management
  fieldCreated: (fieldId: string, fieldType: string, properties: Record<string, any> = {}) =>
    trackEvent('field_created', { field_id: fieldId, field_type: fieldType, ...properties }),
    
  cropPlanted: (fieldId: string, cropType: string, area: number, properties: Record<string, any> = {}) =>
    trackEvent('crop_planted', { 
      field_id: fieldId, 
      crop_type: cropType, 
      area,
      ...properties 
    }),
    
  // AI and assistant interactions
  aiAssistantInteraction: (query: string, responseType: string, responseTime: number, properties: Record<string, any> = {}) =>
    trackEvent('ai_assistant_interaction', {
      query_length: query.length,
      response_type: responseType,
      response_time_ms: responseTime,
      ...properties,
    }),
    
  // Error and performance tracking
  errorOccurred: (error: Error, context: string, properties: Record<string, any> = {}) =>
    trackEvent('error_occurred', {
      error_name: error.name,
      error_message: error.message,
      error_stack: error.stack,
      context,
      ...properties,
    }),
    
  performanceMetric: (metricName: string, value: number, properties: Record<string, any> = {}) =>
    trackEvent('performance_metric', {
      metric_name: metricName,
      value,
      category: 'performance',
      ...properties,
    }),
    
  // Field mapping events with enhanced tracking
  fieldMappingCompleted: (duration: number, method: 'manual' | 'gps' | 'import', fieldId = '', properties: Record<string, any> = {}) => {
    const event = trackEvent('field_mapping_completed', {
      duration,
      method,
      ...(fieldId && { field_id: fieldId }),
      ...properties,
    });
    
    // Update user properties with mapping stats
    if (fieldId) {
      updateUserProperties({
        last_field_mapped: fieldId,
        last_mapping_method: method,
        total_fields_mapped: (properties.total_fields_mapped || 0) + 1,
        [`${method}_mappings_count`]: ((properties[`${method}_mappings_count`] as number) || 0) + 1,
      });
    }
    
    return event;
  },
  
  // AI Assistant interactions with enhanced context
  aiAssistantUsed: (topic: string, query: string, responseTime: number, responseType = '', properties: Record<string, any> = {}) => {
    const event = trackEvent('ai_assistant_used', {
      topic,
      query_length: query.length,
      response_time_ms: responseTime,
      ...(responseType && { response_type: responseType }),
      ...properties,
    });
    
    // Track assistant usage patterns
    updateUserProperties({
      last_assistant_topic: topic,
      last_assistant_query: query.substring(0, 100), // Store first 100 chars
      total_assistant_queries: (properties.total_assistant_queries || 0) + 1,
      total_assistant_time: (properties.total_assistant_time || 0) + responseTime,
    });
    
    return event;
  },
  
  // Pro upgrade flow tracking
  proUpgradeClicked: (plan: string, location: string, properties: Record<string, any> = {}) => {
    const event = trackEvent('pro_upgrade_clicked', {
      plan,
      location,
      ...properties,
    });
    
    // Track upgrade intent
    updateUserProperties({
      upgrade_intent_plan: plan,
      upgrade_intent_location: location,
      upgrade_intent_timestamp: new Date().toISOString(),
      total_upgrade_attempts: (properties.total_upgrade_attempts || 0) + 1,
    });
    
    return event;
  },
  
  // WhatsApp integration events
  whatsappMessageSent: (messageType: string, messageLength: number, properties: Record<string, any> = {}) => {
    const event = trackEvent('whatsapp_message_sent', {
      message_type: messageType,
      message_length: messageLength,
      ...properties,
    });
    
    // Track WhatsApp engagement
    updateUserProperties({
      last_whatsapp_message_type: messageType,
      total_whatsapp_messages: (properties.total_whatsapp_messages || 0) + 1,
      last_whatsapp_message_time: new Date().toISOString(),
    });
    
    return event;
  },
  
  // Page view with enhanced context
  pageView: (pageName: string, properties: Record<string, any> = {}) => {
    const event = trackPageView(pageName);
    
    // Track page navigation patterns
    updateUserProperties({
      last_page_viewed: pageName,
      last_page_view_time: new Date().toISOString(),
      total_page_views: (properties.total_page_views || 0) + 1,
      [`page_view_count_${pageName.replace(/\//g, '_').toLowerCase()}`]: 
        ((properties[`page_view_count_${pageName.replace(/\//g, '_').toLowerCase()}`] as number) || 0) + 1,
    });
    
    return event;
  },
  
  // Feature engagement with enhanced tracking
  featureEngagement: (feature: string, action: string, properties: Record<string, any> = {}) => {
    const event = trackEvent('feature_engagement', {
      feature,
      action,
      ...properties,
    });
    
    // Track feature usage patterns
    updateUserProperties({
      [`last_${feature}_usage`]: new Date().toISOString(),
      [`${feature}_usage_count`]: ((properties[`${feature}_usage_count`] as number) || 0) + 1,
      [`${feature}_last_action`]: action,
    });
    
    return event;
  },
  
  // User feedback tracking
  feedbackSubmitted: (rating: number, feedback: string, context: string, properties: Record<string, any> = {}) => {
    const event = trackEvent('feedback_submitted', {
      rating,
      feedback_length: feedback.length,
      context,
      ...properties,
    });
    
    // Track user sentiment
    updateUserProperties({
      last_feedback_rating: rating,
      last_feedback_context: context,
      total_feedback_submitted: (properties.total_feedback_submitted || 0) + 1,
      average_feedback_rating: Math.round(
        ((properties.average_feedback_rating || 0) * (properties.total_feedback_submitted || 0) + rating) /
        ((properties.total_feedback_submitted || 0) + 1) * 10
      ) / 10, // Calculate new average
    });
    
    return event;
  },
  
  // User behavior patterns
  rageClickDetected: (element: string, clickCount: number, properties: Record<string, any> = {}) => {
    const event = trackEvent('rage_click_detected', {
      element,
      click_count: clickCount,
      ...properties,
    });
    
    // Track potential UX issues
    updateUserProperties({
      last_rage_click_element: element,
      total_rage_clicks: (properties.total_rage_clicks || 0) + 1,
      [`rage_clicks_on_${element}`]: ((properties[`rage_clicks_on_${element}`] as number) || 0) + 1,
    });
    
    return event;
  },
  
  // Session and engagement tracking
  sessionEnded: (duration: number, pageCount: number, properties: Record<string, any> = {}) => {
    const event = trackEvent('session_ended', {
      session_duration: duration,
      pages_viewed: pageCount,
      ...properties,
    });
    
    // Update user's session stats
    updateUserProperties({
      last_session_duration: duration,
      last_session_pages: pageCount,
      total_sessions: (properties.total_sessions || 0) + 1,
      total_session_duration: (properties.total_session_duration || 0) + duration,
    });
    
    return event;
  },
};

// Initialize performance monitoring
const initPerformanceMonitoring = (posthog: PostHog): void => {
  if (typeof window === 'undefined' || !('performance' in window)) return;
  
  // Track long tasks in the background
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'longtask' && entry.duration > 100) { // Only track tasks > 100ms
          trackEvent('performance_metric', {
            metric_name: 'long_task',
            value: entry.duration,
            category: 'performance',
            start_time: entry.startTime,
            name: entry.name,
          });
        }
      });
    });
    observer.observe({ entryTypes: ['longtask'] });
  }
}

// Error tracking utilities
const initErrorTracking = (posthog: PostHog): void => {
  // This function is kept for backward compatibility
  // Error tracking is now handled inline in the initAnalytics function
  console.log('Error tracking initialized');
};

// Export all public functions and objects
const analytics = {
  initAnalytics,
  getAnalytics,
  isAnalyticsInitialized: () => isInitialized,
  trackEvent,
  identifyUser,
  resetAnalytics,
  Events,
};

export default analytics;
