
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Leaf, Cloud, ShoppingCart, MessageCircle, HelpCircle } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <div className="min-h-screen bg-soft-cream-200">
      {/* Floating AI Assistant Button */}
      <div className="fixed bottom-24 right-4 z-50">
        <Link to="/ai-assistant" className="flex items-center justify-center w-14 h-14 rounded-full bg-crop-green-500 text-white shadow-lg hover:bg-crop-green-600 transition-colors">
          <HelpCircle size={28} />
        </Link>
      </div>
      
      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-2 flex justify-around items-center z-40 shadow-lg">
        <Link 
          to="/" 
          className={`flex flex-col items-center ${isActive('/') ? 'text-crop-green-500' : 'text-gray-600'} hover:text-crop-green-600 transition-colors`}
        >
          <Home size={26} />
          <span className="text-sm font-medium mt-1">Home</span>
        </Link>
        
        <Link 
          to="/scan" 
          className={`flex flex-col items-center ${isActive('/scan') ? 'text-crop-green-500' : 'text-gray-600'} hover:text-crop-green-600 transition-colors`}
        >
          <Leaf size={26} />
          <span className="text-sm font-medium mt-1">Scan</span>
        </Link>
        
        <Link 
          to="/weather" 
          className={`flex flex-col items-center ${isActive('/weather') ? 'text-crop-green-500' : 'text-gray-600'} hover:text-crop-green-600 transition-colors`}
        >
          <Cloud size={26} />
          <span className="text-sm font-medium mt-1">Weather</span>
        </Link>
        
        <Link 
          to="/market" 
          className={`flex flex-col items-center ${isActive('/market') ? 'text-crop-green-500' : 'text-gray-600'} hover:text-crop-green-600 transition-colors`}
        >
          <ShoppingCart size={26} />
          <span className="text-sm font-medium mt-1">Market</span>
        </Link>
        
        <Link 
          to="/chat" 
          className={`flex flex-col items-center ${isActive('/chat') ? 'text-crop-green-500' : 'text-gray-600'} hover:text-crop-green-600 transition-colors`}
        >
          <MessageCircle size={26} />
          <span className="text-sm font-medium mt-1">Chat</span>
        </Link>
      </nav>
      
      {/* Main Content Area */}
      <main className="pb-24 min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default Layout;
