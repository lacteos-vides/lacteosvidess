-- ============================================================
-- MIGRACIÓN: Categorías + Productos (Lácteos Vides)
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- ------------------------------------------------------------
-- 1. TABLA: categories
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT categories_name_not_empty CHECK (trim(name) != '')
);

CREATE INDEX IF NOT EXISTS idx_categories_order ON categories(order_index);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Categorías visibles públicamente" ON categories;
CREATE POLICY "Categorías visibles públicamente" ON categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Solo admins insertan categorías" ON categories;
CREATE POLICY "Solo admins insertan categorías" ON categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Solo admins actualizan categorías" ON categories;
CREATE POLICY "Solo admins actualizan categorías" ON categories FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Solo admins eliminan categorías" ON categories;
CREATE POLICY "Solo admins eliminan categorías" ON categories FOR DELETE USING (auth.role() = 'authenticated');

-- Categoría por defecto (para productos sin categoría)
INSERT INTO categories (id, name, order_index)
VALUES ('00000000-0000-0000-0000-000000000001'::uuid, 'General', 0)
ON CONFLICT (id) DO NOTHING;


-- ------------------------------------------------------------
-- 2. MODIFICAR products (añadir columnas si faltan)
-- ------------------------------------------------------------

-- Añadir category_id (nullable primero)
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE RESTRICT;

-- Asignar categoría por defecto a productos sin categoría
UPDATE products SET category_id = '00000000-0000-0000-0000-000000000001'::uuid WHERE category_id IS NULL;

-- Hacer NOT NULL
ALTER TABLE products ALTER COLUMN category_id SET NOT NULL;

-- Resto de columnas
ALTER TABLE products ADD COLUMN IF NOT EXISTS order_index INTEGER NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS estado TEXT NOT NULL DEFAULT 'activo';

-- Constraint para estado (si no existe)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_estado_check') THEN
    ALTER TABLE products ADD CONSTRAINT products_estado_check CHECK (estado IN ('activo', 'inactivo'));
  END IF;
END $$;

-- Validaciones de precio
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_price_positive;
ALTER TABLE products ADD CONSTRAINT products_price_positive CHECK (price >= 0);

ALTER TABLE products DROP CONSTRAINT IF EXISTS products_price_max;
ALTER TABLE products ADD CONSTRAINT products_price_max CHECK (price <= 999999.99);

ALTER TABLE products DROP CONSTRAINT IF EXISTS products_name_not_empty;
ALTER TABLE products ADD CONSTRAINT products_name_not_empty CHECK (trim(name) != '');

ALTER TABLE products DROP CONSTRAINT IF EXISTS products_codigo_not_empty;
ALTER TABLE products ADD CONSTRAINT products_codigo_not_empty CHECK (trim(codigo) != '');

-- Índices
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_category_order ON products(category_id, order_index);


-- ------------------------------------------------------------
-- 3. VISTA: productos con categoría ordenados
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW products_with_category AS
SELECT 
  p.id, p.codigo, p.name, p.price, p.order_index, p.estado, p.created_at,
  p.category_id, c.name AS category_name, c.order_index AS category_order
FROM products p
JOIN categories c ON p.category_id = c.id
ORDER BY c.order_index, p.order_index, p.name;
