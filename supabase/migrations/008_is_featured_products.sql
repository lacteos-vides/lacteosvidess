-- ============================================================
-- Migración: Productos destacados (is_featured) para Productos v3
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- Nueva columna en products (máximo 16 para pantalla de destacados)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN products.is_featured IS 'Producto mostrado en pantalla Productos v3 (máx. 16).';

-- Índice para filtrar destacados
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured) WHERE is_featured = true;

-- Recrear vista para incluir is_featured
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
