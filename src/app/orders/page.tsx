'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PackageCheck,
  Calendar,
  ChevronRight,
  ShoppingBag,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { fetchApi, getImageUrl } from '@/lib/api';

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  price: number;
  quantity: number;
  size: string | null;
  color: string | null;
  subtotal: number;
  product?: {
    images?: { image_url: string; is_primary: boolean }[];
  };
}

interface OrderRecord {
  id: number;
  order_number: string;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: string;
  subtotal: number;
  discount_amount: number;
  delivery_fee: number;
  total_amount: number;
  shipping_name: string;
  shipping_email: string;
  shipping_address: string;
  shipping_city: string;
  coupon_code: string | null;
  created_at: string;
  items: OrderItem[];
}

export default function CustomerOrdersPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useCustomerAuth();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true);
      fetchApi<any>('/my-orders', { authType: 'customer' })
        .then((res) => {
          if (res.success && res.data) {
            const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
            setOrders(list);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8 py-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-[14px] text-black/60 mb-6">
        <Link href="/" className="hover:text-black">Home</Link>
        <ChevronRight className="size-4" />
        <span className="font-semibold text-black">My Orders</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] sm:text-[36px] font-black uppercase text-black font-integral">
            MY ORDER HISTORY
          </h1>
          <p className="text-sm text-black/60 mt-1">
            Track shipments, review past purchases, and check delivery status.
          </p>
        </div>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white text-xs font-bold rounded-2xl hover:bg-gray-800 transition self-start sm:self-auto"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="size-4" />
        </Link>
      </div>

      {authLoading || loading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium">Loading your orders...</p>
        </div>
      ) : !isAuthenticated ? (
        <div className="rounded-3xl border border-black/10 bg-gray-50 p-12 text-center my-6 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center text-black">
            <ShoppingBag className="size-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Sign in to view your orders</h2>
          <p className="text-sm text-gray-500 max-w-md">
            Please log in with your customer account to view your purchase history and order receipts.
          </p>
          <Link
            href="/login?redirect=/orders"
            className="mt-2 rounded-2xl bg-black px-8 py-3.5 text-xs font-bold text-white hover:bg-gray-800 transition"
          >
            Sign In to Account
          </Link>
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-3xl border border-black/10 bg-gray-50 p-12 text-center my-6 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center text-black">
            <PackageCheck className="size-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">No orders placed yet</h2>
          <p className="text-sm text-gray-500 max-w-md">
            You haven&apos;t placed any orders with this account yet. Explore our latest collections!
          </p>
          <Link
            href="/shop"
            className="mt-2 rounded-2xl bg-black px-8 py-3.5 text-xs font-bold text-white hover:bg-gray-800 transition"
          >
            Browse Catalog
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const statusConfig = {
              pending: { label: 'Pending', bg: 'bg-gray-100 text-gray-800', icon: Clock },
              paid: { label: 'Paid', bg: 'bg-emerald-100 text-emerald-800', icon: CheckCircle2 },
              processing: { label: 'Processing', bg: 'bg-amber-100 text-amber-800', icon: Clock },
              shipped: { label: 'Shipped', bg: 'bg-blue-100 text-blue-800', icon: Truck },
              delivered: { label: 'Delivered', bg: 'bg-emerald-100 text-emerald-800', icon: CheckCircle2 },
              cancelled: { label: 'Cancelled', bg: 'bg-red-100 text-red-800', icon: XCircle },
            }[order.status] || { label: order.status, bg: 'bg-gray-100 text-gray-800', icon: Clock };

            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-black/10 p-6 md:p-8 shadow-sm space-y-6"
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-gray-100">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-lg text-black">
                        {order.order_number}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusConfig.bg}`}>
                        <StatusIcon className="size-3.5" />
                        <span>{statusConfig.label}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-black/50 mt-1">
                      <Calendar className="size-3.5" />
                      <span>Placed on {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-black/40 uppercase tracking-wider font-semibold block">Total</span>
                    <span className="text-2xl font-black text-black">${Number(order.total_amount).toFixed(2)}</span>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-4">
                  {order.items?.map((item) => {
                    const primaryImg = getImageUrl(item.product?.images?.[0]?.image_url || '/figma/imgImage8_30fc2006.png');

                    return (
                      <div key={item.id} className="flex items-center gap-4 sm:gap-6">
                        <div className="size-16 sm:size-20 rounded-2xl bg-[#F0EEED] overflow-hidden flex items-center justify-center p-2 shrink-0">
                          <img
                            src={primaryImg}
                            alt={item.product_name}
                            className="size-full object-contain"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm sm:text-base text-black truncate">
                            {item.product_name}
                          </h4>
                          <div className="flex flex-wrap gap-2 text-xs text-black/60 mt-0.5">
                            {item.size && <span>Size: <strong className="text-black font-semibold">{item.size}</strong></span>}
                            {item.color && <span>Color: <strong className="text-black font-semibold">{item.color}</strong></span>}
                            <span>Qty: <strong className="text-black font-semibold">{item.quantity}</strong></span>
                          </div>
                        </div>

                        <div className="text-right font-bold text-sm sm:text-base text-black">
                          ${Number(item.subtotal || item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer Breakdown */}
                <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-black/60">
                  <div>
                    <span className="font-semibold text-black">Shipping to: </span>
                    <span>{order.shipping_name} — {order.shipping_address}, {order.shipping_city}</span>
                  </div>

                  <div className="flex items-center gap-4 text-black/80 font-medium">
                    {order.discount_amount > 0 && (
                      <span className="text-[#FF3333]">
                        Coupon ({order.coupon_code || 'Promo'}): -${Number(order.discount_amount).toFixed(2)}
                      </span>
                    )}
                    <span>Delivery: {order.delivery_fee === 0 ? 'FREE' : `$${order.delivery_fee}`}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
