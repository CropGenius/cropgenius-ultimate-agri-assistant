
/**
 * Generate an absolute URL for auth redirects that works across environments
 */
export const getAbsoluteURL = (path: string): string => {
  // Determine the base URL based on environment
  let baseUrl = '';
  
  // Check for localhost/development
  if (window.location.hostname === 'localhost') {
    baseUrl = `${window.location.protocol}//${window.location.host}`;
  } 
  // Check for Lovable.dev preview
  else if (window.location.hostname.includes('lovable.app')) {
    baseUrl = `${window.location.protocol}//${window.location.host}`;
  } 
  // Check for Netlify preview
  else if (window.location.hostname.includes('netlify.app')) {
    baseUrl = `${window.location.protocol}//${window.location.host}`;
  } 
  // Default to production URL
  else {
    baseUrl = 'https://cropgenius.com'; // Replace with your production domain
  }
  
  // Ensure path starts with a slash and combine with baseUrl
  const formattedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${formattedPath}`;
};

/**
 * Get the appropriate redirect URL for authentication
 */
export const getAuthRedirectURL = (): string => {
  return getAbsoluteURL('/auth/callback');
};

/**
 * Extract information from URL after auth redirect
 */
export const extractAuthParamsFromURL = (): Record<string, string> => {
  const params = new URLSearchParams(window.location.hash.substring(1));
  const result: Record<string, string> = {};
  
  for (const [key, value] of params.entries()) {
    result[key] = value;
  }
  
  return result;
};
