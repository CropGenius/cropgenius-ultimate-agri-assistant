import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Field, FieldCrop, FieldHistory } from '@/types/field';
import {
  getFieldById,
  deleteField,
} from '@/features/field-management/services/fieldService';
import { 
  getFieldCrops, 
  getFieldHistory 
} from '@/features/field-management/services/fieldDetailService';
import { useOfflineMutation } from './offline/useOfflineMutation';

export const useFieldData = () => {
  const { id: fieldId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch field data
  const {
    data: field,
    isLoading: isLoadingField,
    error: fieldError,
    refetch: refetchField,
  } = useQuery<Field | null>({
    queryKey: ['field', fieldId],
    queryFn: () => (fieldId ? getFieldById(fieldId) : Promise.resolve(null)),
    enabled: !!fieldId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch field crops
  const {
    data: crops = [],
    isLoading: isLoadingCrops,
    error: cropsError,
    refetch: refetchCrops,
  } = useQuery<FieldCrop[]>({
    queryKey: ['fieldCrops', fieldId],
    queryFn: () => (fieldId ? getFieldCrops(fieldId) : Promise.resolve([])),
    enabled: !!fieldId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch field history
  const {
    data: history = [],
    isLoading: isLoadingHistory,
    error: historyError,
    refetch: refetchHistory,
  } = useQuery<FieldHistory[]>({
    queryKey: ['fieldHistory', fieldId],
    queryFn: () => (fieldId ? getFieldHistory(fieldId) : Promise.resolve([])),
    enabled: !!fieldId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Delete field mutation with offline support
  const deleteFieldMutation = useOfflineMutation({
    mutationFn: async () => {
      if (!fieldId) throw new Error('Field ID is required');
      return deleteField(fieldId);
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['fields'] });
      queryClient.removeQueries({ queryKey: ['field', fieldId] });
      queryClient.removeQueries({ queryKey: ['fieldCrops', fieldId] });
      queryClient.removeQueries({ queryKey: ['fieldHistory', fieldId] });

      // Show success message
      toast.success('Field deleted successfully');

      // Navigate to fields list
      navigate('/fields');
    },
    onError: (error: Error) => {
      console.error('Error deleting field:', error);
      toast.error('Failed to delete field', {
        description:
          error.message || 'An error occurred while deleting the field',
      });
    },
  });

  // Handle field deletion
  const handleDeleteField = useCallback(() => {
    if (!fieldId) return;

    // Show confirmation dialog
    if (
      window.confirm(
        'Are you sure you want to delete this field? This action cannot be undone.'
      )
    ) {
      deleteFieldMutation.mutate(undefined);
    }
  }, [fieldId, deleteFieldMutation]);

  // Refresh all field data
  const refreshFieldData = useCallback(async () => {
    await Promise.all([refetchField(), refetchCrops(), refetchHistory()]);
  }, [refetchField, refetchCrops, refetchHistory]);

  return {
    // Field data
    fieldId,
    field,
    crops,
    history,

    // Loading states
    isLoading: isLoadingField || isLoadingCrops || isLoadingHistory,
    isLoadingField,
    isLoadingCrops,
    isLoadingHistory,

    // Errors
    error: fieldError || cropsError || historyError,
    fieldError,
    cropsError,
    historyError,

    // Actions
    refreshFieldData,
    deleteField: handleDeleteField,
    isDeleting: deleteFieldMutation.isPending,

    // Refs for manual refresh
    refetchField,
    refetchCrops,
    refetchHistory,
  };
};
