import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Bell, User } from 'lucide-react';

const TopNav = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-lg border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">CropGenius</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 text-white/80 hover:text-white">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 text-white/80 hover:text-white">
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopNav;