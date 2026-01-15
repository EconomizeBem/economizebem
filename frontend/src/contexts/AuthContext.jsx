import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// URL base da API - usa variável de ambiente ou fallback para localhost
const baseURL = process.env.REACT_APP_API_URL || process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
const API = `${baseURL}/api`;

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, [token]);

    const fetchUser = async () => {
        try {
            const response = await axios.get(`${API}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(response.data);
        } catch (error) {
            console.error('Failed to fetch user:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const response = await axios.post(`${API}/auth/login`, { email, password });
        const { token: newToken, user: userData } = response.data;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
        return userData;
    };

    const register = async (name, email, password) => {
        const response = await axios.post(`${API}/auth/register`, { name, email, password });
        const { token: newToken, user: userData } = response.data;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
        return userData;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const updateProfile = async (data) => {
        await axios.put(`${API}/auth/profile`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setUser(prev => ({ ...prev, ...data }));
    };

    const forgotPassword = async (email) => {
        await axios.post(`${API}/auth/forgot-password`, { email });
    };

    const resetPassword = async (resetToken, newPassword) => {
        await axios.post(`${API}/auth/reset-password`, { token: resetToken, new_password: newPassword });
    };

    const changePassword = async (currentPassword, newPassword) => {
        await axios.put(`${API}/auth/change-password`, 
            { current_password: currentPassword, new_password: newPassword },
            { headers: { Authorization: `Bearer ${token}` } }
        );
    };

    const value = {
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        forgotPassword,
        resetPassword,
        changePassword
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
