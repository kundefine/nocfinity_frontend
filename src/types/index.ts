export interface Product {
  id: string;
  name: string;
  category: string;
  dressStyle: 'casual' | 'formal' | 'party' | 'gym' | string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  stock?: number;
  sku?: string;
  inStock?: boolean;
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock';
  rating: number;
  reviewCount: number;
  image: string;
  thumbnails?: string[];
  description: string;
  colors: { name: string; hex: string }[];
  sizes: string[];
  isNewArrival?: boolean;
  isTopSelling?: boolean;
}

export interface Review {
  id: string;
  author: string;
  verified: boolean;
  rating: number;
  comment: string;
  date: string;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
}
