import React, { Suspense } from 'react';
import ProductDetailClient from './ProductDetailClient';
import { products } from '@/data/products';

export function generateStaticParams() {
  return products.map((product) => ({
    id: product.id,
  }));
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense fallback={<div className="p-12 text-center text-black font-semibold">Loading product...</div>}>
      <ProductDetailClient productId={id} />
    </Suspense>
  );
}
