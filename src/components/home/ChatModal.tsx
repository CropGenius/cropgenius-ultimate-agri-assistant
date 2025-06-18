import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/70 z-[100] flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-gray-900 w-full max-w-lg h-[85%] rounded-t-2xl border-t border-x border-white/20 flex flex-col shadow-2xl"
            initial={{ y: '100%' }}
            animate={{ y: '0%' }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-white/20 flex-shrink-0">
              <h2 className="text-xl font-bold text-white">CropGenius AI</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700">
                <X />
              </button>
            </div>
            <div className="flex-grow p-4 space-y-4 overflow-y-auto">
              <div className="text-white bg-gradient-to-r from-purple-600 to-indigo-600 p-3 rounded-lg max-w-xs self-start">
                Hello! How can I help you optimize your farm today?
              </div>
               <div className="text-white bg-gray-700 p-3 rounded-lg max-w-xs self-end ml-auto">
                How do I treat maize rust?
              </div>
            </div>
            <div className="p-4 border-t border-white/20 bg-gray-900/50 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ask me anything..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
                <button className="bg-purple-600 p-2 rounded-lg text-white hover:bg-purple-700 transition-colors transform hover:scale-105">
                  <Send />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
