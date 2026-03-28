const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// ── Token helpers ─────────────────────────────────────────
export const setTokens = ({ accessToken, refreshToken }: { 
  accessToken: string; 
  refreshToken: string; 
}) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

export const getAccessToken  = () => localStorage.getItem('accessToken');
export const getRefreshToken = () => localStorage.getItem('refreshToken');

export const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

// ── Auto refresh when access token expires ────────────────
const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) { clearTokens(); return null; }

    const data = await res.json();
    setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    return data.accessToken;
  } catch {
    clearTokens();
    return null;
  }
};

// ── Main fetch wrapper ────────────────────────────────────
export const apiFetch = async (
  path: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getAccessToken();

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) headers['Authorization'] = `Bearer ${token}`;

  // Don't set Content-Type for FormData (browser sets it with boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  let res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  // Token expired → refresh and retry once
  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
    }
  }

  return res;
};