import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, ChevronUp, ChevronDown, Download, Trash, Bug, AlertCircle, Info, Clock } from 'lucide-react';

// Error types
type ErrorType = 
  | 'react-error'
  | 'network-error'
  | 'api-error'
  | 'render-error'
  | 'promise-error'
  | 'global-error'
  | 'component-error'
  | 'init-error'
  | 'other';

// Severity levels
type SeverityLevel = 'critical' | 'error' | 'warning' | 'info';

// Debug entry interface
interface DebugEntry {
  id: string;
  type: ErrorType;
  severity: SeverityLevel;
  message: string;
  details?: string;
  componentStack?: string;
  stack?: string;
  timestamp: string;
  origin?: string;
  context?: Record<string, any>;
  resolved?: boolean;
}

// Global debug system setup
declare global {
  interface Window {
    CropGeniusDebug?: {
      errors: any[];
      logError: (error: any) => void;
      clearErrors: () => void;
      downloadErrorLog: () => void;
      toggleDebugPanel: () => void;
      isDebugPanelVisible: boolean;
      [key: string]: any;
    };
  }
}

// Generate a unique ID for each error
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Initialize global debug object only in development mode
if (typeof window !== 'undefined' && import.meta.env.MODE === 'development') {
  if (!window.CropGeniusDebug) {
    window.CropGeniusDebug = {
      errors: [],
      logError: (error: any) => {},
      clearErrors: () => {},
      downloadErrorLog: () => {},
      toggleDebugPanel: () => {},
      isDebugPanelVisible: false
    };
  }
}

// Main Debug Panel Component (only for development)
export const DebugPanel: React.FC = () => {
  if (import.meta.env.MODE !== 'development') return null;
  const [visible, setVisible] = useState(false);
  const [errors, setErrors] = useState<DebugEntry[]>([]);
  const [filter, setFilter] = useState<ErrorType | 'all'>('all');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const debugPanelRef = useRef<HTMLDivElement>(null);
  const errorsRef = useRef<DebugEntry[]>([]);

  // Keep a ref to the current errors to avoid dependency cycles
  useEffect(() => {
    errorsRef.current = errors;
  }, [errors]);
  
  // Stable function references to avoid recreating functions on every render
  const logError = useCallback((error: Partial<DebugEntry>) => {
    const newError: DebugEntry = {
      id: generateId(),
      type: error.type || 'other',
      severity: error.severity || 'error',
      message: error.message || 'Unknown error',
      details: error.details,
      componentStack: error.componentStack,
      stack: error.stack,
      timestamp: error.timestamp || new Date().toISOString(),
      origin: error.origin || 'unknown',
      context: error.context || {},
      resolved: false
    };
    
    console.error('[CropGenius Debug]', newError);
    
    // Update state with the new error
    setErrors(prev => {
      const updated = [newError, ...prev];
      // Keep only the latest 100 errors
      if (updated.length > 100) {
        updated.pop();
      }
      return updated;
    });
    
    // Save to localStorage for persistence
    try {
      const savedErrors = JSON.parse(localStorage.getItem('cropgenius_errors') || '[]');
      savedErrors.unshift(newError);
      if (savedErrors.length > 100) savedErrors.length = 100;
      localStorage.setItem('cropgenius_errors', JSON.stringify(savedErrors));
    } catch (e) {
      console.error('Failed to save error to localStorage', e);
    }
    
    // Make the debug panel visible for critical errors
    if (error.severity === 'critical') {
      setVisible(true);
    }
  }, []);
  
  const clearAllErrors = useCallback(() => {
    setErrors([]);
    try {
      localStorage.removeItem('cropgenius_errors');
    } catch (e) {
      console.error('Failed to clear errors from localStorage', e);
    }
  }, []);
  
  const downloadErrorLog = useCallback(() => {
    const dataStr = JSON.stringify(errorsRef.current, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileName = `cropgenius-errors-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
  }, []);
  
  const toggleDebugPanel = useCallback(() => {
    setVisible(prev => !prev);
  }, []);

  // Handle keyboard shortcut (Ctrl+Shift+D)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      e.preventDefault();
      setVisible(v => !v);
    }
  }, []);

  // Load saved errors on component mount - once only
  useEffect(() => {
    try {
      const savedErrors = JSON.parse(localStorage.getItem('cropgenius_errors') || '[]');
      if (savedErrors.length > 0) {
        setErrors(savedErrors);
      }
    } catch (e) {
      console.error('Failed to load errors from localStorage', e);
    }
  }, []); // Empty dependency array = only run once on mount
  
  // Register keyboard shortcut
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
  
  // Update global CropGeniusDebug object
  useEffect(() => {
    window.CropGeniusDebug = {
      errors: errorsRef.current,
      logError,
      clearErrors: clearAllErrors,
      downloadErrorLog,
      toggleDebugPanel,
      isDebugPanelVisible: visible
    };
  }, [visible, logError, clearAllErrors, downloadErrorLog, toggleDebugPanel]);
  
  // Filter errors based on current filter and search term
  const filteredErrors = errors.filter(error => {
    const matchesFilter = filter === 'all' || error.type === filter;
    const matchesSearch = searchTerm === '' || 
      error.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      error.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      error.origin?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });
  
  // Toggle expansion state for an error
  const toggleExpanded = (id: string) => {
    setExpanded(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  // Mark an error as resolved
  const markResolved = (id: string) => {
    setErrors(prev => 
      prev.map(error => 
        error.id === id ? { ...error, resolved: !error.resolved } : error
      )
    );
  };
  
  // Get a badge color based on severity
  const getSeverityColor = (severity: SeverityLevel) => {
    switch (severity) {
      case 'critical': return 'rgba(220, 38, 38, 0.8)';
      case 'error': return 'rgba(252, 165, 165, 0.8)';
      case 'warning': return 'rgba(251, 191, 36, 0.8)';
      case 'info': return 'rgba(59, 130, 246, 0.8)';
      default: return 'rgba(107, 114, 128, 0.8)';
    }
  };
  
  // Format the timestamp for display
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString() + ' ' + date.toLocaleDateString();
    } catch (e) {
      return timestamp;
    }
  };
  
  // If not visible, just show the toggle button
  if (!visible) {
    return (
      <button
        onClick={() => setVisible(true)}
        className="fixed bottom-4 right-4 bg-slate-800 text-white p-2 rounded-full shadow-lg z-50 hover:bg-slate-700"
        style={{ opacity: 0.7 }}
        title="Open Debug Panel (Ctrl+Shift+D)"
      >
        <Bug size={20} />
      </button>
    );
  }
  
  return (
    <div 
      ref={debugPanelRef}
      className="fixed bottom-0 right-0 w-full sm:w-96 max-h-[80vh] bg-slate-900 text-slate-100 shadow-2xl z-50 rounded-t-lg overflow-hidden flex flex-col"
      style={{ border: '1px solid rgba(255,255,255,0.1)' }}
    >
      {/* Header */}
      <div className="p-3 bg-slate-800 flex items-center justify-between border-b border-slate-700">
        <h3 className="font-semibold flex items-center">
          <Bug className="mr-2" size={18} />
          CropGenius Debug
          <span className="ml-2 px-2 py-0.5 text-xs bg-slate-700 rounded-full">
            {filteredErrors.length}/{errors.length}
          </span>
        </h3>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => window.CropGeniusDebug.downloadErrorLog()}
            className="p-1 text-slate-400 hover:text-slate-100"
            title="Download Error Log"
          >
            <Download size={16} />
          </button>
          <button 
            onClick={() => window.CropGeniusDebug.clearErrors()}
            className="p-1 text-slate-400 hover:text-slate-100"
            title="Clear All Errors"
          >
            <Trash size={16} />
          </button>
          <button 
            onClick={() => setVisible(false)}
            className="p-1 text-slate-400 hover:text-slate-100"
            title="Close Debug Panel"
          >
            <X size={16} />
          </button>
        </div>
      </div>
      
      {/* Search and filters */}
      <div className="p-2 bg-slate-800 border-b border-slate-700 flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Search errors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 p-1 px-2 text-sm bg-slate-700 border border-slate-600 rounded text-white"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as ErrorType | 'all')}
          className="p-1 px-2 text-sm bg-slate-700 border border-slate-600 rounded text-white"
        >
          <option value="all">All Types</option>
          <option value="react-error">React Errors</option>
          <option value="network-error">Network Errors</option>
          <option value="api-error">API Errors</option>
          <option value="render-error">Render Errors</option>
          <option value="promise-error">Promise Errors</option>
          <option value="global-error">Global Errors</option>
          <option value="component-error">Component Errors</option>
          <option value="init-error">Initialization Errors</option>
          <option value="other">Other Errors</option>
        </select>
      </div>
      
      {/* Error list */}
      <div className="overflow-y-auto flex-1">
        {filteredErrors.length === 0 ? (
          <div className="p-4 text-center text-slate-500">
            No errors to display
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filteredErrors.map(error => (
              <div 
                key={error.id} 
                className={`p-3 hover:bg-slate-800/50 ${error.resolved ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start">
                  <div 
                    className="w-3 h-3 mt-1 rounded-full mr-2" 
                    style={{ backgroundColor: getSeverityColor(error.severity) }}
                  ></div>
                  <div className="flex-1 min-w-0">
                    <div 
                      className="font-medium text-sm truncate cursor-pointer" 
                      onClick={() => toggleExpanded(error.id)}
                    >
                      {error.message}
                    </div>
                    <div className="flex mt-1 text-xs text-slate-400 justify-between">
                      <div>{error.type}</div>
                      <div className="flex items-center">
                        <Clock size={12} className="mr-1" />
                        {formatTimestamp(error.timestamp)}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleExpanded(error.id)}
                    className="ml-2 text-slate-400 hover:text-slate-200"
                  >
                    {expanded[error.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
                
                {/* Expanded content */}
                {expanded[error.id] && (
                  <div className="mt-3 border-t border-slate-700 pt-2">
                    {error.details && (
                      <div className="mt-2">
                        <div className="text-xs font-semibold text-slate-300 mb-1">Details:</div>
                        <pre className="text-xs bg-slate-800 p-2 rounded overflow-auto max-h-24">
                          {error.details}
                        </pre>
                      </div>
                    )}
                    
                    {error.origin && (
                      <div className="mt-2">
                        <div className="text-xs font-semibold text-slate-300 mb-1">Origin:</div>
                        <code className="text-xs text-slate-400">{error.origin}</code>
                      </div>
                    )}
                    
                    {error.stack && (
                      <div className="mt-2">
                        <div className="text-xs font-semibold text-slate-300 mb-1">Stack Trace:</div>
                        <pre className="text-xs bg-slate-800 p-2 rounded overflow-auto max-h-32 whitespace-pre-wrap">
                          {error.stack}
                        </pre>
                      </div>
                    )}
                    
                    {error.componentStack && (
                      <div className="mt-2">
                        <div className="text-xs font-semibold text-slate-300 mb-1">Component Stack:</div>
                        <pre className="text-xs bg-slate-800 p-2 rounded overflow-auto max-h-32 whitespace-pre-wrap">
                          {error.componentStack}
                        </pre>
                      </div>
                    )}
                    
                    {error.context && Object.keys(error.context).length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs font-semibold text-slate-300 mb-1">Context:</div>
                        <pre className="text-xs bg-slate-800 p-2 rounded overflow-auto max-h-24">
                          {JSON.stringify(error.context, null, 2)}
                        </pre>
                      </div>
                    )}
                    
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => markResolved(error.id)}
                        className={`text-xs px-2 py-1 rounded ${
                          error.resolved 
                            ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                            : 'bg-green-800/50 text-green-300 hover:bg-green-800'
                        }`}
                      >
                        {error.resolved ? 'Mark Unresolved' : 'Mark Resolved'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="p-2 bg-slate-800 border-t border-slate-700 text-xs text-slate-400 flex justify-between">
        <div>
          Press <kbd className="px-1 py-0.5 bg-slate-700 rounded">Ctrl+Shift+D</kbd> to toggle panel
        </div>
        <div>
          v1.0.0
        </div>
      </div>
    </div>
  );
};

// Export the debug functions for use in the app
export const logError = (error: Partial<DebugEntry>) => {
  if (typeof window !== 'undefined' && window.CropGeniusDebug && window.CropGeniusDebug.logError) {
    window.CropGeniusDebug.logError(error);
  }
};

export const toggleDebugPanel = () => {
  if (typeof window !== 'undefined' && window.CropGeniusDebug && window.CropGeniusDebug.toggleDebugPanel) {
    window.CropGeniusDebug.toggleDebugPanel();
  }
};

export const clearErrors = () => {
  if (typeof window !== 'undefined' && window.CropGeniusDebug && window.CropGeniusDebug.clearErrors) {
    window.CropGeniusDebug.clearErrors();
  }
};

export const downloadErrorLog = () => {
  if (typeof window !== 'undefined' && window.CropGeniusDebug && window.CropGeniusDebug.downloadErrorLog) {
    window.CropGeniusDebug.downloadErrorLog();
  }
};
