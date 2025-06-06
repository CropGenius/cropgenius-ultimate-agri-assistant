/**
 * Checks if the user is currently online
 *
 * @returns {boolean} Whether the user has an active internet connection
 */
export const isOnline = (): boolean => {
  if (typeof navigator === 'undefined') {
    return true; // For SSR environments, assume online
  }
  return navigator.onLine;
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

/**
 * Function to check if we can connect to specific API
 *
 * @param apiUrl The URL of the API to check
 * @returns {Promise<boolean>} A promise that resolves to true if the API is reachable, false otherwise
 */
export const checkApiConnection = async (apiUrl: string): Promise<boolean> => {
  if (!isOnline()) {
    return false;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(apiUrl, {
      method: 'HEAD',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    return false;
  }
};
