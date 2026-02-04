-- ============================================================
-- MIGRACIÓN: Videos (Lácteos Vides)
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- ------------------------------------------------------------
-- 1. TABLA: videos
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT videos_name_not_empty CHECK (trim(name) != ''),
  CONSTRAINT videos_file_url_not_empty CHECK (trim(file_url) != ''),
  CONSTRAINT videos_order_min_1 CHECK (order_index >= 1)
);

CREATE INDEX IF NOT EXISTS idx_videos_order ON videos(order_index);

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Videos visibles públicamente" ON videos;
CREATE POLICY "Videos visibles públicamente" ON videos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Solo admins insertan videos" ON videos;
CREATE POLICY "Solo admins insertan videos" ON videos FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Solo admins actualizan videos" ON videos;
CREATE POLICY "Solo admins actualizan videos" ON videos FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Solo admins eliminan videos" ON videos;
CREATE POLICY "Solo admins eliminan videos" ON videos FOR DELETE USING (auth.role() = 'authenticated');


-- ------------------------------------------------------------
-- 2. STORAGE: Bucket 'videos' (crear desde Dashboard si falla)
-- ------------------------------------------------------------
-- NOTA: Si el INSERT falla (ej. bucket ya existe), crea el bucket manualmente:
--   Supabase Dashboard -> Storage -> New bucket
--   - Name: videos
--   - Public bucket: ON (para URLs públicas)
--   - File size limit: 50 MB
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos',
  'videos',
  true,
  52428800,
  ARRAY['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Políticas de Storage para el bucket 'videos'
-- (Solo si storage.objects existe y no hay conflictos)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'lacteos_videos_select') THEN
    EXECUTE 'CREATE POLICY "lacteos_videos_select" ON storage.objects FOR SELECT USING (bucket_id = ''videos'')';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'lacteos_videos_insert') THEN
    EXECUTE 'CREATE POLICY "lacteos_videos_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = ''videos'')';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'lacteos_videos_update') THEN
    EXECUTE 'CREATE POLICY "lacteos_videos_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = ''videos'')';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'lacteos_videos_delete') THEN
    EXECUTE 'CREATE POLICY "lacteos_videos_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = ''videos'')';
  END IF;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;
