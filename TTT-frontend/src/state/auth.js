import { api } from "./config";

let accessToken = null;
let refreshPromise = null;

export function initAccessTokenFromStorage() {
  // no-op: we intentionally do NOT persist the access token
  // across reloads; it only lives in memory.
  accessToken = null;
}

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token) {
  accessToken = token || null;
}

export async function refreshAccessToken() {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const resp = await fetch(api("/api/auth/refresh"), {
        method: "POST",
        credentials: "include",
      });

      if (!resp.ok) {
        setAccessToken(null);
        return null;
      }

      const body = await resp.json().catch(() => null);
      const newToken = body?.accessToken || body?.token || null;

      if (!newToken) {
        setAccessToken(null);
        return null;
      }

      setAccessToken(newToken);
      return newToken;
    } catch (err) {
      console.error("Failed to refresh access token", err);
      setAccessToken(null);
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function fetchWithAuth(path, { method = "GET", headers = {}, body, token, ...rest } = {}) {
  const effectiveToken = token || getAccessToken();
  const baseHeaders = headers || {};
  const authHeaders = effectiveToken
    ? { ...baseHeaders, Authorization: `Bearer ${effectiveToken}` }
    : baseHeaders;

  let resp = await fetch(api(path), {
    method,
    headers: authHeaders,
    body,
    credentials: "include",
    ...rest,
  });

  if (resp.status === 401 || resp.status === 403) {
    const newToken = await refreshAccessToken();
    if (!newToken) {
      return resp;
    }

    const retryHeaders = {
      ...baseHeaders,
      Authorization: `Bearer ${newToken}`,
    };

    resp = await fetch(api(path), {
      method,
      headers: retryHeaders,
      body,
      credentials: "include",
      ...rest,
    });
  }

  return resp;
}
