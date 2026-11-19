'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle2, Package, MapPin, ArrowRight, ShoppingBag, CreditCard } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function OrderConfirmationClient({ orderNumber }: { orderNumber: string }) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderNumber) return;

    fetchApi<any>(`/orders/${orderNumber}`, { authType: 'customer' })
      .then((res) => {
        if (res.success && res.data) {
          setOrder(res.data);
        } else {
          setError(res.message || 'Order details could not be retrieved.');
        }
      })
      .catch(() => {
        setError('Failed to fetch order information.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F0F0]/50 py-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Loading your receipt...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#F0F0F0]/50 py-16 px-4">
        <div className="max-w-md mx-auto bg-white rounded-3xl p-8 text-center shadow-xs border border-gray-100">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-gray-500 text-sm mb-6">{error || 'Unable to locate order #' + orderNumber}</p>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center w-full py-3.5 bg-black text-white rounded-full font-medium hover:bg-black/85 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9] py-10 md:py-16 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Success Header Card */}
        <div className="bg-white rounded-3xl p-8 md:p-10 text-center shadow-xs border border-gray-100">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full uppercase tracking-wider mb-3">
            {order.payment_status === 'paid' ? 'Payment Confirmed' : 'Order Placed'}
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-950 tracking-tight">
            Thank you for your order!
          </h1>
          <p className="text-gray-500 mt-2 text-base">
            We&apos;ve sent an order confirmation email to <span className="font-semibold text-gray-900">{order.shipping_email}</span>.
          </p>

          <div className="inline-flex items-center gap-2 mt-6 px-4 py-2 bg-gray-50 rounded-2xl border border-gray-100">
            <span className="text-xs uppercase text-gray-400 font-semibold tracking-wider">Order Reference</span>
            <span className="font-mono text-sm font-bold text-gray-900">#{order.order_number}</span>
          </div>
        </div>

        {/* Order Details & Items Card */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-gray-100 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold text-gray-950 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-gray-400" />
              Order Items ({order.items?.length || 0})
            </h2>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
              order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
              order.status === 'processing' ? 'bg-indigo-100 text-indigo-800' :
              order.status === 'paid' ? 'bg-blue-100 text-blue-800' :
              'bg-amber-100 text-amber-800'
            }`}>
              {order.status}
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            {order.items?.map((item: any) => (
              <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl overflow-hidden relative shrink-0">
                    <Image
                      src={item.product?.images?.[0]?.image_url || '/figma/imgImage7_96f1301c.png'}
                      alt={item.product_name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm md:text-base">{item.product_name}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      {item.size && <span>Size: {item.size}</span>}
                      {item.size && item.color && <span>•</span>}
                      {item.color && <span>Color: {item.color}</span>}
                      <span>•</span>
                      <span>Qty: {item.quantity}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-gray-900 text-base">${Number(item.price * item.quantity).toFixed(2)}</p>
                  <p className="text-xs text-gray-400">${Number(item.price).toFixed(2)} each</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Breakdown */}
          <div className="bg-gray-50 rounded-2xl p-5 space-y-2.5 text-sm border border-gray-100">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-medium text-gray-900">${Number(order.subtotal).toFixed(2)}</span>
            </div>
            {Number(order.discount_amount) > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount {order.coupon_code ? `(${order.coupon_code})` : ''}</span>
                <span className="font-semibold">-${Number(order.discount_amount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Delivery Fee</span>
              <span className="font-medium text-gray-900">
                {Number(order.delivery_fee) === 0 ? 'FREE' : `$${Number(order.delivery_fee).toFixed(2)}`}
              </span>
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between text-base font-extrabold text-gray-950">
              <span>Total Paid</span>
              <span>${Number(order.total_amount).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Shipping & Payment Info Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100">
            <div className="flex items-center gap-2 text-gray-900 font-bold mb-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              Shipping Address
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-semibold text-gray-900">{order.shipping_name}</p>
              <p>{order.shipping_address}</p>
              <p>{order.shipping_city}{order.shipping_postal_code ? `, ${order.shipping_postal_code}` : ''}</p>
              <p>{order.shipping_country}</p>
              {order.shipping_phone && <p className="text-xs text-gray-400 pt-1">Tel: {order.shipping_phone}</p>}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100">
            <div className="flex items-center gap-2 text-gray-900 font-bold mb-3">
              <CreditCard className="w-5 h-5 text-gray-400" />
              Payment Details
            </div>
            <div className="text-sm text-gray-600 space-y-2">
              <div className="flex justify-between">
                <span>Method:</span>
                <span className="font-semibold text-gray-900">Stripe (Card)</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={`font-bold ${order.payment_status === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {order.payment_status?.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span className="text-gray-700">
                  {new Date(order.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
          <Link
            href="/orders"
            className="w-full sm:w-1/2 py-4 text-center rounded-full bg-white border border-gray-200 text-gray-900 font-bold text-sm hover:bg-gray-50 transition-all shadow-xs"
          >
            View All My Orders
          </Link>
          <Link
            href="/shop"
            className="w-full sm:w-1/2 py-4 text-center rounded-full bg-black text-white font-bold text-sm hover:bg-black/85 transition-all shadow-md flex items-center justify-center gap-2"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
