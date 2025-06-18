import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ProSwipeBanner = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-transparent z-40 max-w-[414px] mx-auto">
      <motion.div
        className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-xl p-4 text-white text-center shadow-lg cursor-pointer"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 1, type: 'spring', stiffness: 100 }}
        drag="y"
        dragConstraints={{ top: -100, bottom: 0 }}
        onDragEnd={(_, info) => {
          if (info.offset.y < -50) {
            navigate('/referrals'); // Or your pro upgrade page
          }
        }}
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <Star className="text-yellow-300" />
          <h3 className="font-bold text-lg">Go Pro</h3>
        </div>
        <p className="text-sm mb-2">Swipe up to unlock AI predictions & more.</p>
        <p className="text-xs text-gray-300">+15k farmers trust us this week</p>
      </motion.div>
    </div>
  );
};
