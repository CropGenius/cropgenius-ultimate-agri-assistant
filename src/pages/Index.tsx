
import { Card } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { Leaf, Cloud, ShoppingCart, AlertTriangle } from "lucide-react";

const Index = () => {
  return (
    <Layout>
      <div className="p-6 animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-crop-green-700 mb-2">Welcome to CropGenius</h1>
          <p className="text-gray-600">Your AI-powered farming assistant</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 hover:shadow-lg transition-shadow animate-slide-in bg-white/80 backdrop-blur">
            <Leaf className="w-8 h-8 text-crop-green-600 mb-2" />
            <h3 className="font-semibold text-sm">Crop Scanner</h3>
            <p className="text-xs text-gray-600 mt-1">Diagnose plant health</p>
          </Card>

          <Card className="p-4 hover:shadow-lg transition-shadow animate-slide-in bg-white/80 backdrop-blur">
            <Cloud className="w-8 h-8 text-sky-blue-600 mb-2" />
            <h3 className="font-semibold text-sm">Weather</h3>
            <p className="text-xs text-gray-600 mt-1">Local forecast</p>
          </Card>

          <Card className="p-4 hover:shadow-lg transition-shadow animate-slide-in bg-white/80 backdrop-blur">
            <ShoppingCart className="w-8 h-8 text-soil-brown-600 mb-2" />
            <h3 className="font-semibold text-sm">Marketplace</h3>
            <p className="text-xs text-gray-600 mt-1">Buy & sell crops</p>
          </Card>

          <Card className="p-4 hover:shadow-lg transition-shadow animate-slide-in bg-white/80 backdrop-blur">
            <AlertTriangle className="w-8 h-8 text-yellow-600 mb-2" />
            <h3 className="font-semibold text-sm">Alerts</h3>
            <p className="text-xs text-gray-600 mt-1">Important updates</p>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
