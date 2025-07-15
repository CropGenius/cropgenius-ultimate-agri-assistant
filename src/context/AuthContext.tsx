// Re-export everything from AuthProvider to maintain backward compatibility
export { AuthProvider, useAuthContext as useAuth } from '@/providers/AuthProvider';

// Export types for backward compatibility
export type { UserProfile, AuthState } from '@/hooks/useAuth';
