import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { useNavigate } from 'react-router-dom';

interface User {
  user_id: number;
  username: string;
  role: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  const isAuthenticated = !!token;
  const isAdmin = user?.role === 'admin';

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    navigate('/login');
  }, [navigate]);

  // Listen for auto-logout event from api.ts
  useEffect(() => {
    const handleLogout = () => logout();
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [logout]);

  const login = async (username: string, password: string) => {
    const response = await api.login(username, password);
    const decoded = parseJwt(response.token);
    if (decoded) {
      setToken(response.token);
      setUser({
        user_id: decoded.user_id,
        username: decoded.username,
        role: decoded.role,
      });
    } else {
      throw new Error('Invalid token received');
    }
  };

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, isAdmin, login, logout }}>
      {children}
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

function parseJwt(token: string): User | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}
