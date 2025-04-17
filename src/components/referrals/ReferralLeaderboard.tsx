
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Award, Users, Gift } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface LeaderboardItem {
  id: string;
  user_name: string;
  referral_count: number;
  badge?: 'gold' | 'silver' | 'bronze';
}

const ReferralLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch referral counts from Supabase
        const { data, error } = await supabase
          .from('referrals')
          .select('inviter_id, profiles!referrals_inviter_id_fkey(id, full_name)')
          .eq('status', 'accepted')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        if (!data) return;
        
        // Count the number of referrals per user
        const counts: Record<string, { count: number; name: string }> = {};
        data.forEach(row => {
          const inviterId = row.inviter_id;
          const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
          const name = profile?.full_name || 'Unknown Farmer';
          
          if (!counts[inviterId]) {
            counts[inviterId] = { count: 0, name };
          }
          counts[inviterId].count++;
        });
        
        // Convert to array and sort by count
        const leaders = Object.entries(counts).map(([id, { count, name }]) => ({
          id,
          user_name: name,
          referral_count: count
        }));
        leaders.sort((a, b) => b.referral_count - a.referral_count);
        
        // Add badges to top 3
        if (leaders.length > 0) leaders[0].badge = 'gold';
        if (leaders.length > 1) leaders[1].badge = 'silver';
        if (leaders.length > 2) leaders[2].badge = 'bronze';
        
        // Set the leaderboard
        setLeaderboard(leaders.slice(0, 10)); // Show top 10
        
        // Find user's rank
        const userIndex = leaders.findIndex(item => item.id === user.id);
        if (userIndex !== -1) {
          setUserRank(userIndex + 1);
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, [user]);
  
  // Get badge color for ranking
  const getBadgeColor = (badge?: 'gold' | 'silver' | 'bronze') => {
    switch (badge) {
      case 'gold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-900';
      case 'silver':
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700';
      case 'bronze':
        return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-900';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-900';
    }
  };
  
  // Get badge icon for ranking
  const getBadgeIcon = (badge?: 'gold' | 'silver' | 'bronze') => {
    switch (badge) {
      case 'gold':
        return <Trophy className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />;
      case 'silver':
        return <Award className="h-3 w-3 text-gray-600 dark:text-gray-400" />;
      case 'bronze':
        return <Gift className="h-3 w-3 text-amber-600 dark:text-amber-400" />;
      default:
        return null;
    }
  };
  
  // Calculate pro days reward
  const getProDaysReward = (badge?: 'gold' | 'silver' | 'bronze') => {
    switch (badge) {
      case 'gold':
        return 30;
      case 'silver':
        return 14;
      case 'bronze':
        return 7;
      default:
        return 0;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-1.5">
            <Users className="h-4 w-4 text-green-600" />
            Top Farmers This Week
          </CardTitle>
          
          {userRank ? (
            <Badge variant="outline" className="text-xs">
              Your Rank: #{userRank}
            </Badge>
          ) : null}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 pb-3">
        {loading ? (
          <div className="flex justify-center p-4">
            <div className="animate-pulse">Loading leaderboard...</div>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center p-4 text-sm text-muted-foreground">
            No referrals recorded yet. Be the first to invite friends!
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((item, index) => (
              <div 
                key={item.id} 
                className={`flex items-center justify-between p-2 rounded-md ${item.id === user?.id ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-900/20'}`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 text-center font-medium text-sm">
                    {index + 1}
                  </div>
                  <span className="truncate max-w-[120px]">
                    {item.user_name}
                    {item.id === user?.id && (
                      <span className="text-xs text-green-600 ml-1">(You)</span>
                    )}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-xs ${getBadgeColor(item.badge)}`}>
                    {getBadgeIcon(item.badge)}
                    <span className="ml-1">{item.referral_count} invites</span>
                  </Badge>
                  
                  {item.badge && (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-0 text-xs">
                      +{getProDaysReward(item.badge)} days Pro
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReferralLeaderboard;
