import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import api from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUserFromStorage();
    }, []);

    const loadUserFromStorage = async () => {
        try {
            const token = await SecureStore.getItemAsync('token');
            if (token) {
                const decoded = jwtDecode(token);
                // Check if token is expired
                if (decoded.exp * 1000 < Date.now()) {
                    await logout();
                } else {
                    const res = await api.get('/users/me');
                    setUser(res.data);
                }
            }
        } catch (error) {
            console.error("Error loading token:", error);
            await logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (tokenData) => {
        // Enforce strict string serialization. If the backend wraps it in an object, extract it.
        const tokenString = typeof tokenData === 'string' ? tokenData : (tokenData?.token || JSON.stringify(tokenData));
        
        await SecureStore.setItemAsync('token', tokenString);
        
        try {
            const res = await api.get('/users/me');
            setUser(res.data);
        } catch (err) {
            console.error("Failed to fetch fresh user profile after login:", err);
            const decoded = jwtDecode(tokenString);
            setUser({ id: decoded.userId, email: decoded.sub, role: decoded.role });
        }
    };

    const logout = async () => {
        await SecureStore.deleteItemAsync('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
