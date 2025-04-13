
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Bug, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const DevDebugPanel = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { user, session, farmId } = useAuth();
  const location = useLocation();

  return (
    <div className="fixed bottom-0 right-0 w-80 bg-black/85 text-white text-xs rounded-tl-lg shadow-lg z-50 overflow-hidden">
      <div 
        className="px-3 py-2 font-mono flex items-center justify-between cursor-pointer" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <Bug size={14} className="mr-2" />
          <span>CROPGenius Debug</span>
        </div>
        {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </div>
      
      {isExpanded && (
        <div className="p-3 border-t border-white/20 font-mono">
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
            <span className="text-gray-400">Current Route:</span>
            <div className="truncate">{location.pathname}</div>
          </div>
          
          <div className="mb-2">
            <span className="text-gray-400">Token Expiry:</span>
            <div>{session?.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'N/A'}</div>
          </div>
          
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
      )}
    </div>
  );
};

export default DevDebugPanel;
