'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Ticket,
  Users,
  ShieldCheck,
  UserCheck,
  ExternalLink,
  LogOut,
  X,
} from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function AdminSidebar({ mobileOpen = false, onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, logout, hasPermission } = useAdminAuth();

  const navItems = [
    {
      label: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      permission: 'reports.view',
      exact: true,
    },
    {
      label: 'Products',
      href: '/admin/products',
      icon: Package,
      permission: 'products.view',
    },
    {
      label: 'Categories',
      href: '/admin/categories',
      icon: FolderTree,
      permission: 'categories.manage',
    },
    {
      label: 'Orders',
      href: '/admin/orders',
      icon: ShoppingBag,
      permission: 'orders.view',
    },
    {
      label: 'Coupons',
      href: '/admin/coupons',
      icon: Ticket,
      permission: 'coupons.manage',
    },
    {
      label: 'Customers',
      href: '/admin/customers',
      icon: Users,
      permission: 'customers.view',
    },
    {
      label: 'Roles & Staff',
      href: '/admin/roles',
      icon: ShieldCheck,
      permission: 'roles.manage',
    },
    {
      label: 'My Profile',
      href: '/admin/profile',
      icon: UserCheck,
    },
  ];

  const visibleItems = navItems.filter((item) => {
    if (!item.permission) return true;
    return hasPermission(item.permission);
  });

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-black/10 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-black/10 px-6">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-[22px] font-black tracking-tighter text-black font-integral">
              SHOP.CO
            </span>
            <span className="rounded-md bg-black px-1.5 py-0.5 text-[10px] font-bold text-white uppercase">
              Admin
            </span>
          </Link>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden text-black/60 hover:text-black"
            >
              <X className="size-5" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
          {visibleItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname?.startsWith(item.href);

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-[14px] font-medium transition-colors ${
                  isActive
                    ? 'bg-black text-white font-semibold'
                    : 'text-black/70 hover:bg-[#F0EEED] hover:text-black'
                }`}
              >
                <Icon className="size-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer & User Profile */}
        <div className="border-t border-black/10 p-4 space-y-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between rounded-xl bg-[#F0F0F0] px-4 py-2.5 text-[13px] font-medium text-black hover:bg-black/10 transition-colors"
          >
            <span>View Storefront</span>
            <ExternalLink className="size-4 text-black/60" />
          </Link>

          <div className="flex items-center justify-between pt-1">
            <div className="flex flex-col min-w-0 pr-2">
              <span className="text-[14px] font-bold text-black truncate">
                {user?.name || 'Staff Member'}
              </span>
              <span className="text-[11px] text-black/60 truncate">
                {user?.is_super_admin ? 'Super Admin' : user?.email}
              </span>
            </div>

            <button
              onClick={logout}
              className="p-2 text-black/60 hover:text-[#FF3333] hover:bg-[#FF3333]/10 rounded-lg transition-colors"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
