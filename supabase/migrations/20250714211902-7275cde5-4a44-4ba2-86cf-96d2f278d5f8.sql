-- Add coordinates column to farms table for satellite imagery integration
ALTER TABLE farms ADD COLUMN IF NOT EXISTS coordinates POINT;

-- Create spatial index for efficient coordinate queries
CREATE INDEX IF NOT EXISTS idx_farms_coordinates ON farms USING GIST(coordinates);

-- Add sample coordinates for existing farms (Nairobi region for testing)
UPDATE farms 
SET coordinates = ST_SetSRID(ST_MakePoint(36.8219 + (random() - 0.5) * 0.1, -1.2921 + (random() - 0.5) * 0.1), 4326)
WHERE coordinates IS NULL;