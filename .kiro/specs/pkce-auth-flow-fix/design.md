# Design Document

## Overview

The PKCE authentication flow fix focuses on implementing a robust code verifier storage and retrieval system that ensures OAuth callbacks can successfully complete token exchange. The design addresses the root cause of the "invalid request: both auth code and code verifier should be non-empty" error by implementing proper PKCE state management with fallback mechanisms and comprehensive debugging.

## Architecture

### PKCE Flow State Management

The core architectural change involves implementing a dedicated PKCE state manager that handles code verifier generation, storage, retrieval, and cleanup throughout the OAuth flow lifecycle.

```typescript
// PKCE State Management Architecture
interface PKCEState {
  codeVerifier: string;
  codeChallenge: string;
  state: string;
  timestamp: number;
  redirectTo?: string;
}

class PKCEStateManager {
  private static readonly STORAGE_KEY_PREFIX = 'cropgenius-pkce-';
  private static readonly STATE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
  
  static generateAndStore(redirectTo?: string): Promise<PKCEState>
  static retrieve(state: string): Promise<PKCEState | null>
  static cleanup(state: string): Promise<void>
  static cleanupExpired(): Promise<void>
}
```

### Enhanced OAuth Flow Architecture

The OAuth flow will be redesigned with explicit PKCE state management:

1. **Initiation Phase**: Generate code verifier, create code challenge, store state
2. **Redirect Phase**: Include state parameter in OAuth URL for correlation
3. **Callback Phase**: Retrieve code verifier using state parameter
4. **Exchange Phase**: Use both authorization code and code verifier for token exchange
5. **Cleanup Phase**: Remove stored PKCE state after successful exchange

### Fallback Strategy Architecture

Multiple fallback mechanisms ensure OAuth works even when primary storage fails:

```typescript
interface OAuthFlowStrategy {
  name: 'pkce' | 'implicit' | 'hybrid';
  isSupported(): boolean;
  execute(redirectTo?: string): Promise<AuthResult>;
}

class OAuthFlowManager {
  private strategies: OAuthFlowStrategy[] = [
    new PKCEFlowStrategy(),
    new ImplicitFlowStrategy(),
    new HybridFlowStrategy()
  ];
  
  async executeOptimalFlow(redirectTo?: string): Promise<AuthResult>
}
```

## Components and Interfaces

### Core PKCE Components

#### PKCEStateManager
- **Purpose**: Manages PKCE code verifier lifecycle
- **Methods**:
  - `generateCodeVerifier()`: Creates cryptographically secure code verifier
  - `generateCodeChallenge(verifier)`: Creates SHA256 code challenge
  - `storeState(state)`: Persists PKCE state with expiration
  - `retrieveState(stateParam)`: Retrieves PKCE state by state parameter
  - `cleanupState(stateParam)`: Removes used PKCE state
  - `cleanupExpiredStates()`: Removes expired PKCE states

#### OAuthCallbackHandler
- **Purpose**: Processes OAuth callbacks with PKCE support
- **Methods**:
  - `handleCallback(url)`: Processes callback URL parameters
  - `extractAuthCode(url)`: Extracts authorization code from callback
  - `extractState(url)`: Extracts state parameter from callback
  - `validateCallback(params)`: Validates callback parameters
  - `exchangeCodeForSession(code, verifier)`: Performs token exchange

#### AuthFlowStrategy (Interface)
- **Purpose**: Defines OAuth flow strategy interface
- **Methods**:
  - `isSupported()`: Checks if strategy is supported in current environment
  - `initiate(redirectTo)`: Starts OAuth flow using this strategy
  - `handleCallback(params)`: Processes callback for this strategy
  - `getName()`: Returns strategy name for debugging

### Storage Components

#### PKCEStorage
- **Purpose**: Abstracts PKCE state storage with fallbacks
- **Storage Layers**:
  1. **Primary**: localStorage with unique keys
  2. **Secondary**: sessionStorage for cross-tab scenarios
  3. **Tertiary**: In-memory storage for privacy mode
  4. **Fallback**: URL-based state passing (limited)

#### StorageHealthMonitor
- **Purpose**: Monitors storage availability and health
- **Features**:
  - Storage quota monitoring
  - Cross-tab synchronization detection
  - Privacy mode detection
  - Storage corruption detection

## Data Models

### PKCE State Model

```typescript
interface PKCEState {
  // Core PKCE Data
  codeVerifier: string;        // Base64URL-encoded random string
  codeChallenge: string;       // SHA256 hash of code verifier
  codeChallengeMethod: 'S256'; // Always SHA256 for security
  
  // Flow Correlation
  state: string;               // Unique state parameter for correlation
  nonce?: string;              // Optional nonce for additional security
  
  // Metadata
  timestamp: number;           // Creation timestamp for expiration
  redirectTo?: string;         // Post-auth redirect destination
  instanceId: string;          // Client instance ID for debugging
  
  // Storage Metadata
  storageKey: string;          // Key used for storage
  storageMethod: 'localStorage' | 'sessionStorage' | 'memory';
  expiresAt: number;           // Expiration timestamp
}
```

### OAuth Callback Model

```typescript
interface OAuthCallbackParams {
  // OAuth Standard Parameters
  code?: string;               // Authorization code from provider
  state?: string;              // State parameter for correlation
  error?: string;              // Error code if auth failed
  error_description?: string;  // Human-readable error description
  
  // Validation Results
  isValid: boolean;            // Overall validation result
  validationErrors: string[];  // Specific validation failures
  
  // Extracted Data
  authCode: string | null;     // Validated authorization code
  stateParam: string | null;   // Validated state parameter
  
  // Metadata
  url: string;                 // Original callback URL
  timestamp: number;           // Processing timestamp
  userAgent: string;           // Browser user agent
}
```

### OAuth Flow Configuration

```typescript
interface OAuthFlowConfig {
  // Flow Type Configuration
  preferredFlow: 'pkce' | 'implicit' | 'auto';
  fallbackEnabled: boolean;
  
  // PKCE Configuration
  pkce: {
    codeVerifierLength: number;     // Default: 128
    codeChallengeMethod: 'S256';    // Always SHA256
    stateLength: number;            // Default: 32
    expirationMinutes: number;      // Default: 10
  };
  
  // Storage Configuration
  storage: {
    primaryMethod: 'localStorage' | 'sessionStorage';
    enableFallbacks: boolean;
    keyPrefix: string;
    cleanupInterval: number;        // Cleanup interval in ms
  };
  
  // Security Configuration
  security: {
    enforceHTTPS: boolean;
    validateOrigin: boolean;
    requireNonce: boolean;
    maxRetries: number;
  };
  
  // Debug Configuration
  debug: {
    enabled: boolean;
    logLevel: 'error' | 'warn' | 'info' | 'debug';
    includeTimings: boolean;
    includeSensitiveData: boolean;  // Only in development
  };
}
```

## Error Handling

### PKCE-Specific Error Types

```typescript
enum PKCEErrorType {
  CODE_VERIFIER_GENERATION_FAILED = 'CODE_VERIFIER_GENERATION_FAILED',
  CODE_VERIFIER_STORAGE_FAILED = 'CODE_VERIFIER_STORAGE_FAILED',
  CODE_VERIFIER_RETRIEVAL_FAILED = 'CODE_VERIFIER_RETRIEVAL_FAILED',
  CODE_VERIFIER_MISSING = 'CODE_VERIFIER_MISSING',
  CODE_CHALLENGE_GENERATION_FAILED = 'CODE_CHALLENGE_GENERATION_FAILED',
  STATE_PARAMETER_MISSING = 'STATE_PARAMETER_MISSING',
  STATE_PARAMETER_MISMATCH = 'STATE_PARAMETER_MISMATCH',
  PKCE_FLOW_EXPIRED = 'PKCE_FLOW_EXPIRED',
  STORAGE_UNAVAILABLE = 'STORAGE_UNAVAILABLE',
  TOKEN_EXCHANGE_FAILED = 'TOKEN_EXCHANGE_FAILED'
}
```

### Error Recovery Strategies

#### Automatic Recovery
- **Storage Failure**: Fall back to alternative storage methods
- **Code Verifier Missing**: Restart OAuth flow with new PKCE state
- **State Mismatch**: Clear corrupted state and restart flow
- **Flow Expired**: Clean up expired state and restart flow

#### User-Initiated Recovery
- **"Try Again" Button**: Restart OAuth flow with fresh PKCE state
- **"Clear Auth Data" Button**: Clear all stored auth state and restart
- **"Use Different Method" Button**: Switch to implicit flow if PKCE fails

#### Developer Recovery
- **Debug Mode**: Detailed PKCE flow logging and state inspection
- **Health Check**: Validate storage availability and PKCE support
- **Configuration Override**: Force specific OAuth flow type

### Error Messages

```typescript
const PKCEErrorMessages = {
  CODE_VERIFIER_MISSING: {
    user: "Sign-in process was interrupted. Please try signing in again.",
    developer: "PKCE code verifier not found in storage. Check storage availability and state correlation."
  },
  STORAGE_UNAVAILABLE: {
    user: "Your browser's storage is unavailable. Please enable cookies and try again.",
    developer: "localStorage and sessionStorage are unavailable. Check privacy settings and browser compatibility."
  },
  TOKEN_EXCHANGE_FAILED: {
    user: "Sign-in failed during the final step. Please try again.",
    developer: "Token exchange failed with PKCE parameters. Verify code verifier and authorization code."
  }
};
```

## Testing Strategy

### Unit Testing
- PKCE code verifier generation and validation
- Code challenge creation and verification
- State parameter generation and correlation
- Storage operations with different storage methods
- Error classification and recovery logic

### Integration Testing
- Complete PKCE flow simulation
- Storage fallback scenarios
- Cross-tab OAuth flow handling
- Error recovery mechanisms
- Multiple concurrent OAuth attempts

### End-to-End Testing
- Full Google OAuth flow with PKCE
- Browser storage manipulation scenarios
- Network interruption during OAuth flow
- Privacy mode and incognito testing
- Mobile browser OAuth flow

### Debug Testing
- PKCE flow step-by-step logging
- Storage state inspection tools
- OAuth parameter validation
- Performance timing measurements
- Error boundary functionality

## Security Considerations

### PKCE Security
- Cryptographically secure code verifier generation
- SHA256 code challenge method exclusively
- State parameter uniqueness and unpredictability
- Secure storage of sensitive PKCE data
- Proper cleanup of used PKCE states

### Storage Security
- Unique storage keys to prevent collisions
- Expiration-based cleanup to prevent accumulation
- No sensitive data in URL parameters
- Cross-origin storage isolation
- Secure random number generation

### Flow Security
- Origin validation for callback URLs
- State parameter validation for CSRF protection
- Nonce validation for replay attack prevention
- HTTPS enforcement for production
- Rate limiting for OAuth attempts

## Performance Optimization

### Storage Performance
- Efficient key generation and lookup
- Batch cleanup of expired states
- Minimal storage footprint
- Fast serialization/deserialization
- Storage quota monitoring

### Flow Performance
- Minimal redirect latency
- Efficient callback processing
- Optimized token exchange
- Reduced network requests
- Fast error detection and recovery

### Memory Performance
- Automatic cleanup of completed flows
- Efficient in-memory fallback storage
- Minimal memory footprint
- Garbage collection friendly
- Resource leak prevention