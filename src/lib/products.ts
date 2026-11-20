import { Product } from '@/types';
import { products as fallbackProducts } from '@/data/products';

export function formatApiProduct(item: any): Product {
  if (!item) return fallbackProducts[0];

  const hasDiscount = item.discount_price && Number(item.discount_price) < Number(item.price);
  const currentPrice = hasDiscount ? Number(item.discount_price) : Number(item.price);
  const origPrice = hasDiscount ? Number(item.price) : undefined;
  const discountPct = origPrice && origPrice > 0
    ? Math.round(((origPrice - currentPrice) / origPrice) * 100)
    : undefined;

  let primaryImg = '/figma/imgImage7_96f1301c.png';
  let thumbs: string[] = [];

  if (item.images && Array.isArray(item.images) && item.images.length > 0) {
    const primary = item.images.find((img: any) => img.is_primary) || item.images[0];
    primaryImg = primary.image_url;
    thumbs = item.images.map((img: any) => img.image_url);
  }

  // Format colors
  let formattedColors = [
    { name: 'Olive Green', hex: '#4F4631' },
    { name: 'Navy Blue', hex: '#314F4A' },
    { name: 'Charcoal', hex: '#31344F' },
  ];
  if (Array.isArray(item.colors) && item.colors.length > 0) {
    formattedColors = item.colors.map((c: any) => {
      if (typeof c === 'string') return { name: c, hex: '#000000' };
      return { name: c.name || 'Color', hex: c.hex || '#000000' };
    });
  }

  // Format sizes
  let formattedSizes = ['Small', 'Medium', 'Large', 'X-Large'];
  if (Array.isArray(item.sizes) && item.sizes.length > 0) {
    formattedSizes = item.sizes;
  }

  const stockQty = item.stock !== undefined ? Number(item.stock) : 10;
  const inStock = item.in_stock !== undefined ? Boolean(item.in_stock) : stockQty > 0;
  const stockStatus = item.stock_status || (stockQty <= 0 ? 'out_of_stock' : stockQty <= 5 ? 'low_stock' : 'in_stock');

  return {
    id: String(item.id),
    name: item.name || 'Unnamed Product',
    category: item.category?.slug || item.category?.name || 'clothing',
    dressStyle: item.dress_style || 'casual',
    price: currentPrice,
    originalPrice: origPrice,
    discountPercent: discountPct,
    stock: stockQty,
    sku: item.sku || `SKU-${String(item.id).padStart(4, '0')}`,
    inStock,
    stockStatus,
    rating: Number(item.average_rating || 4.5),
    reviewCount: Number(item.reviews_count || 15),
    image: primaryImg,
    thumbnails: thumbs.length > 0 ? thumbs : [primaryImg],
    description: item.description || '',
    colors: formattedColors,
    sizes: formattedSizes,
    isNewArrival: !!item.is_new_arrival,
    isTopSelling: !!item.is_top_selling,
  };
}
