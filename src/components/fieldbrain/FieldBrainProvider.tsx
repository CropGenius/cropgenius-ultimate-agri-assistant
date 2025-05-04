
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { FieldBrainAssistant } from './FieldBrainAssistant';
import fieldBrain from '@/agents/FieldBrainAgent';

interface FieldBrainContextType {
  selectedFieldId: string | undefined;
  selectField: (id: string) => void;
  isAssistantMinimized: boolean;
  toggleAssistant: () => void;
  showAssistant: () => void;
  hideAssistant: () => void;
}

const FieldBrainContext = createContext<FieldBrainContextType | undefined>(undefined);

interface FieldBrainProviderProps {
  children: ReactNode;
}

export function FieldBrainProvider({ children }: FieldBrainProviderProps) {
  const [selectedFieldId, setSelectedFieldId] = useState<string | undefined>(undefined);
  const [isAssistantMinimized, setIsAssistantMinimized] = useState(true);

  // Initialize the agent
  React.useEffect(() => {
    fieldBrain.initialize().catch(console.error);
    
    return () => {
      // Clean up the agent on unmount
      fieldBrain.cleanup();
    };
  }, []);

  const selectField = (id: string) => {
    setSelectedFieldId(id);
    // Auto show the assistant when a field is selected
    setIsAssistantMinimized(false);
  };

  const toggleAssistant = () => {
    setIsAssistantMinimized(prev => !prev);
  };

  const showAssistant = () => {
    setIsAssistantMinimized(false);
  };

  const hideAssistant = () => {
    setIsAssistantMinimized(true);
  };

  return (
    <FieldBrainContext.Provider value={{
      selectedFieldId,
      selectField,
      isAssistantMinimized,
      toggleAssistant,
      showAssistant,
      hideAssistant
    }}>
      {children}
      
      {/* Floating assistant */}
      <div className={`fixed bottom-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        isAssistantMinimized 
          ? 'w-auto h-auto' 
          : 'w-full h-[500px] md:w-96 md:h-[600px] md:max-w-md md:bottom-4 md:right-4'
      }`}>
        <FieldBrainAssistant 
          fieldId={selectedFieldId} 
          minimized={isAssistantMinimized}
          onMaximize={showAssistant} 
        />
      </div>
    </FieldBrainContext.Provider>
  );
}

export function useFieldBrainContext() {
  const context = useContext(FieldBrainContext);
  if (context === undefined) {
    throw new Error('useFieldBrainContext must be used within a FieldBrainProvider');
  }
  return context;
}
