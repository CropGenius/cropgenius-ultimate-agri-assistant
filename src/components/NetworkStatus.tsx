import { useEffect, useState } from 'react';
import { useServiceWorker } from '../hooks/useServiceWorker';

const NetworkStatus = () => {
  const { isOnline } = useServiceWorker();
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [wasOffline, setWasOffline] = useState(!navigator.onLine);

  useEffect(() => {
    // Only show the status if there's a change in network status
    if (isOnline === false || wasOffline !== !isOnline) {
      setIsVisible(true);
      setIsExiting(false);
      
      // Auto-hide after 3 seconds if online, 5 seconds if offline
      const timeout = setTimeout(() => {
        if (isOnline) {
          handleDismiss();
        }
      }, isOnline ? 3000 : 5000);
      
      return () => clearTimeout(timeout);
    }
  }, [isOnline, wasOffline]);
  
  useEffect(() => {
    // Track if we were ever offline during this session
    if (!isOnline) {
      setWasOffline(true);
    }
  }, [isOnline]);
  
  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
    }, 300); // Match this with the CSS transition duration
  };
  
  if (!isVisible) return null;
  
  return (
    <div 
      className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 transition-all duration-300 ${
        isExiting 
          ? 'opacity-0 translate-y-4' 
          : 'opacity-100 translate-y-0'
      } ${
        isOnline 
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
      }`}
      role="status"
      aria-live="polite"
    >
      <span className={`inline-block w-2 h-2 rounded-full ${
        isOnline ? 'bg-green-500' : 'bg-yellow-500'
      }`}></span>
      <span className="text-sm font-medium">
        {isOnline ? 'Back online' : 'You are currently offline'}
      </span>
      <button 
        onClick={handleDismiss}
        className="ml-2 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        aria-label="Dismiss notification"
      >
        <svg 
          className="h-4 w-4" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor"
          aria-hidden="true"
        >
          <path 
            fillRule="evenodd" 
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
            clipRule="evenodd" 
          />
        </svg>
      </button>
    </div>
  );
};

export default NetworkStatus;
