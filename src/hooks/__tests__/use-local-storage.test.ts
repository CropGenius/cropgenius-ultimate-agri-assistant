import { renderHook, act } from '@testing-library/react-hooks';
import { useLocalStorage } from '../use-local-storage';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = String(value);
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

// Mock the global localStorage
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('useLocalStorage', () => {
  beforeEach(() => {
    // Clear all mocks and localStorage before each test
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should initialize with the provided initial value', () => {
    const { result } = renderHook(() => 
      useLocalStorage('testKey', 'initialValue')
    );

    const [value] = result.current;
    expect(value).toBe('initialValue');
  });

  it('should retrieve a value from localStorage if it exists', () => {
    // Set a value in localStorage before the hook is called
    localStorage.setItem('testKey', JSON.stringify('storedValue'));

    const { result } = renderHook(() => 
      useLocalStorage('testKey', 'initialValue')
    );

    const [value] = result.current;
    expect(value).toBe('storedValue');
    expect(localStorage.getItem).toHaveBeenCalledWith('testKey');
  });

  it('should update localStorage when the value changes', () => {
    const { result } = renderHook(() => 
      useLocalStorage('testKey', 'initialValue')
    );

    const [, setValue] = result.current;
    
    act(() => {
      setValue('newValue');
    });

    expect(result.current[0]).toBe('newValue');
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'testKey', 
      JSON.stringify('newValue')
    );
  });

  it('should handle function updates', () => {
    const { result } = renderHook(() => 
      useLocalStorage('counter', 0)
    );

    const [, setValue] = result.current;
    
    act(() => {
      setValue(prev => (prev as number) + 1);
    });

    expect(result.current[0]).toBe(1);
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'counter', 
      JSON.stringify(1)
    );
  });

  it('should handle objects and arrays', () => {
    const testObject = { name: 'Test', value: 42 };
    const testArray = [1, 2, 3];

    const { result: objectResult } = renderHook(() =>
      useLocalStorage('testObject', testObject)
    );

    const { result: arrayResult } = renderHook(() =>
      useLocalStorage('testArray', testArray)
    );

    expect(objectResult.current[0]).toEqual(testObject);
    expect(arrayResult.current[0]).toEqual(testArray);

    // Verify localStorage was called with stringified values
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'testObject',
      JSON.stringify(testObject)
    );
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'testArray',
      JSON.stringify(testArray)
    );
  });

  it('should handle errors when parsing invalid JSON', () => {
    // Mock getItem to return invalid JSON
    (localStorage.getItem as jest.Mock).mockImplementationOnce(() => '{invalid json');
    
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const { result } = renderHook(() => 
      useLocalStorage('invalidKey', 'default')
    );

    // Should fall back to the default value
    expect(result.current[0]).toBe('default');
    expect(consoleError).toHaveBeenCalled();
    
    consoleError.mockRestore();
  });

  it('should update when the key changes', () => {
    const { result, rerender } = renderHook(
      ({ key, initialValue }) => useLocalStorage(key, initialValue),
      {
        initialProps: { key: 'key1', initialValue: 'value1' },
      }
    );

    expect(result.current[0]).toBe('value1');

    // Change the key
    rerender({ key: 'key2', initialValue: 'value2' });

    expect(result.current[0]).toBe('value2');
  });
});
