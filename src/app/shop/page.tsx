'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ChevronRight,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Check,
  ArrowLeft,
  ArrowRight,
  X,
  Loader2,
} from 'lucide-react';
import { products as fallbackProducts } from '@/data/products';
import ProductCard from '@/components/ui/ProductCard';
import { fetchApi } from '@/lib/api';
import { formatApiProduct } from '@/lib/products';
import { Product } from '@/types';

const CATEGORIES = [
  { label: 'T-shirts', value: 't-shirts' },
  { label: 'Shorts', value: 'shorts' },
  { label: 'Shirts', value: 'shirts' },
  { label: 'Hoodie', value: 'hoodie' },
  { label: 'Jeans', value: 'jeans' },
];

const COLORS = [
  { name: 'Brown', hex: '#4F4631' },
  { name: 'Navy', hex: '#223843' },
  { name: 'Green', hex: '#00C12B' },
  { name: 'Red', hex: '#F50606' },
  { name: 'Yellow', hex: '#F5DD06' },
  { name: 'Orange', hex: '#F57906' },
  { name: 'Cyan', hex: '#06CAF5' },
  { name: 'Blue', hex: '#063AF5' },
  { name: 'Purple', hex: '#7D06F5' },
  { name: 'Pink', hex: '#F506A4' },
  { name: 'White', hex: '#FFFFFF', border: true },
  { name: 'Black', hex: '#000000' },
];

const SIZES = [
  'XX-Small',
  'X-Small',
  'Small',
  'Medium',
  'Large',
  'X-Large',
  '2X-Large',
  '3X-Large',
  '4X-Large',
];

const DRESS_STYLES = [
  { label: 'Casual', value: 'casual' },
  { label: 'Formal', value: 'formal' },
  { label: 'Party', value: 'party' },
  { label: 'Gym', value: 'gym' },
];

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialStyle = searchParams.get('style') || '';
  const searchQuery = searchParams.get('q') || '';

  const [categoriesList, setCategoriesList] = useState(CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedStyle, setSelectedStyle] = useState<string>(initialStyle);
  const [maxPrice, setMaxPrice] = useState<number>(300);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // API State
  const [apiProducts, setApiProducts] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(true);

  // Load Categories from API
  useEffect(() => {
    fetchApi('/categories').then((res) => {
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setCategoriesList(
          res.data.map((c: any) => ({
            label: c.name,
            value: c.slug || String(c.id),
          }))
        );
      }
    }).catch(() => {});
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedStyle, maxPrice, selectedColor, selectedSize, inStockOnly, sortBy]);

  // Load Products from API
  useEffect(() => {
    let url = `/products?per_page=9&page=${currentPage}`;
    if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
    if (selectedCategory) url += `&category=${encodeURIComponent(selectedCategory)}`;
    if (selectedStyle) url += `&style=${encodeURIComponent(selectedStyle)}`;
    if (maxPrice && maxPrice < 300) url += `&max_price=${maxPrice}`;
    if (selectedColor) url += `&color=${encodeURIComponent(selectedColor)}`;
    if (selectedSize) url += `&size=${encodeURIComponent(selectedSize)}`;
    if (inStockOnly) url += `&in_stock=1`;
    if (sortBy) url += `&sort=${sortBy}`;

    setLoading(true);
    fetchApi<any[]>(url).then((res) => {
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setApiProducts(res.data.map(formatApiProduct));
        if (res.meta) {
          setTotalPages(res.meta.last_page || 1);
          setTotalCount(res.meta.total || res.data.length);
        }
      } else {
        setApiProducts([]);
        setTotalPages(1);
        setTotalCount(0);
      }
      setLoading(false);
    }).catch(() => {
      setApiProducts(null);
      setLoading(false);
    });
  }, [searchQuery, selectedCategory, selectedStyle, maxPrice, selectedColor, selectedSize, inStockOnly, sortBy, currentPage]);

  // Client-side filtering ensures instant response & consistent variant matching
  const displayedProducts = useMemo(() => {
    const sourceList = apiProducts !== null ? apiProducts : fallbackProducts;

    return sourceList.filter((p) => {
      // If using fallback products without backend
      if (apiProducts === null) {
        if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
        if (selectedCategory && p.category !== selectedCategory) {
          return false;
        }
        if (selectedStyle && p.dressStyle !== selectedStyle) {
          return false;
        }
        if (p.price > maxPrice) {
          return false;
        }
      }

      // Color filter check
      if (selectedColor) {
        const colorLower = selectedColor.toLowerCase();
        const hasColor = p.colors && p.colors.length > 0
          ? p.colors.some((c) => {
              const cName = (typeof c === 'string' ? c : c.name || '').toLowerCase();
              if (cName.includes(colorLower)) return true;
              if (colorLower === 'blue' && (cName.includes('navy') || cName.includes('denim'))) return true;
              if (colorLower === 'green' && cName.includes('olive')) return true;
              if (colorLower === 'black' && cName.includes('charcoal')) return true;
              if (colorLower === 'red' && cName.includes('maroon')) return true;
              return false;
            })
          : true;
        if (!hasColor) return false;
      }

      // Size filter check
      if (selectedSize) {
        const sizeLower = selectedSize.toLowerCase();
        const hasSize = p.sizes && p.sizes.length > 0
          ? p.sizes.some((s) => {
              const sLower = s.toLowerCase();
              return sLower === sizeLower || sLower.includes(sizeLower) || sizeLower.includes(sLower);
            })
          : true;
        if (!hasSize) return false;
      }

      // In-stock availability filter check
      if (inStockOnly) {
        const isOutOfStock = p.stock !== undefined && p.stock <= 0;
        if (isOutOfStock) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });
  }, [apiProducts, searchQuery, selectedCategory, selectedStyle, maxPrice, selectedColor, selectedSize, inStockOnly, sortBy]);

  const FilterSidebar = (
    <div className="rounded-[20px] border border-black/10 p-6 flex flex-col gap-6 bg-white">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-[20px] font-bold text-black">Filters</h3>
        <SlidersHorizontal className="size-5 text-black/40" />
      </div>

      <div className="border-t border-black/10" />

      {/* Categories */}
      <div className="flex flex-col gap-3">
        {categoriesList.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(selectedCategory === cat.value ? '' : cat.value)}
            className={`flex items-center justify-between text-[16px] transition-colors ${
              selectedCategory === cat.value ? 'font-bold text-black' : 'text-black/60 hover:text-black'
            }`}
          >
            <span>{cat.label}</span>
            <ChevronRight className="size-4" />
          </button>
        ))}
      </div>

      <div className="border-t border-black/10" />

      {/* Price Slider */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between font-bold text-black text-[20px]">
          <span>Price</span>
          <ChevronUp className="size-4" />
        </div>
        <div className="flex flex-col gap-2">
          <input
            type="range"
            min={50}
            max={300}
            step={10}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full accent-black cursor-pointer"
          />
          <div className="flex items-center justify-between text-[14px] font-medium text-black">
            <span>$50</span>
            <span className="font-bold text-black">${maxPrice}</span>
            <span>$300</span>
          </div>
        </div>
      </div>

      <div className="border-t border-black/10" />

      {/* Colors */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between font-bold text-black text-[20px]">
          <span>Colors</span>
          {selectedColor ? (
            <button
              onClick={() => setSelectedColor(null)}
              className="text-xs font-normal text-black/50 hover:text-black transition-colors"
            >
              Clear ({selectedColor})
            </button>
          ) : (
            <ChevronUp className="size-4" />
          )}
        </div>
        <div className="grid grid-cols-5 gap-3">
          {COLORS.map((c) => {
            const isSelected = selectedColor === c.name;
            const isLight = c.name === 'White' || c.name === 'Yellow';
            return (
              <button
                key={c.name}
                onClick={() => setSelectedColor(isSelected ? null : c.name)}
                style={{ backgroundColor: c.hex }}
                className={`relative size-9 rounded-full transition-all hover:scale-110 flex items-center justify-center ${
                  isSelected ? 'ring-2 ring-offset-2 ring-black scale-105' : 'hover:opacity-90'
                } ${c.border ? 'border border-black/20' : ''}`}
                aria-label={c.name}
                title={c.name}
              >
                {isSelected && (
                  <Check className={`size-4 ${isLight ? 'text-black' : 'text-white'}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-black/10" />

      {/* Size */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between font-bold text-black text-[20px]">
          <span>Size</span>
          {selectedSize ? (
            <button
              onClick={() => setSelectedSize('')}
              className="text-xs font-normal text-black/50 hover:text-black transition-colors"
            >
              Clear ({selectedSize})
            </button>
          ) : (
            <ChevronUp className="size-4" />
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => {
            const isSelected = selectedSize === size;
            return (
              <button
                key={size}
                onClick={() => setSelectedSize(isSelected ? '' : size)}
                className={`rounded-full px-4 py-2 text-[14px] font-medium transition-all ${
                  isSelected
                    ? 'bg-black text-white shadow-sm scale-105'
                    : 'bg-[#F0F0F0] text-black/60 hover:bg-black/10 hover:text-black'
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-black/10" />

      {/* Dress Style */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between font-bold text-black text-[20px]">
          <span>Dress Style</span>
          <ChevronUp className="size-4" />
        </div>
        {DRESS_STYLES.map((st) => (
          <button
            key={st.value}
            onClick={() => setSelectedStyle(selectedStyle === st.value ? '' : st.value)}
            className={`flex items-center justify-between text-[16px] transition-colors ${
              selectedStyle === st.value ? 'font-bold text-black' : 'text-black/60 hover:text-black'
            }`}
          >
            <span>{st.label}</span>
            <ChevronRight className="size-4" />
          </button>
        ))}
      </div>

      <div className="border-t border-black/10" />

      {/* Availability / In Stock */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between font-bold text-black text-[20px]">
          <span>Availability</span>
        </div>
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="size-4.5 rounded-sm accent-black cursor-pointer"
          />
          <span className="text-[14px] font-medium text-black/80">
            In Stock Only <span className="text-black/40 text-xs">(Hide out of stock)</span>
          </span>
        </label>
      </div>

      <button
        onClick={() => setMobileFilterOpen(false)}
        className="w-full rounded-full bg-black py-3.5 text-[14px] font-medium text-white transition-opacity hover:opacity-90 mt-2"
      >
        Apply Filter
      </button>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8 py-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-[14px] text-black/60 mb-6">
        <Link href="/" className="hover:text-black">Home</Link>
        <ChevronRight className="size-4" />
        <Link href="/shop" className="hover:text-black">Shop</Link>
        {selectedCategory && (
          <>
            <ChevronRight className="size-4" />
            <span className="font-semibold text-black capitalize">{selectedCategory}</span>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block lg:col-span-1">
          {FilterSidebar}
        </aside>

        {/* Product Grid Area */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <h1 className="text-[28px] md:text-[32px] font-bold text-black capitalize">
                  {searchQuery
                    ? `Results for "${searchQuery}"`
                    : (selectedCategory || selectedStyle || 'All Products')}
                </h1>
                <span className="text-[14px] text-black/60 pt-1">
                  Showing {displayedProducts.length} Products
                </span>
              </div>
              {/* Active Filter Badges */}
              {(selectedColor || selectedSize || selectedCategory || selectedStyle || inStockOnly || searchQuery) && (
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {selectedColor && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 text-xs font-semibold text-black">
                      Color: {selectedColor}
                      <button
                        onClick={() => setSelectedColor(null)}
                        className="p-0.5 hover:bg-black/10 rounded-full"
                        aria-label="Clear color filter"
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  )}
                  {selectedSize && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 text-xs font-semibold text-black">
                      Size: {selectedSize}
                      <button
                        onClick={() => setSelectedSize('')}
                        className="p-0.5 hover:bg-black/10 rounded-full"
                        aria-label="Clear size filter"
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  )}
                  {inStockOnly && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-xs font-semibold text-emerald-800 border border-emerald-200">
                      In Stock Only
                      <button
                        onClick={() => setInStockOnly(false)}
                        className="p-0.5 hover:bg-emerald-100 rounded-full"
                        aria-label="Clear in stock filter"
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  )}
                  {selectedCategory && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 text-xs font-semibold text-black capitalize">
                      Category: {selectedCategory}
                      <button
                        onClick={() => setSelectedCategory('')}
                        className="p-0.5 hover:bg-black/10 rounded-full"
                        aria-label="Clear category filter"
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  )}
                  {selectedStyle && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 text-xs font-semibold text-black capitalize">
                      Style: {selectedStyle}
                      <button
                        onClick={() => setSelectedStyle('')}
                        className="p-0.5 hover:bg-black/10 rounded-full"
                        aria-label="Clear style filter"
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  )}
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 text-xs font-semibold text-black">
                      Query: &ldquo;{searchQuery}&rdquo;
                      <button
                        onClick={() => router.push('/shop')}
                        className="p-0.5 hover:bg-black/10 rounded-full"
                        aria-label="Clear search"
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setSelectedCategory('');
                      setSelectedStyle('');
                      setMaxPrice(300);
                      setSelectedColor(null);
                      setSelectedSize('');
                      setInStockOnly(false);
                      if (searchQuery) router.push('/shop');
                    }}
                    className="text-xs text-red-500 hover:underline font-medium ml-1"
                  >
                    Reset all
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden p-2.5 rounded-full bg-[#F0F0F0] text-black hover:bg-black/10"
                aria-label="Filter"
              >
                <SlidersHorizontal className="size-5" />
              </button>

              <div className="flex items-center gap-2 text-[14px] text-black/60">
                <span>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-lg border border-black/10 bg-white py-1.5 px-3 font-semibold text-black outline-none"
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="popular">Most Popular</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="py-24 text-center">
              <Loader2 className="size-8 animate-spin mx-auto text-black mb-3" />
              <p className="text-sm font-medium text-black/60">Fetching latest collection from store...</p>
            </div>
          ) : displayedProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {displayedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="rounded-[20px] bg-[#F0F0F0] p-12 text-center my-8">
              <p className="text-[18px] font-semibold text-black">No products found matching your filters.</p>
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setSelectedStyle('');
                  setMaxPrice(300);
                  setSelectedColor(null);
                  setSelectedSize('');
                  setInStockOnly(false);
                  router.push('/shop');
                }}
                className="mt-4 rounded-full bg-black px-6 py-2.5 text-[14px] text-white hover:bg-black/80 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-black/10 pt-6 mt-8 flex items-center justify-between">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="flex items-center gap-2 rounded-lg border border-black/10 px-4 py-2 text-[14px] font-medium text-black hover:bg-black/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowLeft className="size-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                  const isActive = pageNum === currentPage;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`size-9 rounded-lg text-[14px] font-medium transition-colors ${
                        isActive
                          ? 'bg-black text-white'
                          : 'text-black/60 hover:bg-black/5'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="flex items-center gap-2 rounded-lg border border-black/10 px-4 py-2 text-[14px] font-medium text-black hover:bg-black/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <span>Next</span>
                <ArrowRight className="size-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[24px] bg-white p-6 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-black/10">
              <h3 className="text-[20px] font-bold text-black">Filters</h3>
              <button onClick={() => setMobileFilterOpen(false)} className="p-1">
                <X className="size-6 text-black" />
              </button>
            </div>
            <div className="pt-4">
              {FilterSidebar}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading shop...</div>}>
      <ShopContent />
    </Suspense>
  );
}
