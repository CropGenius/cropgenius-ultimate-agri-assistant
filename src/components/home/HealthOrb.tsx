import { motion } from 'framer-motion';
import { useState } from 'react';
import { X } from 'lucide-react';

interface HealthOrbProps {
  score: number;
  tasks: { id: string; title: string }[];
}

export const HealthOrb: React.FC<HealthOrbProps> = ({ score, tasks }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getGradient = (s: number) => {
    if (s > 80) return 'from-green-400 to-emerald-500';
    if (s > 60) return 'from-yellow-400 to-amber-500';
    return 'from-red-500 to-rose-600';
  };

  return (
    <>
      <motion.div
        className="relative w-48 h-48 mx-auto cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        <motion.div
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${getGradient(score)}`}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <div className="absolute inset-2 bg-gray-800 rounded-full flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-5xl font-bold">{score}</div>
            <div className="text-sm tracking-widest uppercase">Farm Health</div>
          </div>
        </div>
      </motion.div>

      {isModalOpen && (
        <motion.div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setIsModalOpen(false)}
        >
          <motion.div
            className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm border border-white/20"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Top Priorities</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X />
              </button>
            </div>
            <ul className="space-y-3">
              {tasks.length > 0 ? tasks.slice(0, 3).map(task => (
                <li key={task.id} className="bg-gray-800 p-3 rounded-lg text-white">
                  {task.title}
                </li>
              )) : <p className='text-gray-400'>No urgent tasks right now. Great job!</p>}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};
