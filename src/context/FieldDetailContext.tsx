import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { Field, FieldCrop, FieldHistory } from '@/types/field';
import { useFieldData } from '@/hooks/useFieldData';
import {
  useFieldAIAgents,
  FieldAIAgents,
} from '@/hooks/agents/useFieldAIAgents';

interface FieldDetailContextType extends FieldAIAgents {
  // Field data
  field: Field | null;
  crops: FieldCrop[];
  history: FieldHistory[];

  // Loading states
  isLoading: boolean;
  isLoadingField: boolean;
  isLoadingCrops: boolean;
  isLoadingHistory: boolean;

  // Errors
  error: Error | null;
  fieldError: Error | null;
  cropsError: Error | null;
  historyError: Error | null;

  // Actions
  refreshFieldData: () => Promise<void>;
  deleteField: () => void;
  isDeleting: boolean;

  // Field ID
  fieldId: string | undefined;
}

const FieldDetailContext = createContext<FieldDetailContextType | undefined>(
  undefined
);

interface FieldDetailProviderProps {
  children: ReactNode;
  fieldId: string;
}

export const FieldDetailProvider: React.FC<FieldDetailProviderProps> = ({
  children,
  fieldId,
}) => {
  // Get field data and operations
  const fieldData = useFieldData();

  // Get AI agents for field operations
  const aiAgents = useFieldAIAgents(fieldId);

  // Combine all context values
  const contextValue = useMemo(
    () => ({
      ...fieldData,
      ...aiAgents,
    }),
    [fieldData, aiAgents]
  );

  return (
    <FieldDetailContext.Provider value={contextValue}>
      {children}
    </FieldDetailContext.Provider>
  );
};

export const useFieldDetail = (): FieldDetailContextType => {
  const context = useContext(FieldDetailContext);
  if (context === undefined) {
    throw new Error('useFieldDetail must be used within a FieldDetailProvider');
  }
  return context;
};
