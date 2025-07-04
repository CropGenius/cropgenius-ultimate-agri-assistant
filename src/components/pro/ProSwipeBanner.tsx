import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon, ArrowRightIcon } from 'lucide-react';

interface ProSwipeBannerProps {
  onUpgrade?: () => void;
}

export const ProSwipeBanner: React.FC<ProSwipeBannerProps> = ({ onUpgrade }) => {
  const { user } = useAuth();
  const [showBanner, setShowBanner] = useState(true);
  const [referralCode, setReferralCode] = useState('');

  useEffect(() => {
    if (user) {
      // Check if user has already upgraded
      checkProStatus();
    }
  }, [user]);

  const checkProStatus = async () => {
    if (!user) return;
    
    const { data: userData } = await supabase
      .from('users')
      .select('pro_status, referral_code')
      .eq('id', user.id)
      .single();

    if (userData?.pro_status) {
      setShowBanner(false);
    } else {
      setReferralCode(userData?.referral_code || '');
    }
  };

  const handleReferFriend = async () => {
    if (!user) return;
    
    try {
      // Generate referral code if none exists
      if (!referralCode) {
        const newCode = `CG-${Math.random().toString(36).substr(2, 9)}`;
        await supabase
          .from('users')
          .update({ referral_code: newCode })
          .eq('id', user.id);
        setReferralCode(newCode);
      }

      // Copy referral link to clipboard
      const referralLink = `${window.location.origin}/signup?ref=${referralCode}`;
      await navigator.clipboard.writeText(referralLink);
      
      // Show success message
      alert('Referral link copied to clipboard! Share it with your farming friends.');
    } catch (error) {
      console.error('Error generating referral:', error);
      alert('Failed to generate referral link. Please try again.');
    }
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 z-50"
        >
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SparklesIcon className="w-6 h-6" />
                <div>
                  <h3 className="font-semibold">Upgrade to Pro</h3>
                  <p className="text-sm">Get advanced crop insights, market intelligence, and priority support</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleReferFriend}
                  className="px-4 py-2 bg-white text-blue-600 rounded-full text-sm font-medium hover:bg-gray-100"
                >
                  Refer a Friend
                </button>
                <button
                  onClick={() => {
                    if (onUpgrade) onUpgrade();
                    setShowBanner(false);
                  }}
                  className="px-6 py-2 bg-white text-blue-600 rounded-full text-sm font-medium hover:bg-gray-100 flex items-center gap-2"
                >
                  Upgrade Now
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
