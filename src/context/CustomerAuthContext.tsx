'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';

export interface UserAddress {
  id?: string;
  title: string;
  recipient_name?: string;
  recipient_phone?: string;
  address: string;
  city: string;
  postal_code?: string;
  country?: string;
  is_default?: boolean;
}

export interface CustomerUser {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  addresses?: UserAddress[];
}

interface CustomerAuthContextType {
  user: CustomerUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  saveAddress: (address: UserAddress) => Promise<boolean>;
  deleteAddress: (id: string) => Promise<boolean>;
  updateProfile: (data: { name: string; phone?: string | null }) => Promise<{ success: boolean; message?: string }>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('shopco_customer_token');
      const savedUser = localStorage.getItem('shopco_customer_user');
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch {}
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetchApi<{ user: CustomerUser; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res.success && res.data) {
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('shopco_customer_token', res.data.token);
      localStorage.setItem('shopco_customer_user', JSON.stringify(res.data.user));

      // Merge guest cart into customer account if guest cart token exists
      const guestToken = localStorage.getItem('shopco_guest_token');
      if (guestToken) {
        fetchApi('/cart/merge', {
          method: 'POST',
          body: JSON.stringify({ guest_token: guestToken }),
          authType: 'customer',
        }).catch(() => {});
      }

      return { success: true };
    }

    return { success: false, message: res.message || 'Login failed.' };
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone?: string;
  }) => {
    const res = await fetchApi<{ user: CustomerUser; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (res.success && res.data) {
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('shopco_customer_token', res.data.token);
      localStorage.setItem('shopco_customer_user', JSON.stringify(res.data.user));

      // Merge guest cart into customer account if guest cart token exists
      const guestToken = localStorage.getItem('shopco_guest_token');
      if (guestToken) {
        fetchApi('/cart/merge', {
          method: 'POST',
          body: JSON.stringify({ guest_token: guestToken }),
          authType: 'customer',
        }).catch(() => {});
      }

      return { success: true };
    }

    return { success: false, message: res.message || 'Registration failed.' };
  };

  const logout = () => {
    fetchApi('/auth/logout', { method: 'POST' }).catch(() => {});
    setUser(null);
    setToken(null);
    localStorage.removeItem('shopco_customer_token');
    localStorage.removeItem('shopco_customer_user');
  };

  const refreshProfile = async () => {
    try {
      const res = await fetchApi<CustomerUser>('/auth/me');
      if (res.success && res.data) {
        setUser(res.data);
        localStorage.setItem('shopco_customer_user', JSON.stringify(res.data));
      }
    } catch {}
  };

  const saveAddress = async (newAddress: UserAddress) => {
    if (!user) return false;
    const existing = user.addresses || [];
    const addressId = newAddress.id || `addr_${Date.now()}`;
    const payloadAddress = { ...newAddress, id: addressId };

    let list = existing;
    if (payloadAddress.is_default) {
      list = list.map((a) => ({ ...a, is_default: false }));
    }

    const idx = list.findIndex(
      (a) => (a.id && a.id === payloadAddress.id) ||
             (a.title && payloadAddress.title && a.title.toLowerCase() === payloadAddress.title.toLowerCase())
    );

    let updated: UserAddress[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = { ...updated[idx], ...payloadAddress };
    } else {
      updated = [...list, payloadAddress];
    }

    const res = await fetchApi<UserAddress[]>('/auth/addresses', {
      method: 'PUT',
      authType: 'customer',
      body: JSON.stringify({ addresses: updated }),
    });

    if (res.success && res.data) {
      const updatedUser = { ...user, addresses: res.data };
      setUser(updatedUser);
      localStorage.setItem('shopco_customer_user', JSON.stringify(updatedUser));
      return true;
    }
    return false;
  };

  const deleteAddress = async (id: string) => {
    if (!user) return false;
    const existing = user.addresses || [];
    const updated = existing.filter((a) => a.id !== id);

    const res = await fetchApi<UserAddress[]>('/auth/addresses', {
      method: 'PUT',
      authType: 'customer',
      body: JSON.stringify({ addresses: updated }),
    });

    if (res.success && res.data) {
      const updatedUser = { ...user, addresses: res.data };
      setUser(updatedUser);
      localStorage.setItem('shopco_customer_user', JSON.stringify(updatedUser));
      return true;
    }
    return false;
  };

  const updateProfile = async (data: { name: string; phone?: string | null }) => {
    const res = await fetchApi<CustomerUser>('/auth/profile', {
      method: 'PUT',
      authType: 'customer',
      body: JSON.stringify(data),
    });

    if (res.success && res.data) {
      const updatedUser = { ...user, ...res.data };
      setUser(updatedUser);
      localStorage.setItem('shopco_customer_user', JSON.stringify(updatedUser));
      return { success: true };
    }

    return { success: false, message: res.message || 'Failed to update profile.' };
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
        saveAddress,
        deleteAddress,
        updateProfile,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
}
