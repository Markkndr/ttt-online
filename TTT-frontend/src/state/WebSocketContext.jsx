import { createContext, useCallback, useContext, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAuth } from "./AuthContext";

const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }) {
    const clientRef = useRef(null);
    const subsRef = useRef(new Map());
    const { accessToken } = useAuth();

    const disconnect = useCallback(() => {
        if (!clientRef.current) return;

        for (const { sub } of subsRef.current.values()) {
            if (sub) sub.unsubscribe();
        }

        subsRef.current.clear();
        clientRef.current.deactivate();
        clientRef.current = null;
    }, []);

    const connect = useCallback((tokenOverride = null) => {
        const token = tokenOverride || accessToken;

        console.log("WS token at connect =", token);

        if (!token) {
            console.warn("Skipping WS connect because token is missing");
            return;
        }

        if (clientRef.current) {
            disconnect();
        }

        const client = new Client({
            webSocketFactory: () => new SockJS(import.meta.env.VITE_WS_URL),
            reconnectDelay: 5000,
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
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
            onWebSocketError: (event) => {
                console.error("WebSocket error", event);
            },
        });

        client.activate();
        clientRef.current = client;
    }, [accessToken, disconnect]);

    const subscribe = useCallback((destination, callback) => {
        if (!clientRef.current) return null;

        const existing = subsRef.current.get(destination);
        if (existing) return existing.sub;

        const entry = { callback, sub: null };
        subsRef.current.set(destination, entry);

        if (!clientRef.current.connected) return null;

        const sub = clientRef.current.subscribe(destination, callback);
        subsRef.current.set(destination, { callback, sub });
        return sub;
    }, []);

    const send = useCallback((destination, body) => {
        if (!clientRef.current || !clientRef.current.connected) {
            console.warn("WS publish skipped, client not connected");
            return;
        }

        clientRef.current.publish({
            destination,
            body: JSON.stringify(body),
        });
    }, []);

    return (
        <WebSocketContext.Provider value={{ connect, disconnect, subscribe, send }}>
            {children}
        </WebSocketContext.Provider>
    );
}

export function useWebSocket() {
    return useContext(WebSocketContext);
}