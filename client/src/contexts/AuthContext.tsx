import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/cv';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  guestLogin: () => void;
  isGuest: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('izicv_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGuest, setIsGuest] = useState<boolean>(!localStorage.getItem('izicv_token'));

  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('izicv_token');

      if (!storedToken) {
        setIsGuest(true);
        setIsLoading(false);
        return;
      }

      try {
        const { user } = await api.getMe();
        setUser(user);
        setToken(storedToken);
        setIsGuest(false);
      } catch (err) {
        console.warn('Session expiree ou serveur injoignable, bascule en mode local:', err);
        localStorage.removeItem('izicv_token');
        setToken(null);
        setUser(null);
        setIsGuest(true);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    localStorage.removeItem('izicv_guest');
    const result = await api.login({ email, password });
    localStorage.setItem('izicv_token', result.token);
    setToken(result.token);
    setUser(result.user);
    setIsGuest(false);
  };

  const register = async (email: string, password: string, fullName: string) => {
    localStorage.removeItem('izicv_guest');
    const result = await api.register({ email, password, fullName });
    localStorage.setItem('izicv_token', result.token);
    setToken(result.token);
    setUser(result.user);
    setIsGuest(false);
  };

  const logout = () => {
    localStorage.removeItem('izicv_token');
    localStorage.removeItem('izicv_guest');
    setToken(null);
    setUser(null);
    setIsGuest(true);
  };

  const guestLogin = () => {
    localStorage.removeItem('izicv_token');
    localStorage.setItem('izicv_guest', 'true');
    setIsGuest(true);
    setUser({
      id: 'guest-user',
      email: 'invite@izicv.local',
      fullName: 'Mode Découverte',
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        guestLogin,
        isGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
