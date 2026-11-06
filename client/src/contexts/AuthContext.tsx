import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/cv';
import { api } from '../services/api';
import {
  requestGoogleDriveAccess,
  getSavedGoogleAccessToken,
  GoogleUserProfile,
} from '../services/googleDrive';
import { trackEvent } from '../services/telemetry';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  guestLogin: () => void;
  isGuest: boolean;
  loginWithGoogle: () => Promise<void>;
  isGoogleDriveConnected: boolean;
  googleAccessToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('izicv_token'));
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(getSavedGoogleAccessToken());
  const [isGoogleDriveConnected, setIsGoogleDriveConnected] = useState<boolean>(Boolean(getSavedGoogleAccessToken()));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGuest, setIsGuest] = useState<boolean>(
    !localStorage.getItem('izicv_token') && !getSavedGoogleAccessToken()
  );

  useEffect(() => {
    async function loadUser() {
      // 1. Vérifier si une session Google Drive active existe
      const googleToken = getSavedGoogleAccessToken();
      const savedGoogleUserStr = localStorage.getItem('izicv_google_user');

      if (googleToken && savedGoogleUserStr) {
        try {
          const googleUser: GoogleUserProfile = JSON.parse(savedGoogleUserStr);
          setUser({
            id: googleUser.id,
            email: googleUser.email,
            fullName: googleUser.fullName,
            createdAt: new Date().toISOString(),
          });
          setGoogleAccessToken(googleToken);
          setIsGoogleDriveConnected(true);
          setIsGuest(false);
          setIsLoading(false);
          return;
        } catch {
          // Si le JSON est corrompu, continuer
        }
      }

      // 2. Vérifier si un compte e-mail local/distant existe
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
        console.warn('Session expirée ou serveur injoignable, bascule en mode local:', err);
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

  const loginWithGoogle = async () => {
    const { accessToken, user: googleUser } = await requestGoogleDriveAccess();
    setUser({
      id: googleUser.id,
      email: googleUser.email,
      fullName: googleUser.fullName,
      createdAt: new Date().toISOString(),
    });
    setGoogleAccessToken(accessToken);
    setIsGoogleDriveConnected(true);
    setIsGuest(false);
    localStorage.removeItem('izicv_guest');
    trackEvent('connexion', { method: 'google' }, googleUser.id);
  };

  const login = async (email: string, password: string) => {
    localStorage.removeItem('izicv_guest');
    const result = await api.login({ email, password });
    localStorage.setItem('izicv_token', result.token);
    setToken(result.token);
    setUser(result.user);
    setIsGuest(false);
    trackEvent('connexion', { method: 'email' }, result.user?.id);
  };

  const register = async (email: string, password: string, fullName: string) => {
    localStorage.removeItem('izicv_guest');
    const result = await api.register({ email, password, fullName });
    localStorage.setItem('izicv_token', result.token);
    setToken(result.token);
    setUser(result.user);
    setIsGuest(false);
    trackEvent('inscription', { method: 'email' }, result.user?.id);
  };

  const logout = () => {
    localStorage.removeItem('izicv_token');
    localStorage.removeItem('izicv_guest');
    localStorage.removeItem('izicv_google_access_token');
    localStorage.removeItem('izicv_google_token_expiry');
    localStorage.removeItem('izicv_google_user');
    setToken(null);
    setUser(null);
    setGoogleAccessToken(null);
    setIsGoogleDriveConnected(false);
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
        loginWithGoogle,
        isGoogleDriveConnected,
        googleAccessToken,
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
