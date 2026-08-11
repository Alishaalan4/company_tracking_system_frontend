import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types';
import api from '../api/axios';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: User, authToken: string) => void;
  logout: () => void;
  /** Replace the cached user, e.g. after changing a password or PIN. */
  setUser: (user: User) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (!savedToken) {
      setIsLoading(false);
      return;
    }

    // Show the cached user immediately so the UI does not flash...
    setToken(savedToken);
    if (savedUser) {
      try {
        setUserState(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('user');
      }
    }

    // ...then confirm the token is still valid and refresh role/permission
    // flags, which can change server-side between sessions.
    api
      .get('/auth/me')
      .then(({ data }) => {
        setUserState(data);
        localStorage.setItem('user', JSON.stringify(data));
      })
      .catch((error) => {
        // A 401 is already handled by the axios interceptor; anything else
        // (server down, network) should keep the cached session usable.
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUserState(null);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = (userData: User, authToken: string) => {
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(authToken);
    setUserState(userData);
  };

  const setUser = (userData: User) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUserState(userData);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
       console.error('Logout error', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUserState(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, setUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
