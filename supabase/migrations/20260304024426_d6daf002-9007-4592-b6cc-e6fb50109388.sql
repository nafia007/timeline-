-- Update the films bucket to ensure no restrictive file_size_limit
-- (It's already 5GB, but let's remove it entirely to use global limit)
UPDATE storage.buckets 
SET file_size_limit = NULL
WHERE id = 'films';