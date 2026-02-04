-- Actualizar categoría General de order_index 0 a 1 (el orden 0 ya no se permite)
UPDATE categories 
SET order_index = 1 
WHERE id = '00000000-0000-0000-0000-000000000001' AND order_index = 0;
