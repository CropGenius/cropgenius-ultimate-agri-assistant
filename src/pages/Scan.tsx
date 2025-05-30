import React, { useContext } from 'react';
import { getFallbackUserId } from '../utils/fallbackUser';
import AuthContext from '../context/AuthContext';
import Layout from '../components/Layout';
import CropScanner from "@/components/scanner/CropScanner";
import FieldBrainAssistant from "@/components/ai/FieldBrainAssistant";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FieldBrainProvider } from "@/hooks/useFieldBrain";

const ScanPage = () => {
  const { user } = useContext(AuthContext);
  // Use a default user ID since we don't have authentication
  const userId = getFallbackUserId(user?.id);
  
  return (
    <Layout>
      <Tabs defaultValue="scanner" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">AI Crop Scanner</h1>
          <TabsList>
            <TabsTrigger value="scanner">Scanner</TabsTrigger>
            <TabsTrigger value="assistant">AI Assistant</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="scanner" className="mt-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Scan Your Crops</CardTitle>
              <CardDescription>
                Take a photo or upload an image to analyze your crops.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CropScanner />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="assistant" className="mt-0">
          {userId ? (
            <FieldBrainProvider userId={userId}>
              <FieldBrainAssistant />
            </FieldBrainProvider>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Loading AI Assistant</CardTitle>
                <CardDescription>
                  Please wait while we initialize the AI assistant...
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default ScanPage;
