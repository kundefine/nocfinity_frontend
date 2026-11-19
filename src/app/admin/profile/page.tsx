'use client';

import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  KeyRound,
  ShieldCheck,
  Check,
  AlertTriangle,
  Mail,
  Phone,
  Lock,
} from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { fetchApi } from '@/lib/api';

export default function AdminProfilePage() {
  const { user, refreshUser } = useAdminAuth();

  // Profile Form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccess(null);
    setProfileError(null);

    const res = await fetchApi('/admin/auth/profile', {
      method: 'PUT',
      authType: 'admin',
      body: JSON.stringify({ name: name.trim(), phone: phone.trim() || null }),
    });

    if (res.success) {
      setProfileSuccess('Profile details updated successfully.');
      refreshUser();
    } else {
      setProfileError(res.message || 'Failed to update profile.');
    }
    setProfileSaving(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordSuccess(null);
    setPasswordError(null);

    if (newPassword !== passwordConfirmation) {
      setPasswordError('New password and confirmation do not match.');
      setPasswordSaving(false);
      return;
    }

    const res = await fetchApi('/admin/auth/password', {
      method: 'PUT',
      authType: 'admin',
      body: JSON.stringify({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: passwordConfirmation,
      }),
    });

    if (res.success) {
      setPasswordSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setPasswordConfirmation('');
    } else {
      setPasswordError(res.message || 'Failed to change password.');
    }
    setPasswordSaving(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-black" />
          My Profile & Security
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your personal administrative identity, phone contact, and access credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Account Overview Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-black text-white font-bold text-2xl flex items-center justify-center mb-4">
            {user?.name
              ? user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)
              : 'AD'}
          </div>
          <h2 className="text-lg font-bold text-gray-900">{user?.name || 'Administrator'}</h2>
          <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>

          <div className="mt-4 flex flex-wrap gap-1.5 justify-center">
            {user?.is_super_admin && (
              <span className="text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                Super Admin
              </span>
            )}
            {Array.isArray(user?.roles)
              ? user.roles.map((r: any) => (
                  <span
                    key={r.id || r.slug || r.name || r}
                    className="text-xs font-semibold bg-gray-100 text-gray-800 px-2.5 py-0.5 rounded-full"
                  >
                    {r.name || r}
                  </span>
                ))
              : user?.roles && typeof user.roles === 'object'
              ? Object.entries(user.roles).map(([slug, name]: [string, any]) => (
                  <span
                    key={slug}
                    className="text-xs font-semibold bg-gray-100 text-gray-800 px-2.5 py-0.5 rounded-full"
                  >
                    {String(name)}
                  </span>
                ))
              : null}
          </div>

          <div className="w-full border-t border-gray-100 mt-6 pt-4 text-left text-xs text-gray-500 space-y-2">
            <div className="flex justify-between">
              <span>User ID:</span>
              <span className="font-mono text-gray-800">#{user?.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Permissions:</span>
              <span className="font-medium text-gray-800">
                {user?.is_super_admin ? 'Unlimited (*)' : `${user?.permissions?.length || 0} granted`}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Edit Profile Form */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-black" />
              Personal Information
            </h3>

            {profileSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}
            {profileError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-gray-100 text-gray-500 border border-gray-200 rounded-xl cursor-not-allowed"
                  />
                </div>
                <span className="text-[11px] text-gray-400 mt-1 block">
                  Staff email addresses must be modified by a Super Administrator.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="+1 (555) 019-2834"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="px-5 py-2 text-sm font-semibold text-white bg-black hover:bg-gray-800 rounded-xl transition disabled:opacity-50"
                >
                  {profileSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-black" />
              Change Password
            </h3>

            {passwordSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}
            {passwordError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Current Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    New Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Min 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Repeat password"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="px-5 py-2 text-sm font-semibold text-white bg-black hover:bg-gray-800 rounded-xl transition disabled:opacity-50"
                >
                  {passwordSaving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
