import React, { useEffect, useState } from 'react';
import { worker } from './browser';

export const MSWProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const initMocks = async () => {
      if (process.env.NODE_ENV === 'development') {
        try {
          await worker.start({
            onUnhandledRequest: 'bypass',
            serviceWorker: {
              url: '/mockServiceWorker.js',
            },
          });
          console.log('MSW worker started');
        } catch (error) {
          console.error('Failed to start MSW worker', error);
        }
      }
      setReady(true);
    };

    initMocks();
  }, []);

  if (!ready) {
    return <div>Loading mock service worker...</div>;
  }

  return <>{children}</>;
};
