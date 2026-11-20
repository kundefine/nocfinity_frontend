export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';
export const API_BASE_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

export function getImageUrl(path?: string | null): string {
  if (!path || typeof path !== 'string' || path.trim() === '') {
    return '/figma/imgImage7_96f1301c.png';
  }

  const trimmed = path.trim();

  // Full URLs (http, https) or data URIs or blob URIs
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  // Uploaded images on the backend
  if (trimmed.startsWith('/uploads/') || trimmed.startsWith('uploads/')) {
    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return `${API_BASE_ORIGIN}${cleanPath}`;
  }

  // Frontend static assets (e.g. /figma/...)
  return trimmed;
}

export interface FetchApiOptions extends RequestInit {
  authType?: 'customer' | 'admin';
}

export async function fetchApi<T = any>(
  endpoint: string,
  options: FetchApiOptions = {}
): Promise<{ success: boolean; data?: T; message?: string; errors?: any; meta?: any }> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = new Headers(options.headers || {});
  headers.set('Accept', 'application/json');

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Auto attach token if available
  if (typeof window !== 'undefined' && !headers.has('Authorization')) {
    const adminToken = localStorage.getItem('shopco_admin_token');
    const customerToken = localStorage.getItem('shopco_customer_token');
    
    // Normalize path to detect if target is admin or customer
    const pathWithoutPrefix = endpoint.replace(/^\/?api\/v1\//, '/');
    const isAdmin = options.authType === 'admin' ||
      (options.authType !== 'customer' && (pathWithoutPrefix.startsWith('/admin') || endpoint.includes('/admin/')));

    const token = isAdmin ? adminToken : customerToken;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const json = await res.json();
    if (typeof json.success === 'undefined') {
      json.success = res.ok;
    }
    return json;
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Network error occurred connecting to backend.',
    };
  }
}
