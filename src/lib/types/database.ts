export type Category = {
  id: string;
  name: string;
  order_index: number;
  created_at: string;
};

export type Product = {
  id: string;
  category_id: string;
  codigo: string;
  name: string;
  price: number;
  order_index: number;
  estado: "activo" | "inactivo";
  is_featured?: boolean;
  created_at: string;
};

export type ProductWithCategory = Product & {
  category_name: string;
  category_order: number;
};

export type Video = {
  id: string;
  name: string;
  file_url: string;
  order_index: number;
  created_at: string;
};

export type GalleryItem = {
  id: string;
  image_url: string;
  product: string;
  price: string;
  order_index: number;
  created_at: string;
};
