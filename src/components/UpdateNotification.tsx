import { useEffect, useState } from 'react';
import { useServiceWorkerNotification as useUpdateNotification, isServiceWorkerSupported } from '../hooks/useServiceWorker';

const UpdateNotification = () => {
  if (!isServiceWorkerSupported()) {
    return null;
  }
  const { showNotification, handleUpdate, dismissNotification } = useUpdateNotification();
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (showNotification) {
      setIsVisible(true);
      setIsExiting(false);
      setProgress(100);
      
      // Start progress bar animation (10 seconds)
      const duration = 10000; // 10 seconds
      const startTime = Date.now();
      const endTime = startTime + duration;
      
      const updateProgress = () => {
        const now = Date.now();
        const remaining = endTime - now;
        
        if (remaining <= 0) {
          setProgress(0);
          handleDismiss();
          return;
        }
        
        const newProgress = (remaining / duration) * 100;
        setProgress(newProgress);
        
        if (isVisible && !isExiting) {
          animationFrameId = requestAnimationFrame(updateProgress);
        }
      };
      
      let animationFrameId = requestAnimationFrame(updateProgress);
      
      return () => {
        cancelAnimationFrame(animationFrameId);
      };
    }
  }, [showNotification]);
  
  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      dismissNotification();
    }, 300); // Match this with the CSS transition duration
  };
  
  if (!isVisible) return null;
  
  return (
    <div className={`fixed bottom-4 right-4 z-50 w-full max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-all duration-300 transform ${
      isExiting ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'
    }`}
    role="alert"
    aria-live="polite">
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <svg 
              className="h-6 w-6 text-green-500" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 10V3L4 14h7v7l9-11h-7z" 
              />
            </svg>
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              New update available!
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
              A new version of CropGenius is available. Update now for the latest features and improvements.
            </p>
            <div className="mt-3 flex space-x-3">
              <button
                type="button"
                onClick={handleUpdate}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                Update now
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="bg-white dark:bg-gray-800 rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              onClick={handleDismiss}
              aria-label="Dismiss"
            >
              <span className="sr-only">Close</span>
              <svg 
                className="h-5 w-5" 
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
        </div>
      </div>
      <div 
        className="h-1 bg-green-100 dark:bg-green-900"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div 
          className="h-full bg-green-500 transition-all duration-300 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default UpdateNotification;
