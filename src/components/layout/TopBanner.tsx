'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';

export default function TopBanner() {
  const [visible, setVisible] = useState(true);
  const pathname = usePathname();

  if (!visible || pathname?.startsWith('/admin')) return null;

  return (
    <div className="relative bg-black px-4 py-2.5 text-center text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-center text-[12px] md:text-[14px]">
        <span>
          Sign up and get 20% off to your first order.{' '}
          <Link href="/shop" className="font-medium underline hover:text-white/80">
            Sign Up Now
          </Link>
        </span>
      </div>
      <button
        onClick={() => setVisible(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-opacity"
        aria-label="Close banner"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
