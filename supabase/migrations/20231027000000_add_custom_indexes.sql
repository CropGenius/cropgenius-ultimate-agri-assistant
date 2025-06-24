-- Add GiST index for field locations (GEOGRAPHY type)
CREATE INDEX IF NOT EXISTS idx_fields_location_gist ON public.fields USING GIST (location);

-- Add index for weather_data.location (TEXT 'lat,lng')
-- Note: This B-tree index is primarily for exact matches if the text 'lat,lng' is queried directly.
-- It will NOT significantly speed up proximity searches on this text field.
-- For efficient spatial queries on weather_data.location, its type should be changed to GEOGRAPHY/GEOMETRY with a GiST index.
CREATE INDEX IF NOT EXISTS idx_weather_data_location_text ON public.weather_data(location);

-- Add index for weather_data.recorded_at for faster time-based sorting
CREATE INDEX IF NOT EXISTS idx_weather_data_recorded_at ON public.weather_data(recorded_at DESC);

-- Add index for fields.crop_type_id (used in field-analysis nearby crops query)
CREATE INDEX IF NOT EXISTS idx_fields_crop_type_id ON public.fields(crop_type_id);
