/**
 * Redirect Loop Detection and Prevention
 * Tracks authentication redirects to prevent infinite loops
 */

export interface RedirectState {
  count: number;
  lastRedirect: number;
  path: string;
  userAgent: string;
}

export interface RedirectConfig {
  maxRedirects: number;
  timeWindow: number; // milliseconds
  storageKey: string;
}

const DEFAULT_CONFIG: RedirectConfig = {
  maxRedirects: 5,
  timeWindow: 30000, // 30 seconds
  storageKey: 'auth_redirect_tracker'
};

export class RedirectTracker {
  private config: RedirectConfig;

  constructor(config: Partial<RedirectConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Track a redirect attempt
   */
  trackRedirect(path: string): void {
    const now = Date.now();
    const currentState = this.getRedirectState();

    const newState: RedirectState = {
      count: currentState ? currentState.count + 1 : 1,
      lastRedirect: now,
      path,
      userAgent: navigator.userAgent
    };

    this.saveRedirectState(newState);
  }

  /**
   * Check if redirect loop is detected
   */
  isRedirectLoop(): boolean {
    const state = this.getRedirectState();
    
    if (!state) {
      return false;
    }

    const now = Date.now();
    const timeSinceLastRedirect = now - state.lastRedirect;

    // If too much time has passed, reset the counter
    if (timeSinceLastRedirect > this.config.timeWindow) {
      this.clearRedirectState();
      return false;
    }

    return state.count >= this.config.maxRedirects;
  }

  /**
   * Get current redirect state
   */
  getRedirectState(): RedirectState | null {
    try {
      const stored = sessionStorage.getItem(this.config.storageKey);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Failed to read redirect state:', error);
      return null;
    }
  }

  /**
   * Clear redirect tracking state
   */
  clearRedirectState(): void {
    try {
      sessionStorage.removeItem(this.config.storageKey);
    } catch (error) {
      console.warn('Failed to clear redirect state:', error);
    }
  }

  /**
   * Reset redirect counter (for manual retry)
   */
  resetRedirectCounter(): void {
    const state = this.getRedirectState();
    if (state) {
      const newState: RedirectState = {
        ...state,
        count: 0,
        lastRedirect: Date.now()
      };
      this.saveRedirectState(newState);
    }
  }

  /**
   * Get redirect statistics for debugging
   */
  getRedirectStats(): {
    count: number;
    lastRedirect: Date | null;
    path: string | null;
    timeInWindow: boolean;
  } {
    const state = this.getRedirectState();
    
    if (!state) {
      return {
        count: 0,
        lastRedirect: null,
        path: null,
        timeInWindow: false
      };
    }

    const now = Date.now();
    const timeSinceLastRedirect = now - state.lastRedirect;
    const timeInWindow = timeSinceLastRedirect <= this.config.timeWindow;

    return {
      count: state.count,
      lastRedirect: new Date(state.lastRedirect),
      path: state.path,
      timeInWindow
    };
  }

  /**
   * Check if we should allow a redirect
   */
  shouldAllowRedirect(path: string): boolean {
    // Always allow if no previous state
    const state = this.getRedirectState();
    if (!state) {
      return true;
    }

    // Allow if enough time has passed
    const now = Date.now();
    const timeSinceLastRedirect = now - state.lastRedirect;
    if (timeSinceLastRedirect > this.config.timeWindow) {
      this.clearRedirectState();
      return true;
    }

    // Allow if under the limit
    return state.count < this.config.maxRedirects;
  }

  /**
   * Get time until redirect is allowed again
   */
  getTimeUntilReset(): number {
    const state = this.getRedirectState();
    if (!state) {
      return 0;
    }

    const now = Date.now();
    const timeSinceLastRedirect = now - state.lastRedirect;
    const timeRemaining = this.config.timeWindow - timeSinceLastRedirect;

    return Math.max(0, timeRemaining);
  }

  private saveRedirectState(state: RedirectState): void {
    try {
      sessionStorage.setItem(this.config.storageKey, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save redirect state:', error);
    }
  }
}

// Export default instance
export const redirectTracker = new RedirectTracker();