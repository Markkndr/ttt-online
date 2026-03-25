import { createContext, useCallback, useContext, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAuth } from "./AuthContext";

const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }) {
  const clientRef = useRef(null);
  const subsRef = useRef(new Map()); // dest -> subscription
  const { accessToken } = useAuth();

  const connect = useCallback(() => {
    if (clientRef.current) return;

    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("Connected to websocket, client:", client);
        const token = accessToken;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        for (const [dest, { callback }] of subsRef.current.entries()) {
          const sub = client.subscribe(dest, callback, headers);
          subsRef.current.set(dest, { callback, sub });
        }
      },
      onStompError: (frame) => {
        console.error("STOMP error", frame);
      }
    });

    client.activate();
    clientRef.current = client;
  }, []);

  const subscribe = useCallback((destination, callback) => {
    if (!clientRef.current) return;
    const existing = subsRef.current.get(destination);
    if (existing) return existing.sub;

    const entry = { callback, sub: null };
    subsRef.current.set(destination, entry);

    // if not connected yet, just store and let onConnect do the real subscribe
    if (!clientRef.current || !clientRef.current.connected) {
      return null;
    }

    const token = accessToken;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const sub = clientRef.current.subscribe(destination, callback, headers);
    subsRef.current.set(destination, { callback, sub });
    return sub;
  }, []);

  const disconnect = useCallback(() => {
    if (!clientRef.current) return;
    for (const { sub } of subsRef.current.values()) {
      sub.unsubscribe();
    }
    subsRef.current.clear();
    clientRef.current.deactivate();
    clientRef.current = null;
  }, []);

  const send = useCallback((destination, body) => {
    if (!clientRef.current || !clientRef.current.connected) return;
    const token = accessToken;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    clientRef.current.publish({
      destination,
      body: JSON.stringify(body),
      headers,
    });
  }, []);

  return (
    <WebSocketContext.Provider
      value={{
        client: clientRef.current,
        connect,
        subscribe,
        send,
        disconnect,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  return useContext(WebSocketContext);
}
