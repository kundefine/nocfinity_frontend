'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Search, ShoppingCart, User, Menu, X, ChevronDown, LogOut, PackageCheck, MapPin } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useCustomerAuth } from '@/context/CustomerAuthContext';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { totalCount } = useCart();
  const { user, isAuthenticated, logout } = useCustomerAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  if (pathname?.startsWith('/admin')) return null;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
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

        {/* Center-Right: Search Input */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-[500px] relative items-center">
          <Search className="absolute left-4 size-5 text-black/40 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for products..."
            className="w-full rounded-full bg-[#F0F0F0] py-3 pl-12 pr-4 text-[14px] text-black outline-none placeholder:text-black/40 focus:ring-2 focus:ring-black/20 transition-all"
          />
        </form>

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

      {/* Mobile Search Bar & Menu */}
      <div className="md:hidden px-4 pb-3">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <Search className="absolute left-3 size-4 text-black/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for products..."
            className="w-full rounded-full bg-[#F0F0F0] py-2 pl-10 pr-4 text-[13px] text-black outline-none placeholder:text-black/40"
          />
        </form>
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
