import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Initial check for user in localStorage
        const token = localStorage.getItem('authToken');
        const name = localStorage.getItem('userName');
        const email = localStorage.getItem('userEmail');
        const role = localStorage.getItem('userRole');

        if (token && name && email) {
            setUser({ name, email, role, token });
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        localStorage.setItem('authToken', userData.token);
        localStorage.setItem('userName', userData.name);
        localStorage.setItem('userEmail', userData.email);
        localStorage.setItem('userRole', userData.role || 'USER');
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');
        setUser(null);
        window.location.href = '/';
    };

    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
