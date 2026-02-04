-- ============================================================
-- Eliminar descripción e image_url de products
-- Ejecutar en Supabase SQL Editor
-- ============================================================

ALTER TABLE products DROP COLUMN IF EXISTS description;
ALTER TABLE products DROP COLUMN IF EXISTS image_url;

-- Actualizar vista si existe
DROP VIEW IF EXISTS products_with_category;
CREATE OR REPLACE VIEW products_with_category AS
SELECT 
  p.id, p.codigo, p.name, p.price, p.order_index, p.estado, p.created_at,
  p.category_id, c.name AS category_name, c.order_index AS category_order
FROM products p
JOIN categories c ON p.category_id = c.id
ORDER BY c.order_index, p.order_index, p.name;
