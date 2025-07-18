// 🚀 CROPGENIUS INFINITY IQ PKCE DEBUG DASHBOARD
// Development-only PKCE flow debugging and monitoring for GENIUS developers! 🔥💪

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Key, 
  Database, 
  Activity, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Download
} from 'lucide-react';
import { PKCEStateManager, PKCEState } from '@/utils/pkceManager';
import { oauthFlowManager, getOAuthDiagnostics } from '@/utils/oauthFlowManager';
import { SupabaseManager } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// 🔥 PKCE DEBUG DASHBOARD - ONLY FOR DEVELOPMENT
export default function PKCEDebugDashboard() {
  const [isVisible, setIsVisible] = useState(false);
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [storageStates, setStorageStates] = useState<PKCEState[]>([]);
  const [showSensitiveData, setShowSensitiveData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 🌟 LOAD DIAGNOSTICS
  const loadDiagnostics = async () => {
    try {
      setIsLoading(true);
      const diag = await getOAuthDiagnostics();
      setDiagnostics(diag);
      
      // Load stored PKCE states
      const states = await loadStoredPKCEStates();
      setStorageStates(states);
    } catch (error) {
      console.error('Failed to load PKCE diagnostics:', error);
      toast.error('Failed to load PKCE diagnostics');
    } finally {
      setIsLoading(false);
    }
  };

  // 🔍 LOAD STORED PKCE STATES
  const loadStoredPKCEStates = async (): Promise<PKCEState[]> => {
    const states: PKCEState[] = [];
    
    try {
      // Check localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('cropgenius-pkce-')) {
          try {
            const stateJson = localStorage.getItem(key);
            if (stateJson) {
              const state: PKCEState = JSON.parse(stateJson);
              state.storageMethod = 'localStorage';
              states.push(state);
            }
          } catch (error) {
            console.warn('Invalid PKCE state in localStorage:', key);
          }
        }
      }
      
      // Check sessionStorage
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith('cropgenius-pkce-')) {
          try {
            const stateJson = sessionStorage.getItem(key);
            if (stateJson) {
              const state: PKCEState = JSON.parse(stateJson);
              state.storageMethod = 'sessionStorage';
              states.push(state);
            }
          } catch (error) {
            console.warn('Invalid PKCE state in sessionStorage:', key);
          }
        }
      }
      
      // Check memory storage
      if (window.cropgeniusPKCEMemoryStorage) {
        window.cropgeniusPKCEMemoryStorage.forEach((stateJson, key) => {
          if (key.startsWith('cropgenius-pkce-')) {
            try {
              const state: PKCEState = JSON.parse(stateJson);
              state.storageMethod = 'memory';
              states.push(state);
            } catch (error) {
              console.warn('Invalid PKCE state in memory:', key);
            }
          }
        });
      }
    } catch (error) {
      console.error('Failed to load PKCE states:', error);
    }
    
    return states.sort((a, b) => b.timestamp - a.timestamp);
  };

  // 🧹 CLEANUP EXPIRED STATES
  const cleanupExpiredStates = async () => {
    try {
      setIsLoading(true);
      const result = await PKCEStateManager.cleanupExpiredStates();
      
      if (result.success) {
        toast.success(`Cleaned up ${result.data} expired PKCE states`);
        await loadDiagnostics();
      } else {
        toast.error('Failed to cleanup expired states');
      }
    } catch (error) {
      console.error('Cleanup failed:', error);
      toast.error('Cleanup failed');
    } finally {
      setIsLoading(false);
    }
  };

  // 🗑️ CLEAR ALL PKCE STATES
  const clearAllStates = async () => {
    try {
      setIsLoading(true);
      
      // Clear localStorage
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('cropgenius-pkce-')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Clear sessionStorage
      const sessionKeysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith('cropgenius-pkce-')) {
          sessionKeysToRemove.push(key);
        }
      }
      sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));
      
      // Clear memory storage
      if (window.cropgeniusPKCEMemoryStorage) {
        const memoryKeysToRemove: string[] = [];
        window.cropgeniusPKCEMemoryStorage.forEach((_, key) => {
          if (key.startsWith('cropgenius-pkce-')) {
            memoryKeysToRemove.push(key);
          }
        });
        memoryKeysToRemove.forEach(key => window.cropgeniusPKCEMemoryStorage!.delete(key));
      }
      
      toast.success(`Cleared ${keysToRemove.length + sessionKeysToRemove.length} PKCE states`);
      await loadDiagnostics();
    } catch (error) {
      console.error('Clear all failed:', error);
      toast.error('Failed to clear all states');
    } finally {
      setIsLoading(false);
    }
  };

  // 📋 COPY TO CLIPBOARD
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied to clipboard`);
    }).catch(() => {
      toast.error('Failed to copy to clipboard');
    });
  };

  // 📥 EXPORT DIAGNOSTICS
  const exportDiagnostics = () => {
    const data = {
      timestamp: new Date().toISOString(),
      diagnostics,
      storageStates,
      instanceId: SupabaseManager.getInstanceId(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pkce-diagnostics-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Diagnostics exported successfully');
  };

  // 🚀 INITIALIZE
  useEffect(() => {
    if (isVisible) {
      loadDiagnostics();
    }
  }, [isVisible]);

  // 🎨 RENDER STATUS BADGE
  const renderStatusBadge = (condition: boolean, trueText: string, falseText: string) => (
    <Badge variant={condition ? "default" : "destructive"} className="ml-2">
      {condition ? (
        <>
          <CheckCircle className="h-3 w-3 mr-1" />
          {trueText}
        </>
      ) : (
        <>
          <XCircle className="h-3 w-3 mr-1" />
          {falseText}
        </>
      )}
    </Badge>
  );

  // 🔒 RENDER SENSITIVE DATA
  const renderSensitiveData = (data: string, label: string) => (
    <div className="flex items-center space-x-2">
      <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
        {showSensitiveData ? data : '••••••••••••••••'}
      </code>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => copyToClipboard(data, label)}
        className="h-6 w-6 p-0"
      >
        <Copy className="h-3 w-3" />
      </Button>
    </div>
  );

  // 🎯 RENDER STATE CARD
  const renderStateCard = (state: PKCEState, index: number) => {
    const isExpired = Date.now() > state.expiresAt;
    const age = Date.now() - state.timestamp;
    const ageMinutes = Math.floor(age / (1000 * 60));
    
    return (
      <Card key={index} className={`mb-4 ${isExpired ? 'border-red-200 bg-red-50 dark:bg-red-950' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">
              PKCE State #{index + 1}
              {isExpired && <Badge variant="destructive" className="ml-2">Expired</Badge>}
            </CardTitle>
            <Badge variant="outline">{state.storageMethod}</Badge>
          </div>
          <CardDescription className="text-xs">
            Created {ageMinutes}m ago • Expires {new Date(state.expiresAt).toLocaleTimeString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500">State Parameter:</label>
            {renderSensitiveData(state.state, 'State Parameter')}
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Code Verifier:</label>
            {renderSensitiveData(state.codeVerifier, 'Code Verifier')}
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Code Challenge:</label>
            {renderSensitiveData(state.codeChallenge, 'Code Challenge')}
          </div>
          {state.redirectTo && (
            <div>
              <label className="text-xs font-medium text-gray-500">Redirect To:</label>
              <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded ml-2">
                {state.redirectTo}
              </code>
            </div>
          )}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Instance: {state.instanceId}</span>
            <span>Method: {state.codeChallengeMethod}</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  // 🚫 DON'T RENDER IN PRODUCTION
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <>
      {/* 🔧 DEBUG TOGGLE BUTTON */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(!isVisible)}
          variant="outline"
          size="sm"
          className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-2 border-blue-200 dark:border-blue-800"
        >
          <Shield className="h-4 w-4 mr-2" />
          PKCE Debug
        </Button>
      </div>

      {/* 🎨 DEBUG DASHBOARD */}
      {isVisible && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm">
          <div className="fixed inset-4 bg-white dark:bg-gray-900 rounded-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-500 to-green-500 text-white">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <h2 className="text-lg font-bold">PKCE Debug Dashboard</h2>
                <Badge variant="secondary">Development Only</Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowSensitiveData(!showSensitiveData)}
                  className="text-white hover:bg-white/20"
                >
                  {showSensitiveData ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={exportDiagnostics}
                  className="text-white hover:bg-white/20"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsVisible(false)}
                  className="text-white hover:bg-white/20"
                >
                  ✕
                </Button>
              </div>
            </div>

            <div className="p-4 h-full overflow-auto">
              <Tabs defaultValue="overview" className="h-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
                  <TabsTrigger value="storage">Storage</TabsTrigger>
                  <TabsTrigger value="actions">Actions</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center">
                          <Activity className="h-4 w-4 mr-2" />
                          Flow Status
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {diagnostics && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Optimal Strategy:</span>
                              <Badge variant="outline">{diagnostics.optimalStrategy || 'None'}</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Preferred Flow:</span>
                              <Badge variant="outline">{diagnostics.preferredFlow}</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Supported:</span>
                              <Badge variant="outline">{diagnostics.supportedStrategies.length}</Badge>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center">
                          <Database className="h-4 w-4 mr-2" />
                          Storage Status
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Active States:</span>
                            <Badge variant="outline">{storageStates.filter(s => Date.now() <= s.expiresAt).length}</Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Expired States:</span>
                            <Badge variant="destructive">{storageStates.filter(s => Date.now() > s.expiresAt).length}</Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Total States:</span>
                            <Badge variant="outline">{storageStates.length}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center">
                          <Key className="h-4 w-4 mr-2" />
                          Instance Info
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="text-xs">
                            <span className="text-gray-500">Instance ID:</span>
                            <code className="ml-2 bg-gray-100 dark:bg-gray-800 px-1 rounded">
                              {SupabaseManager.getInstanceId()}
                            </code>
                          </div>
                          <div className="text-xs">
                            <span className="text-gray-500">Storage Key:</span>
                            <code className="ml-2 bg-gray-100 dark:bg-gray-800 px-1 rounded">
                              cropgenius-auth-v4
                            </code>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="capabilities" className="space-y-4">
                  {diagnostics && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Browser Capabilities</CardTitle>
                        <CardDescription>Required features for OAuth flows</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Web Crypto API</span>
                          {renderStatusBadge(diagnostics.browserCapabilities.webCrypto, 'Supported', 'Missing')}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Local Storage</span>
                          {renderStatusBadge(diagnostics.browserCapabilities.localStorage, 'Available', 'Unavailable')}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Session Storage</span>
                          {renderStatusBadge(diagnostics.browserCapabilities.sessionStorage, 'Available', 'Unavailable')}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Text Encoder</span>
                          {renderStatusBadge(diagnostics.browserCapabilities.textEncoder, 'Supported', 'Missing')}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">URL API</span>
                          {renderStatusBadge(diagnostics.browserCapabilities.url, 'Supported', 'Missing')}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="storage" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Stored PKCE States</h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={loadDiagnostics}
                      disabled={isLoading}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                  
                  <div className="max-h-96 overflow-auto">
                    {storageStates.length === 0 ? (
                      <Card>
                        <CardContent className="text-center py-8">
                          <Database className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                          <p className="text-gray-500">No PKCE states found</p>
                        </CardContent>
                      </Card>
                    ) : (
                      storageStates.map((state, index) => renderStateCard(state, index))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="actions" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Cleanup Actions</CardTitle>
                        <CardDescription>Manage stored PKCE states</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button
                          onClick={cleanupExpiredStates}
                          disabled={isLoading}
                          className="w-full"
                          variant="outline"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Cleanup Expired States
                        </Button>
                        <Button
                          onClick={clearAllStates}
                          disabled={isLoading}
                          className="w-full"
                          variant="destructive"
                        >
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Clear All States
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Debug Actions</CardTitle>
                        <CardDescription>Development utilities</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button
                          onClick={() => setShowSensitiveData(!showSensitiveData)}
                          className="w-full"
                          variant="outline"
                        >
                          {showSensitiveData ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                          {showSensitiveData ? 'Hide' : 'Show'} Sensitive Data
                        </Button>
                        <Button
                          onClick={exportDiagnostics}
                          className="w-full"
                          variant="outline"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export Diagnostics
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      )}
    </>
  );
}