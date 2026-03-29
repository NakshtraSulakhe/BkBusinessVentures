/**
 * API Utility for authenticated requests
 */

export interface ApiOptions extends RequestInit {
  token?: string | null;
}

/**
 * Fetch with automatic Authorization header
 */
export async function fetchWithAuth(url: string, options: ApiOptions = {}) {
  const token = options.token || (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null);
  
  const headers = new Headers(options.headers || {});
  
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // Set default Content-Type if body is present and not already set
  if (options.body && !headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // If unauthorized, redirect to login
  if (response.status === 401 && typeof window !== 'undefined') {
    console.warn('Unauthorized API call - redirecting to login');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    window.location.href = '/login';
  }

  return response;
}

/**
 * Helper for GET requests
 */
export async function get(url: string, token?: string | null) {
  return fetchWithAuth(url, { method: 'GET', token });
}

/**
 * Helper for POST requests
 */
export async function post(url: string, data: any, token?: string | null) {
  return fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  });
}

/**
 * Helper for PUT requests
 */
export async function put(url: string, data: any, token?: string | null) {
  return fetchWithAuth(url, {
    method: 'PUT',
    body: JSON.stringify(data),
    token,
  });
}

/**
 * Helper for PATCH requests
 */
export async function patch(url: string, data: any, token?: string | null) {
  return fetchWithAuth(url, {
    method: 'PATCH',
    body: JSON.stringify(data),
    token,
  });
}

/**
 * Helper for DELETE requests
 */
export async function del(url: string, token?: string | null) {
  return fetchWithAuth(url, { method: 'DELETE', token });
}
