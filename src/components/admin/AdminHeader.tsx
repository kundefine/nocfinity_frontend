'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, Bell, ExternalLink } from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';

interface AdminHeaderProps {
  onOpenMobile: () => void;
  title: string;
}

export default function AdminHeader({ onOpenMobile, title }: AdminHeaderProps) {
  const { user } = useAdminAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-black/10 bg-white/95 px-4 md:px-8 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobile}
          className="lg:hidden text-black p-1 hover:bg-black/5 rounded-md"
          aria-label="Open sidebar"
        >
          <Menu className="size-6" />
        </button>
        <h1 className="text-[20px] md:text-[24px] font-bold text-black font-integral">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/"
          target="_blank"
          className="hidden sm:flex items-center gap-1.5 rounded-full border border-black/10 px-4 py-1.5 text-[13px] font-medium text-black hover:bg-black/5"
        >
          <span>Store</span>
          <ExternalLink className="size-3.5" />
        </Link>

        <div className="flex items-center gap-3 border-l border-black/10 pl-4">
          <div className="flex size-9 items-center justify-center rounded-full bg-black text-[13px] font-bold text-white uppercase">
            {user?.name ? user.name.slice(0, 2) : 'AD'}
          </div>
          <div className="hidden md:flex flex-col">
            <span className="text-[13px] font-bold text-black leading-tight">
              {user?.name}
            </span>
            <span className="text-[11px] text-black/50">
              {user?.is_super_admin ? 'Super Admin' : 'Staff'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
