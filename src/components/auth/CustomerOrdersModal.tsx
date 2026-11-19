'use client';

import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Calendar, PackageCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface CustomerOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CustomerOrdersModal({ isOpen, onClose }: CustomerOrdersModalProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchApi('/my-orders').then((res) => {
        if (res.success && res.data) {
          setOrders(res.data);
        }
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col p-6 sm:p-8 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-black" />
              My Orders
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Track your past purchases and shipping updates</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black p-1.5 rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto py-4 space-y-4 flex-1">
          {loading ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-500 font-medium">Loading your orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-base font-medium text-gray-800">No orders found</p>
              <p className="text-xs text-gray-400 mt-1">Once you complete a purchase, your orders will appear here.</p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-gray-50 p-4 sm:p-5 rounded-2xl border border-gray-100 hover:border-gray-200 transition space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-mono font-bold text-sm text-gray-900">
                      {order.order_number}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        order.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'shipped'
                          ? 'bg-blue-100 text-blue-800'
                          : order.status === 'processing'
                          ? 'bg-amber-100 text-amber-800'
                          : order.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {order.status}
                    </span>
                    <span className="font-bold text-sm text-gray-900">
                      ${Number(order.total_amount).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Items preview */}
                <div className="border-t border-gray-200/60 pt-2.5 space-y-1.5">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between text-xs text-gray-700">
                      <span className="font-medium">
                        {item.quantity}x {item.product_name || item.product?.name}
                        {item.size ? ` (${item.size})` : ''}
                      </span>
                      <span className="font-mono text-gray-500">${Number(item.subtotal || item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-black text-white text-xs font-bold rounded-2xl hover:bg-gray-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
