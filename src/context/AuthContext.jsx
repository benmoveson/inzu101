import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest, ApiError, setSessionExpiredCallback } from '../utils/api';

const AuthContext = createContext();

const API_URL = '/api';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sessionExpiredMessage, setSessionExpiredMessage] = useState(false);

    const clearSession = () => {
        setUser(null);
        localStorage.removeItem('inzu_user');
        localStorage.removeItem('inzu_token');
    };

    const handleSessionExpired = () => {
        clearSession();
        setSessionExpiredMessage(true);
        // Message will be shown on login page
    };

    const verifySession = async (token) => {
        try {
            await apiRequest(`${API_URL}/auth/verify`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return true;
        } catch (error) {
            // Session expired or invalid
            if (error instanceof ApiError && error.status === 401) {
                clearSession();
            }
            return false;
        }
    };

    useEffect(() => {
        // Register session expiry handler
        setSessionExpiredCallback(handleSessionExpired);

        // Check for saved user and token in localStorage on mount
        const savedUser = localStorage.getItem('inzu_user');
        const token = localStorage.getItem('inzu_token');

        if (savedUser && token) {
            // Verify token is still valid
            verifySession(token).then(isValid => {
                if (isValid) {
                    setUser(JSON.parse(savedUser));
                } else {
                    // Token expired, clear session
                    clearSession();
                }
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        try {
            const data = await apiRequest(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (data.requires2FA) {
                return { success: true, requires2FA: true, userId: data.userId };
            }

            setUser(data.user);
            localStorage.setItem('inzu_user', JSON.stringify(data.user));
            localStorage.setItem('inzu_token', data.token);
            return { success: true };
        } catch (error) {
            if (error instanceof ApiError) {
                return { success: false, error: error.message, isNetworkError: error.isNetworkError };
            }
            return { success: false, error: error.message };
        }
    };

    const verify2FA = async (userId, code) => {
        try {
            const data = await apiRequest(`${API_URL}/auth/verify-2fa`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, code }),
            });

            setUser(data.user);
            localStorage.setItem('inzu_user', JSON.stringify(data.user));
            localStorage.setItem('inzu_token', data.token);
            return { success: true };
        } catch (error) {
            if (error instanceof ApiError) {
                return { success: false, error: error.message, isNetworkError: error.isNetworkError };
            }
            return { success: false, error: error.message };
        }
    };

    const signup = async (userData) => {
        try {
            const data = await apiRequest(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });

            // Return userId for OTP verification
            return { success: true, userId: data.userId };
        } catch (error) {
            if (error instanceof ApiError) {
                return { success: false, error: error.message, isNetworkError: error.isNetworkError };
            }
            return { success: false, error: error.message };
        }
    };

    const logout = () => {
        clearSession();
    };

    const updateUser = (updatedUser) => {
        const newUser = { ...user, ...updatedUser };
        setUser(newUser);
        localStorage.setItem('inzu_user', JSON.stringify(newUser));
        
        // If district is being updated, sync with backend
        if (updatedUser.district) {
            const token = getToken();
            if (token) {
                apiRequest(`${API_URL}/users/profile`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ district: updatedUser.district })
                }).catch(err => {
                    console.error('Failed to sync district with backend:', err);
                });
            }
        }
    };

    const getToken = () => {
        return localStorage.getItem('inzu_token');
    };

    const isAuthenticated = () => {
        return user !== null && getToken() !== null;
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            login, 
            verify2FA, 
            signup, 
            logout, 
            updateUser, 
            loading,
            getToken,
            isAuthenticated,
            clearSession,
            sessionExpiredMessage,
            setSessionExpiredMessage
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
