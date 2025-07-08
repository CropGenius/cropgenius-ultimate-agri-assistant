-- 🌱 DEVELOPMENT SEED DATA
-- Test data for CropGenius platform

-- Insert crop types
INSERT INTO crop_types (name, scientific_name, category, growing_season_days, description) VALUES
('Maize', 'Zea mays', 'cereal', 120, 'Primary staple crop in Africa'),
('Tomato', 'Solanum lycopersicum', 'vegetable', 90, 'High-value cash crop'),
('Beans', 'Phaseolus vulgaris', 'legume', 75, 'Protein-rich nitrogen-fixing crop'),
('Cassava', 'Manihot esculenta', 'root', 365, 'Drought-resistant staple crop'),
('Sweet Potato', 'Ipomoea batatas', 'root', 120, 'Nutritious root vegetable');

-- Insert sample market data
INSERT INTO crop_prices (crop_name, location_name, price_per_kg, market_source, date) VALUES
('Maize', 'Nairobi', 45.00, 'Wakulima Market', CURRENT_DATE),
('Tomato', 'Nairobi', 80.00, 'Wakulima Market', CURRENT_DATE),
('Beans', 'Mombasa', 120.00, 'Kongowea Market', CURRENT_DATE),
('Cassava', 'Kisumu', 35.00, 'Kibuye Market', CURRENT_DATE),
('Sweet Potato', 'Eldoret', 50.00, 'Kerio Valley', CURRENT_DATE);