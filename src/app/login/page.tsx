'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Sparkles, AlertTriangle, ArrowRight } from 'lucide-react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const { login } = useCustomerAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await login(email.trim(), password);

    if (res.success) {
      router.push(redirectUrl);
    } else {
      setError(res.message || 'Invalid email or password.');
    }
    setLoading(false);
  };

  const handleQuickDemoLogin = async () => {
    setLoading(true);
    setError(null);
    const res = await login('customer@shop.co', 'password123');
    if (res.success) {
      router.push(redirectUrl);
    } else {
      setError(res.message || 'Demo login failed.');
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl max-w-md w-full p-8">
      {/* Brand & Heading */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-block text-[32px] font-black font-integral tracking-tighter text-black">
          SHOP.CO
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Welcome Back</h1>
        <p className="text-xs text-gray-500 mt-1">
          Sign in to access your order history, saved addresses, and faster checkout.
        </p>
      </div>

      {/* 1-Click Demo Login */}
      <div className="mb-6">
        <button
          type="button"
          onClick={handleQuickDemoLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold transition disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>1-Click Demo Login (customer@shop.co)</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full pl-10 pr-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-black transition"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-gray-700">Password</label>
            <Link
              href="/forgot-password"
              className="text-xs text-gray-500 hover:text-black font-medium transition"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-black transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-black hover:bg-gray-800 text-white font-bold text-sm rounded-2xl transition disabled:opacity-50 mt-2 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
        >
          <span>{loading ? 'Signing in...' : 'Sign In'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Switch to Register */}
      <div className="mt-8 pt-6 border-t border-gray-100 text-center text-xs text-gray-600">
        Don&apos;t have an account?{' '}
        <Link href={`/register${redirectUrl !== '/' ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`} className="font-bold text-black hover:underline">
          Create an account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-[#FAFAFA]">
      <Suspense fallback={<div className="p-8 text-center text-sm font-semibold">Loading login form...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
