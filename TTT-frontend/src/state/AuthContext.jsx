import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  refreshAccessToken as coreRefreshAccessToken,
  setAccessToken as coreSetAccessToken,
  getAccessToken,
  initAccessTokenFromStorage,
} from "./auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [accessToken, setAccessTokenState] = useState(null);

  useEffect(() => {
    initAccessTokenFromStorage();
    setAccessTokenState(getAccessToken());
  }, []);

  const setAccessToken = useCallback((token) => {
    coreSetAccessToken(token);
    setAccessTokenState(getAccessToken());
  }, []);

  const refreshAccessToken = useCallback(async () => {
    const newToken = await coreRefreshAccessToken();
    setAccessTokenState(getAccessToken());
    return newToken;
  }, []);

  const value = {
    accessToken,
    setAccessToken,
    refreshAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
