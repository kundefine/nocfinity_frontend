'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem } from '@/types';
import { fetchApi } from '@/lib/api';

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  totalCount: number;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  appliedPromo: string | null;
  applyPromo: (code: string) => Promise<{ success: boolean; message?: string }>;
  removePromo: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoDiscount, setPromoDiscount] = useState<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('shopco_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Clean up old static placeholder mock items from initial Figma design preview
          const isOldMock =
            parsed.length === 3 &&
            parsed.some((i: any) => i.id === 'cart-1' && i.name === 'Gradient Graphic T-shirt');

          if (isOldMock) {
            setItems([]);
            localStorage.removeItem('shopco_cart');
            localStorage.removeItem('shopco_promo');
          } else {
            setItems(parsed);
          }
        }
      }
      const savedPromo = localStorage.getItem('shopco_promo');
      if (savedPromo && savedPromo !== 'SHOP20') {
        setAppliedPromo(savedPromo);
      }
      if (!localStorage.getItem('shopco_guest_token')) {
        localStorage.setItem('shopco_guest_token', 'gst_' + Math.random().toString(36).substring(2) + Date.now().toString(36));
      }
    } catch {}
    setIsInitialized(true);
  }, []);

  // Save to localStorage only after initial load
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem('shopco_cart', JSON.stringify(items));
    } catch {}
  }, [items, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    try {
      if (appliedPromo) {
        localStorage.setItem('shopco_promo', appliedPromo);
      } else {
        localStorage.removeItem('shopco_promo');
      }
    } catch {}
  }, [appliedPromo, isInitialized]);

  const addToCart = (newItem: Omit<CartItem, 'id'>) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.productId === newItem.productId && i.size === newItem.size && i.color === newItem.color
      );
      if (existing) {
        return prev.map((i) =>
          i.id === existing.id ? { ...i, quantity: i.quantity + newItem.quantity } : i
        );
      }
      return [...prev, { ...newItem, id: `cart-${Date.now()}` }];
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) => {
          if (i.id === id) {
            const nextQty = i.quantity + delta;
            return nextQty > 0 ? { ...i, quantity: nextQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedPromo(null);
    setPromoDiscount(null);
    localStorage.removeItem('shopco_cart');
    localStorage.removeItem('shopco_promo');
  };

  const totalCount = items.reduce((acc, curr) => acc + curr.quantity, 0);
  const subtotal = items.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);

  const applyPromo = async (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return { success: false, message: 'Please enter a coupon code.' };

    try {
      const res = await fetchApi<any>('/coupons/apply', {
        method: 'POST',
        body: JSON.stringify({ code: cleanCode, subtotal }),
      });

      if (res.success && res.data) {
        setAppliedPromo(res.data.code);
        setPromoDiscount(res.data.discount_amount);
        return { success: true };
      }

      // Offline demo fallback
      if (cleanCode === 'SHOP20') {
        setAppliedPromo('SHOP20');
        setPromoDiscount(Math.round(subtotal * 0.2));
        return { success: true };
      }

      return { success: false, message: res.message || 'Invalid coupon code.' };
    } catch {
      if (cleanCode === 'SHOP20') {
        setAppliedPromo('SHOP20');
        setPromoDiscount(Math.round(subtotal * 0.2));
        return { success: true };
      }
      return { success: false, message: 'Failed to connect to coupon service.' };
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setPromoDiscount(null);
  };

  // Calculate discount
  const discount = promoDiscount !== null
    ? promoDiscount
    : appliedPromo
    ? Math.round(subtotal * 0.2)
    : 0;

  const deliveryFee = items.length > 0 ? (subtotal >= 250 ? 0 : 15) : 0;
  const total = Math.max(0, subtotal - discount + deliveryFee);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalCount,
        subtotal,
        discount,
        deliveryFee,
        total,
        appliedPromo,
        applyPromo,
        removePromo,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
