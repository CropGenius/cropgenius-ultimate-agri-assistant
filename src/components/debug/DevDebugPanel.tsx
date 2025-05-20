
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Bug, ChevronUp, ChevronDown, Wifi, WifiOff, RefreshCw, AlertTriangle, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { diagnostics } from "@/utils/diagnosticService";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const DevDebugPanel = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [activeTab, setActiveTab] = useState<'auth' | 'errors' | 'network' | 'components'>('auth');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [errors, setErrors] = useState<any[]>([]);
  const { user, session, farmId } = useAuth();
  const location = useLocation();

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load errors from diagnostics service
  useEffect(() => {
    setErrors(diagnostics.getErrorLog());

    // Set up keyboard shortcut to toggle visibility
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+Shift+D to toggle panel visibility
      if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        setIsVisible(prev => !prev);
        event.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Run diagnostics
  const runDiagnostics = () => {
    const report = diagnostics.runSystemHealthCheck();
    setErrors(diagnostics.getErrorLog());
    toast.success("Diagnostics completed", {
      description: "Check the console for full report"
    });
  };

  const clearErrorLog = () => {
    diagnostics.clearErrorLog();
    setErrors([]);
    toast.success("Error log cleared");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 right-0 w-80 bg-black/85 text-white text-xs rounded-tl-lg shadow-lg z-50 overflow-hidden">
      <div 
        className="px-3 py-2 font-mono flex items-center justify-between cursor-pointer" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <Bug size={14} className="mr-2" />
          <span>CROPGenius Debug</span>
          {!isOnline && <Badge variant="destructive" className="ml-2 h-5">Offline</Badge>}
        </div>
        {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </div>
      
      {isExpanded && (
        <div className="border-t border-white/20 font-mono">
          {/* Tab Navigation */}
          <div className="flex border-b border-white/20">
            <div 
              className={`px-3 py-1.5 cursor-pointer ${activeTab === 'auth' ? 'bg-white/10' : ''}`}
              onClick={() => setActiveTab('auth')}
            >
              Auth
            </div>
            <div 
              className={`px-3 py-1.5 cursor-pointer ${activeTab === 'errors' ? 'bg-white/10' : ''}`}
              onClick={() => setActiveTab('errors')}
            >
              Errors {errors.length > 0 && <span className="text-red-400 ml-1">({errors.length})</span>}
            </div>
            <div 
              className={`px-3 py-1.5 cursor-pointer ${activeTab === 'network' ? 'bg-white/10' : ''}`}
              onClick={() => setActiveTab('network')}
            >
              Network
            </div>
            <div 
              className={`px-3 py-1.5 cursor-pointer ${activeTab === 'components' ? 'bg-white/10' : ''}`}
              onClick={() => setActiveTab('components')}
            >
              App
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-3">
            {activeTab === 'auth' && (
              <>
                <div className="mb-2">
                  <span className="text-gray-400">User ID:</span>
                  <div className="truncate">{user?.id || 'Not authenticated'}</div>
                </div>
                
                <div className="mb-2">
                  <span className="text-gray-400">Email:</span>
                  <div className="truncate">{user?.email || 'N/A'}</div>
                </div>
                
                <div className="mb-2">
                  <span className="text-gray-400">Session Valid:</span>
                  <div>{session ? 'Yes' : 'No'}</div>
                </div>
                
                <div className="mb-2">
                  <span className="text-gray-400">Farm ID:</span>
                  <div className="truncate">{farmId || 'Not set'}</div>
                </div>
                
                <div className="mb-2">
                  <span className="text-gray-400">Token Expiry:</span>
                  <div>{session?.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'N/A'}</div>
                </div>
              </>
            )}

            {activeTab === 'errors' && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Recent Errors</span>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-6 text-xs"
                    onClick={clearErrorLog}
                  >
                    Clear
                  </Button>
                </div>

                {errors.length === 0 ? (
                  <div className="text-center py-4 text-gray-400">No errors recorded</div>
                ) : (
                  <div className="max-h-40 overflow-auto">
                    {errors.slice().reverse().map((error, idx) => (
                      <Card key={idx} className="p-2 mb-2 bg-red-950/50 border-red-900/50 text-white">
                        <div className="flex items-start gap-1">
                          <AlertTriangle size={12} className="text-red-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="truncate font-semibold">{error.message}</div>
                            <div className="text-gray-400 text-[10px]">{new Date(error.timestamp).toLocaleString()}</div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'network' && (
              <>
                <div className="mb-4 flex items-center">
                  <span className="text-gray-400 mr-2">Status:</span>
                  {isOnline ? (
                    <div className="flex items-center text-green-400">
                      <Wifi size={12} className="mr-1" /> Online
                    </div>
                  ) : (
                    <div className="flex items-center text-red-400">
                      <WifiOff size={12} className="mr-1" /> Offline
                    </div>
                  )}
                </div>

                <div className="mb-2">
                  <span className="text-gray-400">Current Route:</span>
                  <div className="truncate">{location.pathname}</div>
                </div>

                <div className="mb-2">
                  <span className="text-gray-400">Supabase:</span>
                  <div className="flex items-center">
                    <Database size={12} className="mr-1" /> 
                    {session ? 'Connected' : 'Not connected'}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'components' && (
              <>
                <div className="mb-2">
                  <span className="text-gray-400">Current Route:</span>
                  <div className="truncate">{location.pathname}</div>
                </div>
                
                <div className="mb-2">
                  <span className="text-gray-400">Dev Mode:</span>
                  <div>{import.meta.env.MODE}</div>
                </div>
                
                <div className="mb-2">
                  <span className="text-gray-400">App Version:</span>
                  <div>1.0.0</div>
                </div>
              </>
            )}

            <div className="flex gap-2 mt-3">
              <Button 
                size="sm" 
                variant="outline" 
                className="h-7 text-xs"
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
              >
                Clear Storage
              </Button>
              
              <Button 
                size="sm" 
                variant="outline" 
                className="h-7 text-xs"
                onClick={runDiagnostics}
              >
                <RefreshCw size={12} className="mr-1" />
                Diagnostics
              </Button>
              
              <Button 
                size="sm" 
                variant="outline" 
                className="h-7 text-xs"
                onClick={() => {
                  console.log({
                    user,
                    session,
                    farmId,
                    localStorage: { ...localStorage },
                  });
                }}
              >
                Log Debug
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevDebugPanel;
