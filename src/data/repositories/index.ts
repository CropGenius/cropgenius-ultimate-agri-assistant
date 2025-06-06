// src/data/repositories/index.ts
/**
 * Central export point for all repositories
 */

// Export database client
export { db, DatabaseError } from '@/data/supabaseClient';

// Export all repositories
export { FarmRepository, useFarmRepository } from './farmRepository';
export { TaskRepository, useTaskRepository } from './taskRepository';
export { MarketRepository, useMarketRepository } from './marketRepository';
export {
  CropScanRepository,
  useCropScanRepository,
} from './cropScanRepository';
export { WeatherRepository, useWeatherRepository } from './weatherRepository';

// Re-export entity types for convenience
export type { Farm, Field } from './farmRepository';

export type {
  Task,
  CreateTaskPayload,
  UpdateTaskPayload,
} from './taskRepository';

export type {
  MarketListing,
  PriceTrend,
  DemandSignal,
  MarketListingFilters,
} from './marketRepository';

export type { CropScan, CreateCropScanPayload } from './cropScanRepository';

export type {
  WeatherData,
  WeatherForecast,
  WeatherAlert,
} from './weatherRepository';
