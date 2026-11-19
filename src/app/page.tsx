import React from 'react';
import HeroSection from '@/components/home/HeroSection';
import BrandBar from '@/components/home/BrandBar';
import ProductGridSection from '@/components/home/ProductGridSection';
import DressStyleSection from '@/components/home/DressStyleSection';
import CustomerReviews from '@/components/home/CustomerReviews';
import { products as fallbackProducts, customerReviews as fallbackReviews } from '@/data/products';
import { formatApiProduct } from '@/lib/products';
import { API_BASE_URL } from '@/lib/api';

async function getFeaturedProducts() {
  'use cache';
  try {
    const res = await fetch(`${API_BASE_URL}/products/featured`, {
      next: { revalidate: 30 },
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return {
          newArrivals: json.data.new_arrivals?.length > 0
            ? json.data.new_arrivals.map(formatApiProduct)
            : fallbackProducts.filter((p) => p.isNewArrival),
          topSelling: json.data.top_selling?.length > 0
            ? json.data.top_selling.map(formatApiProduct)
            : fallbackProducts.filter((p) => p.isTopSelling),
          dressStyles: json.data.dress_styles || [],
          customerReviews: json.data.customer_reviews || [],
        };
      }
    }
  } catch {
    // Fallback to local data if backend is offline
  }

  return {
    newArrivals: fallbackProducts.filter((p) => p.isNewArrival),
    topSelling: fallbackProducts.filter((p) => p.isTopSelling),
    dressStyles: [],
    customerReviews: fallbackReviews,
  };
}

export default async function HomePage() {
  const { newArrivals, topSelling, dressStyles, customerReviews } = await getFeaturedProducts();

  return (
    <div className="flex flex-col">
      <HeroSection />
      <BrandBar />
      <ProductGridSection
        id="new-arrivals"
        title="NEW ARRIVALS"
        products={newArrivals}
        viewAllLink="/shop"
        hasDivider={true}
      />
      <ProductGridSection
        title="TOP SELLING"
        products={topSelling}
        viewAllLink="/shop"
        hasDivider={false}
      />
      <DressStyleSection styles={dressStyles} />
      <CustomerReviews initialReviews={customerReviews} />
    </div>
  );
}
