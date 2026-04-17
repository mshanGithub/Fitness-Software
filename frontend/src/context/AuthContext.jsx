import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, userAPI } from '../services/api';

const AuthContext = createContext(null);
const TOKEN_KEY = 'twc_token';
const USER_KEY = 'twc_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  const persistSession = useCallback((data) => {
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    setStats(null);
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        clearSession();
      }
    }
    setLoading(false);
  }, [clearSession]);

  const login = async (email, password, options = {}) => {
    const request = options.admin ? authAPI.adminLogin : authAPI.login;
    const { data } = await request({ email, password });
    persistSession(data);
    return data;
  };

  const register = async (formData) => {
    const { data } = await authAPI.register(formData);
    persistSession(data);
    return data;
  };

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const refreshStats = useCallback(async () => {
    try {
      const { data } = await userAPI.getStats();
      setStats(data);
    } catch {
      // stats are optional, fail silently
    }
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        stats,
        login,
        register,
        logout,
        refreshStats,
        updateUser,
        isAdmin: user?.role === 'admin',
        isAuthenticated: !!token,
      }}
    >
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
