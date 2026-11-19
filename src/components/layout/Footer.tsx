'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) return null;

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="relative bg-[#F0F0F0] pt-24 pb-12 mt-32">
      {/* Floating Newsletter Card */}
      <div className="absolute left-1/2 -top-24 -translate-x-1/2 w-[calc(100%-2rem)] max-w-7xl">
        <div className="rounded-[20px] bg-black px-6 py-8 md:px-16 md:py-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <h2 className="text-white text-[28px] md:text-[40px] font-extrabold uppercase leading-tight max-w-[550px] font-integral">
            STAY UPTO DATE ABOUT OUR LATEST OFFERS
          </h2>

          <form onSubmit={handleSubscribe} className="w-full md:w-[360px] flex flex-col gap-3">
            <div className="relative flex items-center">
              <Mail className="absolute left-4 size-5 text-black/40 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full rounded-full bg-white py-3 pl-12 pr-4 text-[14px] text-black outline-none placeholder:text-black/40"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-full bg-white py-3 text-[14px] font-medium text-black transition-colors hover:bg-white/90"
            >
              {subscribed ? 'Subscribed!' : 'Subscribe to Newsletter'}
            </button>
          </form>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 pb-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Link href="/" className="text-[32px] font-black text-black font-integral">
              SHOP.CO
            </Link>
            <p className="text-[14px] text-black/60 leading-relaxed max-w-sm">
              We have clothes that suits your style and which you&apos;re proud to wear. From women to men.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="size-8 rounded-full border border-black/20 bg-white flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <img src="/figma/imgGroup3_0fd7c70c.svg" alt="Twitter" className="size-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="size-8 rounded-full border border-black/20 bg-black flex items-center justify-center hover:opacity-80 transition-opacity"
                aria-label="Facebook"
              >
                <img src="/figma/imgGroup4_a845102c.svg" alt="Facebook" className="size-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="size-8 rounded-full border border-black/20 bg-white flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <img src="/figma/imgGroup5_9a7f9a8c.svg" alt="Instagram" className="size-4" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="size-8 rounded-full border border-black/20 bg-white flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <img src="/figma/imgGroup6_8bdbbb0c.svg" alt="GitHub" className="size-4" />
              </a>
            </div>
          </div>

          {/* Links Column 1: Company */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[16px] font-medium tracking-[3px] text-black uppercase">
              Company
            </h4>
            <div className="flex flex-col gap-3 text-[14px] text-black/60">
              <Link href="/shop" className="hover:text-black transition-colors">About</Link>
              <Link href="/shop" className="hover:text-black transition-colors">Features</Link>
              <Link href="/shop" className="hover:text-black transition-colors">Works</Link>
              <Link href="/shop" className="hover:text-black transition-colors">Career</Link>
            </div>
          </div>

          {/* Links Column 2: Help */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[16px] font-medium tracking-[3px] text-black uppercase">
              Help
            </h4>
            <div className="flex flex-col gap-3 text-[14px] text-black/60">
              <Link href="/shop" className="hover:text-black transition-colors">Customer Support</Link>
              <Link href="/shop" className="hover:text-black transition-colors">Delivery Details</Link>
              <Link href="/shop" className="hover:text-black transition-colors">Terms & Conditions</Link>
              <Link href="/shop" className="hover:text-black transition-colors">Privacy Policy</Link>
            </div>
          </div>

          {/* Links Column 3: FAQ */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[16px] font-medium tracking-[3px] text-black uppercase">
              FAQ
            </h4>
            <div className="flex flex-col gap-3 text-[14px] text-black/60">
              <Link href="/shop" className="hover:text-black transition-colors">Account</Link>
              <Link href="/shop" className="hover:text-black transition-colors">Manage Deliveries</Link>
              <Link href="/shop" className="hover:text-black transition-colors">Orders</Link>
              <Link href="/shop" className="hover:text-black transition-colors">Payments</Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Payment Badges */}
        <div className="border-t border-black/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[14px] text-black/60 text-center md:text-left">
            Shop.co © 2000-2023, All Rights Reserved
          </p>

          <div className="flex items-center gap-3">
            <div className="h-[30px] rounded-md bg-white border border-black/5 px-2 flex items-center justify-center shadow-xs">
              <img src="/figma/imgBadge_99be19f3.svg" alt="Visa" className="h-4 object-contain" />
            </div>
            <div className="h-[30px] rounded-md bg-white border border-black/5 px-2 flex items-center justify-center shadow-xs">
              <img src="/figma/imgBadge1_e11317f2.svg" alt="Mastercard" className="h-4 object-contain" />
            </div>
            <div className="h-[30px] rounded-md bg-white border border-black/5 px-2 flex items-center justify-center shadow-xs">
              <img src="/figma/imgBadge2_4d49e4e0.svg" alt="PayPal" className="h-4 object-contain" />
            </div>
            <div className="h-[30px] rounded-md bg-white border border-black/5 px-2 flex items-center justify-center shadow-xs">
              <img src="/figma/imgBadge3_3932f155.svg" alt="Apple Pay" className="h-4 object-contain" />
            </div>
            <div className="h-[30px] rounded-md bg-white border border-black/5 px-2 flex items-center justify-center shadow-xs">
              <img src="/figma/imgBadge4_b2984d68.svg" alt="Google Pay" className="h-4 object-contain" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
