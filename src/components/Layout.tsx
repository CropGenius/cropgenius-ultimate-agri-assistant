
import React from "react";
import { Link } from "react-router-dom";
import { Menu, Home, Seedling, Cloud, ShoppingCart } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-crop-green-50 to-white">
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 flex justify-around items-center z-50">
        <Link to="/" className="flex flex-col items-center text-crop-green-600 hover:text-crop-green-700 transition-colors">
          <Home size={24} />
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link to="/scan" className="flex flex-col items-center text-crop-green-600 hover:text-crop-green-700 transition-colors">
          <Seedling size={24} />
          <span className="text-xs mt-1">Scan</span>
        </Link>
        <Link to="/weather" className="flex flex-col items-center text-crop-green-600 hover:text-crop-green-700 transition-colors">
          <Cloud size={24} />
          <span className="text-xs mt-1">Weather</span>
        </Link>
        <Link to="/market" className="flex flex-col items-center text-crop-green-600 hover:text-crop-green-700 transition-colors">
          <ShoppingCart size={24} />
          <span className="text-xs mt-1">Market</span>
        </Link>
      </nav>
      <main className="pb-20 min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default Layout;
