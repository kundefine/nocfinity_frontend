'use client';

import React, { useState, useEffect } from 'react';
import {
  Ticket,
  Plus,
  Search,
  Edit2,
  Trash2,
  Calendar,
  DollarSign,
  Percent,
  X,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface CouponItem {
  id: number;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_order_amount: number | null;
  usage_limit: number | null;
  used_count: number;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponItem | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadCoupons = async () => {
    setLoading(true);
    const res = await fetchApi<CouponItem[]>('/admin/coupons');
    if (res.success && res.data) {
      setCoupons(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const openCreateModal = () => {
    setEditingCoupon(null);
    setCode('');
    setType('percentage');
    setValue('20');
    setMinOrderAmount('50');
    setUsageLimit('100');
    setStartsAt(new Date().toISOString().split('T')[0]);
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setExpiresAt(nextMonth.toISOString().split('T')[0]);
    setIsActive(true);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (coupon: CouponItem) => {
    setEditingCoupon(coupon);
    setCode(coupon.code);
    setType(coupon.type);
    setValue(String(coupon.value));
    setMinOrderAmount(coupon.min_order_amount ? String(coupon.min_order_amount) : '');
    setUsageLimit(coupon.usage_limit ? String(coupon.usage_limit) : '');
    setStartsAt(coupon.starts_at ? coupon.starts_at.substring(0, 10) : '');
    setExpiresAt(coupon.expires_at ? coupon.expires_at.substring(0, 10) : '');
    setIsActive(coupon.is_active);
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    const payload = {
      code: code.trim().toUpperCase(),
      type,
      value: parseFloat(value),
      min_order_amount: minOrderAmount ? parseFloat(minOrderAmount) : null,
      usage_limit: usageLimit ? parseInt(usageLimit, 10) : null,
      starts_at: startsAt || null,
      expires_at: expiresAt || null,
      is_active: isActive,
    };

    let res;
    if (editingCoupon) {
      res = await fetchApi(`/admin/coupons/${editingCoupon.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } else {
      res = await fetchApi('/admin/coupons', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }

    if (res.success) {
      setModalOpen(false);
      loadCoupons();
    } else {
      setFormError(res.message || 'Failed to save coupon.');
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    const res = await fetchApi(`/admin/coupons/${id}`, { method: 'DELETE' });
    if (res.success) {
      loadCoupons();
    } else {
      alert(res.message || 'Failed to delete coupon.');
    }
  };

  const filteredCoupons = coupons.filter((c) =>
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Ticket className="w-6 h-6 text-black" />
            Coupons & Discounts
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage promotional discount codes and percentage vouchers.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition"
        >
          <Plus className="w-4 h-4" />
          Create Coupon
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search coupons by code (e.g. SHOP20)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
          />
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-medium">Loading promotional coupons...</p>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="py-20 text-center">
            <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-medium text-gray-800">No coupons found</p>
            <p className="text-xs text-gray-400 mt-1">Try changing your search or add a new coupon code.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Discount</th>
                  <th className="px-6 py-4">Min Spend</th>
                  <th className="px-6 py-4">Redemptions</th>
                  <th className="px-6 py-4">Validity</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCoupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50/70 transition">
                    <td className="px-6 py-4 font-mono font-bold text-gray-900 tracking-wider">
                      <span className="inline-block px-2.5 py-1 bg-gray-100 border border-gray-200 rounded-md">
                        {coupon.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {coupon.type === 'percentage' ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-xs">
                          <Percent className="w-3 h-3" /> {coupon.value}% OFF
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full text-xs">
                          <DollarSign className="w-3 h-3" /> ${coupon.value} FLAT
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      {coupon.min_order_amount ? `$${coupon.min_order_amount}` : 'None'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 font-medium">
                        {coupon.used_count}{' '}
                        <span className="text-gray-400 font-normal">
                          / {coupon.usage_limit ?? '∞'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>
                          {coupon.starts_at ? coupon.starts_at.substring(0, 10) : 'Now'} to{' '}
                          {coupon.expires_at ? coupon.expires_at.substring(0, 10) : 'Never'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {coupon.is_active ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                          <Check className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(coupon)}
                        className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition"
                        title="Edit Coupon"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(coupon.id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete Coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUMMER25"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 text-sm font-mono uppercase bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Discount Type *</label>
                  <select
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Value * ({type === 'percentage' ? '%' : '$'})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    placeholder={type === 'percentage' ? '20' : '15'}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Min Order Spend ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Optional (e.g. 50)"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Max Redemptions
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Unlimited if empty"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Starts At</label>
                  <input
                    type="date"
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Expires At</label>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-black focus:ring-black w-4 h-4 cursor-pointer"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700 font-medium cursor-pointer">
                  Coupon is active and available for customer use
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-semibold text-white bg-black hover:bg-gray-800 rounded-xl transition disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
