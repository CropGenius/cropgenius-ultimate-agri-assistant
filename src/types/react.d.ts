/// <reference types="react" />
/// <reference types="react/jsx-runtime" />

import React from 'react';

declare module 'react' {
  const jsx: any;
  const jsxs: any;
  const jsxDEV: any;
}

declare module 'react/jsx-runtime' {
  export const jsx: any;
  export const jsxs: any;
  export const jsxDEV: any;
}
