'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Lock, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { fetchApi } from '@/lib/api';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get('token') || '';
  const initialEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== passwordConfirmation) {
      setError('Passwords do not match.');
      return;
    }

    if (!token) {
      setError('Password reset token is missing from URL.');
      return;
    }

    setLoading(true);

    const res = await fetchApi('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        token,
        email: email.trim(),
        password,
        password_confirmation: passwordConfirmation,
      }),
    });

    if (res.success) {
      setSuccess(true);
    } else {
      setError(res.message || 'Failed to reset password. The token may be expired or invalid.');
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl max-w-md w-full">
      <div className="text-center mb-6">
        <Link href="/" className="inline-block text-[28px] font-black font-integral tracking-tighter mb-1">
          SHOP.CO
        </Link>
        <h1 className="text-xl font-bold text-gray-900 mt-2">Reset Account Password</h1>
        <p className="text-xs text-gray-500 mt-1">
          Enter your new password below to regain access to your account.
        </p>
      </div>

      {success ? (
        <div className="text-center py-4 space-y-4">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Password Changed!</h2>
          <p className="text-xs text-gray-600">
            Your password has been securely reset. You can now log into your account with your new credentials.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full py-3 bg-black text-white text-xs font-bold rounded-2xl hover:bg-gray-800 transition"
          >
            <span>Return to Store</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Account Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                required
                placeholder="Min 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                required
                placeholder="Repeat password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-black hover:bg-gray-800 text-white font-bold text-sm rounded-2xl transition disabled:opacity-50 mt-2"
          >
            {loading ? 'Resetting Password...' : 'Update Password'}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 bg-gray-50/50">
      <Suspense fallback={<div className="p-8 text-center text-sm font-semibold">Loading reset form...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
