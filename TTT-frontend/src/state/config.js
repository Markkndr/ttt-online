// Central place to build backend API URLs for fetch calls.
// Set VITE_API_URL in .env to override the base (e.g., http://localhost:8080).
// If not set, we default to relative paths so a reverse proxy or same-origin backend can serve /api.

export const API_BASE_URL = (import.meta?.env?.VITE_API_URL || '').trim();

export function api(path) {
  // Ensure path starts with '/'
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalized}`;
}
