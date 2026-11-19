'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { Mail, CheckCircle2, AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react';
import { fetchApi } from '@/lib/api';

function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const res = await fetchApi('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim() }),
    });

    if (res.success) {
      setSuccessMessage(
        'If an account exists for this email, password reset instructions have been sent. If running locally with Docker, check Mailpit at http://localhost:8025.'
      );
    } else {
      setError(res.message || 'Unable to request password reset. Please try again.');
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
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Reset Password</h1>
        <p className="text-xs text-gray-500 mt-1">
          Enter your registered email address and we&apos;ll send you instructions to reset your password.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage ? (
        <div className="text-center py-4 space-y-4">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Email Dispatched</h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            {successMessage}
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 w-full py-3 bg-black text-white text-xs font-bold rounded-2xl hover:bg-gray-800 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      ) : (
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-black hover:bg-gray-800 text-white font-bold text-sm rounded-2xl transition disabled:opacity-50 mt-2 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            <span>{loading ? 'Sending link...' : 'Send Password Reset Link'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="pt-4 text-center">
            <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-black font-semibold transition">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Sign In</span>
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 bg-[#FAFAFA]">
      <Suspense fallback={<div className="p-8 text-center text-sm font-semibold">Loading form...</div>}>
        <ForgotPasswordForm />
      </Suspense>
    </div>
  );
}
