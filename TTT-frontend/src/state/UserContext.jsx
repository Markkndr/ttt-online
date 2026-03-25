import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { fetchWithAuth } from './auth';
import { useAuth } from './AuthContext';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const { accessToken } = useAuth();

    const refreshUser = useCallback(async () => {
        if (!accessToken) {
            setUser(null);
            return;
        }

        try {
            const response = await fetchWithAuth('/api/user/me', {
                method: 'GET',
                token: accessToken,
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data);
            } else {
                setUser(null);
                if (response.status === 403 || response.status === 401) {
                    console.log("No active session found (User not logged in yet or expired).");
                }
            }
        } catch (error) {
            console.error("Error in refresh:", error);
        }
    }, [accessToken]);

    useEffect(() => {
        if (accessToken) {
            refreshUser();
        } else {
            setUser(null);
        }
    }, [accessToken, refreshUser]);

    return (
        <UserContext.Provider value={{ user, setUser, refreshUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);