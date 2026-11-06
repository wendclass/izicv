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
  const [isGuest, setIsGuest] = useState<boolean>(false);

  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('izicv_token');
      const isGuestMode = localStorage.getItem('izicv_guest') === 'true';

      if (isGuestMode) {
        setIsGuest(true);
        setUser({
          id: 'guest-user',
          email: 'invite@izicv.local',
          fullName: 'Utilisateur Invité',
          createdAt: new Date().toISOString(),
        });
        setIsLoading(false);
        return;
      }

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const { user } = await api.getMe();
        setUser(user);
        setToken(storedToken);
      } catch (err) {
        console.warn('Session expirée ou invalide:', err);
        localStorage.removeItem('izicv_token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    localStorage.removeItem('izicv_guest');
    setIsGuest(false);
    const result = await api.login({ email, password });
    localStorage.setItem('izicv_token', result.token);
    setToken(result.token);
    setUser(result.user);
  };

  const register = async (email: string, password: string, fullName: string) => {
    localStorage.removeItem('izicv_guest');
    setIsGuest(false);
    const result = await api.register({ email, password, fullName });
    localStorage.setItem('izicv_token', result.token);
    setToken(result.token);
    setUser(result.user);
  };

  const logout = () => {
    localStorage.removeItem('izicv_token');
    localStorage.removeItem('izicv_guest');
    setToken(null);
    setUser(null);
    setIsGuest(false);
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
