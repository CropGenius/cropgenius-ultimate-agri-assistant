// 🚀 CROPGENIUS INFINITY IQ PKCE MANAGER
// Production-ready PKCE flow for 100 MILLION FARMERS! 🌍💪

import { logAuthEvent, logAuthError, AuthEventType } from '@/utils/authDebugger';

// 🔥 PKCE STATE INTERFACE - INFINITY IQ LEVEL
export interface PKCEState {
    // Core PKCE Data - BULLETPROOF
    codeVerifier: string;        // Base64URL-encoded cryptographically secure
    codeChallenge: string;       // SHA256 hash of code verifier
    codeChallengeMethod: 'S256'; // Always SHA256 for MAXIMUM security

    // Flow Correlation - GENIUS LEVEL
    state: string;               // Unique state parameter - COLLISION RESISTANT
    nonce?: string;              // Additional security layer

    // Metadata - PRODUCTION READY
    timestamp: number;           // Creation timestamp for expiration
    redirectTo?: string;         // Post-auth redirect destination
    instanceId: string;          // Client instance ID for debugging

    // Storage Metadata - INFINITY IQ
    storageKey: string;          // Key used for storage
    storageMethod: 'localStorage' | 'sessionStorage' | 'memory';
    expiresAt: number;           // Expiration timestamp
}

// 🌟 PKCE ERROR TYPES - COMPREHENSIVE
export enum PKCEErrorType {
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

// 💪 PKCE RESULT INTERFACE
export interface PKCEResult<T = any> {
    success: boolean;
    data?: T;
    error?: {
        type: PKCEErrorType;
        message: string;
        userMessage: string;
        developerMessage: string;
        code: string;
        timestamp: string;
        retryable: boolean;
    };
}

// 🚀 INFINITY IQ PKCE STATE MANAGER - PRODUCTION READY
export class PKCEStateManager {
    private static getConfig() {
        // Dynamic import to avoid circular dependencies
        try {
            const { authConfig } = require('./authConfig');
            return authConfig.oauth.pkce;
        } catch {
            // Fallback to defaults if config not available
            return {
                storageKeyPrefix: 'cropgenius-pkce-',
                expirationMinutes: 10,
                codeVerifierLength: 128,
                stateLength: 32
            };
        }
    }

    private static get STORAGE_KEY_PREFIX() {
        return this.getConfig().storageKeyPrefix;
    }

    private static get STATE_EXPIRY_MS() {
        return this.getConfig().expirationMinutes * 60 * 1000;
    }

    private static get CODE_VERIFIER_LENGTH() {
        return this.getConfig().codeVerifierLength;
    }

    private static get STATE_LENGTH() {
        return this.getConfig().stateLength;
    }

    // 🔥 GENERATE CRYPTOGRAPHICALLY SECURE CODE VERIFIER
    static async generateCodeVerifier(): Promise<PKCEResult<string>> {
        try {
            logAuthEvent(AuthEventType.INITIALIZATION, 'Generating PKCE code verifier with INFINITY IQ security');

            // Use Web Crypto API for MAXIMUM security
            const array = new Uint8Array(this.CODE_VERIFIER_LENGTH);
            crypto.getRandomValues(array);

            // Convert to base64url encoding (RFC 7636 compliant)
            const codeVerifier = btoa(String.fromCharCode(...array))
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=/g, '');

            logAuthEvent(AuthEventType.INITIALIZATION, 'Code verifier generated successfully', {
                length: codeVerifier.length,
                entropy: 'cryptographically-secure'
            });

            return {
                success: true,
                data: codeVerifier
            };
        } catch (error) {
            const errorResult = {
                type: PKCEErrorType.CODE_VERIFIER_GENERATION_FAILED,
                message: error instanceof Error ? error.message : 'Unknown error',
                userMessage: 'Authentication setup failed. Please try again.',
                developerMessage: 'Failed to generate PKCE code verifier using Web Crypto API.',
                code: 'PKCE_001',
                timestamp: new Date().toISOString(),
                retryable: true
            };

            logAuthError(AuthEventType.INITIALIZATION, 'Code verifier generation failed', error as Error);

            return {
                success: false,
                error: errorResult
            };
        }
    }

    // 🌟 GENERATE SHA256 CODE CHALLENGE
    static async generateCodeChallenge(codeVerifier: string): Promise<PKCEResult<string>> {
        try {
            logAuthEvent(AuthEventType.INITIALIZATION, 'Generating SHA256 code challenge');

            // Encode the code verifier
            const encoder = new TextEncoder();
            const data = encoder.encode(codeVerifier);

            // Generate SHA256 hash
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);

            // Convert to base64url
            const hashArray = new Uint8Array(hashBuffer);
            const codeChallenge = btoa(String.fromCharCode(...hashArray))
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=/g, '');

            logAuthEvent(AuthEventType.INITIALIZATION, 'Code challenge generated successfully', {
                challengeLength: codeChallenge.length,
                method: 'S256'
            });

            return {
                success: true,
                data: codeChallenge
            };
        } catch (error) {
            const errorResult = {
                type: PKCEErrorType.CODE_CHALLENGE_GENERATION_FAILED,
                message: error instanceof Error ? error.message : 'Unknown error',
                userMessage: 'Authentication setup failed. Please try again.',
                developerMessage: 'Failed to generate SHA256 code challenge from code verifier.',
                code: 'PKCE_002',
                timestamp: new Date().toISOString(),
                retryable: true
            };

            logAuthError(AuthEventType.INITIALIZATION, 'Code challenge generation failed', error as Error);

            return {
                success: false,
                error: errorResult
            };
        }
    }

    // 💪 GENERATE UNIQUE STATE PARAMETER
    static generateState(): PKCEResult<string> {
        try {
            logAuthEvent(AuthEventType.INITIALIZATION, 'Generating unique state parameter');

            const array = new Uint8Array(this.STATE_LENGTH);
            crypto.getRandomValues(array);

            const state = btoa(String.fromCharCode(...array))
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=/g, '');

            logAuthEvent(AuthEventType.INITIALIZATION, 'State parameter generated successfully', {
                length: state.length,
                entropy: 'cryptographically-secure'
            });

            return {
                success: true,
                data: state
            };
        } catch (error) {
            const errorResult = {
                type: PKCEErrorType.STATE_PARAMETER_MISSING,
                message: error instanceof Error ? error.message : 'Unknown error',
                userMessage: 'Authentication setup failed. Please try again.',
                developerMessage: 'Failed to generate unique state parameter.',
                code: 'PKCE_003',
                timestamp: new Date().toISOString(),
                retryable: true
            };

            logAuthError(AuthEventType.INITIALIZATION, 'State parameter generation failed', error as Error);

            return {
                success: false,
                error: errorResult
            };
        }
    }

    // 🔥 STORE PKCE STATE WITH FALLBACK MECHANISMS
    static async storeState(pkceState: Omit<PKCEState, 'storageKey' | 'storageMethod' | 'expiresAt'>): Promise<PKCEResult<PKCEState>> {
        try {
            logAuthEvent(AuthEventType.INITIALIZATION, 'Storing PKCE state with INFINITY IQ fallbacks', {
                state: pkceState.state,
                hasRedirectTo: !!pkceState.redirectTo,
                instanceId: pkceState.instanceId
            });

            const expiresAt = Date.now() + this.STATE_EXPIRY_MS;
            const storageKey = `${this.STORAGE_KEY_PREFIX}${pkceState.state}`;

            const fullPkceState: PKCEState = {
                ...pkceState,
                storageKey,
                storageMethod: 'localStorage', // Will be updated based on actual storage used
                expiresAt
            };

            const stateJson = JSON.stringify(fullPkceState);

            // 🚀 TRY PRIMARY STORAGE: localStorage
            try {
                localStorage.setItem(storageKey, stateJson);
                fullPkceState.storageMethod = 'localStorage';

                logAuthEvent(AuthEventType.INITIALIZATION, 'PKCE state stored in localStorage successfully', {
                    storageKey,
                    expiresAt: new Date(expiresAt).toISOString()
                });

                return {
                    success: true,
                    data: fullPkceState
                };
            } catch (localStorageError) {
                logAuthEvent(AuthEventType.INITIALIZATION, 'localStorage failed, trying sessionStorage', {
                    error: localStorageError instanceof Error ? localStorageError.message : 'Unknown error'
                });
            }

            // 🌟 TRY SECONDARY STORAGE: sessionStorage
            try {
                sessionStorage.setItem(storageKey, stateJson);
                fullPkceState.storageMethod = 'sessionStorage';

                logAuthEvent(AuthEventType.INITIALIZATION, 'PKCE state stored in sessionStorage successfully', {
                    storageKey,
                    expiresAt: new Date(expiresAt).toISOString()
                });

                return {
                    success: true,
                    data: fullPkceState
                };
            } catch (sessionStorageError) {
                logAuthEvent(AuthEventType.INITIALIZATION, 'sessionStorage failed, using memory storage', {
                    error: sessionStorageError instanceof Error ? sessionStorageError.message : 'Unknown error'
                });
            }

            // 💪 FALLBACK: In-memory storage (for privacy mode)
            if (!window.cropgeniusPKCEMemoryStorage) {
                window.cropgeniusPKCEMemoryStorage = new Map();
            }

            window.cropgeniusPKCEMemoryStorage.set(storageKey, stateJson);
            fullPkceState.storageMethod = 'memory';

            logAuthEvent(AuthEventType.INITIALIZATION, 'PKCE state stored in memory successfully', {
                storageKey,
                expiresAt: new Date(expiresAt).toISOString(),
                warning: 'Using memory storage - state will not persist across page reloads'
            });

            return {
                success: true,
                data: fullPkceState
            };

        } catch (error) {
            const errorResult = {
                type: PKCEErrorType.CODE_VERIFIER_STORAGE_FAILED,
                message: error instanceof Error ? error.message : 'Unknown error',
                userMessage: 'Authentication setup failed. Please enable cookies and try again.',
                developerMessage: 'Failed to store PKCE state in any available storage mechanism.',
                code: 'PKCE_004',
                timestamp: new Date().toISOString(),
                retryable: true
            };

            logAuthError(AuthEventType.INITIALIZATION, 'PKCE state storage failed completely', error as Error);

            return {
                success: false,
                error: errorResult
            };
        }
    }

    // 🌟 RETRIEVE PKCE STATE BY STATE PARAMETER
    static async retrieveState(stateParam: string): Promise<PKCEResult<PKCEState | null>> {
        try {
            logAuthEvent(AuthEventType.OAUTH_CALLBACK, 'Retrieving PKCE state with INFINITY IQ precision', {
                stateParam,
                timestamp: new Date().toISOString()
            });

            const storageKey = `${this.STORAGE_KEY_PREFIX}${stateParam}`;
            let stateJson: string | null = null;
            let storageMethod: 'localStorage' | 'sessionStorage' | 'memory' | null = null;

            // 🔥 TRY PRIMARY STORAGE: localStorage
            try {
                stateJson = localStorage.getItem(storageKey);
                if (stateJson) {
                    storageMethod = 'localStorage';
                    logAuthEvent(AuthEventType.OAUTH_CALLBACK, 'PKCE state found in localStorage');
                }
            } catch (error) {
                logAuthEvent(AuthEventType.OAUTH_CALLBACK, 'localStorage retrieval failed, trying sessionStorage');
            }

            // 🌟 TRY SECONDARY STORAGE: sessionStorage
            if (!stateJson) {
                try {
                    stateJson = sessionStorage.getItem(storageKey);
                    if (stateJson) {
                        storageMethod = 'sessionStorage';
                        logAuthEvent(AuthEventType.OAUTH_CALLBACK, 'PKCE state found in sessionStorage');
                    }
                } catch (error) {
                    logAuthEvent(AuthEventType.OAUTH_CALLBACK, 'sessionStorage retrieval failed, trying memory storage');
                }
            }

            // 💪 TRY FALLBACK: In-memory storage
            if (!stateJson && window.cropgeniusPKCEMemoryStorage) {
                stateJson = window.cropgeniusPKCEMemoryStorage.get(storageKey) || null;
                if (stateJson) {
                    storageMethod = 'memory';
                    logAuthEvent(AuthEventType.OAUTH_CALLBACK, 'PKCE state found in memory storage');
                }
            }

            if (!stateJson) {
                logAuthEvent(AuthEventType.OAUTH_CALLBACK, 'PKCE state not found in any storage', {
                    stateParam,
                    storageKey,
                    availableKeys: this.getAvailableStorageKeys()
                });

                return {
                    success: true,
                    data: null
                };
            }

            // 🚀 PARSE AND VALIDATE STATE
            const pkceState: PKCEState = JSON.parse(stateJson);

            // Check expiration
            if (Date.now() > pkceState.expiresAt) {
                logAuthEvent(AuthEventType.OAUTH_CALLBACK, 'PKCE state expired, cleaning up', {
                    stateParam,
                    expiresAt: new Date(pkceState.expiresAt).toISOString(),
                    currentTime: new Date().toISOString()
                });

                // Clean up expired state
                await this.cleanupState(stateParam);

                return {
                    success: false,
                    error: {
                        type: PKCEErrorType.PKCE_FLOW_EXPIRED,
                        message: 'PKCE flow has expired',
                        userMessage: 'Sign-in process took too long. Please try signing in again.',
                        developerMessage: 'PKCE state expired. Increase expiration time or optimize flow.',
                        code: 'PKCE_005',
                        timestamp: new Date().toISOString(),
                        retryable: true
                    }
                };
            }

            logAuthEvent(AuthEventType.OAUTH_CALLBACK, 'PKCE state retrieved successfully', {
                stateParam,
                storageMethod,
                hasCodeVerifier: !!pkceState.codeVerifier,
                hasCodeChallenge: !!pkceState.codeChallenge,
                instanceId: pkceState.instanceId,
                redirectTo: pkceState.redirectTo
            });

            return {
                success: true,
                data: pkceState
            };

        } catch (error) {
            const errorResult = {
                type: PKCEErrorType.CODE_VERIFIER_RETRIEVAL_FAILED,
                message: error instanceof Error ? error.message : 'Unknown error',
                userMessage: 'Sign-in process was interrupted. Please try signing in again.',
                developerMessage: 'Failed to retrieve PKCE state from storage.',
                code: 'PKCE_006',
                timestamp: new Date().toISOString(),
                retryable: true
            };

            logAuthError(AuthEventType.OAUTH_CALLBACK, 'PKCE state retrieval failed', error as Error, {
                stateParam
            });

            return {
                success: false,
                error: errorResult
            };
        }
    }

    // 🔥 CLEANUP PKCE STATE AFTER USE
    static async cleanupState(stateParam: string): Promise<PKCEResult<void>> {
        try {
            logAuthEvent(AuthEventType.OAUTH_CALLBACK, 'Cleaning up PKCE state', {
                stateParam
            });

            const storageKey = `${this.STORAGE_KEY_PREFIX}${stateParam}`;

            // Clean from all possible storage locations
            try {
                localStorage.removeItem(storageKey);
            } catch (error) {
                // Ignore localStorage errors
            }

            try {
                sessionStorage.removeItem(storageKey);
            } catch (error) {
                // Ignore sessionStorage errors
            }

            if (window.cropgeniusPKCEMemoryStorage) {
                window.cropgeniusPKCEMemoryStorage.delete(storageKey);
            }

            logAuthEvent(AuthEventType.OAUTH_CALLBACK, 'PKCE state cleaned up successfully', {
                stateParam,
                storageKey
            });

            return {
                success: true
            };
        } catch (error) {
            logAuthError(AuthEventType.OAUTH_CALLBACK, 'PKCE state cleanup failed', error as Error, {
                stateParam
            });

            return {
                success: false,
                error: {
                    type: PKCEErrorType.CODE_VERIFIER_STORAGE_FAILED,
                    message: error instanceof Error ? error.message : 'Unknown error',
                    userMessage: 'Cleanup failed, but sign-in may still work.',
                    developerMessage: 'Failed to cleanup PKCE state from storage.',
                    code: 'PKCE_007',
                    timestamp: new Date().toISOString(),
                    retryable: false
                }
            };
        }
    }

    // 💪 CLEANUP EXPIRED STATES
    static async cleanupExpiredStates(): Promise<PKCEResult<number>> {
        try {
            logAuthEvent(AuthEventType.INITIALIZATION, 'Starting cleanup of expired PKCE states');

            let cleanedCount = 0;
            const currentTime = Date.now();

            // Clean localStorage
            try {
                const keysToRemove: string[] = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith(this.STORAGE_KEY_PREFIX)) {
                        try {
                            const stateJson = localStorage.getItem(key);
                            if (stateJson) {
                                const pkceState: PKCEState = JSON.parse(stateJson);
                                if (currentTime > pkceState.expiresAt) {
                                    keysToRemove.push(key);
                                }
                            }
                        } catch (error) {
                            // Invalid JSON, remove it
                            keysToRemove.push(key);
                        }
                    }
                }

                keysToRemove.forEach(key => {
                    localStorage.removeItem(key);
                    cleanedCount++;
                });
            } catch (error) {
                // Ignore localStorage errors
            }

            // Clean sessionStorage
            try {
                const keysToRemove: string[] = [];
                for (let i = 0; i < sessionStorage.length; i++) {
                    const key = sessionStorage.key(i);
                    if (key && key.startsWith(this.STORAGE_KEY_PREFIX)) {
                        try {
                            const stateJson = sessionStorage.getItem(key);
                            if (stateJson) {
                                const pkceState: PKCEState = JSON.parse(stateJson);
                                if (currentTime > pkceState.expiresAt) {
                                    keysToRemove.push(key);
                                }
                            }
                        } catch (error) {
                            // Invalid JSON, remove it
                            keysToRemove.push(key);
                        }
                    }
                }

                keysToRemove.forEach(key => {
                    sessionStorage.removeItem(key);
                    cleanedCount++;
                });
            } catch (error) {
                // Ignore sessionStorage errors
            }

            // Clean memory storage
            if (window.cropgeniusPKCEMemoryStorage) {
                const keysToRemove: string[] = [];
                window.cropgeniusPKCEMemoryStorage.forEach((value, key) => {
                    if (key.startsWith(this.STORAGE_KEY_PREFIX)) {
                        try {
                            const pkceState: PKCEState = JSON.parse(value);
                            if (currentTime > pkceState.expiresAt) {
                                keysToRemove.push(key);
                            }
                        } catch (error) {
                            // Invalid JSON, remove it
                            keysToRemove.push(key);
                        }
                    }
                });

                keysToRemove.forEach(key => {
                    window.cropgeniusPKCEMemoryStorage!.delete(key);
                    cleanedCount++;
                });
            }

            logAuthEvent(AuthEventType.INITIALIZATION, 'Expired PKCE states cleanup completed', {
                cleanedCount,
                currentTime: new Date(currentTime).toISOString()
            });

            return {
                success: true,
                data: cleanedCount
            };
        } catch (error) {
            logAuthError(AuthEventType.INITIALIZATION, 'Expired PKCE states cleanup failed', error as Error);

            return {
                success: false,
                error: {
                    type: PKCEErrorType.CODE_VERIFIER_STORAGE_FAILED,
                    message: error instanceof Error ? error.message : 'Unknown error',
                    userMessage: 'Storage cleanup failed, but authentication should still work.',
                    developerMessage: 'Failed to cleanup expired PKCE states.',
                    code: 'PKCE_008',
                    timestamp: new Date().toISOString(),
                    retryable: false
                }
            };
        }
    }

    // 🌟 GET AVAILABLE STORAGE KEYS FOR DEBUGGING
    private static getAvailableStorageKeys(): string[] {
        const keys: string[] = [];

        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.STORAGE_KEY_PREFIX)) {
                    keys.push(key);
                }
            }
        } catch (error) {
            // Ignore localStorage errors
        }

        try {
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                if (key && key.startsWith(this.STORAGE_KEY_PREFIX)) {
                    keys.push(key);
                }
            }
        } catch (error) {
            // Ignore sessionStorage errors
        }

        if (window.cropgeniusPKCEMemoryStorage) {
            window.cropgeniusPKCEMemoryStorage.forEach((_, key) => {
                if (key.startsWith(this.STORAGE_KEY_PREFIX)) {
                    keys.push(key);
                }
            });
        }

        return keys;
    }

    // 🚀 GENERATE COMPLETE PKCE STATE
    static async generateAndStoreState(redirectTo?: string, instanceId?: string): Promise<PKCEResult<PKCEState>> {
        try {
            logAuthEvent(AuthEventType.INITIALIZATION, 'Generating complete PKCE state with INFINITY IQ', {
                redirectTo,
                instanceId
            });

            // Generate all PKCE components
            const codeVerifierResult = await this.generateCodeVerifier();
            if (!codeVerifierResult.success) {
                return codeVerifierResult as PKCEResult<PKCEState>;
            }

            const codeChallengeResult = await this.generateCodeChallenge(codeVerifierResult.data!);
            if (!codeChallengeResult.success) {
                return codeChallengeResult as PKCEResult<PKCEState>;
            }

            const stateResult = this.generateState();
            if (!stateResult.success) {
                return stateResult as PKCEResult<PKCEState>;
            }

            // Create PKCE state object
            const pkceState: Omit<PKCEState, 'storageKey' | 'storageMethod' | 'expiresAt'> = {
                codeVerifier: codeVerifierResult.data!,
                codeChallenge: codeChallengeResult.data!,
                codeChallengeMethod: 'S256',
                state: stateResult.data!,
                timestamp: Date.now(),
                redirectTo,
                instanceId: instanceId || 'unknown'
            };

            // Store the state
            const storeResult = await this.storeState(pkceState);
            if (!storeResult.success) {
                return storeResult;
            }

            logAuthEvent(AuthEventType.INITIALIZATION, 'Complete PKCE state generated and stored successfully', {
                state: storeResult.data!.state,
                storageMethod: storeResult.data!.storageMethod,
                expiresAt: new Date(storeResult.data!.expiresAt).toISOString()
            });

            return storeResult;
        } catch (error) {
            const errorResult = {
                type: PKCEErrorType.CODE_VERIFIER_GENERATION_FAILED,
                message: error instanceof Error ? error.message : 'Unknown error',
                userMessage: 'Authentication setup failed. Please try again.',
                developerMessage: 'Failed to generate and store complete PKCE state.',
                code: 'PKCE_009',
                timestamp: new Date().toISOString(),
                retryable: true
            };

            logAuthError(AuthEventType.INITIALIZATION, 'Complete PKCE state generation failed', error as Error);

            return {
                success: false,
                error: errorResult
            };
        }
    }
}

// 🌟 EXTEND WINDOW INTERFACE FOR MEMORY STORAGE
declare global {
    interface Window {
        cropgeniusPKCEMemoryStorage?: Map<string, string>;
    }
}

// 🚀 INITIALIZE CLEANUP ON LOAD
if (typeof window !== 'undefined') {
    // Clean up expired states on page load
    PKCEStateManager.cleanupExpiredStates().then(result => {
        if (result.success && result.data! > 0) {
            console.log(`🧹 [PKCE MANAGER] Cleaned up ${result.data} expired PKCE states`);
        }
    });

    // Set up periodic cleanup (every 5 minutes)
    setInterval(() => {
        PKCEStateManager.cleanupExpiredStates();
    }, 5 * 60 * 1000);
}