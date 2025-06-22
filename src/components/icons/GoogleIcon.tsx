import React from 'react';

/**
 * Google brand icon (multicolour) – a simplified version sized for buttons.
 * Width/height inherit from parent.
 */
const GoogleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 48 48" {...props}>
    <path fill="#EA4335" d="M24 9.5c3.72 0 6.32 1.62 7.78 2.98l5.7-5.7C33.72 3.02 29.22 1 24 1 14.8 1 6.98 6.48 3.44 14h6.84c2.1-4.23 6.46-7 13.72-7z" />
    <path fill="#4285F4" d="M46.1 24.54c0-1.54-.14-3.02-.4-4.48H24v8.48h12.44c-.54 2.9-2.16 5.36-4.6 7l7.4 5.78c4.32-3.98 6.86-9.84 6.86-16.78z" />
    <path fill="#FBBC05" d="M10.28 28.92l-6.84 5.28C6.98 41.52 14.8 47 24 47c5.86 0 10.78-1.9 14.38-5.18l-7.4-5.78c-2 1.34-4.54 2.14-6.98 2.14-5.5 0-10.18-3.7-11.86-8.26z" />
    <path fill="#34A853" d="M24 12.16c2.96 0 5.42 1.02 7.2 2.8l5.38-5.38C33.84 6.64 29.94 4.5 24 4.5 15.82 4.5 8.96 9.98 6.26 17.42l6.9 5.36c1.6-4.58 6.28-8.26 10.84-8.26z" />
    <path fill="none" d="M0 0h48v48H0z" />
  </svg>
);

export default GoogleIcon; 