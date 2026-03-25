import { createContext, useCallback, useContext, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAuth } from "./AuthContext";

const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }) {
  const clientRef = useRef(null);
  const subsRef = useRef(new Map());
  const { accessToken } = useAuth();

    const client = new Client({
        webSocketFactory: () => new SockJS(import.meta.env.VITE_WS_URL),
        reconnectDelay: 5000,
        connectHeaders: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : {},
        onConnect: () => {
            console.log("Connected to websocket");
            for (const [dest, { callback }] of subsRef.current.entries()) {
                const sub = client.subscribe(dest, callback);
                subsRef.current.set(dest, { callback, sub });
            }
        },
        onStompError: (frame) => {
            console.error("STOMP error", frame);
        },
    });

  const connect = useCallback(() => {
    if (clientRef.current) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(import.meta.env.VITE_WS_URL),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("Connected to websocket");

        const token = accessToken;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        for (const [dest, { callback }] of subsRef.current.entries()) {
          const sub = client.subscribe(dest, callback, headers);
          subsRef.current.set(dest, { callback, sub });
        }
      },
      onStompError: (frame) => {
        console.error("STOMP error", frame);
      },
    });

    client.activate();
    clientRef.current = client;
  }, [accessToken]);

  const subscribe = useCallback(
      (destination, callback) => {
        if (!clientRef.current) return null;

        const existing = subsRef.current.get(destination);
        if (existing) return existing.sub;

        const entry = { callback, sub: null };
        subsRef.current.set(destination, entry);

        if (!clientRef.current.connected) {
          return null;
        }

        const token = accessToken;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const sub = clientRef.current.subscribe(destination, callback, headers);
        subsRef.current.set(destination, { callback, sub });
        return sub;
      },
      [accessToken]
  );

  const disconnect = useCallback(() => {
    if (!clientRef.current) return;

    for (const { sub } of subsRef.current.values()) {
      if (sub) sub.unsubscribe();
    }
    subsRef.current.clear();

    clientRef.current.deactivate();
    clientRef.current = null;
  }, []);

  const send = useCallback(
      (destination, body) => {
        if (!clientRef.current || !clientRef.current.connected) return;

        const token = accessToken;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        clientRef.current.publish({
          destination,
          body: JSON.stringify(body),
          headers,
        });
      },
      [accessToken]
  );

  return (
      <WebSocketContext.Provider value={{ connect, disconnect, subscribe, send }}>
        {children}
      </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  return useContext(WebSocketContext);
}