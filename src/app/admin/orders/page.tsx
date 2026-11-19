'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Eye, X, CheckCircle, Clock, Truck, Ban } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { useAdminAuth } from '@/context/AdminAuthContext';

interface OrderItem {
  id: number;
  product_name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  subtotal: number;
  product?: { images: { image_url: string }[] };
}

interface OrderRecord {
  id: number;
  order_number: string;
  user_id?: number | null;
  status: string;
  payment_status: string;
  subtotal: number;
  discount_amount: number;
  delivery_fee: number;
  total_amount: number;
  coupon_code?: string;
  shipping_name: string;
  shipping_email: string;
  shipping_phone?: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code?: string;
  shipping_country: string;
  created_at: string;
  items?: OrderItem[];
  user?: { name: string; email: string };
}

export default function AdminOrdersPage() {
  const { hasPermission } = useAdminAuth();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    let query = `/admin/orders?search=${encodeURIComponent(search)}`;
    if (statusFilter) query += `&status=${statusFilter}`;

    const res = await fetchApi<OrderRecord[]>(query);
    if (res.success && res.data) {
      setOrders(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const handleInspect = async (id: number) => {
    const res = await fetchApi<OrderRecord>(`/admin/orders/${id}`);
    if (res.success && res.data) {
      setSelectedOrder(res.data);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedOrder) return;
    setStatusUpdating(true);

    const res = await fetchApi(`/admin/orders/${selectedOrder.id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: newStatus }),
    });

    setStatusUpdating(false);

    if (res.success && res.data) {
      setSelectedOrder(res.data);
      loadOrders();
    } else {
      alert(res.message || 'Status update failed.');
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      paid: 'bg-emerald-100 text-emerald-800',
      delivered: 'bg-green-100 text-green-800',
      shipped: 'bg-purple-100 text-purple-800',
      processing: 'bg-blue-100 text-blue-800',
      pending: 'bg-amber-100 text-amber-800',
      cancelled: 'bg-rose-100 text-rose-800',
    };
    return (
      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${map[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-bold text-black font-integral">Orders &amp; Fulfillment</h2>
          <p className="text-[13px] text-black/50">Track customer orders, review shipping addresses, and advance order status</p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-black/10 bg-white p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadOrders();
          }}
          className="relative flex-1 min-w-[220px]"
        >
          <Search className="absolute left-3.5 size-4 text-black/40 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order number, customer name, email..."
            className="w-full rounded-xl border border-black/10 bg-[#F9F9F9] py-2 pl-10 pr-4 text-[13px] text-black outline-none focus:border-black focus:bg-white"
          />
        </form>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-black/10 bg-white py-2 px-3 text-[13px] font-medium text-black outline-none capitalize"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-black/10 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead className="border-b border-black/10 bg-[#FBFBFB] text-[12px] font-bold uppercase tracking-wider text-black/40">
              <tr>
                <th className="py-3 px-6">Order</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-black/40">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length > 0 ? (
                orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-black/[0.02]">
                    <td className="py-3 px-6 font-mono font-bold text-black">{ord.order_number}</td>
                    <td className="py-3 px-4 text-black">
                      <div className="font-semibold">{ord.shipping_name}</div>
                      <div className="text-[12px] text-black/50">{ord.shipping_email}</div>
                    </td>
                    <td className="py-3 px-4 text-black/60 text-[13px]">
                      {new Date(ord.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-black font-semibold">
                      {ord.items?.length || 1} items
                    </td>
                    <td className="py-3 px-4 font-bold text-black">
                      ${Number(ord.total_amount).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${ord.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {ord.payment_status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(ord.status)}
                    </td>
                    <td className="py-3 px-6 text-right">
                      <button
                        onClick={() => handleInspect(ord.id)}
                        className="rounded-lg border border-black/10 px-3 py-1 text-[12px] font-semibold text-black hover:bg-black hover:text-white"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-black/40">
                    No orders match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 md:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-black/10">
              <div>
                <h3 className="text-[20px] font-bold text-black font-integral">
                  {selectedOrder.order_number}
                </h3>
                <span className="text-[12px] text-black/50">
                  Placed on {new Date(selectedOrder.created_at).toLocaleString()}
                </span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-black/50 hover:text-black">
                <X className="size-5" />
              </button>
            </div>

            {/* Status Advancer */}
            <div className="rounded-2xl border border-black/10 bg-[#F9F9F9] p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[12px] font-bold uppercase text-black/50 block">Current Status</span>
                <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
              </div>

              {hasPermission('orders.update_status') && (
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold text-black">Update To:</span>
                  <select
                    disabled={statusUpdating}
                    value={selectedOrder.status}
                    onChange={(e) => handleUpdateStatus(e.target.value)}
                    className="rounded-xl border border-black/10 bg-white py-1.5 px-3 text-[13px] font-bold text-black outline-none capitalize"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled (Restore Stock)</option>
                  </select>
                </div>
              )}
            </div>

            {/* Shipping & Customer Details */}
            <div className="grid grid-cols-2 gap-4 rounded-2xl border border-black/10 p-4 text-[13px]">
              <div>
                <h4 className="font-bold text-black mb-1 uppercase text-[11px] tracking-wider text-black/40">Customer</h4>
                <div className="font-semibold text-black">{selectedOrder.shipping_name}</div>
                <div className="text-black/60">{selectedOrder.shipping_email}</div>
                {selectedOrder.shipping_phone && <div className="text-black/60">{selectedOrder.shipping_phone}</div>}
              </div>
              <div>
                <h4 className="font-bold text-black mb-1 uppercase text-[11px] tracking-wider text-black/40">Shipping Destination</h4>
                <div className="text-black/80">{selectedOrder.shipping_address}</div>
                <div className="text-black/80">{selectedOrder.shipping_city}, {selectedOrder.shipping_postal_code}</div>
                <div className="text-black/80">{selectedOrder.shipping_country}</div>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3">
              <h4 className="font-bold text-black text-[14px]">Ordered Items</h4>
              <div className="divide-y divide-black/5 border rounded-2xl border-black/10 overflow-hidden">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-white text-[13px]">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-lg bg-[#F0EEED] p-1 flex items-center justify-center shrink-0">
                        {item.product?.images?.[0]?.image_url ? (
                          <img src={item.product.images[0].image_url} alt="" className="size-full object-contain" />
                        ) : (
                          <ShoppingBag className="size-5 text-black/30" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-black">{item.product_name}</div>
                        <div className="text-black/50 text-[11px]">
                          {item.size && `Size: ${item.size}`} {item.color && `• Color: ${item.color}`}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-black">${Number(item.price).toFixed(2)} × {item.quantity}</div>
                      <div className="text-[12px] text-black/50">${Number(item.subtotal).toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Totals Summary */}
            <div className="rounded-2xl bg-[#F0F0F0] p-4 space-y-2 text-[13px]">
              <div className="flex justify-between text-black/60">
                <span>Subtotal</span>
                <span>${Number(selectedOrder.subtotal).toFixed(2)}</span>
              </div>
              {selectedOrder.discount_amount > 0 && (
                <div className="flex justify-between text-[#FF3333] font-medium">
                  <span>Discount {selectedOrder.coupon_code && `(${selectedOrder.coupon_code})`}</span>
                  <span>-${Number(selectedOrder.discount_amount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-black/60">
                <span>Delivery Fee</span>
                <span>${Number(selectedOrder.delivery_fee).toFixed(2)}</span>
              </div>
              <div className="border-t border-black/10 pt-2 flex justify-between font-bold text-black text-[16px]">
                <span>Total Amount</span>
                <span>${Number(selectedOrder.total_amount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
