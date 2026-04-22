import { createContext, useState, useEffect, useMemo } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    const api = useMemo(() => axios.create({
        baseURL: import.meta.env.VITE_API_URL || '/api',
    }), []);

    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    useEffect(() => {
        const fetchProfile = async () => {
            if (token) {
                try {
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    const res = await api.get('/auth/profile');
                    setUser(res.data.user);
                } catch (err) {
                    console.error('Failed to fetch profile:', err);
                    if (err.response?.status === 401) logout();
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        };

        if (token) {
            localStorage.setItem('token', token);
            fetchProfile();
        } else {
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
            setUser(null);
            setLoading(false);
        }

        const interceptor = api.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    logout();
                }
                return Promise.reject(error);
            }
        );

        return () => {
            api.interceptors.response.eject(interceptor);
        };
    }, [token, api]);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email: email.toLowerCase(), password });
        if (res.data.token) {
            setToken(res.data.token);
            setUser(res.data.user);
        }
        return res.data;
    };

    const signup = async (email, password) => {
        const res = await api.post('/auth/signup', { email: email.toLowerCase(), password });
        return res.data; // Don't set token yet
    };

    const verifyEmail = async (email, otp) => {
        const res = await api.post('/auth/verify-email', { email: email.toLowerCase(), otp });
        setToken(res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    const verifyMfa = async (email, otp) => {
        const res = await api.post('/auth/mfa/login-verify', { email, otp });
        setToken(res.data.token);
        setUser(res.data.user);
        return res.data;
    };


    const refreshProfile = async () => {
        if (!token) return;
        const res = await api.get('/auth/profile');
        setUser(res.data.user);
        return res.data.user;
    };

    const logout = () => {
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, signup, verifyEmail, verifyMfa, logout, loading, api, setToken, setUser, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
};
