import { useEffect, useState, FC } from 'react';
import { WifiOff, Wifi, X } from 'lucide-react';

const OfflineModeBanner: FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Set the handlers right after the component mounts
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setIsVisible(true);
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsVisible(true);
    };

    // Set initial state
    setIsOnline(navigator.onLine);

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
  };

  // Don't show if dismissed or if online and not in the process of showing the online message
  if ((isOnline && !isVisible) || isDismissed) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
      data-testid="offline-banner"
    >
      <div
        className={`flex items-center px-4 py-3 rounded-lg shadow-lg ${
          isOnline
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-yellow-50 border border-yellow-200 text-yellow-800'
        }`}
      >
        <div className="flex-shrink-0">
          {isOnline ? (
            <Wifi className="h-5 w-5 text-green-600" />
          ) : (
            <WifiOff className="h-5 w-5 text-yellow-600" />
          )}
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium">
            {isOnline
              ? 'Back online! Your changes will be synced.'
              : 'You are currently offline. Some features may be limited.'}
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="ml-4 -mr-1 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 text-gray-400 hover:text-gray-500"
          data-testid="dismiss-button"
        >
          <span className="sr-only">Dismiss</span>
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default OfflineModeBanner;
