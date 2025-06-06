// src/data/supabaseClient.ts
/**
 * Centralized Supabase client wrapper that provides enhanced functionality
 * and consistent error handling for all Supabase operations.
 */

import { supabase } from '@/integrations/supabase/client';
import { diagnostics } from '@/utils/diagnosticService';
import { toast } from 'sonner';
import { offlineSyncService } from '@/services/offlineSyncService';

// Error handling for database operations
export class DatabaseError extends Error {
  constructor(
    message: string,
    public originalError: any,
    public operation: string,
    public table?: string,
    public metadata?: Record<string, any>
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

// Generic type for query parameters to improve type safety
export interface QueryParams<T> {
  table: string;
  columns?: string;
  filters?: Partial<Record<keyof T, any>>;
  order?: { column: keyof T; ascending?: boolean };
  limit?: number;
  offset?: number;
  singleRecord?: boolean;
}

// Function to handle operation offline queueing
const handleOfflineOperation = async <T>(
  operation: 'insert' | 'update' | 'delete',
  table: string,
  data: T,
  filters?: Record<string, any>
): Promise<{ success: boolean; error?: string }> => {
  try {
    await offlineSyncService.queueOperation({
      operation,
      table,
      data,
      filters,
      timestamp: new Date().toISOString()
    });
    
    return { success: true };
  } catch (error) {
    console.error(`Error queueing offline ${operation}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error during offline queueing'
    };
  }
};

// Supabase wrapper with enhanced functionality
export const db = {
  /**
   * Fetch records from a table with flexible querying
   */
  async find<T>(params: QueryParams<T>): Promise<{ data: T[] | null; error: DatabaseError | null }> {
    try {
      // Check network connection
      if (!navigator.onLine) {
        // For offline reads, try to get from cache
        const cachedData = await offlineSyncService.getCachedData(params.table, params.filters);
        if (cachedData) {
          return { data: cachedData as T[], error: null };
        }
        
        // If not in cache, return error
        return { 
          data: null, 
          error: new DatabaseError(
            'Network offline and data not in cache',
            null,
            'find',
            params.table
          ) 
        };
      }

      // Build the query
      let query = supabase
        .from(params.table)
        .select(params.columns || '*');

      // Apply filters if provided
      if (params.filters) {
        Object.entries(params.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }

      // Apply ordering if provided
      if (params.order) {
        query = query.order(params.order.column as string, {
          ascending: params.order.ascending ?? true
        });
      }

      // Apply pagination if provided
      if (params.limit) {
        query = query.limit(params.limit);
      }

      if (params.offset) {
        query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
      }

      // Execute the query
      const { data, error } = params.singleRecord 
        ? await query.single() 
        : await query;

      if (error) {
        const dbError = new DatabaseError(
          `Error fetching data from ${params.table}: ${error.message}`,
          error,
          'find',
          params.table,
          { params }
        );
        
        diagnostics.logError(dbError, { 
          source: 'database', 
          operation: 'find', 
          table: params.table 
        });
        
        return { data: null, error: dbError };
      }

      // Cache the results for offline use
      if (data) {
        await offlineSyncService.cacheData(params.table, data);
      }

      return { data: data as T[], error: null };
    } catch (error) {
      const dbError = new DatabaseError(
        `Unexpected error during find operation on ${params.table}`,
        error,
        'find',
        params.table,
        { params }
      );
      
      diagnostics.logError(dbError, { 
        source: 'database', 
        operation: 'find', 
        table: params.table 
      });
      
      return { data: null, error: dbError };
    }
  },

  /**
   * Insert a new record into a table
   */
  async insert<T extends Record<string, any>>(
    table: string,
    data: T | T[],
    options: { returnData?: boolean; idColumn?: string } = {}
  ): Promise<{ data: T | T[] | null; error: DatabaseError | null; offlineQueued?: boolean }> {
    try {
      // If offline, queue the operation for later
      if (!navigator.onLine) {
        const result = await handleOfflineOperation('insert', table, data);
        if (result.success) {
          toast.info('Changes will be saved when you're back online');
          return { data: Array.isArray(data) ? data : [data] as T[], error: null, offlineQueued: true };
        } else {
          return { 
            data: null, 
            error: new DatabaseError(
              result.error || 'Failed to queue offline insert',
              null,
              'insert',
              table
            ),
            offlineQueued: false
          };
        }
      }

      // Proceed with online insert
      const { data: insertedData, error } = options.returnData
        ? await supabase.from(table).insert(data).select()
        : await supabase.from(table).insert(data);

      if (error) {
        const dbError = new DatabaseError(
          `Error inserting data into ${table}: ${error.message}`,
          error,
          'insert',
          table
        );
        
        diagnostics.logError(dbError, { 
          source: 'database', 
          operation: 'insert', 
          table 
        });
        
        return { data: null, error: dbError };
      }

      return { data: insertedData as T | T[], error: null };
    } catch (error) {
      const dbError = new DatabaseError(
        `Unexpected error during insert operation on ${table}`,
        error,
        'insert',
        table
      );
      
      diagnostics.logError(dbError, { 
        source: 'database', 
        operation: 'insert', 
        table 
      });
      
      return { data: null, error: dbError };
    }
  },

  /**
   * Update records in a table based on filters
   */
  async update<T extends Record<string, any>>(
    table: string,
    filters: Record<string, any>,
    data: Partial<T>,
    options: { returnData?: boolean } = {}
  ): Promise<{ data: T | null; error: DatabaseError | null; offlineQueued?: boolean }> {
    try {
      // If offline, queue the operation for later
      if (!navigator.onLine) {
        const result = await handleOfflineOperation('update', table, data, filters);
        if (result.success) {
          toast.info('Changes will be applied when you're back online');
          return { data: data as T, error: null, offlineQueued: true };
        } else {
          return { 
            data: null, 
            error: new DatabaseError(
              result.error || 'Failed to queue offline update',
              null,
              'update',
              table
            ),
            offlineQueued: false
          };
        }
      }

      // Build the query with filters
      let query = supabase.from(table).update(data);

      // Apply each filter
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });

      // Execute with or without returning data
      const { data: updatedData, error } = options.returnData
        ? await query.select().single()
        : await query;

      if (error) {
        const dbError = new DatabaseError(
          `Error updating data in ${table}: ${error.message}`,
          error,
          'update',
          table
        );
        
        diagnostics.logError(dbError, { 
          source: 'database', 
          operation: 'update', 
          table 
        });
        
        return { data: null, error: dbError };
      }

      return { data: updatedData as T, error: null };
    } catch (error) {
      const dbError = new DatabaseError(
        `Unexpected error during update operation on ${table}`,
        error,
        'update',
        table
      );
      
      diagnostics.logError(dbError, { 
        source: 'database', 
        operation: 'update', 
        table 
      });
      
      return { data: null, error: dbError };
    }
  },

  /**
   * Delete records from a table based on filters
   */
  async delete<T>(
    table: string,
    filters: Record<string, any>,
    options: { returnData?: boolean } = {}
  ): Promise<{ data: T | null; error: DatabaseError | null; offlineQueued?: boolean }> {
    try {
      // If offline, queue the operation for later
      if (!navigator.onLine) {
        const result = await handleOfflineOperation('delete', table, {}, filters);
        if (result.success) {
          toast.info('Deletion will be processed when you're back online');
          return { data: null, error: null, offlineQueued: true };
        } else {
          return { 
            data: null, 
            error: new DatabaseError(
              result.error || 'Failed to queue offline delete',
              null,
              'delete',
              table
            ),
            offlineQueued: false
          };
        }
      }

      // Build the query with filters
      let query = supabase.from(table).delete();

      // Apply each filter
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });

      // Execute with or without returning data
      const { data: deletedData, error } = options.returnData
        ? await query.select().single()
        : await query;

      if (error) {
        const dbError = new DatabaseError(
          `Error deleting data from ${table}: ${error.message}`,
          error,
          'delete',
          table
        );
        
        diagnostics.logError(dbError, { 
          source: 'database', 
          operation: 'delete', 
          table 
        });
        
        return { data: null, error: dbError };
      }

      return { data: deletedData as T, error: null };
    } catch (error) {
      const dbError = new DatabaseError(
        `Unexpected error during delete operation on ${table}`,
        error,
        'delete',
        table
      );
      
      diagnostics.logError(dbError, { 
        source: 'database', 
        operation: 'delete', 
        table 
      });
      
      return { data: null, error: dbError };
    }
  },

  /**
   * Execute a custom query with RPC
   */
  async rpc<T>(
    functionName: string,
    params?: Record<string, any>
  ): Promise<{ data: T | null; error: DatabaseError | null }> {
    try {
      // If offline, return appropriate error
      if (!navigator.onLine) {
        return { 
          data: null, 
          error: new DatabaseError(
            'Cannot execute RPC functions while offline',
            null,
            'rpc',
            functionName
          ) 
        };
      }

      const { data, error } = await supabase.rpc(functionName, params || {});

      if (error) {
        const dbError = new DatabaseError(
          `Error executing RPC function ${functionName}: ${error.message}`,
          error,
          'rpc',
          functionName
        );
        
        diagnostics.logError(dbError, { 
          source: 'database', 
          operation: 'rpc', 
          function: functionName 
        });
        
        return { data: null, error: dbError };
      }

      return { data: data as T, error: null };
    } catch (error) {
      const dbError = new DatabaseError(
        `Unexpected error during RPC execution of ${functionName}`,
        error,
        'rpc',
        functionName
      );
      
      diagnostics.logError(dbError, { 
        source: 'database', 
        operation: 'rpc', 
        function: functionName 
      });
      
      return { data: null, error: dbError };
    }
  },

  // Expose the raw supabase client for advanced use cases
  raw: supabase
};
