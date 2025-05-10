
/**
 * Checks if the user is currently online
 * 
 * @returns {boolean} Whether the user has an active internet connection
 */
export const isOnline = (): boolean => {
  return typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean' 
    ? navigator.onLine 
    : true; // Default to true if navigator.onLine is not available
};

/**
 * Adds a listener for online/offline status changes
 * 
 * @param onStatusChange Callback function that receives the new online status
 * @returns {() => void} Function to remove the event listeners
 */
export const addOnlineStatusListener = (
  onStatusChange: (isOnline: boolean) => void
): (() => void) => {
  const handleOnline = () => onStatusChange(true);
  const handleOffline = () => onStatusChange(false);
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};
