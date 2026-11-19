'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { fetchApi } from '@/lib/api';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string;
  roles?: any;
  is_super_admin: boolean;
  permissions: string[];
}

interface AdminAuthContextType {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('shopco_admin_token');
      const savedUser = localStorage.getItem('shopco_admin_user');
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch {}
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetchApi<{ user: AdminUser; token: string }>('/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res.success && res.data) {
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('shopco_admin_token', res.data.token);
      localStorage.setItem('shopco_admin_user', JSON.stringify(res.data.user));
      return { success: true };
    }

    return { success: false, message: res.message || 'Login failed.' };
  };

  const logout = () => {
    fetchApi('/admin/auth/logout', { method: 'POST', authType: 'admin' }).catch(() => {});
    setUser(null);
    setToken(null);
    localStorage.removeItem('shopco_admin_token');
    localStorage.removeItem('shopco_admin_user');
    router.push('/admin/login');
  };

  const refreshUser = async () => {
    try {
      const res = await fetchApi<AdminUser>('/admin/auth/me', { authType: 'admin' });
      if (res.success && res.data) {
        setUser(res.data);
        localStorage.setItem('shopco_admin_user', JSON.stringify(res.data));
      }
    } catch {}
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.is_super_admin) return true;
    return user.permissions?.includes(permission) ?? false;
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        refreshUser,
        hasPermission,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
