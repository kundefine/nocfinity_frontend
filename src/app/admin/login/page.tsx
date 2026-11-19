'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, ArrowRight, Lock, Mail } from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAdminAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      router.push('/admin');
    } else {
      setError(res.message || 'Invalid credentials.');
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F4F5] p-4">
      <div className="w-full max-w-md rounded-[24px] border border-black/10 bg-white p-8 shadow-xl">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-black text-white">
            <Shield className="size-6" />
          </div>
          <h1 className="text-[28px] font-black text-black font-integral">
            SHOP.CO
          </h1>
          <p className="text-[14px] text-black/60 mt-1">
            Staff &amp; Administrator Portal
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-[#FF3333]/10 p-3.5 text-[14px] font-medium text-[#FF3333]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-bold text-black mb-1">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 size-4 text-black/40 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@shop.co"
                className="w-full rounded-xl border border-black/10 bg-[#F9F9F9] py-3 pl-10 pr-4 text-[14px] text-black outline-none focus:border-black focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[13px] font-bold text-black">
                Password
              </label>
              <Link
                href="/reset-password"
                className="text-[11px] text-black/60 hover:text-black font-medium"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 size-4 text-black/40 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-black/10 bg-[#F9F9F9] py-3 pl-10 pr-4 text-[14px] text-black outline-none focus:border-black focus:bg-white transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 rounded-xl bg-black py-3.5 text-[15px] font-medium text-white hover:bg-black/85 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-md"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
            <ArrowRight className="size-4" />
          </button>
        </form>

        {/* Quick Demo Accounts Helper */}
        <div className="mt-8 border-t border-black/10 pt-6">
          <p className="text-[12px] font-bold uppercase tracking-wider text-black/40 mb-3 text-center">
            One-Click Demo Credentials
          </p>
          <div className="grid grid-cols-2 gap-2 text-[12px]">
            <button
              type="button"
              onClick={() => handleQuickLogin('superadmin@shop.co')}
              className="rounded-lg border border-black/10 p-2 text-left hover:bg-black/5"
            >
              <div className="font-bold text-black">Super Admin</div>
              <div className="text-[11px] text-black/50">Full access</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@shop.co')}
              className="rounded-lg border border-black/10 p-2 text-left hover:bg-black/5"
            >
              <div className="font-bold text-black">Admin</div>
              <div className="text-[11px] text-black/50">Store admin</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('products@shop.co')}
              className="rounded-lg border border-black/10 p-2 text-left hover:bg-black/5"
            >
              <div className="font-bold text-black">Product Mgr</div>
              <div className="text-[11px] text-black/50">Catalog only</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('orders@shop.co')}
              className="rounded-lg border border-black/10 p-2 text-left hover:bg-black/5"
            >
              <div className="font-bold text-black">Order Mgr</div>
              <div className="text-[11px] text-black/50">Orders &amp; coupons</div>
            </button>
          </div>
          <div className="text-center mt-3 text-[11px] text-black/40">
            Password: <code className="font-mono text-black">password123</code>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-[13px] text-black/60 hover:text-black">
            &larr; Return to Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
