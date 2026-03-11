-- Set explicit per-file upload limit for film buckets to 50GB (bytes)
-- so large TUS uploads are not blocked by implicit/default limits.
UPDATE storage.buckets
SET file_size_limit = 53687091200
WHERE id IN ('films', 'films2');