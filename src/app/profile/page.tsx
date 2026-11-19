'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  User,
  MapPin,
  Home,
  Building2,
  Plus,
  Edit2,
  Trash2,
  Check,
  ChevronRight,
  ShoppingBag,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  X,
  Phone,
  Mail,
  Lock,
} from 'lucide-react';
import { useCustomerAuth, UserAddress } from '@/context/CustomerAuthContext';
import { fetchApi } from '@/lib/api';

export default function CustomerProfilePage() {
  const { user, isAuthenticated, isLoading, refreshProfile, saveAddress, deleteAddress, updateProfile } = useCustomerAuth();

  const [activeTab, setActiveTab] = useState<'addresses' | 'personal' | 'security'>('addresses');

  // Address Modal State
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [modalTitle, setModalTitle] = useState('Home');
  const [modalRecipientName, setModalRecipientName] = useState('');
  const [modalRecipientPhone, setModalRecipientPhone] = useState('');
  const [modalAddress, setModalAddress] = useState('');
  const [modalCity, setModalCity] = useState('');
  const [modalPostalCode, setModalPostalCode] = useState('');
  const [modalIsDefault, setModalIsDefault] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const addresses = user?.addresses || [];

  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setModalTitle('Home');
    setModalRecipientName(user?.name || '');
    setModalRecipientPhone(user?.phone || '');
    setModalAddress('');
    setModalCity('');
    setModalPostalCode('');
    setModalIsDefault(addresses.length === 0);
    setAddressError(null);
    setAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr: UserAddress) => {
    setEditingAddressId(addr.id || null);
    setModalTitle(addr.title || 'Home');
    setModalRecipientName(addr.recipient_name || user?.name || '');
    setModalRecipientPhone(addr.recipient_phone || user?.phone || '');
    setModalAddress(addr.address || '');
    setModalCity(addr.city || '');
    setModalPostalCode(addr.postal_code || '');
    setModalIsDefault(!!addr.is_default);
    setAddressError(null);
    setAddressModalOpen(true);
  };

  const handleSaveAddressModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalAddress.trim() || !modalCity.trim()) {
      setAddressError('Street address and city are required.');
      return;
    }

    setSavingAddress(true);
    setAddressError(null);

    const payload: UserAddress = {
      id: editingAddressId || undefined,
      title: modalTitle.trim() || 'Home',
      recipient_name: modalRecipientName.trim() || undefined,
      recipient_phone: modalRecipientPhone.trim() || undefined,
      address: modalAddress.trim(),
      city: modalCity.trim(),
      postal_code: modalPostalCode.trim() || undefined,
      country: 'United States',
      is_default: modalIsDefault,
    };

    const success = await saveAddress(payload);
    setSavingAddress(false);

    if (success) {
      setAddressModalOpen(false);
    } else {
      setAddressError('Failed to save address. Please try again.');
    }
  };

  const handleDeleteAddress = async (id?: string) => {
    if (!id) return;
    if (confirm('Are you sure you want to delete this address?')) {
      await deleteAddress(id);
    }
  };

  const handleSetDefaultAddress = async (addr: UserAddress) => {
    await saveAddress({ ...addr, is_default: true });
  };

  const handleUpdateProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess(null);
    setProfileError(null);

    const res = await updateProfile({
      name: name.trim(),
      phone: phone.trim() || null,
    });

    if (res.success) {
      setProfileSuccess('Profile details saved successfully.');
    } else {
      setProfileError(res.message || 'Failed to update profile.');
    }
    setSavingProfile(false);
  };

  const handleUpdatePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPassword(true);
    setPasswordSuccess(null);
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      setSavingPassword(false);
      return;
    }

    const res = await fetchApi('/auth/password', {
      method: 'PUT',
      authType: 'customer',
      body: JSON.stringify({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      }),
    });

    if (res.success) {
      setPasswordSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordError(res.message || 'Failed to update password.');
    }
    setSavingPassword(false);
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-20 text-center">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Loading your profile...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4 text-black">
          <User className="size-8" />
        </div>
        <h1 className="text-2xl font-black uppercase text-black font-integral">Sign In Required</h1>
        <p className="text-sm text-gray-600 mt-2 mb-6">
          Please log in to your customer account to manage your profile and saved shipping addresses.
        </p>
        <Link
          href="/login?redirect=/profile"
          className="inline-block px-8 py-3.5 bg-black text-white text-xs font-bold rounded-2xl hover:bg-gray-800 transition"
        >
          Sign In to Account
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8 py-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-[14px] text-black/60 mb-6">
        <Link href="/" className="hover:text-black">Home</Link>
        <ChevronRight className="size-4" />
        <span className="font-semibold text-black">My Profile &amp; Addresses</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] sm:text-[36px] font-black uppercase text-black font-integral">
            MY ACCOUNT &amp; ADDRESSES
          </h1>
          <p className="text-sm text-black/60 mt-1">
            Manage your personal profile, delivery address book, and security settings.
          </p>
        </div>

        <Link
          href="/orders"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-2xl transition self-start sm:self-auto"
        >
          <ShoppingBag className="size-4" />
          <span>View Order History</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8 gap-2 sm:gap-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('addresses')}
          className={`pb-3.5 px-2 text-sm font-bold transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'addresses'
              ? 'border-black text-black'
              : 'border-transparent text-gray-400 hover:text-black'
          }`}
        >
          <MapPin className="size-4" />
          <span>Saved Addresses ({addresses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('personal')}
          className={`pb-3.5 px-2 text-sm font-bold transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'personal'
              ? 'border-black text-black'
              : 'border-transparent text-gray-400 hover:text-black'
          }`}
        >
          <User className="size-4" />
          <span>Personal Details</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3.5 px-2 text-sm font-bold transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'security'
              ? 'border-black text-black'
              : 'border-transparent text-gray-400 hover:text-black'
          }`}
        >
          <ShieldCheck className="size-4" />
          <span>Password &amp; Security</span>
        </button>
      </div>

      {/* TAB 1: SAVED ADDRESSES */}
      {activeTab === 'addresses' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Delivery Address Book</h2>
              <p className="text-xs text-gray-500">
                Save your home, office, and frequent delivery destinations for 1-click checkout.
              </p>
            </div>
            <button
              onClick={handleOpenAddAddress}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition shadow-xs"
            >
              <Plus className="size-4" />
              <span>Add New Address</span>
            </button>
          </div>

          {addresses.length === 0 ? (
            <div className="p-12 text-center bg-gray-50 rounded-3xl border border-gray-100 flex flex-col items-center gap-3">
              <div className="size-14 rounded-full bg-black/5 flex items-center justify-center text-black">
                <MapPin className="size-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900">No Saved Addresses Yet</h3>
              <p className="text-xs text-gray-500 max-w-sm">
                You haven&apos;t added any shipping addresses to your address book yet. Add one now to enjoy fast auto-filled checkout!
              </p>
              <button
                onClick={handleOpenAddAddress}
                className="mt-2 px-5 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition"
              >
                Add Your First Address
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {addresses.map((addr, idx) => {
                const isHome = (addr.title || '').toLowerCase().includes('home');
                const isOffice = (addr.title || '').toLowerCase().includes('office');
                const IconComponent = isHome ? Home : isOffice ? Building2 : MapPin;

                return (
                  <div
                    key={addr.id || idx}
                    className={`p-5 rounded-2xl border transition relative flex flex-col justify-between ${
                      addr.is_default
                        ? 'border-black bg-white shadow-xs'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div>
                      {/* Top badge row */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-gray-100 text-black">
                            <IconComponent className="size-4" />
                          </div>
                          <span className="font-bold text-sm text-gray-900">{addr.title || 'Address'}</span>
                        </div>

                        {addr.is_default && (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold uppercase tracking-wide">
                            Default
                          </span>
                        )}
                      </div>

                      {/* Recipient Details */}
                      {addr.recipient_name && (
                        <p className="text-xs font-semibold text-gray-900 mb-0.5">{addr.recipient_name}</p>
                      )}
                      {addr.recipient_phone && (
                        <p className="text-xs text-gray-500 mb-2">{addr.recipient_phone}</p>
                      )}

                      {/* Address Lines */}
                      <p className="text-sm text-gray-800 font-medium leading-relaxed">{addr.address}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {addr.city}{addr.postal_code ? `, ${addr.postal_code}` : ''}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{addr.country || 'United States'}</p>
                    </div>

                    {/* Actions row */}
                    <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEditAddress(addr)}
                          className="px-2.5 py-1 text-gray-700 hover:text-black hover:bg-gray-100 rounded-lg transition font-medium flex items-center gap-1"
                        >
                          <Edit2 className="size-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 rounded-lg transition font-medium flex items-center gap-1"
                        >
                          <Trash2 className="size-3" />
                          <span>Delete</span>
                        </button>
                      </div>

                      {!addr.is_default && (
                        <button
                          type="button"
                          onClick={() => handleSetDefaultAddress(addr)}
                          className="text-[11px] font-semibold text-gray-500 hover:text-black transition"
                        >
                          Set Default
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PERSONAL DETAILS */}
      {activeTab === 'personal' && (
        <div className="max-w-xl bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Personal Details</h2>
          <p className="text-xs text-gray-500 mb-6">
            Update your display name and contact phone number.
          </p>

          {profileSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertTriangle className="size-4 shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email Address (Read-only)</label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-3.5 py-2.5 text-sm bg-gray-100 text-gray-500 border border-gray-200 rounded-xl cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 019-2834"
                className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="mt-2 px-6 py-3 bg-black hover:bg-gray-800 text-white font-bold text-xs rounded-xl transition disabled:opacity-50"
            >
              {savingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: PASSWORD & SECURITY */}
      {activeTab === 'security' && (
        <div className="max-w-xl bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Change Password</h2>
          <p className="text-xs text-gray-500 mb-6">
            Ensure your account uses a strong, unique password to stay secure.
          </p>

          {passwordSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertTriangle className="size-4 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">New Password (Min 8 characters)</label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Confirm New Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
              />
            </div>

            <button
              type="submit"
              disabled={savingPassword}
              className="mt-2 px-6 py-3 bg-black hover:bg-gray-800 text-white font-bold text-xs rounded-xl transition disabled:opacity-50"
            >
              {savingPassword ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}

      {/* ADDRESS MODAL (ADD / EDIT) */}
      {addressModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setAddressModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-black p-1.5 rounded-full hover:bg-gray-100 transition"
            >
              <X className="size-5" />
            </button>

            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {editingAddressId ? 'Edit Delivery Address' : 'Add New Shipping Address'}
            </h3>
            <p className="text-xs text-gray-500 mb-5">
              Enter the delivery details below to save into your address book.
            </p>

            {addressError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle className="size-4 shrink-0" />
                <span>{addressError}</span>
              </div>
            )}

            <form onSubmit={handleSaveAddressModal} className="space-y-3.5">
              {/* Preset Label Pills */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Address Label</label>
                <div className="flex items-center gap-2 mb-2">
                  {['Home', 'Office', 'Studio', 'Other'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setModalTitle(preset)}
                      className={`px-3 py-1 text-xs rounded-lg font-medium border transition ${
                        modalTitle === preset
                          ? 'bg-black text-white border-black'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  required
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  placeholder="e.g. Home, Office, Mom's House"
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                />
              </div>

              {/* Recipient */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Recipient Name</label>
                  <input
                    type="text"
                    value={modalRecipientName}
                    onChange={(e) => setModalRecipientName(e.target.value)}
                    placeholder="Recipient's Name"
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={modalRecipientPhone}
                    onChange={(e) => setModalRecipientPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* Street Address */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Street Address *</label>
                <input
                  type="text"
                  required
                  value={modalAddress}
                  onChange={(e) => setModalAddress(e.target.value)}
                  placeholder="123 Fifth Avenue, Apt 4B"
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                />
              </div>

              {/* City & Postal Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={modalCity}
                    onChange={(e) => setModalCity(e.target.value)}
                    placeholder="New York"
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={modalPostalCode}
                    onChange={(e) => setModalPostalCode(e.target.value)}
                    placeholder="10001"
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* Default Toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-gray-700 font-medium">
                  <input
                    type="checkbox"
                    checked={modalIsDefault}
                    onChange={(e) => setModalIsDefault(e.target.checked)}
                    className="rounded border-gray-300 text-black focus:ring-black"
                  />
                  <span>Set as default shipping address</span>
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAddressModalOpen(false)}
                  className="px-4 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAddress}
                  className="px-6 py-2.5 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition disabled:opacity-50"
                >
                  {savingAddress ? 'Saving Address...' : editingAddressId ? 'Update Address' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
