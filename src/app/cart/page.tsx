'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  Tag,
  ShoppingBag,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import StripeCheckoutModal from '@/components/checkout/StripeCheckoutModal';

export default function CartPage() {
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    discount,
    deliveryFee,
    total,
    appliedPromo,
    applyPromo,
    removePromo,
  } = useCart();

  const { user, saveAddress } = useCustomerAuth();

  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<string | null>(null);
  const [promoError, setPromoError] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = await applyPromo(promoInput);
    if (res.success) {
      setPromoMessage(`Coupon "${promoInput.toUpperCase()}" applied successfully!`);
      setPromoError(false);
      setPromoInput('');
    } else {
      setPromoMessage(res.message || 'Invalid coupon code. Try "SHOP20" or "FIRST10".');
      setPromoError(true);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8 py-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-[14px] text-black/60 mb-6">
        <Link href="/" className="hover:text-black">Home</Link>
        <ChevronRight className="size-4" />
        <span className="font-semibold text-black">Cart</span>
      </div>

      <h1 className="text-[32px] md:text-[40px] font-black uppercase text-black mb-8 font-integral">
        YOUR CART
      </h1>

      {items.length === 0 ? (
        <div className="rounded-[24px] border border-black/10 bg-[#F0F0F0]/50 p-12 text-center my-8 flex flex-col items-center gap-4">
          <ShoppingBag className="size-16 text-black/30" />
          <h2 className="text-[24px] font-bold text-black">Your cart is empty</h2>
          <p className="text-[15px] text-black/60 max-w-md">
            Looks like you haven&apos;t added any items to your cart yet. Explore our latest arrivals and top-selling collections!
          </p>
          <Link
            href="/shop"
            className="mt-2 rounded-full bg-black px-8 py-3.5 text-[15px] font-medium text-white hover:bg-black/85"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-7 rounded-[20px] border border-black/10 p-4 sm:p-6 divide-y divide-black/10">
            {items.map((item) => (
              <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                <div className="relative size-[100px] sm:size-[120px] rounded-[14px] bg-[#F0EEED] overflow-hidden shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between py-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-[16px] sm:text-[18px] font-bold text-black leading-snug">
                        {item.name}
                      </h3>
                      <div className="mt-1 flex flex-col gap-0.5 text-[12px] sm:text-[13px] text-black/60">
                        {item.size && <span>Size: <strong className="text-black">{item.size}</strong></span>}
                        {item.color && <span>Color: <strong className="text-black">{item.color}</strong></span>}
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 mt-0.5">
                          <CheckCircle2 className="size-3 text-emerald-600" />
                          <span>In Stock · Ready to ship</span>
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1 text-[#FF3333] hover:opacity-75 transition-opacity"
                      aria-label="Remove item"
                    >
                      <Trash2 className="size-5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[18px] sm:text-[20px] font-bold text-black">
                      ${item.price}
                    </span>

                    <div className="flex items-center justify-between rounded-full bg-[#F0F0F0] px-3 py-1.5 w-[100px] sm:w-[110px]">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="text-black hover:opacity-70 p-1"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="text-[14px] font-bold text-black">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="text-black hover:opacity-70 p-1"
                        aria-label="Increase quantity"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5 rounded-[20px] border border-black/10 p-6 space-y-5">
            <h2 className="text-[20px] font-bold text-black">Order Summary</h2>

            <div className="space-y-4 text-[16px]">
              <div className="flex justify-between text-black/60">
                <span>Subtotal</span>
                <span className="font-bold text-black">${subtotal}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-[#FF3333]">
                  <span>Discount {appliedPromo ? `(${appliedPromo})` : ''}</span>
                  <span className="font-bold">-${discount}</span>
                </div>
              )}

              <div className="flex justify-between text-black/60">
                <span>Delivery Fee</span>
                <span className="font-bold text-black">
                  {deliveryFee === 0 ? <span className="text-emerald-600 uppercase">FREE</span> : `$${deliveryFee}`}
                </span>
              </div>

              <div className="border-t border-black/10 pt-4 flex justify-between text-[18px] font-bold text-black">
                <span>Total</span>
                <span>${total}</span>
              </div>
            </div>

            {/* Promo Code Input */}
            <form onSubmit={handleApplyPromo} className="flex gap-3 pt-2">
              <div className="relative flex-1">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-black/40" />
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder="Add promo code (e.g. SHOP20)"
                  className="w-full rounded-full bg-[#F0F0F0] py-3.5 pl-11 pr-4 text-[14px] text-black outline-none placeholder:text-black/40 uppercase font-semibold"
                />
              </div>

              <button
                type="submit"
                className="rounded-full bg-black px-6 py-3.5 text-[14px] font-medium text-white transition-all hover:bg-black/85"
              >
                Apply
              </button>
            </form>

            {promoMessage && (
              <p
                className={`text-[13px] font-medium -mt-2 flex items-center gap-1.5 ${
                  promoError ? 'text-red-600' : 'text-emerald-700'
                }`}
              >
                {promoError ? <AlertTriangle className="size-4 shrink-0" /> : <CheckCircle2 className="size-4 shrink-0" />}
                <span>{promoMessage}</span>
              </p>
            )}

            {/* Checkout Button */}
            <button
              onClick={() => setCheckoutModalOpen(true)}
              disabled={items.length === 0}
              className="w-full rounded-full bg-black py-4 text-[16px] font-medium text-white transition-all hover:bg-black/85 flex items-center justify-center gap-3 shadow-md hover:shadow-lg disabled:opacity-50"
            >
              <span>Go to Checkout</span>
              <ArrowRight className="size-5" />
            </button>
          </div>
        </div>
      )}

      {/* Real Stripe Checkout Modal */}
      <StripeCheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        items={items}
        total={total}
        appliedPromo={appliedPromo}
        user={user}
        saveAddress={saveAddress}
        clearCart={clearCart}
      />
    </div>
  );
}
