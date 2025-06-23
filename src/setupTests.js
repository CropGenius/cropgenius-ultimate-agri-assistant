// Import jest-dom for custom matchers
import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = String(value);
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = String(value);
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Mock ResizeObserver
class ResizeObserverStub {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

window.ResizeObserver = ResizeObserverStub;

// Mock IntersectionObserver
class IntersectionObserverStub {
  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
    this.observe = jest.fn();
    this.unobserve = jest.fn();
    this.disconnect = jest.fn();
  }
}

window.IntersectionObserver = IntersectionObserverStub;

// Mock scrollIntoView
elementProto.scrollIntoView = jest.fn();

// Mock requestAnimationFrame
window.requestAnimationFrame = (callback) => setTimeout(callback, 0);

// Mock cancelAnimationFrame
window.cancelAnimationFrame = (id) => clearTimeout(id);

// Mock console methods in test environment
const consoleError = console.error;
const consoleWarn = console.warn;

beforeAll(() => {
  // Suppress specific console errors/warnings in tests
  jest.spyOn(console, 'error').mockImplementation((...args) => {
    // Suppress specific errors/warnings here if needed
    if (
      !args[0].includes('Warning: An update to') &&
      !args[0].includes('Warning: React does not recognize the')
    ) {
      consoleError(...args);
    }
  });

  jest.spyOn(console, 'warn').mockImplementation((...args) => {
    // Suppress specific warnings here if needed
    if (!args[0].includes('DeprecationWarning')) {
      consoleWarn(...args);
    }
  });
});

afterEach(() => {
  // Clear all mocks after each test
  jest.clearAllMocks();
  
  // Clear localStorage and sessionStorage mocks
  window.localStorage.clear();
  window.sessionStorage.clear();
});

afterAll(() => {
  // Restore original console methods
  jest.restoreAllMocks();
});
