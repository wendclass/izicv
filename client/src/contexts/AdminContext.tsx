import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface AdminContextType {
  isAdminAuthenticated: boolean;
  adminEmail: string | null;
  adminToken: string | null;
  isLoading: boolean;
  loginWithGoogle: (credential: string) => Promise<boolean>;
  logout: () => Promise<void>;
  resetInactivityTimer: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const ADMIN_TOKEN_KEY = 'izicv_admin_token';
const ADMIN_EMAIL_KEY = 'izicv_admin_email';
const ADMIN_LAST_ACTIVE_KEY = 'izicv_admin_last_active';
const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return sessionStorage.getItem(ADMIN_TOKEN_KEY);
  });
  const [adminEmail, setAdminEmail] = useState<string | null>(() => {
    return sessionStorage.getItem(ADMIN_EMAIL_KEY);
  });
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(async () => {
    if (adminToken) {
      try {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
        });
      } catch (e) {
        // Silent
      }
    }
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    sessionStorage.removeItem(ADMIN_EMAIL_KEY);
    sessionStorage.removeItem(ADMIN_LAST_ACTIVE_KEY);
    setAdminToken(null);
    setAdminEmail(null);
    setIsAdminAuthenticated(false);
  }, [adminToken]);

  const resetInactivityTimer = useCallback(() => {
    sessionStorage.setItem(ADMIN_LAST_ACTIVE_KEY, Date.now().toString());
  }, []);

  // Verify stored session on mount & check 2h inactivity
  useEffect(() => {
    const verifySession = async () => {
      const storedToken = sessionStorage.getItem(ADMIN_TOKEN_KEY);
      const storedLastActive = sessionStorage.getItem(ADMIN_LAST_ACTIVE_KEY);

      if (!storedToken || !storedLastActive) {
        setIsLoading(false);
        setIsAdminAuthenticated(false);
        return;
      }

      // Check 2 hours inactivity limit
      const lastActiveTime = parseInt(storedLastActive, 10);
      if (Date.now() - lastActiveTime > TWO_HOURS_MS) {
        logout();
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/admin/verify-session', {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setIsAdminAuthenticated(true);
          setAdminEmail(data.email);
          resetInactivityTimer();
        } else {
          // Token rejected or expired: reset
          logout();
        }
      } catch (err) {
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, [logout, resetInactivityTimer]);

  // Activity listeners to track the 2h inactivity window
  useEffect(() => {
    if (!isAdminAuthenticated) return;

    const handleActivity = () => {
      const storedLastActive = sessionStorage.getItem(ADMIN_LAST_ACTIVE_KEY);
      if (storedLastActive && Date.now() - parseInt(storedLastActive, 10) > TWO_HOURS_MS) {
        logout();
      } else {
        resetInactivityTimer();
      }
    };

    const events = ['mousemove', 'keydown', 'touchstart', 'scroll'];
    events.forEach((evt) => window.addEventListener(evt, handleActivity, { passive: true }));

    // Periodic check every 1 minute
    const interval = setInterval(() => {
      const storedLastActive = sessionStorage.getItem(ADMIN_LAST_ACTIVE_KEY);
      if (storedLastActive && Date.now() - parseInt(storedLastActive, 10) > TWO_HOURS_MS) {
        logout();
      }
    }, 60000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleActivity));
      clearInterval(interval);
    };
  }, [isAdminAuthenticated, logout, resetInactivityTimer]);

  const loginWithGoogle = async (credential: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });

      if (!res.ok) {
        // Any 404 or non-200 -> unauthorized
        return false;
      }

      const data = await res.json();
      if (data.token && data.email) {
        sessionStorage.setItem(ADMIN_TOKEN_KEY, data.token);
        sessionStorage.setItem(ADMIN_EMAIL_KEY, data.email);
        sessionStorage.setItem(ADMIN_LAST_ACTIVE_KEY, Date.now().toString());
        setAdminToken(data.token);
        setAdminEmail(data.email);
        setIsAdminAuthenticated(true);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  return (
    <AdminContext.Provider
      value={{
        isAdminAuthenticated,
        adminEmail,
        adminToken,
        isLoading,
        loginWithGoogle,
        logout,
        resetInactivityTimer,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
