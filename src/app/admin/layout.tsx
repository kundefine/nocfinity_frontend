'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AdminAuthProvider, useAdminAuth } from '@/context/AdminAuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAdminAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isLoginPage) {
      router.push('/admin/login');
    }
  }, [isLoading, isAuthenticated, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F9F9F9]">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 animate-spin rounded-full border-4 border-black/20 border-t-black" />
          <p className="text-[14px] font-medium text-black/60">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Derive dynamic page title
  let title = 'Dashboard';
  if (pathname?.includes('/admin/products')) title = 'Products Management';
  else if (pathname?.includes('/admin/categories')) title = 'Categories';
  else if (pathname?.includes('/admin/orders')) title = 'Orders & Fulfillment';
  else if (pathname?.includes('/admin/coupons')) title = 'Coupons & Discounts';
  else if (pathname?.includes('/admin/customers')) title = 'Customer Base';
  else if (pathname?.includes('/admin/roles')) title = 'Roles & Permissions Matrix';
  else if (pathname?.includes('/admin/profile')) title = 'Staff Profile';

  return (
    <div className="flex min-h-screen bg-[#F9F9F9] text-black">
      <AdminSidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex flex-1 flex-col min-w-0">
        <AdminHeader
          title={title}
          onOpenMobile={() => setMobileOpen(true)}
        />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminAuthProvider>
  );
}
