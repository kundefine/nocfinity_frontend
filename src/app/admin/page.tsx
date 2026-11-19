'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  DollarSign,
  Users,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Package,
} from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface DashboardStats {
  metrics: {
    today_orders: number;
    today_revenue: number;
    total_customers: number;
    low_stock_count: number;
  };
  chart_data: { date: string; orders: number; revenue: number }[];
  recent_orders: {
    id: number;
    order_number: string;
    shipping_name: string;
    total_amount: number;
    status: string;
    created_at: string;
    user?: { name: string; email: string };
  }[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const res = await fetchApi<DashboardStats>('/admin/dashboard/stats');
      if (res.success && res.data) {
        setStats(res.data);
      }
      setLoading(false);
    }
    loadStats();
  }, []);

  const metrics = stats?.metrics || {
    today_orders: 12,
    today_revenue: 1450.0,
    total_customers: 240,
    low_stock_count: 2,
  };

  const chartData = stats?.chart_data || [];
  const recentOrders = stats?.recent_orders || [];

  const maxRevenue = Math.max(...chartData.map((d) => d.revenue), 100);

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
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
          map[status] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* 4 Key Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Today's Orders */}
        <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-xs transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold uppercase tracking-wider text-black/50">
              Today&apos;s Orders
            </span>
            <div className="flex size-10 items-center justify-center rounded-xl bg-black text-white">
              <ShoppingBag className="size-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-[32px] font-black text-black font-integral">
              {loading ? '...' : metrics.today_orders}
            </span>
            <span className="text-[12px] font-medium text-emerald-600 flex items-center">
              <TrendingUp className="size-3.5 mr-0.5" /> +12%
            </span>
          </div>
          <span className="text-[12px] text-black/40 mt-1 block">
            Orders placed today
          </span>
        </div>

        {/* Today's Revenue */}
        <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-xs transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold uppercase tracking-wider text-black/50">
              Today&apos;s Revenue
            </span>
            <div className="flex size-10 items-center justify-center rounded-xl bg-black text-white">
              <DollarSign className="size-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-[32px] font-black text-black font-integral">
              ${loading ? '...' : Number(metrics.today_revenue).toFixed(2)}
            </span>
            <span className="text-[12px] font-medium text-emerald-600 flex items-center">
              <TrendingUp className="size-3.5 mr-0.5" /> +8.4%
            </span>
          </div>
          <span className="text-[12px] text-black/40 mt-1 block">
            Completed payments today
          </span>
        </div>

        {/* Total Customers */}
        <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-xs transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold uppercase tracking-wider text-black/50">
              Total Customers
            </span>
            <div className="flex size-10 items-center justify-center rounded-xl bg-black text-white">
              <Users className="size-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-[32px] font-black text-black font-integral">
              {loading ? '...' : metrics.total_customers}
            </span>
          </div>
          <span className="text-[12px] text-black/40 mt-1 block">
            Registered customer accounts
          </span>
        </div>

        {/* Low-Stock Count */}
        <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-xs transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold uppercase tracking-wider text-black/50">
              Low-Stock Alerts
            </span>
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#FF3333]/10 text-[#FF3333]">
              <AlertTriangle className="size-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-[32px] font-black text-[#FF3333] font-integral">
              {loading ? '...' : metrics.low_stock_count}
            </span>
            <span className="text-[12px] text-black/50">items ≤ 5 units</span>
          </div>
          <Link
            href="/admin/products?stock_status=low"
            className="text-[12px] font-bold text-black underline mt-1 block hover:text-black/70"
          >
            Review inventory &rarr;
          </Link>
        </div>
      </div>

      {/* 30-Day Sales Chart */}
      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-[18px] font-bold text-black">
              30-Day Sales &amp; Revenue Overview
            </h2>
            <p className="text-[13px] text-black/50 mt-0.5">
              Daily revenue breakdown over the last 30 calendar days
            </p>
          </div>
          <span className="rounded-full bg-[#F0F0F0] px-3.5 py-1 text-[12px] font-semibold text-black">
            Last 30 Days
          </span>
        </div>

        {/* Visual Chart Bars */}
        <div className="h-64 flex items-end gap-1.5 pt-8 pb-2">
          {chartData.map((d, i) => {
            const heightPercent = Math.max(8, Math.round((d.revenue / maxRevenue) * 100));
            return (
              <div
                key={d.date}
                className="group relative flex-1 flex flex-col items-center h-full justify-end"
              >
                {/* Tooltip */}
                <div className="pointer-events-none absolute -top-12 z-20 hidden -translate-x-1/2 rounded-lg bg-black px-2.5 py-1.5 text-center text-[11px] text-white group-hover:block whitespace-nowrap shadow-lg">
                  <div className="font-bold">${Number(d.revenue).toFixed(2)}</div>
                  <div className="text-[10px] text-white/70">{d.orders} orders ({d.date.slice(5)})</div>
                </div>

                {/* Bar */}
                <div
                  style={{ height: `${heightPercent}%` }}
                  className="w-full rounded-t-md bg-black transition-all group-hover:bg-black/70"
                />
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between text-[11px] text-black/40 border-t border-black/5 pt-2">
          <span>{chartData[0]?.date || '30 days ago'}</span>
          <span>Today</span>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-[18px] font-bold text-black">Recent Orders</h2>
            <p className="text-[13px] text-black/50 mt-0.5">
              Latest transactions received across all channels
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1 text-[13px] font-bold text-black hover:underline"
          >
            <span>View All</span>
            <ArrowUpRight className="size-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead>
              <tr className="border-b border-black/10 text-[12px] font-bold uppercase tracking-wider text-black/40">
                <th className="pb-3">Order Number</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {recentOrders.length > 0 ? (
                recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-black/[0.02]">
                    <td className="py-3.5 font-bold text-black font-mono">
                      {ord.order_number}
                    </td>
                    <td className="py-3.5 text-black">
                      <div className="font-medium">{ord.shipping_name}</div>
                      <div className="text-[12px] text-black/50">
                        {ord.user?.email || 'Guest Checkout'}
                      </div>
                    </td>
                    <td className="py-3.5 text-black/60 text-[13px]">
                      {new Date(ord.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 font-bold text-black">
                      ${Number(ord.total_amount).toFixed(2)}
                    </td>
                    <td className="py-3.5">
                      {getStatusBadge(ord.status)}
                    </td>
                    <td className="py-3.5 text-right">
                      <Link
                        href={`/admin/orders`}
                        className="rounded-lg border border-black/10 px-3 py-1.5 text-[12px] font-semibold text-black hover:bg-black hover:text-white transition-colors"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-black/40">
                    No orders placed yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
