// src/services/api.ts

// URL akan otomatis mengambil dari Environment Vercel jika ada
const API_URL = import.meta.env.VITE_API_URL || "/api";
function getToken() {
  return localStorage.getItem("access_token");
}

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_data");
      // Handle logout globally (maybe reload or dispatch event)
      window.dispatchEvent(new Event("auth-unauthorized"));
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "API Error");
  }

  return response.json();
}
