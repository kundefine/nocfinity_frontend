'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  ChevronDown,
  LogOut,
  PackageCheck,
  MapPin,
  Loader2,
  ArrowRight,
  Star,
  History,
  TrendingUp,
  ArrowUpLeft,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { fetchApi } from '@/lib/api';
import { formatApiProduct } from '@/lib/products';
import { products as fallbackProducts } from '@/data/products';
import { Product } from '@/types';

const POPULAR_SEARCHES = [
  'T-shirts',
  'Skinny Fit Jeans',
  'Casual Shirts',
  'Bermuda Shorts',
  'Graphic T-shirt',
  'Polo with Contrast Trims',
  'Formal Shirts',
];

const SEARCH_TAXONOMY = [
  'T-shirts',
  'Shorts',
  'Shirts',
  'Hoodie',
  'Jeans',
  'Casual',
  'Formal',
  'Party',
  'Gym',
  'Skinny Fit Jeans',
  'Checkered Shirt',
  'Sleeve Striped T-shirt',
  'Vertical Striped Shirt',
  'Courage Graphic T-shirt',
  'Loose Fit Bermuda Shorts',
  'Faded Skinny Jeans',
  'Polo with Contrast Trims',
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { totalCount } = useCart();
  const { user, isAuthenticated, logout } = useCustomerAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('shopco_recent_searches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const saveRecentSearch = (term: string) => {
    if (!term || !term.trim()) return;
    const clean = term.trim();
    setRecentSearches((prev) => {
      const next = [clean, ...prev.filter((t) => t.toLowerCase() !== clean.toLowerCase())].slice(0, 6);
      try {
        localStorage.setItem('shopco_recent_searches', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('shopco_recent_searches');
    } catch {}
  };

  // Close search suggestions on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        desktopSearchRef.current &&
        !desktopSearchRef.current.contains(target) &&
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(target)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute keyword completions based on current query
  const keywordSuggestions = useMemo(() => {
    const trimmed = searchQuery.trim().toLowerCase();
    if (!trimmed) return [];

    return SEARCH_TAXONOMY.filter(
      (term) => term.toLowerCase().includes(trimmed) && term.toLowerCase() !== trimmed
    ).slice(0, 4);
  }, [searchQuery]);

  // Debounced live search for products
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      fetchApi<any[]>(`/products?search=${encodeURIComponent(trimmed)}&per_page=4`)
        .then((res) => {
          if (res.success && Array.isArray(res.data) && res.data.length > 0) {
            setSuggestions(res.data.map(formatApiProduct));
          } else {
            // Local fallback search if backend returns empty or is offline
            const lower = trimmed.toLowerCase();
            const matches = fallbackProducts
              .filter(
                (p) =>
                  p.name.toLowerCase().includes(lower) ||
                  p.category.toLowerCase().includes(lower)
              )
              .slice(0, 4);
            setSuggestions(matches);
          }
        })
        .catch(() => {
          const lower = trimmed.toLowerCase();
          const matches = fallbackProducts
            .filter(
              (p) =>
                p.name.toLowerCase().includes(lower) ||
                p.category.toLowerCase().includes(lower)
            )
            .slice(0, 4);
          setSuggestions(matches);
        })
        .finally(() => {
          setIsSearching(false);
        });
    }, 180);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (pathname?.startsWith('/admin')) return null;

  const handleExecuteSearch = (query: string) => {
    const clean = query.trim();
    if (clean) {
      saveRecentSearch(clean);
      setShowSuggestions(false);
      setSearchQuery(clean);
      router.push(`/shop?q=${encodeURIComponent(clean)}`);
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    handleExecuteSearch(searchQuery);
  };

  const handleSelectProduct = (product: Product) => {
    saveRecentSearch(product.name);
    setShowSuggestions(false);
    setSearchQuery('');
    router.push(`/product/${product.id}`);
  };

  // Render suggestion popup
  const renderSuggestionsDropdown = () => {
    if (!showSuggestions) return null;

    const trimmed = searchQuery.trim();

    return (
      <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-black/10 bg-white p-3 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
        {!trimmed ? (
          /* Empty Search State: Recent Searches & Trending */
          <div className="space-y-4 py-1">
            {recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">
                  <span className="flex items-center gap-1.5">
                    <History className="size-3.5 text-gray-400" />
                    Recent Searches
                  </span>
                  <button
                    type="button"
                    onClick={clearRecentSearches}
                    className="text-[11px] text-gray-400 hover:text-red-500 transition-colors"
                  >
                    Clear all
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {recentSearches.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => handleExecuteSearch(term)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-xs font-medium text-gray-800 hover:bg-black hover:text-white transition-all group"
                    >
                      <History className="size-3 text-gray-400 group-hover:text-white" />
                      <span>{term}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
                <TrendingUp className="size-3.5 text-black" />
                Popular Suggestions
              </p>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleExecuteSearch(term)}
                    className="px-3 py-1.5 rounded-full bg-[#F0EEED] text-xs font-medium text-black hover:bg-black hover:text-white transition-all"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Active Query State: Keyword Suggestions & Live Product Cards */
          <div className="divide-y divide-gray-100 space-y-2">
            {/* Keyword Autocomplete Suggestions */}
            {keywordSuggestions.length > 0 && (
              <div className="pb-1 space-y-0.5">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-2 py-1">
                  Suggested Queries
                </p>
                {keywordSuggestions.map((kw) => (
                  <button
                    key={kw}
                    type="button"
                    onClick={() => handleExecuteSearch(kw)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors text-left group"
                  >
                    <span className="flex items-center gap-2">
                      <Search className="size-3.5 text-gray-400 group-hover:text-black" />
                      <span>{kw}</span>
                    </span>
                    <ArrowUpLeft className="size-3 text-gray-400 group-hover:text-black" />
                  </button>
                ))}
              </div>
            )}

            {/* Direct Matching Products */}
            <div className="pt-2">
              <div className="px-2 py-1 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Matching Products
                </span>
                {isSearching && <Loader2 className="size-3.5 animate-spin text-gray-400" />}
              </div>

              <div className="max-h-[260px] overflow-y-auto divide-y divide-gray-50 py-1">
                {suggestions.length > 0 ? (
                  suggestions.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => handleSelectProduct(product)}
                      className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors text-left group"
                    >
                      <div className="size-11 rounded-lg bg-[#F0EEED] p-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="size-full object-contain group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate group-hover:text-black">
                          {product.name}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                          <span className="capitalize">{product.category}</span>
                          <span>&bull;</span>
                          <span className="flex items-center gap-0.5 text-amber-500 font-medium">
                            <Star className="size-2.5 fill-amber-400 text-amber-400" />
                            {product.rating}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-xs font-bold text-black">${product.price}</span>
                      </div>
                    </button>
                  ))
                ) : !isSearching ? (
                  <div className="py-4 px-3 text-center">
                    <p className="text-xs text-gray-500">No products directly matched &ldquo;{trimmed}&rdquo;</p>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Bottom: View all in shop */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleExecuteSearch(trimmed)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold text-black hover:bg-gray-100 rounded-xl transition-colors"
              >
                <span>Search all results for &ldquo;{trimmed}&rdquo;</span>
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-8">
        {/* Left: Mobile hamburger & Brand */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-black p-1 hover:bg-black/5 rounded-md"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>

          <Link href="/" className="text-[28px] md:text-[32px] font-black tracking-tighter text-black font-integral">
            SHOP.CO
          </Link>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-[16px] text-black">
          <div
            className="relative"
            onMouseEnter={() => setShopDropdownOpen(true)}
            onMouseLeave={() => setShopDropdownOpen(false)}
          >
            <button className="flex items-center gap-1 py-2 hover:text-black/70 transition-colors font-medium">
              <span>Shop</span>
              <ChevronDown className={`size-4 transition-transform ${shopDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {shopDropdownOpen && (
              <div className="absolute left-0 top-full w-48 rounded-xl border border-black/10 bg-white p-2 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
                <Link
                  href="/shop?category=t-shirts"
                  className="block rounded-lg px-3 py-2 text-[14px] hover:bg-[#F0EEED] transition-colors"
                >
                  T-Shirts
                </Link>
                <Link
                  href="/shop?category=shirts"
                  className="block rounded-lg px-3 py-2 text-[14px] hover:bg-[#F0EEED] transition-colors"
                >
                  Shirts
                </Link>
                <Link
                  href="/shop?category=jeans"
                  className="block rounded-lg px-3 py-2 text-[14px] hover:bg-[#F0EEED] transition-colors"
                >
                  Jeans
                </Link>
                <Link
                  href="/shop?category=shorts"
                  className="block rounded-lg px-3 py-2 text-[14px] hover:bg-[#F0EEED] transition-colors"
                >
                  Shorts
                </Link>
                <div className="my-1 border-t border-black/5" />
                <Link
                  href="/shop"
                  className="block rounded-lg px-3 py-2 text-[14px] font-semibold text-black hover:bg-[#F0EEED]"
                >
                  View All Products
                </Link>
              </div>
            )}
          </div>

          <Link href="/shop?filter=sale" className="hover:text-black/70 transition-colors font-medium">
            On Sale
          </Link>
          <Link href="/#new-arrivals" className="hover:text-black/70 transition-colors font-medium">
            New Arrivals
          </Link>
          <Link href="/#brands" className="hover:text-black/70 transition-colors font-medium">
            Brands
          </Link>
        </nav>

        {/* Center-Right: Desktop Search Input with Suggestions */}
        <div ref={desktopSearchRef} className="hidden md:flex flex-1 max-w-[500px] relative items-center">
          <form onSubmit={handleSearchSubmit} className="w-full relative flex items-center">
            <button
              type="submit"
              className="absolute left-3.5 p-1 text-black/40 hover:text-black transition-colors"
              aria-label="Search"
            >
              <Search className="size-4" />
            </button>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setShowSuggestions(false);
              }}
              placeholder="Search for products, categories..."
              className="w-full rounded-full bg-[#F0F0F0] py-2.5 pl-11 pr-10 text-[14px] text-black outline-none placeholder:text-black/40 focus:ring-2 focus:ring-black/20 focus:bg-white transition-all border border-transparent focus:border-black/10"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSuggestions([]);
                }}
                className="absolute right-3.5 p-1 text-black/40 hover:text-black transition-colors"
                aria-label="Clear search"
              >
                <X className="size-4" />
              </button>
            )}
          </form>

          {renderSuggestionsDropdown()}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 md:gap-4 text-black">
          <Link
            href="/cart"
            className="relative p-2 hover:bg-black/5 rounded-full transition-colors"
            aria-label="View Shopping Cart"
          >
            <ShoppingCart className="size-6 text-black" />
            {totalCount > 0 && (
              <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-black text-[11px] font-bold text-white">
                {totalCount}
              </span>
            )}
          </Link>

          <div className="relative">
            {isAuthenticated ? (
              <button
                className="p-2 hover:bg-black/5 rounded-full transition-colors flex items-center gap-1.5"
                aria-label="User Account"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              >
                <User className="size-6 text-black" />
                <span className="hidden lg:inline text-xs font-bold text-gray-700 max-w-[80px] truncate">
                  {user?.name?.split(' ')[0]}
                </span>
              </button>
            ) : (
              <Link
                href="/login"
                className="p-2 hover:bg-black/5 rounded-full transition-colors flex items-center gap-1.5"
                aria-label="Sign In"
              >
                <User className="size-6 text-black" />
              </Link>
            )}

            {isAuthenticated && userDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-black/10 bg-white p-3 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                <div className="px-3 py-2 border-b border-gray-100 mb-2">
                  <p className="text-xs text-gray-400 font-medium">Signed in as</p>
                  <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>

                <Link
                  href="/profile"
                  onClick={() => setUserDropdownOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition text-left"
                >
                  <MapPin className="w-4 h-4 text-gray-500" />
                  My Profile &amp; Addresses
                </Link>

                <Link
                  href="/orders"
                  onClick={() => setUserDropdownOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition text-left"
                >
                  <PackageCheck className="w-4 h-4 text-gray-500" />
                  My Orders History
                </Link>

                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition text-left mt-1"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar with Suggestions */}
      <div ref={mobileSearchRef} className="md:hidden px-4 pb-3 relative">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <button
            type="submit"
            className="absolute left-3 p-1 text-black/40 hover:text-black transition-colors"
            aria-label="Search"
          >
            <Search className="size-4" />
          </button>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search for products, categories..."
            className="w-full rounded-full bg-[#F0F0F0] py-2.5 pl-10 pr-10 text-[13px] text-black outline-none placeholder:text-black/40 focus:bg-white focus:ring-2 focus:ring-black/20 border border-transparent focus:border-black/10 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSuggestions([]);
              }}
              className="absolute right-3 p-1 text-black/40 hover:text-black"
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          )}
        </form>

        {renderSuggestionsDropdown()}
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-black/10 bg-white px-6 py-6 space-y-4">
          <Link
            href="/shop"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-[18px] font-medium text-black"
          >
            Shop
          </Link>
          <Link
            href="/shop?filter=sale"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-[18px] font-medium text-black"
          >
            On Sale
          </Link>
          <Link
            href="/#new-arrivals"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-[18px] font-medium text-black"
          >
            New Arrivals
          </Link>
          <Link
            href="/#brands"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-[18px] font-medium text-black"
          >
            Brands
          </Link>

          <div className="pt-4 border-t border-black/10 space-y-3">
            {isAuthenticated ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-left text-[16px] font-medium text-gray-700 hover:text-black"
                >
                  My Profile &amp; Addresses
                </Link>
                <Link
                  href="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-left text-[16px] font-medium text-gray-700 hover:text-black"
                >
                  My Orders History
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="block text-left text-[16px] font-medium text-red-600"
                >
                  Sign Out ({user?.name?.split(' ')[0]})
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-[16px] font-bold text-black"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-[16px] font-medium text-gray-600"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
