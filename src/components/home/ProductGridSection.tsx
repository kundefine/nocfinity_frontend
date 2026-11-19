import React from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import ProductCard from '@/components/ui/ProductCard';

interface ProductGridSectionProps {
  id?: string;
  title: string;
  products: Product[];
  viewAllLink?: string;
  hasDivider?: boolean;
}

export default function ProductGridSection({
  id,
  title,
  products,
  viewAllLink = '/shop',
  hasDivider = true,
}: ProductGridSectionProps) {
  return (
    <section id={id} className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <h2 className="text-center text-[32px] md:text-[48px] font-black uppercase tracking-tight text-black mb-8 md:mb-12 font-integral">
          {title}
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-8 md:mt-12 flex justify-center">
          <Link
            href={viewAllLink}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-black/10 px-16 py-3.5 text-[16px] font-medium text-black transition-all hover:bg-black hover:text-white"
          >
            View All
          </Link>
        </div>

        {hasDivider && (
          <div className="mt-16 border-b border-black/10" />
        )}
      </div>
    </section>
  );
}
