
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import CropScanner from "@/components/scanner/CropScanner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/utils/authService";
import { Camera, Sparkles, Zap, CheckCircle2, AlertTriangle, Leaf } from "lucide-react";
import { motion } from "framer-motion";

const ScanPage = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [scanHistory, setScanHistory] = useState([
    {
      id: 1,
      crop: 'Maize',
      disease: 'Leaf Blight',
      confidence: 94.5,
      severity: 'Medium',
      date: '2 hours ago',
      status: 'treated'
    },
    {
      id: 2,
      crop: 'Tomatoes',
      disease: 'Early Blight',
      confidence: 87.2,
      severity: 'High',
      date: '1 day ago',
      status: 'pending'
    },
    {
      id: 3,
      crop: 'Beans',
      disease: 'Healthy',
      confidence: 98.1,
      severity: 'None',
      date: '3 days ago',
      status: 'healthy'
    }
  ]);
  
  // Get the current user ID
  useEffect(() => {
    const fetchUserId = async () => {
      const { user } = await getCurrentUser();
      if (user) {
        setUserId(user.id);
      }
    };
    
    fetchUserId();
  }, []);
  
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'none': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'treated': return <Zap className="h-4 w-4 text-blue-600" />;
      case 'pending': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default: return <Leaf className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                <Camera className="h-6 w-6 text-white" />
              </div>
              AI Crop Scanner
            </h1>
            <p className="text-muted-foreground mt-1">
              Advanced disease detection with 99.7% accuracy
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              AI Powered
            </Badge>
            <Badge className="bg-green-100 text-green-700 border-green-200">
              {scanHistory.length} Scans Today
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="scanner" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="scanner">New Scan</TabsTrigger>
            <TabsTrigger value="history">Scan History</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>
          
          <TabsContent value="scanner" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Scanner */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="h-5 w-5" />
                      Crop Disease Scanner
                    </CardTitle>
                    <CardDescription>
                      Take a photo or upload an image to analyze your crops for diseases, pests, and health issues.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CropScanner />
                  </CardContent>
                </Card>
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Accuracy Rate</span>
                      <span className="font-bold text-green-600">99.7%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Diseases Detected</span>
                      <span className="font-bold">150+</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Crops Supported</span>
                      <span className="font-bold">25+</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Response Time</span>
                      <span className="font-bold text-blue-600">&lt; 3 sec</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">How It Works</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs font-bold text-green-600">1</div>
                      <div>
                        <p className="font-medium text-sm">Capture Image</p>
                        <p className="text-xs text-muted-foreground">Take a clear photo of affected plant parts</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">2</div>
                      <div>
                        <p className="font-medium text-sm">AI Analysis</p>
                        <p className="text-xs text-muted-foreground">Advanced AI identifies diseases and issues</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-bold text-purple-600">3</div>
                      <div>
                        <p className="font-medium text-sm">Get Treatment</p>
                        <p className="text-xs text-muted-foreground">Receive detailed treatment recommendations</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Scan History</CardTitle>
                <CardDescription>
                  Review your previous crop scans and their results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scanHistory.map((scan, index) => (
                    <motion.div
                      key={scan.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          {getStatusIcon(scan.status)}
                        </div>
                        <div>
                          <h4 className="font-medium">{scan.crop}</h4>
                          <p className="text-sm text-muted-foreground">{scan.disease}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`text-xs ${getSeverityColor(scan.severity)}`}>
                            {scan.severity}
                          </Badge>
                          <span className="text-sm font-medium">{scan.confidence}%</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{scan.date}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    AI Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">Disease Trend Alert</h4>
                    <p className="text-sm text-blue-700">
                      Leaf blight cases have increased by 23% in your region this week. Consider preventive treatments.
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-900 mb-2">Health Improvement</h4>
                    <p className="text-sm text-green-700">
                      Your crop health score improved by 15% since last week. Great job following treatment recommendations!
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <h4 className="font-medium text-orange-900 mb-2">Weather Impact</h4>
                    <p className="text-sm text-orange-700">
                      High humidity this week may increase fungal disease risk. Monitor crops closely.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Treatment Effectiveness</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Fungicide Treatment</span>
                        <span className="text-sm text-green-600 font-bold">92% Success</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Organic Treatment</span>
                        <span className="text-sm text-blue-600 font-bold">78% Success</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Preventive Care</span>
                        <span className="text-sm text-purple-600 font-bold">85% Success</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ScanPage;
