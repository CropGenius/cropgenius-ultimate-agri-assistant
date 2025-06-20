import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { getUserProfile } from '@/services/userService';

// Query key factory for user profile queries
const userProfileKeys = {
  profile: (userId: string) => ['user-profile', userId] as const,
};

/**
 * Hook to fetch the current user's profile.
 * It uses React Query for caching, refetching, and state management.
 * The query is automatically disabled if no user is authenticated.
 */
export const useUserProfile = () => {
  const { user } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: userProfileKeys.profile(userId!),
    queryFn: () => getUserProfile(userId!),
    // The query will not execute until the userId exists
    enabled: !!userId,
    // Keep data fresh but not too aggressively
    staleTime: 1000 * 60 * 5, // 5 minutes
    // Cache data for longer to avoid re-fetching on every mount
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}; 