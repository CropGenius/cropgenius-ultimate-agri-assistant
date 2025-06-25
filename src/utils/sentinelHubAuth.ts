/**
 * Sentinel Hub OAuth2 Authentication Manager
 * Handles automatic token acquisition and refresh using Client Credentials flow
 */

interface SentinelHubToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number; // calculated timestamp
}

class SentinelHubAuthManager {
  private clientId: string;
  private clientSecret: string;
  private tokenEndpoint = 'https://services.sentinel-hub.com/auth/realms/main/protocol/openid-connect/token';
  private currentToken: SentinelHubToken | null = null;

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  /**
   * Get a valid access token, refreshing if necessary
   */
  async getAccessToken(): Promise<string> {
    if (this.isTokenValid()) {
      return this.currentToken!.access_token;
    }

    await this.refreshToken();
    return this.currentToken!.access_token;
  }

  /**
   * Check if current token is valid and not expired
   */
  private isTokenValid(): boolean {
    if (!this.currentToken) {
      return false;
    }

    // Check if token expires in the next 60 seconds (buffer)
    const now = Date.now();
    const bufferTime = 60 * 1000; // 60 seconds
    return this.currentToken.expires_at > (now + bufferTime);
  }

  /**
   * Fetch a new access token from Sentinel Hub
   */
  private async refreshToken(): Promise<void> {
    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.clientId,
      client_secret: this.clientSecret,
    });

    try {
      const response = await fetch(this.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Sentinel Hub auth failed: ${response.status} - ${errorText}`);
      }

      const tokenData = await response.json();
      
      this.currentToken = {
        access_token: tokenData.access_token,
        token_type: tokenData.token_type,
        expires_in: tokenData.expires_in,
        expires_at: Date.now() + (tokenData.expires_in * 1000),
      };

      console.log('✅ Sentinel Hub token refreshed successfully');
    } catch (error) {
      console.error('❌ Failed to get Sentinel Hub access token:', error);
      throw error;
    }
  }

  /**
   * Make an authenticated request to Sentinel Hub API
   */
  async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = await this.getAccessToken();
    
    const authenticatedOptions: RequestInit = {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      },
    };

    return fetch(url, authenticatedOptions);
  }
}

// Singleton instance
let authManager: SentinelHubAuthManager | null = null;

/**
 * Initialize the Sentinel Hub authentication manager
 */
export function initializeSentinelHubAuth(clientId: string, clientSecret: string): void {
  authManager = new SentinelHubAuthManager(clientId, clientSecret);
}

/**
 * Get the authenticated fetch function for Sentinel Hub API calls
 */
export function getSentinelHubAuthenticatedFetch(): (url: string, options?: RequestInit) => Promise<Response> {
  if (!authManager) {
    throw new Error('Sentinel Hub auth not initialized. Call initializeSentinelHubAuth() first.');
  }
  
  return authManager.authenticatedFetch.bind(authManager);
}

/**
 * Get a valid access token for manual use
 */
export async function getSentinelHubAccessToken(): Promise<string> {
  if (!authManager) {
    throw new Error('Sentinel Hub auth not initialized. Call initializeSentinelHubAuth() first.');
  }
  
  return authManager.getAccessToken();
}

/**
 * Check if Sentinel Hub authentication is properly configured
 */
export function isSentinelHubAuthConfigured(): boolean {
  const clientId = import.meta.env.VITE_SENTINEL_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_SENTINEL_CLIENT_SECRET;
  
  return !!(clientId && clientSecret);
}