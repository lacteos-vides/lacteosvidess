-- ============================================================
-- Migración: Auditoría en productos (created_by, updated_by, updated_at)
-- Ejecutar en Supabase SQL Editor
-- ============================================================

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS created_by TEXT,
  ADD COLUMN IF NOT EXISTS updated_by TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

COMMENT ON COLUMN products.created_by IS 'Correo del admin que creó el producto (Supabase Auth).';
COMMENT ON COLUMN products.updated_by IS 'Correo del admin que realizó la última edición.';
COMMENT ON COLUMN products.updated_at IS 'Fecha y hora de la última edición.';

-- Recrear vista pública SIN campos de auditoría (solo admin consulta created_by/updated_by)
DROP VIEW IF EXISTS products_with_category;
CREATE OR REPLACE VIEW products_with_category AS
SELECT
  p.id,
  p.codigo,
  p.name,
  p.price,
  p.order_index,
  p.estado,
  p.is_featured,
  p.created_at,
  p.category_id,
  c.name AS category_name,
  c.order_index AS category_order
FROM products p
JOIN categories c ON p.category_id = c.id
ORDER BY c.order_index, p.order_index, p.name;

GRANT SELECT ON products_with_category TO anon;
GRANT SELECT ON products_with_category TO authenticated;
