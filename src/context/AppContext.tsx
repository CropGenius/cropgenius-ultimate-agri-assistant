import React, {
  createContext,
  useContext,
  ReactNode,
  useReducer,
  useEffect,
} from 'react';
import { useAuth } from './AuthContext';
import { User } from '@supabase/supabase-js';

// Define the context state structure
interface AppState {
  currentFarmId: string | null;
  selectedFieldId: string | null;
  userPreferences: {
    language: string;
    unitSystem: 'metric' | 'imperial';
    darkMode: boolean;
    notificationsEnabled: boolean;
  };
}

// Actions for the reducer
type AppAction =
  | { type: 'SET_CURRENT_FARM'; payload: string | null }
  | { type: 'SET_SELECTED_FIELD'; payload: string | null }
  | {
      type: 'UPDATE_USER_PREFERENCES';
      payload: Partial<AppState['userPreferences']>;
    };

// Create the context
const AppContext = createContext<
  | {
      state: AppState;
      dispatch: React.Dispatch<AppAction>;
      user: User | null;
    }
  | undefined
>(undefined);

// Initial state
const initialState: AppState = {
  currentFarmId: localStorage.getItem('farmId'),
  selectedFieldId: localStorage.getItem('selectedFieldId'),
  userPreferences: {
    language: localStorage.getItem('language') || 'en',
    unitSystem:
      (localStorage.getItem('unitSystem') as 'metric' | 'imperial') || 'metric',
    darkMode: localStorage.getItem('darkMode') === 'true',
    notificationsEnabled:
      localStorage.getItem('notificationsEnabled') !== 'false',
  },
};

// Reducer function
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_CURRENT_FARM': {
      // Store in localStorage for persistence
      if (action.payload) {
        localStorage.setItem('farmId', action.payload);
      } else {
        localStorage.removeItem('farmId');
      }
      return { ...state, currentFarmId: action.payload };
    }
    case 'SET_SELECTED_FIELD': {
      if (action.payload) {
        localStorage.setItem('selectedFieldId', action.payload);
      } else {
        localStorage.removeItem('selectedFieldId');
      }
      return { ...state, selectedFieldId: action.payload };
    }
    case 'UPDATE_USER_PREFERENCES': {
      const updatedPreferences = {
        ...state.userPreferences,
        ...action.payload,
      };

      // Store each preference in localStorage
      Object.entries(updatedPreferences).forEach(([key, value]) => {
        localStorage.setItem(key, String(value));
      });

      return {
        ...state,
        userPreferences: updatedPreferences,
      };
    }
    default:
      return state;
  }
}

// Provider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { user, farmId } = useAuth(); // Get user and farmId from AuthContext

  // Sync farmId from AuthContext when it changes
  useEffect(() => {
    if (farmId && farmId !== state.currentFarmId) {
      dispatch({ type: 'SET_CURRENT_FARM', payload: farmId });
    }
  }, [farmId, state.currentFarmId]);

  const value = {
    state,
    dispatch,
    user,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook to use the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Convenience hooks for common operations
export const useFarm = () => {
  const { state, dispatch } = useApp();

  return {
    currentFarmId: state.currentFarmId,
    setCurrentFarmId: (farmId: string | null) =>
      dispatch({ type: 'SET_CURRENT_FARM', payload: farmId }),
  };
};

export const useField = () => {
  const { state, dispatch } = useApp();

  return {
    selectedFieldId: state.selectedFieldId,
    setSelectedFieldId: (fieldId: string | null) =>
      dispatch({ type: 'SET_SELECTED_FIELD', payload: fieldId }),
  };
};

export const useUserPreferences = () => {
  const { state, dispatch } = useApp();

  return {
    preferences: state.userPreferences,
    updatePreferences: (preferences: Partial<AppState['userPreferences']>) =>
      dispatch({ type: 'UPDATE_USER_PREFERENCES', payload: preferences }),
  };
};
