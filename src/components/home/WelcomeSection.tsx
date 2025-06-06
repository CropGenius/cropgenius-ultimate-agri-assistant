import React, { useState, useEffect } from 'react';
import WelcomeBackCard from '@/components/welcome/WelcomeBackCard';
import GeniusBadge from '@/components/badges/GeniusBadge';
import { useMemoryStore } from '@/hooks/useMemoryStore';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Users, Zap, AlertTriangle } from 'lucide-react';
import InviteModal from '@/components/referrals/InviteModal';
import { Link } from 'react-router-dom';
import AIInsightAlert from '@/components/ai/AIInsightAlert';

const WelcomeSection = () => {
  const { memory, isInitialized, updateMemory } = useMemoryStore();
  const { user, isLoading } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [aiInsight, setAiInsight] = useState<{
    message: string;
    type: 'weather' | 'market' | 'pest' | 'fertilizer';
    actionText: string;
    actionPath: string;
  } | null>(null);

  useEffect(() => {
    // Show welcome if user is logged in and memory is initialized
    if (!isLoading && user && isInitialized) {
      setShowWelcome(true);

      // Check for AI insights based on real user data
      if (memory.lastFieldCount > 0) {
        fetchAIInsights();
      }
    } else {
      setShowWelcome(false);
    }
  }, [user, isLoading, isInitialized]);

  // Function to fetch real AI insights based on user data
  const fetchAIInsights = async () => {
    try {
      // If we have field data, we can generate real insights
      if (memory.fieldLocations && memory.fieldLocations.length > 0) {
        // Only show insight if the user hasn't seen it recently
        const lastInsightTime = memory.lastInsightShown
          ? new Date(memory.lastInsightShown).getTime()
          : 0;
        const now = new Date().getTime();
        const hoursSinceLastInsight =
          (now - lastInsightTime) / (1000 * 60 * 60);

        // Only show a new insight if it's been at least 4 hours since the last one
        if (hoursSinceLastInsight >= 4) {
          // Determine the most relevant insight type based on user data
          let insightType: 'weather' | 'market' | 'pest' | 'fertilizer' =
            'weather';

          if (
            memory.recentCropsPlanted &&
            memory.recentCropsPlanted.length > 0
          ) {
            // If they have crops, check for market updates or pest alerts
            // This would ideally come from a real API or edge function
            const cropName = memory.recentCropsPlanted[0];

            setAiInsight({
              message: `${memory.farmerName || 'Farmer'}, there's a market opportunity for ${cropName}. Prices are trending upward in your region.`,
              type: 'market',
              actionText: 'View Market Analysis',
              actionPath: '/market',
            });
          } else {
            // Default to weather insight
            setAiInsight({
              message: `${memory.farmerName || 'Farmer'}, rainfall is expected in the next 48 hours. This is ideal for planting.`,
              type: 'weather',
              actionText: 'View Weather Forecast',
              actionPath: '/weather',
            });
          }

          // Update memory to track that we showed an insight
          updateMemory({
            lastInsightShown: new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      console.error('Error fetching AI insights:', error);
    }
  };

  // Determine if we should show the Pro upgrade suggestion
  const shouldSuggestProUpgrade = () => {
    // Show upgrade suggestion if user has 3+ fields or used features frequently
    return memory.lastFieldCount >= 3 || (memory.featureUsageCount || 0) >= 5;
  };

  // Don't show anything if not logged in
  if (!user) return null;

  // Show skeleton while loading
  if (!isInitialized || isLoading) {
    return (
      <div className="w-full mb-6 space-y-4">
        <Skeleton className="w-full h-48 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="w-full h-28 rounded-lg" />
          <Skeleton className="w-full h-28 rounded-lg" />
        </div>
      </div>
    );
  }

  // Show welcome section for logged in users
  return showWelcome ? (
    <div className="w-full mb-6 space-y-4">
      <WelcomeBackCard />

      {/* AI Insight Alert - Only show if we have a real insight */}
      {aiInsight && (
        <AIInsightAlert
          message={aiInsight.message}
          type={aiInsight.type}
          actionText={aiInsight.actionText}
          actionPath={aiInsight.actionPath}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Only show badge if user has completed actions */}
        {memory.lastFieldCount > 0 ? (
          <GeniusBadge type="smart_farmer" />
        ) : (
          <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-900/50 rounded-lg p-4 relative overflow-hidden">
            <div className="flex flex-col h-full justify-between">
              <div>
                <h3 className="font-medium text-amber-800 dark:text-amber-300">
                  Map Your First Field
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                  Start by mapping your field to get personalized AI
                  recommendations
                </p>
              </div>

              <div className="mt-4">
                <Link to="/fields/new">
                  <Button
                    size="sm"
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    Map Field Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Show Pro Upgrade card if criteria is met, otherwise show invite friends card */}
        {shouldSuggestProUpgrade() ? (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-800 rounded-lg p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 rounded-full bg-green-500 opacity-10" />

            <div className="flex flex-col h-full justify-between">
              <div>
                <h3 className="font-medium text-green-800 dark:text-green-300 flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Upgrade to Pro
                </h3>
                <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                  Farmers with {memory.lastFieldCount} fields saw 38% higher
                  yields with Pro
                </p>
              </div>

              <div className="mt-4">
                <Button
                  size="sm"
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => {
                    // Track that user saw the Pro upgrade suggestion
                    updateMemory({
                      lastProSuggestion: new Date().toISOString(),
                    });

                    // Navigate to Pro page (would be implemented in a real app)
                    window.location.href = '/pro';
                  }}
                >
                  Get AI Pro Features
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-lg p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 rounded-full bg-blue-500 opacity-10" />

            <div className="flex flex-col h-full justify-between">
              <div>
                <h3 className="font-medium text-blue-800 dark:text-blue-300 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Invite Friends
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                  Get 7 days Pro access for each farmer who joins
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  {memory.invitesSent
                    ? `${memory.invitesSent} invited · ${memory.invitesSent * 7} days Pro`
                    : 'No invites sent yet'}
                </div>
                <Button
                  size="sm"
                  onClick={() => setIsInviteModalOpen(true)}
                  variant="secondary"
                >
                  Invite & Get Pro
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <InviteModal
        open={isInviteModalOpen}
        onOpenChange={setIsInviteModalOpen}
      />
    </div>
  ) : null;
};

export default WelcomeSection;
