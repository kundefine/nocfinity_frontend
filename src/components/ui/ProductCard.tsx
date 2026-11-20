import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import RatingStars from './RatingStars';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const isOutOfStock = product.stock !== undefined && product.stock <= 0;
  const isLowStock = product.stock !== undefined && product.stock > 0 && product.stock <= 5;

  return (
    <Link href={`/product/${product.id}`} className="group flex flex-col gap-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-[20px] bg-[#F0EEED] flex items-center justify-center transition-transform duration-300 group-hover:scale-[1.02]">
        <img
          src={product.image}
          alt={product.name}
          className={`size-full object-contain p-4 transition-transform duration-300 group-hover:scale-105 ${
            isOutOfStock ? 'opacity-75 grayscale-[25%]' : ''
          }`}
        />

        {/* Stock status badge overlay */}
        {isOutOfStock && (
          <span className="absolute top-3 left-3 rounded-full bg-black/80 backdrop-blur-xs px-3 py-1 text-[11px] font-bold text-white uppercase tracking-wider shadow-sm">
            Out of stock
          </span>
        )}
        {!isOutOfStock && isLowStock && (
          <span className="absolute top-3 left-3 rounded-full bg-amber-500/95 backdrop-blur-xs px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
            Only {product.stock} left
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-[18px] md:text-[20px] font-bold text-black line-clamp-1 group-hover:text-black/70">
          {product.name}
        </h3>

        <RatingStars rating={product.rating} />

        <div className="mt-1 flex items-center gap-3">
          <span className="text-[20px] md:text-[24px] font-bold text-black">
            ${product.price}
          </span>
          {product.originalPrice && (
            <span className="text-[20px] md:text-[24px] font-bold text-black/40 line-through">
              ${product.originalPrice}
            </span>
          )}
          {product.discountPercent && (
            <span className="rounded-full bg-[#FF3333]/10 px-3 py-1 text-[12px] font-medium text-[#FF3333]">
              -{product.discountPercent}%
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
