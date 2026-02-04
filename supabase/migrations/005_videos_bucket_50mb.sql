-- Actualizar límite del bucket videos a 50 MB (si ya existía con 500 MB)
UPDATE storage.buckets
SET file_size_limit = 52428800
WHERE id = 'videos';
