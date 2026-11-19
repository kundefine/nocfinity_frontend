'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  DollarSign,
  UserCheck,
  Eye,
  X,
} from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface CustomerItem {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  is_active: boolean;
  created_at: string;
  orders_count: number;
  orders_sum_total_amount: number | null;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (selectedCustomer) {
      setOrdersLoading(true);
      fetchApi<any[]>(`/my-orders?customer_id=${selectedCustomer.id}`, { authType: 'admin' })
        .then((res) => {
          if (res.success && Array.isArray(res.data)) {
            setCustomerOrders(res.data);
          } else {
            setCustomerOrders([]);
          }
        })
        .catch(() => setCustomerOrders([]))
        .finally(() => setOrdersLoading(false));
    } else {
      setCustomerOrders([]);
    }
  }, [selectedCustomer]);

  const loadCustomers = async () => {
    setLoading(true);
    let url = '/admin/dashboard/customers';
    if (search.trim()) {
      url += `?search=${encodeURIComponent(search.trim())}`;
    }
    const res = await fetchApi<CustomerItem[]>(url);
    if (res.success && res.data) {
      setCustomers(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadCustomers();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-black" />
            Customer Directory
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            View registered customers, their order frequencies, and lifetime expenditures.
          </p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <form onSubmit={handleSearchSubmit} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition"
        >
          Search
        </button>
      </form>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-medium">Loading customer accounts...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="py-20 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-medium text-gray-800">No customers found</p>
            <p className="text-xs text-gray-400 mt-1">Registered retail customers will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Contact Info</th>
                  <th className="px-6 py-4">Orders Placed</th>
                  <th className="px-6 py-4">Total Spent</th>
                  <th className="px-6 py-4">Joined Date</th>
                  <th className="px-6 py-4">Account Status</th>
                  <th className="px-6 py-4 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map((c) => {
                  const initials = c.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <tr key={c.id} className="hover:bg-gray-50/70 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-800 text-xs shrink-0 border border-gray-200">
                            {initials || <Users className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{c.name}</div>
                            <div className="text-xs text-gray-400">ID: #{c.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-gray-700">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            <span>{c.email}</span>
                          </div>
                          {c.phone && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <Phone className="w-3.5 h-3.5 text-gray-400" />
                              <span>{c.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 font-semibold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-full text-xs">
                          <ShoppingBag className="w-3 h-3 text-gray-500" />
                          {c.orders_count} {c.orders_count === 1 ? 'order' : 'orders'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">
                        ${Number(c.orders_sum_total_amount || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>{new Date(c.created_at).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {c.is_active ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full">
                            Suspended
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedCustomer(c)}
                          className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition"
                          title="View customer overview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Quick Overview Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Customer Details</h2>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 text-center">
              <div className="w-16 h-16 rounded-full bg-black text-white font-bold text-xl flex items-center justify-center mx-auto mb-3">
                {selectedCustomer.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <h3 className="text-lg font-bold text-gray-900">{selectedCustomer.name}</h3>
              <p className="text-sm text-gray-500">{selectedCustomer.email}</p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                <span className="text-xs text-gray-400 font-medium">Lifetime Spend</span>
                <p className="text-lg font-bold text-gray-900 mt-0.5">
                  ${Number(selectedCustomer.orders_sum_total_amount || 0).toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                <span className="text-xs text-gray-400 font-medium">Orders Placed</span>
                <p className="text-lg font-bold text-gray-900 mt-0.5">
                  {selectedCustomer.orders_count}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs text-gray-600 border-t border-gray-100 pt-4">
              <div className="flex justify-between py-1">
                <span className="text-gray-400">Phone:</span>
                <span className="font-medium text-gray-800">{selectedCustomer.phone || 'None provided'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-400">Customer ID:</span>
                <span className="font-mono font-medium text-gray-800">#{selectedCustomer.id}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-400">Account Created:</span>
                <span className="font-medium text-gray-800">
                  {new Date(selectedCustomer.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Customer Past Orders History */}
            <div className="mt-5 border-t border-gray-100 pt-4">
              <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">Order History</h4>
              {ordersLoading ? (
                <p className="text-xs text-gray-400 text-center py-4">Loading past orders...</p>
              ) : customerOrders.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {customerOrders.map((ord: any) => (
                    <div key={ord.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                      <div>
                        <span className="font-mono font-bold text-gray-900">#{ord.order_number}</span>
                        <div className="text-[10px] text-gray-400">{new Date(ord.created_at).toLocaleDateString()}</div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-gray-900 block">${Number(ord.total_amount).toFixed(2)}</span>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          ord.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                          ord.status === 'paid' ? 'bg-blue-100 text-blue-800' :
                          ord.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {ord.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 text-center py-3 bg-gray-50 rounded-xl">No prior orders recorded.</p>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-5 py-2.5 bg-black hover:bg-black/85 text-white text-xs font-bold rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
