/**
 * 👥 FARMER COMMUNITY HUB - Trillion-Dollar Social Agriculture
 * WhatsApp of farming with voice-first sharing and local circles
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHapticFeedback } from '@/lib/hapticFeedback';
import { useToast } from './DopamineToast';

interface FarmerPost {
  id: string;
  author: {
    name: string;
    avatar: string;
    reputation: number;
    location: string;
  };
  content: {
    text?: string;
    image?: string;
    voice?: string;
    type: 'text' | 'image' | 'voice' | 'achievement';
  };
  engagement: {
    likes: number;
    comments: number;
    shares: number;
  };
  timestamp: number;
  tags: string[];
}

interface LocalCircle {
  id: string;
  name: string;
  memberCount: number;
  location: string;
  primaryCrop: string;
  recentActivity: number;
}

export const FarmerCommunityHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'feed' | 'circles' | 'experts'>('feed');
  const [posts, setPosts] = useState<FarmerPost[]>([]);
  const [circles, setCircles] = useState<LocalCircle[]>([]);
  const { triggerMedium, triggerSuccess } = useHapticFeedback();
  const { success, info } = useToast();

  useEffect(() => {
    loadCommunityData();
  }, []);

  const loadCommunityData = async () => {
    // Mock data - would integrate with Supabase
    const mockPosts: FarmerPost[] = [
      {
        id: '1',
        author: {
          name: 'Sarah Mwangi',
          avatar: '👩🏾‍🌾',
          reputation: 95,
          location: 'Nakuru, Kenya'
        },
        content: {
          text: 'Just harvested 2 tons of maize! Used the AI disease scanner 3 times this season - zero crop loss! 🌽',
          type: 'achievement'
        },
        engagement: { likes: 24, comments: 8, shares: 5 },
        timestamp: Date.now() - 2 * 60 * 60 * 1000,
        tags: ['maize', 'harvest', 'success']
      },
      {
        id: '2',
        author: {
          name: 'James Ochieng',
          avatar: '👨🏿‍🌾',
          reputation: 87,
          location: 'Kisumu, Kenya'
        },
        content: {
          text: 'Neem oil worked perfectly for my tomatoes! Thanks to whoever recommended it last week 🍅',
          image: 'tomato_field.jpg',
          type: 'image'
        },
        engagement: { likes: 18, comments: 12, shares: 3 },
        timestamp: Date.now() - 4 * 60 * 60 * 1000,
        tags: ['tomatoes', 'organic', 'pest-control']
      }
    ];

    const mockCircles: LocalCircle[] = [
      {
        id: '1',
        name: 'Nakuru Maize Growers',
        memberCount: 247,
        location: 'Nakuru County',
        primaryCrop: 'Maize',
        recentActivity: 15
      },
      {
        id: '2',
        name: 'Organic Farmers Kenya',
        memberCount: 156,
        location: 'Nationwide',
        primaryCrop: 'Mixed',
        recentActivity: 8
      }
    ];

    setPosts(mockPosts);
    setCircles(mockCircles);
  };

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, engagement: { ...post.engagement, likes: post.engagement.likes + 1 }}
        : post
    ));
    triggerSuccess();
    success('Liked!', 'Supporting fellow farmers', '❤️');
  };

  const handleShare = (postId: string) => {
    triggerMedium();
    info('Shared!', 'Spreading farming knowledge', '📤');
  };

  const renderFeed = () => (
    <div className="space-y-4">
      {/* Create Post */}
      <motion.div
        className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-glow-green"
        whileHover={{ scale: 1.01 }}
      >
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-600 rounded-xl flex items-center justify-center">
            <span className="text-xl">👨🏿‍🌾</span>
          </div>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Share your farming experience..."
              className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-800 placeholder-gray-500"
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex space-x-3">
            <motion.button
              className="flex items-center space-x-1 text-xs text-gray-600 hover:text-green-600"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>📸</span>
              <span>Photo</span>
            </motion.button>
            <motion.button
              className="flex items-center space-x-1 text-xs text-gray-600 hover:text-green-600"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>🎤</span>
              <span>Voice</span>
            </motion.button>
          </div>
          <motion.button
            className="bg-green-primary text-white px-4 py-1 rounded-lg text-xs font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Share
          </motion.button>
        </div>
      </motion.div>

      {/* Posts Feed */}
      {posts.map((post, index) => (
        <motion.div
          key={post.id}
          className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-glow-green"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          {/* Post Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                <span className="text-xl">{post.author.avatar}</span>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-800">{post.author.name}</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-600">{post.author.location}</span>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-green-600">⭐</span>
                    <span className="text-xs text-green-600 font-medium">{post.author.reputation}</span>
                  </div>
                </div>
              </div>
            </div>
            <span className="text-xs text-gray-500">
              {Math.floor((Date.now() - post.timestamp) / (1000 * 60 * 60))}h ago
            </span>
          </div>

          {/* Post Content */}
          <div className="mb-3">
            <p className="text-sm text-gray-800 mb-2">{post.content.text}</p>
            {post.content.image && (
              <div className="bg-green-100 rounded-xl h-32 flex items-center justify-center mb-2">
                <span className="text-4xl">🌾</span>
              </div>
            )}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {post.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-xs bg-green-500/20 text-green-700 px-2 py-1 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Post Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <div className="flex space-x-4">
              <motion.button
                onClick={() => handleLike(post.id)}
                className="flex items-center space-x-1 text-xs text-gray-600 hover:text-red-500"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>❤️</span>
                <span>{post.engagement.likes}</span>
              </motion.button>
              <motion.button
                className="flex items-center space-x-1 text-xs text-gray-600 hover:text-blue-500"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>💬</span>
                <span>{post.engagement.comments}</span>
              </motion.button>
              <motion.button
                onClick={() => handleShare(post.id)}
                className="flex items-center space-x-1 text-xs text-gray-600 hover:text-green-500"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>📤</span>
                <span>{post.engagement.shares}</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderCircles = () => (
    <div className="space-y-4">
      <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-glow-green">
        <h3 className="text-lg font-bold text-gray-800 mb-3">🌍 Local Farmer Circles</h3>
        <p className="text-sm text-gray-600 mb-4">Connect with farmers in your area growing similar crops</p>
        
        {circles.map((circle, index) => (
          <motion.div
            key={circle.id}
            className="bg-white/5 backdrop-blur-sm border border-white/5 rounded-xl p-3 mb-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-gray-800">{circle.name}</h4>
                <div className="flex items-center space-x-3 mt-1">
                  <span className="text-xs text-gray-600">📍 {circle.location}</span>
                  <span className="text-xs text-green-600">🌾 {circle.primaryCrop}</span>
                </div>
                <div className="flex items-center space-x-3 mt-1">
                  <span className="text-xs text-gray-600">👥 {circle.memberCount} members</span>
                  <span className="text-xs text-blue-600">💬 {circle.recentActivity} active today</span>
                </div>
              </div>
              <motion.button
                className="bg-green-primary text-white px-3 py-1 rounded-lg text-xs font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  triggerMedium();
                  success('Joined Circle!', `Welcome to ${circle.name}`, '🎉');
                }}
              >
                Join
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderExperts = () => (
    <div className="space-y-4">
      <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-glow-green">
        <h3 className="text-lg font-bold text-gray-800 mb-3">🧑‍🌾 Ask the Experts</h3>
        <p className="text-sm text-gray-600 mb-4">Get advice from certified agronomists and experienced farmers</p>
        
        <motion.div
          className="bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-sm border border-white/10 rounded-xl p-4 mb-4"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl">👨‍🔬</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-800">Dr. Peter Kamau</h4>
              <p className="text-xs text-gray-600">Crop Protection Specialist</p>
              <div className="flex items-center space-x-1">
                <span className="text-xs text-green-600">⭐⭐⭐⭐⭐</span>
                <span className="text-xs text-gray-600">(4.9/5)</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-700 mb-3">
            "Available for voice consultations on pest management and organic farming methods."
          </p>
          <motion.button
            className="bg-green-primary text-white px-4 py-2 rounded-xl text-sm font-medium w-full"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              triggerSuccess();
              info('Expert Chat', 'Connecting you with Dr. Kamau', '🗣️');
            }}
          >
            🎤 Start Voice Chat
          </motion.button>
        </motion.div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
      {/* Tab Navigation */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-1 mb-6 shadow-glow-green">
        <div className="flex">
          {[
            { key: 'feed', label: 'Community Feed', icon: '📱' },
            { key: 'circles', label: 'Local Circles', icon: '🌍' },
            { key: 'experts', label: 'Ask Experts', icon: '🧑‍🌾' }
          ].map((tab) => (
            <motion.button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key as any);
                triggerMedium();
              }}
              className={`flex-1 py-3 px-2 text-sm font-medium rounded-xl transition-all ${
                activeTab === tab.key
                  ? 'bg-green-primary text-white shadow-glow-green'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'feed' && renderFeed()}
          {activeTab === 'circles' && renderCircles()}
          {activeTab === 'experts' && renderExperts()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};